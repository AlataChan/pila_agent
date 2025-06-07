"""
报告管理API路由

提供报告的CRUD操作接口
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.config import get_db
from app.db.models import ReportDraft, User, ReportStatus, InsuranceType
from app.api.deps import get_current_user
from app.schemas.reports import (
    ReportCreate, 
    ReportUpdate, 
    ReportResponse, 
    ReportListResponse,
    ChapterUpdateRequest
)

router = APIRouter()


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新报告"""
    try:
        # 创建报告记录
        db_report = ReportDraft(
            title=report_data.title,
            insurance_type=report_data.insurance_type,
            owner_id=current_user.id
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        return ReportResponse.from_orm(db_report)
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建报告失败: {str(e)}"
        )


@router.get("/", response_model=List[ReportListResponse])
async def get_reports(
    skip: int = 0,
    limit: int = 20,
    status_filter: Optional[str] = None,
    insurance_type_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户的报告列表"""
    query = db.query(ReportDraft).filter(ReportDraft.owner_id == current_user.id)
    
    # 状态过滤
    if status_filter:
        try:
            status_enum = ReportStatus(status_filter)
            query = query.filter(ReportDraft.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"无效的状态值: {status_filter}"
            )
    
    # 保险类型过滤
    if insurance_type_filter:
        try:
            insurance_enum = InsuranceType(insurance_type_filter)
            query = query.filter(ReportDraft.insurance_type == insurance_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"无效的保险类型: {insurance_type_filter}"
            )
    
    # 分页和排序
    reports = query.order_by(ReportDraft.updated_at.desc()).offset(skip).limit(limit).all()
    
    return [ReportListResponse.from_orm(report) for report in reports]


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单个报告详情"""
    report = db.query(ReportDraft).filter(
        ReportDraft.id == report_id,
        ReportDraft.owner_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="报告不存在"
        )
    
    return ReportResponse.from_orm(report)


@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    report_update: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新报告"""
    report = db.query(ReportDraft).filter(
        ReportDraft.id == report_id,
        ReportDraft.owner_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="报告不存在"
        )
    
    try:
        # 更新字段
        update_data = report_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(report, field, value)
        
        report.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(report)
        
        return ReportResponse.from_orm(report)
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新报告失败: {str(e)}"
        )


@router.put("/{report_id}/chapters/{chapter_type}")
async def update_chapter(
    report_id: int,
    chapter_type: str,
    chapter_data: ChapterUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新报告章节内容"""
    report = db.query(ReportDraft).filter(
        ReportDraft.id == report_id,
        ReportDraft.owner_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="报告不存在"
        )
    
    # 验证章节类型
    valid_chapters = {
        "accident_details": "accident_details",
        "policy_summary": "policy_summary", 
        "site_investigation": "site_investigation",
        "cause_analysis": "cause_analysis",
        "loss_assessment": "loss_assessment",
        "conclusion": "conclusion"
    }
    
    if chapter_type not in valid_chapters:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的章节类型: {chapter_type}"
        )
    
    try:
        # 更新章节内容
        setattr(report, valid_chapters[chapter_type], chapter_data.content)
        report.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "章节更新成功", "chapter_type": chapter_type}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新章节失败: {str(e)}"
        )


@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除报告"""
    report = db.query(ReportDraft).filter(
        ReportDraft.id == report_id,
        ReportDraft.owner_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="报告不存在"
        )
    
    try:
        db.delete(report)
        db.commit()
        
        return {"message": "报告删除成功"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除报告失败: {str(e)}"
        )


@router.get("/{report_id}/export")
async def export_report(
    report_id: int,
    format: str = "docx",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """导出报告"""
    report = db.query(ReportDraft).filter(
        ReportDraft.id == report_id,
        ReportDraft.owner_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="报告不存在"
        )
    
    if format not in ["docx", "pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的导出格式"
        )
    
    # TODO: 实现报告导出逻辑
    return {
        "message": "导出功能待实现",
        "report_id": report_id,
        "format": format
    } 