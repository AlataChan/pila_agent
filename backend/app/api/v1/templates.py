"""
模板管理API

提供报告模板的CRUD操作
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.config import get_db
from app.api.deps import get_current_user
from app.db.models import User

router = APIRouter()


@router.get("/")
async def get_templates(
    template_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取模板列表"""
    
    # 模拟模板数据
    templates = [
        {
            "id": 1,
            "type": "accident_details",
            "title": "车辆事故经过模板",
            "content": """根据现场勘查和当事人陈述，事故发生经过如下：

1. 事故发生时间：{事故时间}
2. 事故发生地点：{事故地点}
3. 天气条件：{天气情况}
4. 道路状况：{道路状况}
5. 事故经过：{详细经过}

当事人陈述：
- 投保人陈述：{投保人陈述}
- 第三方陈述：{第三方陈述}

证据材料：
- 现场照片：{照片数量}张
- 交警认定书：{是否有}
- 其他证据：{其他证据}""",
            "isDefault": True,
            "createdAt": "2024-01-15",
            "updatedAt": "2024-03-01"
        },
        {
            "id": 2,
            "type": "loss_assessment",
            "title": "财产损失核定模板", 
            "content": """根据现场查勘和相关资料，损失核定情况如下：

一、受损财产清单
{财产清单}

二、损失程度评估
1. 完全损毁：{完全损毁项目}
2. 部分损坏：{部分损坏项目}
3. 可修复项目：{可修复项目}

三、损失金额核定
1. 直接损失：￥{直接损失金额}
2. 间接损失：￥{间接损失金额}
3. 合计损失：￥{总损失金额}

四、核定依据
- 市场价格调研：{价格依据}
- 专业评估报告：{评估报告}
- 维修报价单：{维修报价}""",
            "isDefault": True,
            "createdAt": "2024-01-20",
            "updatedAt": "2024-02-28"
        },
        {
            "id": 3,
            "type": "conclusion",
            "title": "公估结论标准模板",
            "content": """综合本次事故的调查情况，现作出如下公估结论：

一、事故责任认定
{责任认定结果}

二、保险责任分析
1. 保险标的：{保险标的}
2. 承保风险：{承保风险}
3. 免责条款：{免责条款分析}
4. 责任结论：{责任结论}

三、损失核定结论
1. 认定损失：￥{认定损失}
2. 免赔额：￥{免赔额}
3. 赔偿金额：￥{赔偿金额}

四、处理建议
{处理建议}

以上结论供保险公司理赔参考。""",
            "isDefault": True,
            "createdAt": "2024-02-01",
            "updatedAt": "2024-03-05"
        }
    ]
    
    # 根据类型筛选
    if template_type:
        templates = [t for t in templates if t["type"] == template_type]
    
    # 分页
    total = len(templates)
    templates = templates[skip:skip + limit]
    
    return {
        "items": templates,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }


@router.get("/{template_id}")
async def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单个模板详情"""
    
    # 模拟获取模板
    template = {
        "id": template_id,
        "type": "accident_details",
        "title": "车辆事故经过模板",
        "content": """根据现场勘查和当事人陈述，事故发生经过如下：

1. 事故发生时间：{事故时间}
2. 事故发生地点：{事故地点}
3. 天气条件：{天气情况}
4. 道路状况：{道路状况}
5. 事故经过：{详细经过}

当事人陈述：
- 投保人陈述：{投保人陈述}
- 第三方陈述：{第三方陈述}

证据材料：
- 现场照片：{照片数量}张
- 交警认定书：{是否有}
- 其他证据：{其他证据}""",
        "isDefault": True,
        "createdAt": "2024-01-15",
        "updatedAt": "2024-03-01"
    }
    
    return template


@router.post("/")
async def create_template(
    template_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新模板"""
    
    # 验证必需字段
    required_fields = ["type", "title", "content"]
    for field in required_fields:
        if field not in template_data or not template_data[field]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"缺少必需字段: {field}"
            )
    
    # 模拟创建模板
    new_template = {
        "id": 999,  # 模拟新ID
        "type": template_data["type"],
        "title": template_data["title"],
        "content": template_data["content"],
        "isDefault": False,
        "createdAt": "2024-03-16",
        "updatedAt": "2024-03-16"
    }
    
    return new_template


@router.put("/{template_id}")
async def update_template(
    template_id: int,
    template_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新模板"""
    
    # 验证模板存在（模拟）
    if template_id not in [1, 2, 3]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在"
        )
    
    # 模拟更新模板
    updated_template = {
        "id": template_id,
        "type": template_data.get("type", "accident_details"),
        "title": template_data.get("title", "更新的模板"),
        "content": template_data.get("content", "更新的内容"),
        "isDefault": False,
        "createdAt": "2024-01-15",
        "updatedAt": "2024-03-16"
    }
    
    return updated_template


@router.delete("/{template_id}")
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除模板"""
    
    # 验证模板存在且不是默认模板（模拟）
    if template_id in [1, 2, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="默认模板不能删除"
        )
    
    # 模拟删除
    return {"message": "模板删除成功"}


@router.get("/types/available")
async def get_template_types():
    """获取可用的模板类型"""
    
    return {
        "types": [
            {
                "id": "accident_details",
                "title": "事故经过及索赔",
                "description": "描述事故发生的经过和索赔情况",
                "icon": "📋"
            },
            {
                "id": "policy_summary", 
                "title": "保单内容摘要",
                "description": "总结保险合同的主要内容",
                "icon": "📄"
            },
            {
                "id": "site_investigation",
                "title": "现场查勘情况",
                "description": "记录现场查勘的详细情况",
                "icon": "🔍"
            },
            {
                "id": "cause_analysis",
                "title": "事故原因分析", 
                "description": "分析事故发生的原因和责任",
                "icon": "🔬"
            },
            {
                "id": "loss_assessment",
                "title": "损失核定",
                "description": "评估和核定损失金额",
                "icon": "💰"
            },
            {
                "id": "conclusion",
                "title": "公估结论",
                "description": "给出最终的公估结论和建议",
                "icon": "✅"
            }
        ]
    } 