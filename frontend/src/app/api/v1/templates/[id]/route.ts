/**
 * 单个模板操作API路由
 * 
 * 处理特定模板ID的获取、更新和删除操作
 */

/**
 * GET /api/v1/templates/[id] - 获取特定模板
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // 模拟模板数据 - 在实际应用中这里会从数据库获取
    const templates = getTemplatesData()
    const template = templates.find(t => t.id === id)
    
    if (!template) {
      return Response.json({
        success: false,
        error: '模板不存在',
        message: `ID为 ${id} 的模板未找到`
      }, { status: 404 })
    }
    
    return Response.json({
      success: true,
      data: template,
      message: '模板获取成功'
    })
    
  } catch (error) {
    console.error('获取模板错误:', error)
    return Response.json({
      success: false,
      error: '获取模板失败',
      message: '服务器处理请求时出错'
    }, { status: 500 })
  }
}

/**
 * PUT /api/v1/templates/[id] - 更新特定模板
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, type, content, category, description } = body
    
    // 验证必填字段
    if (!title || !content) {
      return Response.json({
        success: false,
        error: '标题和内容不能为空',
        message: '请填写模板标题和内容'
      }, { status: 400 })
    }
    
    // 模拟查找模板
    const templates = getTemplatesData()
    const existingTemplate = templates.find(t => t.id === id)
    
    if (!existingTemplate) {
      return Response.json({
        success: false,
        error: '模板不存在',
        message: `ID为 ${id} 的模板未找到`
      }, { status: 404 })
    }
    
    // 检查是否是基础模板（不允许修改某些属性）
    if (existingTemplate.category === 'basic' && type !== existingTemplate.id) {
      return Response.json({
        success: false,
        error: '基础模板类型不能修改',
        message: '系统预置的基础模板不允许修改类型'
      }, { status: 403 })
    }
    
    // 模拟更新模板
    const updatedTemplate = {
      ...existingTemplate,
      title,
      type: type || existingTemplate.type,
      content,
      category: category || existingTemplate.category,
      description: description || existingTemplate.description,
      updatedAt: new Date().toISOString()
    }
    
    return Response.json({
      success: true,
      data: updatedTemplate,
      message: '模板更新成功'
    })
    
  } catch (error) {
    console.error('更新模板错误:', error)
    return Response.json({
      success: false,
      error: '更新模板失败',
      message: '服务器处理请求时出错'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/templates/[id] - 删除特定模板
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // 模拟查找模板
    const templates = getTemplatesData()
    const template = templates.find(t => t.id === id)
    
    if (!template) {
      return Response.json({
        success: false,
        error: '模板不存在',
        message: `ID为 ${id} 的模板未找到`
      }, { status: 404 })
    }
    
    // 检查是否是基础模板（不允许删除）
    if (template.category === 'basic' || template.isDefault) {
      return Response.json({
        success: false,
        error: '基础模板不能删除',
        message: '系统预置的基础模板不允许删除'
      }, { status: 403 })
    }
    
    // 模拟删除操作
    return Response.json({
      success: true,
      data: { id },
      message: '模板删除成功'
    })
    
  } catch (error) {
    console.error('删除模板错误:', error)
    return Response.json({
      success: false,
      error: '删除模板失败',
      message: '服务器处理请求时出错'
    }, { status: 500 })
  }
}

/**
 * 获取模板数据的辅助函数
 * 在实际应用中，这应该从数据库或其他存储中获取
 */
function getTemplatesData() {
  return [
    {
      id: 'accident_details',
      title: '事故经过及索赔',
      description: '记录事故发生的详细经过和索赔情况',
      category: 'basic',
      type: 'accident_details',
      content: `## 事故经过

### 事故时间
[事故发生的具体日期和时间]

### 事故地点
[事故发生的详细地址]

### 事故经过
[详细描述事故发生的过程，包括天气、路况、当事人行为等]

### 索赔情况
[描述索赔的具体情况和金额]`,
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'policy_summary',
      title: '保单内容摘要',
      description: '总结保单的关键条款和保险责任',
      category: 'basic',
      type: 'policy_summary',
      content: `## 保单基本信息

### 投保人信息
- 投保人：[投保人姓名/公司名称]
- 联系方式：[电话号码]

### 被保险人信息
- 被保险人：[被保险人姓名/公司名称]
- 关系：[与投保人关系]

### 保险标的
- 保险标的：[保险标的名称和详细描述]
- 保险价值：[保险价值金额]

### 保险责任
- 保险期间：[保险起止日期]
- 保险金额：[保险金额]
- 保险责任：[详细列出保险责任范围]

### 免责条款
[列出主要的免责条款]`,
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'site_investigation',
      title: '现场查勘情况',
      description: '记录现场查勘的详细情况和发现',
      category: 'investigation',
      type: 'site_investigation',
      content: `## 现场查勘记录

### 查勘时间
[查勘的具体日期和时间]

### 查勘人员
- 公估师：[姓名、资质]
- 陪同人员：[相关人员信息]

### 现场环境
- 天气状况：[查勘时的天气情况]
- 现场状况：[现场的基本情况描述]

### 查勘发现
#### 损失情况
[详细描述发现的损失情况]

#### 现场痕迹
[记录现场发现的相关痕迹]

#### 拍照取证
[记录拍摄的照片数量和内容]

### 初步结论
[基于现场查勘得出的初步结论]`,
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cause_analysis',
      title: '事故原因分析',
      description: '分析事故发生的原因和责任认定',
      category: 'analysis',
      type: 'cause_analysis',
      content: `## 事故原因分析

### 直接原因
[分析事故发生的直接原因]

### 间接原因
[分析可能导致事故的间接因素]

### 责任认定
#### 第一方责任
[分析第一方的责任情况]

#### 第二方责任
[分析第二方的责任情况]

#### 第三方责任
[如有第三方，分析其责任情况]

### 事故性质判定
[判定事故性质：意外事故/自然灾害/人为因素等]

### 与保险责任的关系
[分析事故与保险责任条款的关系]`,
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'loss_assessment',
      title: '损失核定',
      description: '评估和核定保险损失金额',
      category: 'assessment',
      type: 'loss_assessment',
      content: `## 损失核定

### 损失项目清单
#### 直接损失
[列出直接损失项目和金额]

#### 间接损失
[如适用，列出间接损失项目]

### 损失金额计算
#### 修复费用
- 材料费：[金额]
- 人工费：[金额]
- 其他费用：[金额]

#### 施救费用
[如有施救费用，详细说明]

#### 残值回收
[如有残值，说明回收情况]

### 赔偿建议
#### 应赔金额
[根据保单条款计算的应赔金额]

#### 免赔额
[免赔额的计算和说明]

#### 最终赔付金额
[扣除免赔额后的最终赔付金额]`,
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'conclusion',
      title: '公估结论',
      description: '基于调查得出的专业公估结论',
      category: 'conclusion',
      type: 'conclusion',
      content: `## 公估结论

### 事故认定
[对事故性质和原因的最终认定]

### 损失确认
[确认的损失金额和范围]

### 责任认定
[各方责任的最终认定结果]

### 赔偿建议
#### 保险责任认定
[事故是否属于保险责任范围]

#### 赔偿金额建议
[建议的赔偿金额及计算依据]

#### 特别说明
[如有特殊情况需要说明的事项]

### 公估师意见
[公估师的专业意见和建议]

---
**公估师签名：** [签名]
**日期：** [日期]
**执业证号：** [证号]`,
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
} 