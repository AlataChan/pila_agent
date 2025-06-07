/**
 * 文件上传API路由
 * 
 * 处理文件上传请求，返回模拟响应
 */

/**
 * POST /api/v1/files/upload - 文件上传
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // 支持单个文件或多个文件上传
    let files: File[] = []
    const singleFile = formData.get('file') as File
    const multipleFiles = formData.getAll('files') as File[]
    
    if (singleFile) {
      files = [singleFile]
    } else if (multipleFiles && multipleFiles.length > 0) {
      files = multipleFiles
    }
    
    if (!files || files.length === 0) {
      return Response.json({
        success: false,
        error: '没有选择文件',
        message: '请选择要上传的文件'
      }, { status: 400 })
    }
    
    // 模拟文件处理
    const uploadedFiles = files.map((file, index) => ({
      id: Date.now() + index,
      fileName: file.name,
      fileType: file.type,
      fileSizeBytes: file.size,
      ocrStatus: 'completed',
      uploadedAt: new Date().toISOString(),
      uploadUrl: `/uploads/${Date.now()}_${file.name}`,
      ocr_result: `这是文件 ${file.name} 的OCR识别结果:\n\n模拟识别的文字内容...`
    }))
    
    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 如果是单个文件上传，返回单个对象；多个文件返回数组
    const responseData = files.length === 1 ? uploadedFiles[0] : uploadedFiles
    
    return Response.json({
      success: true,
      data: responseData,
      message: '文件上传成功'
    }, { status: 200 })
    
  } catch (error) {
    console.error('文件上传错误:', error)
    return Response.json({
      success: false,
      error: '文件上传失败',
      message: '服务器处理文件时出错'
    }, { status: 500 })
  }
} 