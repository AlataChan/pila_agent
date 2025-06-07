import { NextRequest, NextResponse } from 'next/server'

/**
 * PUT /api/v1/reports/[id]/chapters/[chapterId] - 更新报告章节内容
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, chapterId: string } }
) {
  try {
    const { id, chapterId } = params
    
    // 解析请求体，如果解析失败则使用默认值
    let content = ''
    try {
      const body = await request.json()
      content = body.content || ''
    } catch (parseError) {
      console.warn('解析请求体失败，使用空内容:', parseError)
      content = ''
    }

    // 允许空内容，这是正常的编辑操作
    console.log(`更新报告 ${id} 的章节 ${chapterId}, 内容长度: ${content.length}`)

    // 模拟保存章节内容到数据库
    if (content.length > 0) {
      console.log(`更新报告 ${id} 的章节 ${chapterId}:`, content.substring(0, 100) + (content.length > 100 ? '...' : ''))
    } else {
      console.log(`清空报告 ${id} 的章节 ${chapterId}`)
    }

    return NextResponse.json({
      success: true,
      message: '章节更新成功',
      data: {
        reportId: parseInt(id),
        chapterId,
        content,
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('更新章节失败:', error)
    return NextResponse.json({
      success: false,
      message: '更新章节失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 