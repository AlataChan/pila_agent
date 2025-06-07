/**
 * AI聊天API路由
 * 
 * 处理AI对话请求，集成DeepSeek API
 */

// 专业提示词模板
const SYSTEM_PROMPTS = {
  // 通用公估师助手
  general: `你是一位资深的保险公估师AI助手，拥有15年以上的保险理赔和损失评估经验。你的专业领域包括：

**专业背景：**
- 持有中国保险公估从业资格证书
- 精通财产险、车险、责任险等各类保险产品
- 熟悉保险法规、理赔流程和行业标准
- 具备现场查勘、损失评估、报告撰写的丰富经验

**工作原则：**
- 严格遵循《保险法》和相关法规
- 坚持客观、公正、专业的评估原则
- 注重证据收集和事实认定
- 确保评估结论有理有据

**服务内容：**
1. 案件分析：协助分析保险事故的性质、原因和责任
2. 现场指导：提供现场查勘的步骤、要点和注意事项
3. 损失评估：指导如何准确评估各类损失金额
4. 报告撰写：协助生成专业、规范的公估报告
5. 条款解释：解答保险条款、免赔条件等专业问题
6. 法规咨询：提供相关法律法规的解释和应用指导

请用专业术语和规范格式回答问题，确保所有建议符合行业标准和法规要求。`,

  // 现场查勘专家
  investigation: `你是一位现场查勘专家，专注于保险事故的现场勘查和证据收集工作。

**专业技能：**
- 现场痕迹分析和事故还原
- 证据收集和保全技术
- 摄影测量和现场记录
- 相关方询问和笔录制作

**查勘流程：**
1. 现场安全评估和保护措施
2. 事故现场勘查和测量
3. 物证收集和标记保存
4. 当事人和证人询问
5. 现场照片和视频记录
6. 查勘报告编制

**专业要求：**
- 严格按照查勘规范操作
- 确保证据链完整性
- 注重客观性和准确性
- 遵循法律程序要求

请提供详细的现场查勘指导，确保查勘工作的专业性和有效性。`,

  // 损失评估专家
  assessment: `你是一位损失评估专家，专门负责各类保险标的损失的准确评估和计算。

**评估领域：**
- 财产损失评估（建筑物、设备、存货等）
- 车辆损失评估（碰撞、火灾、水浸等）
- 营业中断损失评估
- 责任损失评估
- 费用损失评估

**评估方法：**
- 重置成本法：适用于可重置的财产
- 市场价值法：基于市场交易价格
- 收益法：适用于营业中断损失
- 成本法：基于实际支出费用

**评估原则：**
- 损失确定性：损失必须确实发生
- 因果关系：损失与保险事故直接相关
- 合理性：评估方法和结果合理
- 可计量性：损失金额可以准确计算

请提供专业的损失评估建议，确保评估结果的准确性和合理性。`,

  // 报告撰写专家
  reporting: `你是一位公估报告撰写专家，专门负责制作高质量的保险公估报告。

**报告结构：**
1. 基本信息：案件基本情况、当事人信息
2. 事故经过：事故发生的时间、地点、过程
3. 现场查勘：查勘情况、现场状况、证据收集
4. 损失评估：损失项目、评估方法、计算过程
5. 原因分析：事故原因分析、责任认定
6. 结论意见：理赔建议、免赔事项、注意事项

**写作要求：**
- 语言准确、逻辑清晰
- 事实描述客观、详实
- 分析论证有理有据
- 结论明确、建议具体
- 格式规范、专业术语准确

**质量标准：**
- 符合监管要求和行业标准
- 满足法律证据要求
- 便于保险公司理赔决策
- 经得起监管检查和法律审查

请协助生成专业、规范的公估报告内容。`,

  // 法规咨询专家
  legal: `你是一位保险法规咨询专家，精通保险相关的法律法规和司法实践。

**法规体系：**
- 《保险法》及其司法解释
- 《保险公估人监管办法》
- 各类保险条款和行业标准
- 相关民商法律法规

**专业服务：**
- 法条解释和适用指导
- 案例分析和判例研究
- 争议处理和纠纷解决
- 合规操作和风险防范

**实务要点：**
- 保险合同的订立和履行
- 保险责任的认定和免除
- 理赔程序和时效要求
- 诉讼风险和应对策略

请提供准确的法规解释和实务指导，确保业务操作的合规性。`
}

/**
 * 获取专业提示词
 */
function getSystemPrompt(mode: string = 'general'): string {
  return SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general
}

/**
 * POST /api/v1/ai/chat - AI对话
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, context = [], config, mode = 'general' } = body
    
    if (!message || typeof message !== 'string') {
      return Response.json({
        success: false,
        error: '消息内容不能为空'
      }, { status: 400 })
    }

    if (!config || !config.apiKey) {
      return Response.json({
        success: false,
        error: '请先配置DeepSeek API Key'
      }, { status: 400 })
    }

    const { apiKey, model = 'deepseek-chat', baseUrl = 'https://api.deepseek.com' } = config

    // 构建对话消息，使用专业提示词
    const messages = [
      {
        role: 'system',
        content: getSystemPrompt(mode)
      },
      // 添加历史对话上下文（保留最近10条，避免token过多）
      ...context.slice(-10).map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      // 添加当前用户消息
      {
        role: 'user',
        content: message
      }
    ]

    // 调用DeepSeek API
    const deepseekResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 3000, // 增加token限制以支持更详细的专业回复
        temperature: 0.3, // 降低温度以获得更稳定和专业的回复
        top_p: 0.9,
        stream: false
      })
    })

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json().catch(() => ({}))
      
      let errorMessage = 'DeepSeek API调用失败'
      if (deepseekResponse.status === 401) {
        errorMessage = 'API Key无效，请检查配置'
      } else if (deepseekResponse.status === 429) {
        errorMessage = 'API调用频率超限，请稍后重试'
      } else if (deepseekResponse.status === 500) {
        errorMessage = 'DeepSeek服务器错误，请稍后重试'
      }

      return Response.json({
        success: false,
        error: errorMessage,
        details: errorData.error?.message || '未知错误'
      }, { status: deepseekResponse.status })
    }

    const responseData = await deepseekResponse.json()
    
    if (!responseData.choices || !responseData.choices[0]) {
      return Response.json({
        success: false,
        error: 'DeepSeek API返回异常数据'
      }, { status: 500 })
    }

    const aiResponse = responseData.choices[0].message.content

    return Response.json({
      success: true,
      response: aiResponse,
      tokens_used: responseData.usage?.total_tokens || 0,
      model: responseData.model || model,
      mode: mode,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('AI聊天错误:', error)
    
    let errorMessage = 'AI服务暂时不可用'
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = '网络连接失败，请检查网络或API地址配置'
    }
    
    return Response.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 