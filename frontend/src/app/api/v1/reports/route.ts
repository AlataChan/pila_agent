/**
 * 报告管理API路由
 * 
 * 临时返回模拟数据，避免404错误
 */

/**
 * GET /api/v1/reports - 获取报告列表
 */
export async function GET() {
  return Response.json({
    success: true,
    data: [],
    message: '报告列表获取成功'
  })
}

/**
 * POST /api/v1/reports - 创建新报告
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 模拟创建报告响应
    const mockReport = {
      id: Date.now().toString(),
      title: body.title || '未命名报告',
      insurance_type: body.insurance_type || '其他',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return Response.json({
      success: true,
      data: mockReport,
      message: '报告创建成功'
    }, { status: 201 })
    
  } catch (error) {
    console.error('创建报告错误:', error)
    return Response.json({
      success: false,
      error: '创建报告失败',
      message: '请求格式错误'
    }, { status: 400 })
  }
} 