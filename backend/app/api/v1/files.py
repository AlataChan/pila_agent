"""
文件上传和OCR处理API

提供文件上传、OCR识别等功能
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import time
from pathlib import Path

from app.db.config import get_db
from app.db.models import UploadedFile, User, OCRStatus
from app.api.deps import get_current_user
from app.schemas.files import FileUploadResponse, OCRResultResponse
from app.services.ocr_service import OCRService

router = APIRouter()

# 上传配置
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    report_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """上传文件并触发OCR处理"""
    
    # 验证文件类型
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型: {file_extension}"
        )
    
    # 验证文件大小
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="文件大小超过限制(10MB)"
        )
    
    try:
        # 生成唯一文件名
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # 创建文件记录
        db_file = UploadedFile(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=str(file_path),
            file_type=file.content_type,
            file_size=len(content),
            uploader_id=current_user.id,
            report_id=report_id,
            ocr_status=OCRStatus.PENDING
        )
        
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        # 异步触发OCR处理
        # TODO: 这里应该使用任务队列(如Celery)来异步处理
        await process_ocr_async(db_file.id, db)
        
        return FileUploadResponse(
            id=db_file.id,
            filename=db_file.original_filename,
            file_size=db_file.file_size,
            ocr_status=db_file.ocr_status.value,
            message="文件上传成功，OCR处理中..."
        )
        
    except Exception as e:
        # 清理已上传的文件
        if file_path.exists():
            file_path.unlink()
        
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"文件上传失败: {str(e)}"
        )


async def process_ocr_async(file_id: int, db: Session):
    """异步处理OCR识别"""
    try:
        # 获取文件记录
        db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not db_file:
            return
        
        # 更新状态为处理中
        db_file.ocr_status = OCRStatus.PROCESSING
        db.commit()
        
        # 执行OCR识别
        ocr_service = OCRService()
        result = await ocr_service.process_file(db_file.file_path)
        
        # 更新OCR结果
        db_file.ocr_text = result.text
        db_file.ocr_confidence = result.confidence
        db_file.ocr_status = OCRStatus.COMPLETED
        
        db.commit()
        
    except Exception as e:
        # 更新状态为失败
        db_file.ocr_status = OCRStatus.FAILED
        db.commit()
        print(f"OCR处理失败: {str(e)}")


@router.get("/", response_model=List[FileUploadResponse])
async def get_files(
    skip: int = 0,
    limit: int = 20,
    report_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户上传的文件列表"""
    query = db.query(UploadedFile).filter(UploadedFile.uploader_id == current_user.id)
    
    if report_id:
        query = query.filter(UploadedFile.report_id == report_id)
    
    files = query.order_by(UploadedFile.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        FileUploadResponse(
            id=file.id,
            filename=file.original_filename,
            file_size=file.file_size,
            ocr_status=file.ocr_status.value,
            created_at=file.created_at
        )
        for file in files
    ]


@router.get("/{file_id}/ocr", response_model=OCRResultResponse)
async def get_ocr_result(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取文件的OCR识别结果"""
    file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.uploader_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    
    if file.ocr_status == OCRStatus.PENDING:
        return OCRResultResponse(
            file_id=file_id,
            status="pending",
            message="OCR处理排队中..."
        )
    elif file.ocr_status == OCRStatus.PROCESSING:
        return OCRResultResponse(
            file_id=file_id,
            status="processing",
            message="OCR识别中..."
        )
    elif file.ocr_status == OCRStatus.FAILED:
        return OCRResultResponse(
            file_id=file_id,
            status="failed",
            message="OCR识别失败"
        )
    else:
        return OCRResultResponse(
            file_id=file_id,
            status="completed",
            text=file.ocr_text,
            confidence=file.ocr_confidence,
            message="OCR识别完成"
        )


@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除文件"""
    file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.uploader_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    
    try:
        # 删除物理文件
        file_path = Path(file.file_path)
        if file_path.exists():
            file_path.unlink()
        
        # 删除数据库记录
        db.delete(file)
        db.commit()
        
        return {"message": "文件删除成功"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除文件失败: {str(e)}"
        ) 