"""
AI章节生成API

提供AI辅助生成报告章节的功能
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import time

from app.db.config import get_db
from app.db.models import ReportDraft, User, AIGenerationLog
from app.api.deps import get_current_user
from app.schemas.reports import AIGenerateRequest, AIGenerateResponse
from app.services.ai_service import AIService

router = APIRouter()


@router.post("/generate/{report_id}", response_model=AIGenerateResponse)
async def generate_chapter(
    report_id: int,
    generate_request: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """使用AI生成报告章节内容"""
    
    # 验证报告存在且属于当前用户
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
        "accident_details": "事故经过及索赔",
        "policy_summary": "保单内容摘要",
        "site_investigation": "现场查勘情况", 
        "cause_analysis": "事故原因分析",
        "loss_assessment": "损失核定",
        "conclusion": "公估结论"
    }
    
    if generate_request.chapter_type not in valid_chapters:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的章节类型: {generate_request.chapter_type}"
        )
    
    try:
        # 记录开始时间
        start_time = time.time()
        
        # 调用AI服务生成内容
        ai_service = AIService()
        generation_result = await ai_service.generate_chapter(
            chapter_type=generate_request.chapter_type,
            context=generate_request.context,
            report_data=report,
            prompt_template=generate_request.prompt_template
        )
        
        # 计算生成时间
        generation_time = time.time() - start_time
        
        # 记录AI生成日志
        ai_log = AIGenerationLog(
            report_id=report_id,
            chapter_type=generate_request.chapter_type,
            prompt_text=generation_result.prompt_used,
            generated_content=generation_result.content,
            model_name=generation_result.model_name,
            tokens_used=generation_result.tokens_used,
            generation_time=generation_time
        )
        
        db.add(ai_log)
        
        # 更新报告章节内容
        setattr(report, generate_request.chapter_type, generation_result.content)
        
        db.commit()
        
        return AIGenerateResponse(
            chapter_type=generate_request.chapter_type,
            generated_content=generation_result.content,
            tokens_used=generation_result.tokens_used,
            generation_time=generation_time
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI生成失败: {str(e)}"
        )


@router.get("/templates/{chapter_type}")
async def get_prompt_templates(
    chapter_type: str,
    insurance_type: str = None
):
    """获取章节的提示词模板"""
    
    # 预定义的提示词模板
    templates = {
        "accident_details": {
            "default": """请根据以下信息生成事故经过及索赔章节：

上下文信息：
{context}

请包括以下要点：
1. 事故发生的时间、地点、经过
2. 当事人信息
3. 损失情况概述
4. 索赔申请情况

要求：
- 语言专业、客观
- 逻辑清晰、条理分明
- 篇幅适中（300-500字）
""",
            "车险": """请根据以下信息生成车险事故经过及索赔章节：

上下文信息：
{context}

请重点描述：
1. 交通事故发生经过
2. 车辆损坏情况
3. 人员伤亡情况（如有）
4. 交警处理情况
5. 保险报案及理赔申请

格式要求：
- 时间线清晰
- 责任认定明确
- 损失描述详细
"""
        },
        "site_investigation": {
            "default": """请根据以下信息生成现场查勘情况章节：

上下文信息：
{context}

请详细描述：
1. 查勘时间、地点、参与人员
2. 现场环境和条件
3. 损失标的查勘情况
4. 现场拍照和取证
5. 相关人员询问记录

要求：
- 客观真实、详实准确
- 重点突出、条理清晰
- 为后续定损提供依据
"""
        }
    }
    
    chapter_templates = templates.get(chapter_type, {})
    
    if insurance_type and insurance_type in chapter_templates:
        template = chapter_templates[insurance_type]
    else:
        template = chapter_templates.get("default", "暂无该章节模板")
    
    return {
        "chapter_type": chapter_type,
        "template": template,
        "available_types": list(chapter_templates.keys())
    }


@router.get("/history/{report_id}")
async def get_generation_history(
    report_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取报告的AI生成历史"""
    
    # 验证报告权限
    report = db.query(ReportDraft).filter(
        ReportDraft.id == report_id,
        ReportDraft.owner_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="报告不存在"
        )
    
    # 获取生成历史
    logs = db.query(AIGenerationLog).filter(
        AIGenerationLog.report_id == report_id
    ).order_by(AIGenerationLog.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "chapter_type": log.chapter_type,
            "model_name": log.model_name,
            "tokens_used": log.tokens_used,
            "generation_time": log.generation_time,
            "created_at": log.created_at,
            "content_preview": log.generated_content[:100] + "..." if len(log.generated_content) > 100 else log.generated_content
        }
        for log in logs
    ]


@router.post("/chat")
async def ai_chat(
    message: str,
    context: list = None,
    current_user: User = Depends(get_current_user)
):
    """AI聊天对话"""
    try:
        # 调用AI服务进行对话
        ai_service = AIService()
        response = await ai_service.chat(
            message=message,
            context=context or [],
            user_id=current_user.id
        )
        
        return {
            "response": response.content,
            "tokens_used": response.tokens_used,
            "model": response.model_name
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI对话失败: {str(e)}"
        ) 