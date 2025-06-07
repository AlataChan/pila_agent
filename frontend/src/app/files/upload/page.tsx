'use client'

import { useState, useRef } from 'react'

/**
 * 文件上传页面
 * 
 * 提供文件上传、OCR处理和文件管理功能
 */
export default function FileUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  /**
   * 处理文件选择
   */
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const fileArray = Array.from(selectedFiles)
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.includes('pdf') || file.type.includes('image')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })

    if (validFiles.length !== fileArray.length) {
      setError('部分文件格式不支持或超过10MB限制')
    } else {
      setError('')
    }

    // 添加到文件列表
    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      ocrResult: null
    }))

    setFiles(prev => [...prev, ...newFiles])
  }

  /**
   * 上传文件
   */
  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setUploading(true)

    for (const fileItem of pendingFiles) {
      try {
        // 更新状态为上传中
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
        ))

        const formData = new FormData()
        formData.append('file', fileItem.file)

        const response = await fetch('/api/v1/files/upload', {
          method: 'POST',
          body: formData,
          // TODO: 添加认证头
        })

        if (!response.ok) {
          throw new Error('上传失败')
        }

        const result = await response.json()

        // 更新状态为上传成功
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'uploaded', 
            progress: 100,
            uploadId: result.id,
            ocrResult: result.ocr_result
          } : f
        ))

      } catch (err) {
        console.error('上传失败:', err)
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'error', 
            error: err instanceof Error ? err.message : '上传失败'
          } : f
        ))
      }
    }

    setUploading(false)
  }

  /**
   * 删除文件
   */
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  /**
   * 拖拽处理
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 获取文件状态图标
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'uploading': return '⬆️'
      case 'uploaded': return '✅'
      case 'error': return '❌'
      default: return '📄'
    }
  }

  /**
   * 获取文件类型图标
   */
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    return '📎'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面头部 */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← 返回
          </button>
          <h1 className="text-3xl font-bold text-gray-900">文件上传</h1>
          <p className="text-gray-600 mt-2">上传PDF或图片文件进行OCR识别，提取文字内容</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* 文件上传区域 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-6xl mb-4">📤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              拖拽文件到此处或点击选择
            </h3>
            <p className="text-gray-600 mb-4">
              支持PDF、JPG、PNG格式，单个文件最大10MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              选择文件
            </button>
          </div>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                文件列表 ({files.length})
              </h2>
              <button
                onClick={uploadFiles}
                disabled={uploading || files.filter(f => f.status === 'pending').length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? '上传中...' : '开始上传'}
              </button>
            </div>

            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getStatusIcon(file.status)}</span>
                      <span className="text-sm text-gray-600">
                        {file.status === 'pending' && '等待上传'}
                        {file.status === 'uploading' && '上传中...'}
                        {file.status === 'uploaded' && 'OCR完成'}
                        {file.status === 'error' && file.error}
                      </span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  {/* 进度条 */}
                  {file.status === 'uploading' && (
                    <div className="mt-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* OCR结果 */}
                  {file.ocrResult && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">OCR识别结果:</h4>
                      <p className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                        {file.ocrResult}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">📋 使用说明</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• 支持的文件格式：PDF、JPG、JPEG、PNG</li>
            <li>• 单个文件大小限制：10MB</li>
            <li>• 上传后会自动进行OCR文字识别</li>
            <li>• 识别结果可以复制到报告中使用</li>
            <li>• 文件会安全存储，仅您可以访问</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 