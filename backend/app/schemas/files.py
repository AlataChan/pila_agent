"""
文件相关的Pydantic模式

定义文件上传和OCR相关的数据格式
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FileUploadResponse(BaseModel):
    """文件上传响应"""
    id: int
    filename: str
    file_size: int
    ocr_status: str
    message: str
    created_at: Optional[datetime] = None


class OCRResultResponse(BaseModel):
    """OCR识别结果响应"""
    file_id: int
    status: str
    text: Optional[str] = None
    confidence: Optional[float] = None
    message: str 