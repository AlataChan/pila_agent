import { NextRequest, NextResponse } from 'next/server'

// 模拟章节模板
const chapterTemplates = {
  summary: {
    title: '摘要',
    template: `根据案件基本信息，生成以下内容：

一、案件基本情况
出险时间：[出险时间]
出险地点：[出险地点]
保险标的：[保险标的]
损失金额：[损失金额]

二、主要结论
1. 事故原因：[事故原因]
2. 保险责任：[保险责任判定]
3. 理赔建议：[理赔建议]

三、注意事项
[特别说明事项]`
  },
  client_info: {
    title: '委托方信息',
    template: `一、委托方基本信息
公司名称：[委托方名称]
联系地址：[联系地址]
联系电话：[联系电话]
联系人：[联系人姓名]

二、委托事项
委托日期：[委托日期]
委托内容：[委托具体内容]
委托要求：[委托方要求]

三、相关文件
已收到文件：[文件清单]
待补充文件：[待补充文件]`
  },
  policy_info: {
    title: '保单信息',
    template: `一、基本保单信息
保险公司：[保险公司名称]
保单号码：[保单号码]
保险期间：[保险期间]
投保人：[投保人姓名]
被保险人：[被保险人姓名]

二、承保内容
险种名称：[险种名称]
保险金额：[保险金额]
保险费：[保险费金额]
免赔额：[免赔额]

三、特别约定
特别条款：[特别条款内容]
附加险种：[附加险种]`
  },
  insured_info: {
    title: '被保险人信息',
    template: `一、被保险人基本情况
姓名/名称：[被保险人名称]
证件类型：[证件类型]
证件号码：[证件号码]
联系地址：[联系地址]
联系电话：[联系电话]

二、投保情况
投保历史：[投保历史]
理赔记录：[历史理赔记录]
风险状况：[风险评估]

三、经营情况（适用于企业）
经营范围：[经营范围]
经营地址：[经营地址]
营业状况：[营业状况]`
  },
  accident_details: {
    title: '事故经过',
    template: `一、事故基本情况
出险时间：[具体出险时间]
出险地点：[详细出险地点]
报案时间：[报案时间]
报案人：[报案人姓名及联系方式]

二、事故经过详述
事故起因：[事故发生的直接原因]
事故过程：[详细描述事故发生的全过程]
事故后果：[事故造成的直接后果]

三、相关人员情况
当事人：[当事人基本信息]
证人：[证人信息]
处理人员：[参与处理的人员]

四、初步处理情况
现场处理：[现场如何处理]
报告情况：[向有关部门报告情况]
采取措施：[采取的紧急措施]`
  },
  site_investigation: {
    title: '现场查勘',
    template: `一、查勘基本信息
查勘时间：[查勘时间]
查勘人员：[查勘人员姓名及资质]
天气情况：[当时天气状况]
现场状态：[现场保护情况]

二、现场情况描述
现场环境：[现场周边环境描述]
损失标的：[受损标的详细情况]
损失程度：[损失程度评估]
现场痕迹：[重要痕迹记录]

三、现场勘查记录
测量数据：[相关测量数据]
拍照记录：[照片清单及说明]
物证收集：[收集的物证情况]
现场图绘制：[现场示意图说明]

四、初步分析
损失原因：[现场分析的损失原因]
责任初判：[责任归属初步判断]
需要进一步调查的问题：[待查明事项]`
  },
  cause_analysis: {
    title: '原因分析',
    template: `一、损失原因分析
直接原因：[造成损失的直接原因]
间接原因：[相关的间接因素]
根本原因：[深层次原因分析]

二、技术分析
技术资料：[相关技术资料分析]
专家意见：[专业技术人员意见]
检测结果：[相关检测数据]

三、责任认定
事故责任：[事故责任划分]
过失程度：[各方过失程度]
免责情况：[是否存在免责事由]

四、结论
原因结论：[最终原因认定]
责任结论：[最终责任认定]
建议：[相关建议]`
  },
  loss_assessment: {
    title: '损失核定',
    template: `一、损失项目清单
直接损失：[直接物质损失项目及金额]
间接损失：[间接损失项目及金额]
施救费用：[施救费用明细]
其他费用：[其他相关费用]

二、损失计算依据
评估方法：[采用的评估方法]
价格依据：[价格确定的依据]
折旧计算：[折旧的计算方法]
市场调研：[市场价格调研情况]

三、损失金额汇总
项目名称        数量    单价    金额
[损失项目1]     [数量]  [单价]  [小计]
[损失项目2]     [数量]  [单价]  [小计]
...
合计损失金额：￥[总金额]元

四、核损说明
合理性分析：[损失的合理性]
必要性分析：[损失的必要性]
调整说明：[如有调整的说明]`
  },
  insurance_liability: {
    title: '保险责任',
    template: `一、保险条款分析
适用条款：[适用的保险条款]
责任范围：[保险责任范围]
除外责任：[除外责任条款]
特别约定：[特别约定事项]

二、责任认定分析
承保范围：[是否在承保范围内]
除外情况：[是否属于除外情况]
免赔适用：[免赔额的适用]
条件满足：[理赔条件是否满足]

三、理赔责任结论
保险责任：[保险公司应承担的责任]
免赔金额：[应扣除的免赔金额]
赔偿范围：[实际赔偿范围]
特殊说明：[需要特别说明的事项]

四、法律依据
相关法规：[适用的法律法规]
司法解释：[相关司法解释]
行业惯例：[行业通行做法]`
  },
  claim_calculation: {
    title: '理算结论',
    template: `一、损失汇总
总损失金额：￥[总损失金额]元
其中：
- 直接损失：￥[直接损失金额]元
- 间接损失：￥[间接损失金额]元
- 施救费用：￥[施救费用金额]元
- 其他费用：￥[其他费用金额]元

二、理赔计算
保险金额：￥[保险金额]元
损失金额：￥[确认损失金额]元
免赔金额：￥[免赔金额]元
赔偿金额：￥[最终赔偿金额]元

三、计算过程
[详细的计算过程和依据]

四、理算结论
经核查，本次事故造成的损失在保险责任范围内，建议赔偿金额为：
人民币[赔偿金额大写]元整（￥[赔偿金额]元）`
  },
  conclusions: {
    title: '结论',
    template: `一、基本结论
1. 事故性质：[事故性质认定]
2. 损失情况：[损失情况总结]
3. 责任认定：[责任认定结论]
4. 理赔建议：[理赔处理建议]

二、主要依据
1. 现场查勘情况
2. 相关技术资料
3. 保险条款约定
4. 法律法规规定

三、处理建议
1. 赔偿建议：建议按保险条款约定赔偿￥[金额]元
2. 注意事项：[需要注意的事项]
3. 后续工作：[需要继续跟进的工作]

四、特别说明
[需要特别说明的重要事项]`
  },
  legal_basis: {
    title: '法律依据',
    template: `一、适用法律
1. 《中华人民共和国保险法》
2. 《中华人民共和国民法典》
3. 《保险公司理赔管理规定》
4. [其他适用法律法规]

二、相关条款
[引用具体的法律条款内容]

三、司法解释
[相关的司法解释]

四、行业规范
[适用的行业规范和标准]

五、法律分析
[结合案件具体情况的法律分析]`
  },
  usage_limitations: {
    title: '使用限制',
    template: `一、本报告使用限制
1. 本报告仅供委托方使用，不得用于其他目的
2. 本报告的结论基于现有资料和信息
3. 如发现新的重要情况，可能影响报告结论
4. 本报告的有效期为[有效期]

二、免责声明
1. 本报告基于目前掌握的资料和信息作出
2. 对于无法核实的信息，本报告仅作参考
3. 最终理赔决定权归保险公司所有

三、联系方式
公估机构：[公估机构名称]
联系人：[联系人姓名]
电话：[联系电话]
地址：[联系地址]

四、附件清单
[列出报告的附件清单]`
  }
}

