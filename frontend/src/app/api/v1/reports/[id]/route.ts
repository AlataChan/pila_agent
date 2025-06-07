import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/v1/reports/[id] - 获取特定报告详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 模拟报告数据，实际应该从数据库获取
    const mockReport = {
      id: parseInt(id),
      title: `公估报告 #${id}`,
      caseNo: `CASE-${id}-2024`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // 各章节内容
      basicInfo: `
## 基本信息

**案件编号：** CASE-${id}-2024
**委托方：** 某保险公司
**被保险人：** 张某某
**标的物：** 车辆损失
**出险时间：** 2024年3月15日
**报告日期：** ${new Date().toLocaleDateString()}

## 案件概述

本次事故为车辆碰撞事故，现场勘查显示车辆前部受损严重，需进行详细评估。
      `.trim(),
      
      sceneInspection: `
## 现场勘查

**勘查时间：** 2024年3月16日 上午10:00
**勘查地点：** 事故现场
**勘查人员：** 公估师李某某

### 现场情况描述

1. 事故现场位于市区主干道，路面干燥，视线良好
2. 车辆前部与护栏发生碰撞，造成明显变形
3. 现场无其他车辆卷入，属于单方事故

### 勘查发现

- 车辆前保险杠完全脱落
- 发动机舱盖严重凹陷
- 前大灯破损，需要更换
- 水箱可能存在损坏风险
      `.trim(),
      
      damageAssessment: `
## 损失评估

### 受损部件清单

| 部件名称 | 损坏程度 | 维修方案 | 预估费用 |
|---------|---------|---------|---------|
| 前保险杠 | 完全损坏 | 更换 | ¥2,500 |
| 发动机舱盖 | 严重凹陷 | 更换 | ¥3,200 |
| 前大灯(左) | 破裂 | 更换 | ¥1,800 |
| 前大灯(右) | 破裂 | 更换 | ¥1,800 |
| 水箱 | 疑似损坏 | 检测后确定 | ¥800-1,500 |

### 维修费用汇总

- **配件费用：** ¥9,300
- **工时费用：** ¥2,100  
- **其他费用：** ¥600
- **总计：** ¥12,000

### 评估说明

根据现场勘查和技术检测，本次事故造成的车辆损失主要集中在前部，发动机等核心部件未受影响，维修后可恢复正常使用。
      `.trim(),
      
      conclusion: `
## 结论与建议

### 事故原因分析

根据现场勘查和相关证据，初步判断事故原因为：
1. 驾驶员操作不当，未能及时制动
2. 车速过快，导致制动距离不足
3. 路面状况良好，排除外部因素

### 损失核定结论

经过详细勘查和评估，本次事故车辆维修费用为人民币**12,000元整**。

### 理赔建议

1. 建议保险公司按照车损险条款进行理赔
2. 维修应选择具备资质的专业修理厂
3. 建议投保人加强安全驾驶意识

**公估师：** 李某某  
**执业证号：** PA20240001  
**出具日期：** ${new Date().toLocaleDateString()}
      `.trim()
    }

    return NextResponse.json({
      success: true,
      message: '报告获取成功',
      data: mockReport
    })

  } catch (error) {
    console.error('获取报告失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取报告失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 