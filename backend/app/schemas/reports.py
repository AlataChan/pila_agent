"""
报告相关的Pydantic模式

定义API请求和响应的数据格式
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class InsuranceTypeEnum(str, Enum):
    """保险类型枚举"""
    ENTERPRISE_PROPERTY = "企业财产险"
    AUTO = "车险"
    LIABILITY = "责任险"
    OTHER = "其他"


class ReportStatusEnum(str, Enum):
    """报告状态枚举"""
    DRAFT = "draft"
    REVIEW = "review"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ReportCreate(BaseModel):
    """创建报告请求"""
    title: str = Field(..., min_length=1, max_length=255, description="报告标题")
    insurance_type: Optional[InsuranceTypeEnum] = Field(None, description="保险类型")


class ReportUpdate(BaseModel):
    """更新报告请求"""
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="报告标题")
    insurance_type: Optional[InsuranceTypeEnum] = Field(None, description="保险类型")
    status: Optional[ReportStatusEnum] = Field(None, description="报告状态")
    
    # 报告章节内容
    accident_details: Optional[str] = Field(None, description="事故经过及索赔")
    policy_summary: Optional[str] = Field(None, description="保单内容摘要")
    site_investigation: Optional[str] = Field(None, description="现场查勘情况")
    cause_analysis: Optional[str] = Field(None, description="事故原因分析")
    loss_assessment: Optional[str] = Field(None, description="损失核定")
    conclusion: Optional[str] = Field(None, description="公估结论")


class ChapterUpdateRequest(BaseModel):
    """章节更新请求"""
    content: str = Field(..., description="章节内容")


class ReportListResponse(BaseModel):
    """报告列表响应"""
    id: int
    title: str
    insurance_type: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            title=obj.title,
            insurance_type=obj.insurance_type.value if obj.insurance_type else None,
            status=obj.status.value,
            created_at=obj.created_at,
            updated_at=obj.updated_at
        )


class ReportResponse(BaseModel):
    """完整报告响应"""
    id: int
    title: str
    insurance_type: Optional[str] = None
    status: str
    
    # 报告章节内容
    accident_details: Optional[str] = None
    policy_summary: Optional[str] = None
    site_investigation: Optional[str] = None
    cause_analysis: Optional[str] = None
    loss_assessment: Optional[str] = None
    conclusion: Optional[str] = None
    
    # 元数据
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            title=obj.title,
            insurance_type=obj.insurance_type.value if obj.insurance_type else None,
            status=obj.status.value,
            accident_details=obj.accident_details,
            policy_summary=obj.policy_summary,
            site_investigation=obj.site_investigation,
            cause_analysis=obj.cause_analysis,
            loss_assessment=obj.loss_assessment,
            conclusion=obj.conclusion,
            owner_id=obj.owner_id,
            created_at=obj.created_at,
            updated_at=obj.updated_at
        )


class AIGenerateRequest(BaseModel):
    """AI生成请求"""
    chapter_type: str = Field(..., description="章节类型")
    context: Optional[str] = Field(None, description="上下文信息")
    prompt_template: Optional[str] = Field(None, description="自定义提示词模板")


class AIGenerateResponse(BaseModel):
    """AI生成响应"""
    chapter_type: str
    generated_content: str
    tokens_used: int
    generation_time: float 