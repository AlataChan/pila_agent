/**
 * OCR文字识别API路由
 * 
 * 对指定文件进行OCR识别，返回识别结果
 */

/**
 * POST /api/v1/files/[fileId]/ocr - 执行OCR识别
 */
export async function POST(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params
    
    if (!fileId) {
      return Response.json({
        success: false,
        error: '文件ID不能为空',
        message: '请提供有效的文件ID'
      }, { status: 400 })
    }

    // 模拟OCR处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟OCR识别结果 - 根据文件类型返回不同内容
    const mockOcrResults: Record<string, string> = {
      'pdf': `保险事故报告

出险时间：2024年6月7日 14:30
出险地点：上海市浦东新区张江高科技园区
事故性质：设备故障导致的财产损失

详细经过：
1. 当日下午14:30左右，园区内突然停电
2. 备用发电机启动失败，导致电梯系统断电
3. 电梯轿厢被困在5楼与6楼之间
4. 消防队到场后成功救出被困人员
5. 电梯控制系统主板烧毁，需要更换

损失情况：
- 电梯主控制板：12,500元
- 应急通讯系统：3,200元
- 停电期间业务损失：1,551.89元

总计损失：17,251.89元

报告人：张经理
联系电话：138****5678
报告时间：2024年6月7日 16:00`,

      'image': `事故现场照片说明

图片显示：
- 电梯门打开状态，轿厢停在楼层中间位置
- 控制面板显示故障代码：E-07
- 电梯轿厢内应急照明正常工作
- 楼层显示器黑屏，无数字显示

可见损坏情况：
1. 主控制面板右侧有明显烧焦痕迹
2. 应急通话器指示灯不亮
3. 楼层按钮部分无响应

拍摄时间：2024年6月7日 15:45
拍摄位置：6楼电梯厅
天气状况：晴天，光线充足`,

      'contract': `保险合同条款（部分）

第三条 保险责任
保险人对下列原因造成保险标的损失负责赔偿：
(一) 火灾、爆炸
(二) 雷击、暴雨、洪水、台风、暴雪、冰雹、龙卷风、山崩、滑坡、泥石流
(三) 意外事故造成的设备损坏

第五条 责任免除
下列损失，保险人不负责赔偿：
(一) 战争、军事行动或暴乱、罢工
(二) 核反应、核辐射和核污染
(三) 自然磨损、内在缺陷

第八条 赔偿处理
(一) 保险标的发生保险责任范围内的损失，保险人按保险金额与保险价值的比例承担赔偿责任
(二) 每次事故免赔额为人民币500元
(三) 赔偿金额以不超过保险金额为限

保险金额：50万元
免赔额：500元
保险期间：2024年1月1日至2024年12月31日`
    }

    // 简单的文件类型判断（实际应用中会根据真实文件信息）
    let ocrContent = mockOcrResults['pdf'] // 默认PDF内容
    
    // 根据文件ID的后缀或其他特征选择不同的模拟内容
    const fileIdStr = fileId.toString().toLowerCase()
    if (fileIdStr.includes('image') || fileIdStr.includes('photo') || fileIdStr.includes('pic')) {
      ocrContent = mockOcrResults['image']
    } else if (fileIdStr.includes('contract') || fileIdStr.includes('policy')) {
      ocrContent = mockOcrResults['contract']
    }

    return Response.json({
      success: true,
      data: {
        fileId: fileId,
        ocrContent: ocrContent,
        confidence: 0.95, // 识别置信度
        processedAt: new Date().toISOString(),
        wordCount: ocrContent.length,
        language: 'zh-CN'
      },
      message: 'OCR识别完成'
    }, { status: 200 })

  } catch (error) {
    console.error('OCR识别错误:', error)
    return Response.json({
      success: false,
      error: 'OCR识别失败',
      message: '服务器处理文件时出错'
    }, { status: 500 })
  }
}

/**
 * GET /api/v1/files/[fileId]/ocr - 获取OCR识别结果
 */
export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params
    
    if (!fileId) {
      return Response.json({
        success: false,
        error: '文件ID不能为空',
        message: '请提供有效的文件ID'
      }, { status: 400 })
    }

    // 模拟从数据库获取已保存的OCR结果
    const savedOcrResult = {
      fileId: fileId,
      ocrContent: '这是之前保存的OCR识别结果...',
      confidence: 0.92,
      processedAt: '2024-06-07T14:30:00Z',
      wordCount: 156,
      language: 'zh-CN'
    }

    return Response.json({
      success: true,
      data: savedOcrResult,
      message: '获取OCR结果成功'
    }, { status: 200 })

  } catch (error) {
    console.error('获取OCR结果错误:', error)
    return Response.json({
      success: false,
      error: '获取OCR结果失败',
      message: '服务器处理请求时出错'
    }, { status: 500 })
  }
} 