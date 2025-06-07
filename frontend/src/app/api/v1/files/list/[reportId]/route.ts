/**
 * 文件列表API路由
 * 
 * 获取指定报告的所有文件列表
 */

/**
 * GET /api/v1/files/list/[reportId] - 获取文件列表
 */
export async function GET(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const { reportId } = params
    
    if (!reportId) {
      return Response.json({
        success: false,
        error: '报告ID不能为空',
        message: '请提供有效的报告ID'
      }, { status: 400 })
    }

    // 模拟文件列表数据
    const mockFiles = [
      {
        id: `file_${reportId}_1`,
        fileName: '事故现场照片.jpg',
        fileType: 'image/jpeg',
        fileSizeBytes: 2048576, // 2MB
        uploadedAt: '2024-06-07T14:35:00Z',
        ocrStatus: 'completed',
        ocrContent: null, // 初始为空，需要调用OCR API
        reportId: reportId
      },
      {
        id: `file_${reportId}_2`,
        fileName: '保险合同.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 1536000, // 1.5MB
        uploadedAt: '2024-06-07T14:40:00Z',
        ocrStatus: 'completed',
        ocrContent: null,
        reportId: reportId
      },
      {
        id: `file_${reportId}_3`,
        fileName: '损失清单.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 512000, // 512KB
        uploadedAt: '2024-06-07T14:45:00Z',
        ocrStatus: 'pending',
        ocrContent: null,
        reportId: reportId
      }
    ]

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
      return `${Math.round(bytes / (1024 * 1024))} MB`
    }

    const formattedFiles = mockFiles.map(file => ({
      ...file,
      formattedSize: formatFileSize(file.fileSizeBytes),
      uploadedAtFormatted: new Date(file.uploadedAt).toLocaleString('zh-CN')
    }))

    return Response.json({
      success: true,
      data: formattedFiles,
      total: formattedFiles.length,
      message: '获取文件列表成功'
    }, { status: 200 })

  } catch (error) {
    console.error('获取文件列表错误:', error)
    return Response.json({
      success: false,
      error: '获取文件列表失败',
      message: '服务器处理请求时出错'
    }, { status: 500 })
  }
} 