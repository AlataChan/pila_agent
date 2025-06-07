'use client'

import { useState, useEffect } from 'react'

/**
 * 报告查看页面
 * 
 * 提供只读的报告内容展示和导出功能
 */
export default function ReportViewPage({ params }: { params: { id: string } }) {
  const reportId = params.id
  
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  // 章节配置
  const chapters = [
    { id: 'accident_details', title: '事故经过及索赔', icon: '📋' },
    { id: 'policy_summary', title: '保单内容摘要', icon: '📄' },
    { id: 'site_investigation', title: '现场查勘情况', icon: '🔍' },
    { id: 'cause_analysis', title: '事故原因分析', icon: '🔬' },
    { id: 'loss_assessment', title: '损失核定', icon: '💰' },
    { id: 'conclusion', title: '公估结论', icon: '✅' }
  ]

  /**
   * 加载报告数据
   */
  const loadReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/reports/${reportId}`, {
        headers: {
          'Content-Type': 'application/json',
          // TODO: 添加认证头
        },
      })

      if (!response.ok) {
        throw new Error('加载报告失败')
      }

      const data = await response.json()
      setReport(data)
    } catch (err) {
      console.error('加载报告失败:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      
      // 使用模拟数据作为后备
      setReport({
        id: reportId,
        title: '某某公司车辆保险理赔报告',
        insurance_type: '车险',
        status: 'completed',
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2024-03-16T15:30:00Z',
        accident_details: `根据现场勘查和当事人陈述，事故发生经过如下：

**事故基本信息：**
- 事故发生时间：2024年3月10日14:30
- 事故发生地点：某市XX路与XX街交叉口
- 天气条件：晴朗，能见度良好
- 道路状况：城市主干道，路面干燥

**事故经过：**
被保险车辆（京A12345）由南向北行驶至XX路与XX街交叉口时，因避让突然变道的前车，紧急制动后与跟随车辆发生追尾碰撞。

**当事人陈述：**
- 投保人陈述：当时正常行驶，前车突然变道，紧急制动避让时被后车追尾
- 第三方陈述：跟车距离较近，发现前车制动时已来不及停车

**证据材料：**
- 现场照片：15张
- 交警认定书：已出具
- 行车记录仪：有`,
        
        policy_summary: `**保险合同基本信息：**
- 保险公司：XX财产保险股份有限公司
- 保单号：CXBQ2024001234567
- 投保人：某某公司
- 被保险人：某某公司
- 保险标的：京A12345（品牌：奔驰 型号：E300L）

**承保险种及保险金额：**
1. 机动车损失保险：保险金额350,000元
2. 第三者责任保险：赔偿限额1,000,000元
3. 车上人员责任保险：每座20,000元
4. 全车盗抢险：保险金额350,000元

**保险期间：**
2024年1月1日0时起至2024年12月31日24时止

**特别约定：**
- 指定驾驶人：李某某（驾龄10年）
- 指定行驶区域：本市及周边城市
- 免赔额：绝对免赔额1000元`,
        
        site_investigation: `**现场勘查情况：**

**勘查时间：** 2024年3月10日15:00
**勘查人员：** 李某某（公估师）、王某某（查勘员）
**现场位置：** 某市XX路与XX街交叉口东南角

**现场环境：**
- 路面状况：沥青路面，干燥清洁
- 交通设施：红绿灯正常，标线清晰
- 能见度：良好，无雨雪雾等恶劣天气

**车辆损坏情况：**
1. 被保险车辆（京A12345）：
   - 后保险杠严重变形
   - 后备箱盖凹陷
   - 后组合灯破损
   - 后雾灯脱落

2. 第三方车辆：
   - 前保险杠轻微划伤
   - 前格栅有裂纹

**物证收集：**
- 现场照片：车辆损坏部位、现场环境、路面痕迹
- 测量数据：刹车印长度、车辆最终位置
- 相关证件：驾驶证、行驶证、保单等`,
        
        cause_analysis: `**事故原因分析：**

**直接原因：**
后车跟车距离过近，未保持安全车距，在前车紧急制动时未能及时停车，导致追尾事故。

**间接原因分析：**
1. **驾驶员因素：**
   - 后车驾驶员注意力不够集中
   - 对前方路况判断不准确
   - 反应时间较长

2. **环境因素：**
   - 交通流量较大
   - 前车变道行为突然
   - 路口视线相对复杂

3. **车辆因素：**
   - 后车制动性能正常
   - 轮胎状况良好
   - 无机械故障

**责任认定：**
根据交警部门出具的《道路交通事故认定书》，后车承担此次事故的全部责任。前车避让变道车辆的行为属于正常驾驶行为，无责任。

**结论：**
此次事故系典型的追尾事故，责任明确，符合机动车损失保险的承保范围。`,
        
        loss_assessment: `**损失核定：**

**一、直接财产损失**

**1. 被保险车辆维修费用：**
- 后保险杠更换：￥3,200
- 后备箱盖钣金修复：￥2,800
- 后组合灯更换：￥1,600
- 后雾灯更换：￥400
- 喷漆费用：￥2,500
- 工时费：￥1,500
- **小计：￥12,000**

**2. 施救费用：**
- 拖车费：￥300
- **小计：￥300**

**3. 第三方财产损失：**
- 前保险杠维修：￥800
- 前格栅更换：￥600
- **小计：￥1,400**

**二、损失认定**
- **直接损失合计：￥13,700**
- **绝对免赔额：￥1,000**
- **实际赔偿金额：￥12,700**

**三、核定依据**
1. 4S店维修报价单
2. 配件价格市场调研
3. 当地工时费标准
4. 保险条款约定

**四、核定结论**
经核实，本次事故损失真实合理，在保险责任范围内，建议赔付￥12,700元。`,
        
        conclusion: `**公估结论**

综合本次事故的调查情况，现作出如下公估结论：

**一、事故责任认定**
根据公安交通管理部门出具的《道路交通事故认定书》，后车（第三方车辆）承担此次事故的全部责任，被保险车辆无责任。

**二、保险责任分析**
1. **保险标的：** 京A12345奔驰E300L轿车
2. **承保风险：** 机动车损失保险，承保碰撞、倾覆等风险
3. **事故性质：** 道路交通事故，属于承保风险范围
4. **免责条款：** 经核实，不存在免责情形
5. **责任结论：** 属于保险责任，应予赔付

**三、损失核定结论**
1. **认定损失：** ￥13,700元
2. **免赔额：** ￥1,000元（绝对免赔额）
3. **赔偿金额：** ￥12,700元

**四、处理建议**
1. 建议保险公司按照核定金额￥12,700元进行赔付
2. 建议被保险人选择保险公司推荐的维修厂进行维修
3. 维修过程中如发现隐性损失，可申请二次查勘
4. 保留好所有维修发票和相关单据

**五、公估师意见**
本次事故事实清楚，责任明确，损失真实合理，符合保险合同约定的赔偿条件。建议保险公司予以赔付。

**公估师：** 李某某  
**公估机构：** XX保险公估有限公司  
**出具日期：** 2024年3月16日`
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * 导出报告
   */
  const exportReport = async (format: string) => {
    try {
      setExporting(true)
      const response = await fetch(`/api/v1/reports/${reportId}/export?format=${format}`, {
        headers: {
          'Content-Type': 'application/json',
          // TODO: 添加认证头
        },
      })

      if (!response.ok) {
        throw new Error('导出失败')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.title}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert('导出成功')
    } catch (err) {
      console.error('导出失败:', err)
      alert(err instanceof Error ? err.message : '导出失败')
    } finally {
      setExporting(false)
    }
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      review: '审核中',
      completed: '已完成',
      archived: '已归档'
    }
    return statusMap[status] || status
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-800',
      review: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  // 页面加载时获取报告数据
  useEffect(() => {
    if (reportId) {
      loadReport()
    }
  }, [reportId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">报告加载失败</h1>
          <p className="text-gray-600 mb-4">{error || '报告不存在'}</p>
          <div className="space-x-3">
            <button
              onClick={() => loadReport()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              重试
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← 返回
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{report.title}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
              {getStatusText(report.status)}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.href = `/reports/${reportId}/edit`}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              ✏️ 编辑
            </button>
            
            <div className="relative">
              <button
                onClick={() => exportReport('docx')}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {exporting ? '导出中...' : '📄 导出Word'}
              </button>
            </div>
            
            <button
              onClick={() => exportReport('pdf')}
              disabled={exporting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              📑 导出PDF
            </button>
          </div>
        </div>
      </div>

      {/* 报告内容 */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 报告基本信息 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">报告信息</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">险种类型：</span>
              <span className="font-medium">{report.insurance_type}</span>
            </div>
            <div>
              <span className="text-gray-600">报告状态：</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                {getStatusText(report.status)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">创建时间：</span>
              <span className="font-medium">{report.created_at}</span>
            </div>
            <div>
              <span className="text-gray-600">更新时间：</span>
              <span className="font-medium">{report.updated_at}</span>
            </div>
          </div>
        </div>

        {/* 报告章节内容 */}
        <div className="space-y-6">
          {chapters.map((chapter) => {
            const content = report[chapter.id]
            if (!content) return null

            return (
              <div key={chapter.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">{chapter.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{chapter.title}</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <div 
                    className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* 页脚信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>此报告由公估报告智能撰写助手生成</p>
          <p>生成时间：{new Date().toISOString().slice(0, 19).replace('T', ' ')}</p>
        </div>
      </div>
    </div>
  )
}