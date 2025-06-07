'use client'

import { useState, useEffect } from 'react'

/**
 * 报告编辑器页面
 * 
 * 提供完整的报告编辑功能，包括章节管理、AI生成、文件上传等
 */
export default function ReportEditPage() {
  const reportId = 1 // 模拟报告ID

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeChapter, setActiveChapter] = useState('accident_details')
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [showFilePanel, setShowFilePanel] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [showGeneratedContent, setShowGeneratedContent] = useState(false)
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)

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
  useEffect(() => {
    const loadReport = async () => {
      try {
        const response = await fetch(`/api/v1/reports/${reportId}`)
        if (!response.ok) throw new Error('加载报告失败')
        
        const reportData = await response.json()
        setReport(reportData)
      } catch (error) {
        console.error('加载报告失败:', error)
        // TODO: 显示错误提示
      } finally {
        setLoading(false)
      }
    }

    if (reportId) {
      loadReport()
    }
  }, [reportId])

  /**
   * 保存章节内容
   */
  const saveChapter = async (chapterId: string, content: string) => {
    setSaving(true)
    try {
      console.log(`正在保存章节 ${chapterId}, 内容长度: ${content.length}`)
      
      const response = await fetch(`/api/v1/reports/${reportId}/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('API响应错误:', response.status, errorData)
        throw new Error(`保存失败 (${response.status}): ${errorData}`)
      }
      
      const result = await response.json()
      console.log('保存成功:', result)
      
      setReport((prev: any) => ({ ...prev, [chapterId]: content }))
      
      // 静默保存，不显示成功提示（避免打扰用户）
    } catch (error) {
      console.error('保存失败:', error)
      // 只在真正的错误时显示提示
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        alert(`保存失败: ${error.message}`)
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * AI生成章节内容
   */
  const generateWithAI = async (chapterId: string, context?: string) => {
    try {
      setGeneratedContent('')
      setShowGeneratedContent(false)
      
      const response = await fetch(`/api/v1/ai/generate/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter_type: chapterId,
          context: context
        })
      })
      
      if (!response.ok) throw new Error('AI生成失败')
      
      const result = await response.json()
      if (result.success) {
        setGeneratedContent(result.generated_content)
        setShowGeneratedContent(true)
        
        // 显示生成成功提示
        alert('AI内容生成成功！请在预览区域查看并选择是否插入。')
      } else {
        throw new Error(result.error || 'AI生成失败')
      }
    } catch (error) {
      console.error('AI生成失败:', error)
      alert(`AI生成失败：${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 插入模板内容
   */
  const insertTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/v1/templates/${templateId}`)
      if (!response.ok) throw new Error('获取模板失败')
      
      const template = await response.json()
      if (template.success) {
        setGeneratedContent(template.data.content)
        setShowGeneratedContent(true)
        alert('模板内容已加载！请在预览区域查看并选择是否插入。')
      } else {
        throw new Error(template.message || '获取模板失败')
      }
    } catch (error) {
      console.error('插入模板失败:', error)
      alert(`插入模板失败：${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 插入生成的内容到编辑器
   */
  const insertGeneratedContent = () => {
    if (generatedContent) {
      setReport((prev: any) => ({ ...prev, [activeChapter]: generatedContent }))
      setShowGeneratedContent(false)
      setGeneratedContent('')
      alert('内容已插入到编辑器！')
    }
  }

  /**
   * 追加生成的内容到编辑器
   */
  const appendGeneratedContent = () => {
    if (generatedContent) {
      const currentContent = report[activeChapter] || ''
      const newContent = currentContent ? `${currentContent}\n\n${generatedContent}` : generatedContent
      setReport((prev: any) => ({ ...prev, [activeChapter]: newContent }))
      setShowGeneratedContent(false)
      setGeneratedContent('')
      alert('内容已追加到编辑器！')
    }
  }

  /**
   * 导出报告
   */
  const handleExport = async (format: string = 'docx') => {
    try {
      const response = await fetch(`/api/v1/reports/${reportId}/export?format=${format}`)
      
      if (!response.ok) {
        throw new Error(`导出失败: ${response.status}`)
      }

      // 获取文件名
      const contentDisposition = response.headers.get('content-disposition')
      let fileName = `报告_${reportId}.${format}`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
        }
      }

      // 下载文件
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      alert('导出成功！')
    } catch (error) {
      console.error('导出失败:', error)
      alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

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

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">报告不存在</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
          </button>
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
              onClick={() => window.location.href = '/dashboard'}
              className="text-gray-600 hover:text-gray-800"
            >
              ← 返回
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{report.title}</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {report.status === 'draft' ? '草稿' : report.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilePanel(!showFilePanel)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              📎 文件管理
            </button>
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              🤖 AI助手
            </button>
            <button
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '💾 保存'}
            </button>
            <button 
              onClick={() => handleExport()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📤 导出
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* 左侧章节导航 */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">报告章节</h2>
            <nav className="space-y-2">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter.id)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeChapter === chapter.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{chapter.icon}</span>
                  <span className="text-sm">{chapter.title}</span>
                  {report[chapter.id] && (
                    <span className="ml-auto text-green-500">●</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* 报告信息 */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">报告信息</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>类型: {report.insurance_type || '未设置'}</div>
              <div>创建: {report.created_at}</div>
              <div>更新: {report.updated_at}</div>
            </div>
          </div>
        </div>

        {/* 主编辑区域 */}
        <div className="flex-1 flex flex-col">
          {/* 章节标题 */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {chapters.find(c => c.id === activeChapter)?.title}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => generateWithAI(activeChapter)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                >
                  ✨ AI生成
                </button>
                <button 
                  onClick={() => setShowTemplatePanel(true)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  📋 插入模板
                </button>
              </div>
            </div>
          </div>

          {/* 编辑器 */}
          <div className={`flex-1 p-6 flex flex-col ${showGeneratedContent ? 'space-y-4' : ''}`}>
            <div className={showGeneratedContent ? 'flex-1' : 'h-full'}>
              <textarea
                value={report[activeChapter] || ''}
                onChange={(e) => {
                  const content = e.target.value
                  setReport((prev: any) => ({ ...prev, [activeChapter]: content }))
                }}
                onBlur={(e) => saveChapter(activeChapter, e.target.value)}
                placeholder={`开始撰写${chapters.find(c => c.id === activeChapter)?.title}...

这里是一个智能的报告编辑器：
• 左侧选择不同章节进行编辑
• 点击"AI生成"按钮可以智能生成内容
• 支持实时保存和导出功能
• 可以上传相关文档进行OCR识别

开始输入您的内容...`}
                className="w-full h-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 生成内容预览区域 */}
            {showGeneratedContent && (
              <div className="h-64 border border-gray-300 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">AI生成内容预览</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={insertGeneratedContent}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      替换当前内容
                    </button>
                    <button
                      onClick={appendGeneratedContent}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      追加到末尾
                    </button>
                    <button
                      onClick={() => setShowGeneratedContent(false)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      关闭预览
                    </button>
                  </div>
                </div>
                <div className="h-40 overflow-y-auto bg-white border rounded p-3 text-sm">
                  <pre className="whitespace-pre-wrap font-mono">{generatedContent}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧AI助手面板 */}
        {showAIPanel && (
          <div className="w-80 bg-white border-l border-gray-200">
            <AIAssistantPanel
              reportId={reportId}
              activeChapter={activeChapter}
              onGenerate={generateWithAI}
              onClose={() => setShowAIPanel(false)}
            />
          </div>
        )}

        {/* 右侧文件管理面板 */}
        {showFilePanel && (
          <div className="w-80 bg-white border-l border-gray-200">
            <FileManagementPanel
              reportId={reportId}
              onClose={() => setShowFilePanel(false)}
            />
          </div>
        )}

        {/* 模板选择面板 */}
        {showTemplatePanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-96 max-h-96 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">选择模板</h3>
                  <button 
                    onClick={() => setShowTemplatePanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                <TemplateSelector 
                  onSelect={(templateId) => {
                    insertTemplate(templateId)
                    setShowTemplatePanel(false)
                  }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * AI助手面板组件
 */
function AIAssistantPanel({ reportId, activeChapter, onGenerate, onClose }: any) {
  const [context, setContext] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await onGenerate(activeChapter, context)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">AI助手</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            上下文信息
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="输入相关背景信息，帮助AI生成更准确的内容..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {generating ? '生成中...' : '✨ 生成内容'}
        </button>

        <div className="text-xs text-gray-500">
          <p>💡 提示：</p>
          <ul className="mt-1 space-y-1">
            <li>• 提供详细的案件信息能获得更好的生成效果</li>
            <li>• 可以多次生成，选择最满意的内容</li>
            <li>• 生成后可以手动编辑和优化</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * 文件管理面板组件
 */
function FileManagementPanel({ reportId, onClose }: any) {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ocrModal, setOcrModal] = useState<{isOpen: boolean, file: any, content: string, loading: boolean}>({
    isOpen: false,
    file: null,
    content: '',
    loading: false
  })

  // 加载文件列表
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch(`/api/v1/files/list/${reportId}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setFiles(result.data)
          }
        }
      } catch (error) {
        console.error('加载文件列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFiles()
  }, [reportId])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('report_id', reportId)

      const response = await fetch('/api/v1/files/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('上传失败')

      const result = await response.json()
      if (result.success) {
        // 刷新文件列表
        const listResponse = await fetch(`/api/v1/files/list/${reportId}`)
        if (listResponse.ok) {
          const listResult = await listResponse.json()
          if (listResult.success) {
            setFiles(listResult.data)
          }
        }
      }
    } catch (error) {
      console.error('上传失败:', error)
      alert('文件上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  // 执行OCR识别
  const handleOcrRecognition = async (file: any) => {
    setOcrModal({
      isOpen: true,
      file: file,
      content: '',
      loading: true
    })

    try {
      const response = await fetch(`/api/v1/files/${file.id}/ocr`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('OCR识别失败')

      const result = await response.json()
      if (result.success) {
        setOcrModal(prev => ({
          ...prev,
          content: result.data.ocrContent,
          loading: false
        }))
      }
    } catch (error) {
      console.error('OCR识别失败:', error)
      setOcrModal(prev => ({
        ...prev,
        content: 'OCR识别失败，请重试',
        loading: false
      }))
    }
  }

  // 复制OCR内容
  const copyOcrContent = async () => {
    try {
      await navigator.clipboard.writeText(ocrModal.content)
      alert('内容已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请手动选择文本复制')
    }
  }

  // 关闭OCR模态框
  const closeOcrModal = () => {
    setOcrModal({
      isOpen: false,
      file: null,
      content: '',
      loading: false
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType === 'application/pdf') return '📄'
    return '📎'
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">文件管理</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <div className="space-y-4">
        {/* 文件上传 */}
        <div>
          <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 text-center">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            {uploading ? (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">上传中...</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">📎 点击上传文件</p>
                <p className="text-xs text-gray-500">支持 PDF、图片格式</p>
              </div>
            )}
          </label>
        </div>

        {/* 文件列表 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">已上传文件</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-xs text-gray-500">加载中...</p>
              </div>
            ) : files.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">暂无文件</p>
            ) : (
              files.map((file: any) => (
                <div key={file.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(file.fileType)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {file.formattedSize} • {file.uploadedAtFormatted}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          file.ocrStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : file.ocrStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {file.ocrStatus === 'completed' ? '✓ 可识别' : 
                           file.ocrStatus === 'pending' ? '⏳ 等待中' : '❌ 失败'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-2 flex flex-col space-y-1">
                      <button 
                        onClick={() => handleOcrRecognition(file)}
                        disabled={file.ocrStatus !== 'completed'}
                        className={`px-3 py-1 text-xs rounded font-medium ${
                          file.ocrStatus === 'completed'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        🔍 识别内容
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* OCR识别结果模态框 */}
      {ocrModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* 模态框头部 */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium">识别内容</h3>
              <button onClick={closeOcrModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            {/* 文件信息 */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                {getFileIcon(ocrModal.file?.fileType)} {ocrModal.file?.fileName}
              </p>
            </div>

            {/* 识别内容 */}
            <div className="flex-1 p-4 overflow-hidden">
              {ocrModal.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">正在识别中，请稍候...</p>
                </div>
              ) : (
                <div className="h-full">
                  <textarea
                    value={ocrModal.content}
                    readOnly
                    className="w-full h-full p-3 border border-gray-300 rounded-lg text-sm resize-none bg-gray-50"
                    placeholder="识别内容将显示在这里..."
                  />
                </div>
              )}
            </div>

            {/* 模态框底部 */}
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={closeOcrModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
              {!ocrModal.loading && ocrModal.content && (
                <button
                  onClick={copyOcrContent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  📋 复制内容
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 模板选择器组件
 */
function TemplateSelector({ onSelect }: { onSelect: (templateId: string) => void }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/v1/templates')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setTemplates(result.data)
          }
        }
      } catch (error) {
        console.error('加载模板失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">加载模板中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {templates.length === 0 ? (
        <p className="text-center text-gray-500 py-8">暂无可用模板</p>
      ) : (
        templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">{template.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{template.category}</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {template.isActive ? '可用' : '停用'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
} 