/**
 * POST /api/v1/ai/generate/[reportId] - AI生成章节内容
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const { reportId } = params
    const { chapter_type, context = '' } = await request.json()

    if (!chapter_type) {
      return NextResponse.json({
        success: false,
        error: '请指定要生成的章节类型'
      }, { status: 400 })
    }

    // 检查是否有对应的模板
    const template = chapterTemplates[chapter_type as keyof typeof chapterTemplates]
    if (!template) {
      return NextResponse.json({
        success: false,
        error: `暂不支持生成 ${chapter_type} 章节`
      }, { status: 400 })
    }

    // 模拟AI生成延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 基于模板和上下文生成内容
    let generatedContent = template.template

    // 如果有上下文，可以在这里集成真实的AI API
    if (context) {
      // TODO: 集成真实的AI API (OpenAI, 文心一言, 通义千问等)
      // 这里可以调用外部AI服务，传入模板和上下文
      generatedContent = `基于上下文信息：${context}\n\n${template.template}`
    }

    // 添加一些动态内容
    const currentDate = new Date().toLocaleDateString('zh-CN')
    generatedContent = generatedContent.replace(/\[生成时间\]/g, currentDate)

    console.log(`为报告 ${reportId} 生成 ${chapter_type} 章节内容`)

    return NextResponse.json({
      success: true,
      generated_content: generatedContent,
      chapter_type,
      generated_at: new Date().toISOString(),
      model_used: '模板生成', // 实际使用AI时这里应该是模型名称
    })

  } catch (error) {
    console.error('AI生成失败:', error)
    return NextResponse.json({
      success: false,
      error: 'AI生成服务暂时不可用',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

/**
 * GET /api/v1/ai/generate/[reportId] - 获取AI生成配置
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const supportedChapters = Object.keys(chapterTemplates).map(key => ({
      id: key,
      title: chapterTemplates[key as keyof typeof chapterTemplates].title,
      supported: true
    }))

    return NextResponse.json({
      success: true,
      supported_chapters: supportedChapters,
      ai_models: [
        { id: 'template', name: '模板生成', available: true },
        { id: 'openai', name: 'GPT-4', available: false, reason: '需要配置API密钥' },
        { id: 'qianwen', name: '通义千问', available: false, reason: '需要配置API密钥' },
      ],
      settings: {
        max_context_length: 4000,
        default_model: 'template'
      }
    })

  } catch (error) {
    console.error('获取AI配置失败:', error)
    return NextResponse.json({
      success: false,
      error: '获取AI配置失败'
    }, { status: 500 })
  }
} 