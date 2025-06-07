"""
数据库模型定义

定义了用户、报告、文件上传等核心业务实体
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime

Base = declarative_base()


class ReportStatus(enum.Enum):
    """报告状态枚举"""
    DRAFT = "draft"
    REVIEW = "review" 
    COMPLETED = "completed"
    ARCHIVED = "archived"


class InsuranceType(enum.Enum):
    """保险类型枚举"""
    ENTERPRISE_PROPERTY = "企业财产险"
    AUTO = "车险"
    LIABILITY = "责任险"
    OTHER = "其他"


class OCRStatus(enum.Enum):
    """OCR处理状态枚举"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class User(Base):
    """用户模型"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    reports = relationship("ReportDraft", back_populates="owner")
    uploaded_files = relationship("UploadedFile", back_populates="uploader")


class ReportDraft(Base):
    """报告草稿模型"""
    __tablename__ = "report_drafts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    insurance_type = Column(Enum(InsuranceType), nullable=True)
    status = Column(Enum(ReportStatus), default=ReportStatus.DRAFT)
    
    # 报告内容章节
    accident_details = Column(Text, nullable=True, comment="事故经过及索赔")
    policy_summary = Column(Text, nullable=True, comment="保单内容摘要")
    site_investigation = Column(Text, nullable=True, comment="现场查勘情况")
    cause_analysis = Column(Text, nullable=True, comment="事故原因分析")
    loss_assessment = Column(Text, nullable=True, comment="损失核定")
    conclusion = Column(Text, nullable=True, comment="公估结论")
    
    # 元数据
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    owner = relationship("User", back_populates="reports")
    associated_files = relationship("UploadedFile", back_populates="report")


class UploadedFile(Base):
    """上传文件模型"""
    __tablename__ = "uploaded_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False, comment="文件大小(字节)")
    
    # OCR相关
    ocr_status = Column(Enum(OCRStatus), default=OCRStatus.PENDING)
    ocr_text = Column(Text, nullable=True, comment="OCR识别结果")
    ocr_confidence = Column(Float, nullable=True, comment="OCR识别置信度")
    
    # 关联
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_id = Column(Integer, ForeignKey("report_drafts.id"), nullable=True)
    
    # 元数据
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    uploader = relationship("User", back_populates="uploaded_files")
    report = relationship("ReportDraft", back_populates="associated_files")


class AIGenerationLog(Base):
    """AI生成日志模型"""
    __tablename__ = "ai_generation_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("report_drafts.id"), nullable=False)
    chapter_type = Column(String(50), nullable=False, comment="章节类型")
    prompt_text = Column(Text, nullable=False, comment="提示词")
    generated_content = Column(Text, nullable=False, comment="生成内容")
    
    # AI服务相关
    model_name = Column(String(100), nullable=False)
    tokens_used = Column(Integer, nullable=False)
    generation_time = Column(Float, nullable=False, comment="生成耗时(秒)")
    
    # 元数据
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    report = relationship("ReportDraft")


class ReportTemplate(Base):
    """报告模板模型"""
    __tablename__ = "report_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    insurance_type = Column(Enum(InsuranceType), nullable=True)
    
    # 模板内容
    template_structure = Column(Text, nullable=False, comment="模板结构JSON")
    
    # 元数据
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    creator = relationship("User") 