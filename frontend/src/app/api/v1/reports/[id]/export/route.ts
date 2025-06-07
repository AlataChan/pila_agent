import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/v1/reports/[id]/export - 导出报告
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pdf'

    // 模拟生成报告内容
    const reportContent = `


                    正达保险公估有限公司
              ZhengDa Insurance Survers&Loss Adjusters CO., LTD.
    ═══════════════════════════════════════════════════════════════════

    地址 (ADD)：福建省福州市福州仓山万达广场 C1-1819              邮编 (POST CODE)：350028
    电话 (TEL)：(0591) 86396103                           传真 (FAX)：(0591) 86396662


                              保险公估报告


    ═══════════════════════════════════════════════════════════════════

    案件编号：CASE-${id}-2024
    委托方：某保险公司
    被保险人：张某某
    标的物：车辆损失
    出险时间：2024年3月15日
    报告日期：${new Date().toLocaleDateString('zh-CN')}

═══════════════════════════════════════════════════════════════════

## 一、基本信息

### 1.1 案件概况
本次事故为车辆碰撞事故，现场勘查显示车辆前部受损严重，需进行详细评估。

### 1.2 委托情况
接到保险公司委托后，我公司立即指派专业公估师前往现场进行勘查。

## 二、现场勘查情况

### 2.1 勘查基本信息
勘查时间：2024年3月16日 上午10:00
勘查地点：事故现场
勘查人员：公估师李某某（执业证号：PA20240001）

### 2.2 现场情况描述

1. 事故现场位于市区主干道，路面干燥，视线良好
2. 车辆前部与护栏发生碰撞，造成明显变形
3. 现场无其他车辆卷入，属于单方事故

### 2.3 受损情况勘查

经现场详细勘查，发现以下受损情况：
- 车辆前保险杠完全脱落
- 发动机舱盖严重凹陷
- 前大灯破损，需要更换
- 水箱可能存在损坏风险

## 三、损失评估分析

### 3.1 受损部件清单

| 序号 | 部件名称      | 损坏程度   | 维修方案   | 预估费用    |
|-----|-------------|----------|----------|-----------|
| 1   | 前保险杠     | 完全损坏   | 更换      | ¥2,500   |
| 2   | 发动机舱盖   | 严重凹陷   | 更换      | ¥3,200   |
| 3   | 前大灯(左)   | 破裂      | 更换      | ¥1,800   |
| 4   | 前大灯(右)   | 破裂      | 更换      | ¥1,800   |
| 5   | 水箱        | 疑似损坏   | 检测后确定 | ¥800-1,500 |

### 3.2 维修费用汇总

- 配件费用：¥9,300
- 工时费用：¥2,100  
- 其他费用：¥600
- **损失总计：¥12,000**

### 3.3 评估说明

根据现场勘查和技术检测，本次事故造成的车辆损失主要集中在前部，发动机等核心部件未受影响，维修后可恢复正常使用。所有维修项目均按照原厂标准进行评估。

## 四、事故原因分析

根据现场勘查和相关证据，结合当事人陈述，初步判断事故原因为：

1. **直接原因**：驾驶员操作不当，未能及时制动
2. **间接原因**：车速过快，导致制动距离不足  
3. **环境因素**：路面状况良好，天气晴朗，排除外部不利因素

## 五、公估意见与建议

### 5.1 损失核定意见

经过详细勘查、技术分析和费用评估，本次事故车辆维修费用核定为人民币**12,000元整**。

### 5.2 理赔建议

1. 建议保险公司按照车辆损失保险条款予以理赔
2. 维修应选择具备相应资质的专业汽车修理厂
3. 维修过程中应使用原厂配件或同等质量配件
4. 建议被保险人今后加强安全驾驶意识，避免类似事故发生


═══════════════════════════════════════════════════════════════════

                              公估结论

本次事故经现场勘查和技术分析，损失金额认定为人民币 **12,000元整**。

建议保险公司依据保险条款予以理赔。


                            公估机构信息

公估机构：正达保险公估有限公司
资质证书：[公估机构资质证书号]
业务范围：财产保险公估、人身保险公估
联系电话：(0591) 86396103


                            公估师签字

公估师：李某某                               
执业证号：PA20240001                        
签字：                    （签字）           
日期：${new Date().toLocaleDateString('zh-CN')}                              


                                                    [公司印章位置]

                           正达保险公估有限公司
                      ${new Date().toLocaleDateString('zh-CN')}

═══════════════════════════════════════════════════════════════════
    `.trim()

    // 根据格式生成不同的响应
    let fileName = `公估报告_${id}_${new Date().toISOString().split('T')[0]}`
    let mimeType = 'application/octet-stream'
    let content = reportContent

    switch (format.toLowerCase()) {
      case 'pdf':
        fileName += '.pdf'
        mimeType = 'application/pdf'
        // 模拟PDF内容（实际应该使用PDF生成库）
        content = `PDF模拟内容 - ${reportContent}`
        break
      case 'word':
      case 'docx':
        fileName += '.docx'
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        // 对于Word格式，保持原始文本内容，实际部署时可以使用docx库生成真正的Word文档
        content = reportContent
        break
      case 'txt':
        fileName += '.txt'
        mimeType = 'text/plain'
        break
      default:
        fileName += '.txt'
        mimeType = 'text/plain'
    }

    // 创建Blob响应
    const blob = new Blob([content], { type: mimeType })
    
    const response = new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': blob.size.toString()
      }
    })

    return response

  } catch (error) {
    console.error('导出报告失败:', error)
    return NextResponse.json({
      success: false,
      message: '导出报告失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 