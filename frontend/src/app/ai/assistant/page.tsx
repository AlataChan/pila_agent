'use client'

import { useState, useRef, useEffect } from 'react'
import { ClientTime } from '@/components/ui/ClientTime'

/**
 * AI助手页面
 * 
 * 提供AI对话、章节生成和提示词管理功能
 * 集成DeepSeek模型，支持多种专业模式
 */
export default function AIAssistantPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      type: 'assistant',
      content: '您好！我是基于DeepSeek的公估报告智能撰写助手。我可以帮您：\n\n• 生成报告章节内容\n• 分析案件信息\n• 提供专业建议\n• 优化报告结构\n\n请先配置您的DeepSeek API Key，然后选择专业模式开始对话！',
      timestamp: new Date()
    }
  ])
  
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('deepseek-chat')
  const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com')
  const [professionalMode, setProfessionalMode] = useState('general')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 专业模式配置
  const professionalModes = [
    {
      id: 'general',
      name: '通用公估师',
      description: '全面的保险公估专业助手',
      icon: '🎯',
      color: 'blue'
    },
    {
      id: 'investigation',
      name: '现场查勘专家',
      description: '专注现场勘查和证据收集',
      icon: '🔍',
      color: 'green'
    },
    {
      id: 'assessment',
      name: '损失评估专家',
      description: '专业损失评估和计算',
      icon: '📊',
      color: 'orange'
    },
    {
      id: 'reporting',
      name: '报告撰写专家',
      description: '专业公估报告撰写',
      icon: '📝',
      color: 'purple'
    },
    {
      id: 'legal',
      name: '法规咨询专家',
      description: '保险法规和政策解读',
      icon: '⚖️',
      color: 'red'
    }
  ]

  // 从localStorage加载配置
  useEffect(() => {
    const savedApiKey = localStorage.getItem('deepseek_api_key')
    const savedModel = localStorage.getItem('deepseek_model')
    const savedBaseUrl = localStorage.getItem('deepseek_base_url')
    const savedMode = localStorage.getItem('professional_mode')
    
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedModel) setModel(savedModel)
    if (savedBaseUrl) setBaseUrl(savedBaseUrl)
    if (savedMode) setProfessionalMode(savedMode)
  }, [])

  // 保存配置到localStorage
  const saveSettings = () => {
    localStorage.setItem('deepseek_api_key', apiKey)
    localStorage.setItem('deepseek_model', model)
    localStorage.setItem('deepseek_base_url', baseUrl)
    localStorage.setItem('professional_mode', professionalMode)
    setShowSettings(false)
    
    // 显示保存成功消息
    const currentMode = professionalModes.find(m => m.id === professionalMode)
    const settingsMessage = {
      id: Date.now(),
      type: 'assistant',
      content: `✅ 配置已保存！\n\n**专业模式：** ${currentMode?.icon} ${currentMode?.name}\n**模型：** ${model}\n**API地址：** ${baseUrl}\n**API Key：** ${apiKey ? '已设置' : '未设置'}\n\n现在您可以开始专业对话了。`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, settingsMessage])
  }

  // 切换专业模式
  const changeProfessionalMode = (newMode: string) => {
    setProfessionalMode(newMode)
    localStorage.setItem('professional_mode', newMode)
    
    const modeConfig = professionalModes.find(m => m.id === newMode)
    const modeMessage = {
      id: Date.now(),
      type: 'assistant',
      content: `${modeConfig?.icon} 已切换到 **${modeConfig?.name}** 模式\n\n${modeConfig?.description}\n\n我现在将以该领域专家的身份为您提供专业服务。请告诉我您需要什么帮助？`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, modeMessage])
  }

  // AI模板
  const templates = [
    {
      id: 'accident_analysis',
      title: '事故原因分析',
      description: '分析事故发生的原因和责任',
      prompt: '请根据以下信息分析事故原因：',
      mode: 'general'
    },
    {
      id: 'site_investigation',
      title: '现场查勘指导',
      description: '提供现场查勘步骤和要点',
      prompt: '请为我制定现场查勘计划：',
      mode: 'investigation'
    },
    {
      id: 'loss_assessment',
      title: '损失核定',
      description: '评估和核定保险损失',
      prompt: '请帮我核定以下损失：',
      mode: 'assessment'
    },
    {
      id: 'report_generation',
      title: '报告章节生成',
      description: '生成专业的报告章节',
      prompt: '请帮我生成报告章节：',
      mode: 'reporting'
    },
    {
      id: 'policy_review',
      title: '保单条款分析',
      description: '分析保单条款和适用性',
      prompt: '请分析以下保单条款：',
      mode: 'legal'
    },
    {
      id: 'conclusion',
      title: '公估结论',
      description: '生成专业的公估结论',
      prompt: '请根据以上信息生成公估结论：',
      mode: 'general'
    }
  ]

  // 根据当前模式过滤模板
  const filteredTemplates = templates.filter(template => 
    template.mode === professionalMode || template.mode === 'general'
  )

  /**
   * 发送消息
   */
  const sendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim()
    if (!messageToSend) return

    // 检查API Key配置
    if (!apiKey) {
      const configMessage = {
        id: Date.now(),
        type: 'assistant',
        content: '⚠️ 请先配置DeepSeek API Key才能开始对话。点击右上角的"⚙️ 设置"按钮进行配置。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, configMessage])
      return
    }

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      // 调用AI API，传递DeepSeek配置和专业模式
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          context: messages.slice(-5), // 发送最近5条消息作为上下文
          mode: professionalMode, // 传递专业模式
          config: {
            apiKey,
            model,
            baseUrl
          }
        })
      })

      if (!response.ok) {
        throw new Error('AI响应失败')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'AI响应失败')
      }

      // 添加AI回复
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: result.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('AI对话失败:', error)
      
      // 添加错误消息
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `❌ AI对话失败：${error instanceof Error ? error.message : 'Unknown error'}\n\n请检查：\n• API Key是否正确\n• 网络连接是否正常\n• 模型配置是否有效`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  /**
   * 使用模板
   */
  const useTemplate = (template: any) => {
    // 如果模板需要特定模式，自动切换
    if (template.mode && template.mode !== professionalMode) {
      changeProfessionalMode(template.mode)
    }
    setInputMessage(template.prompt)
    setShowTemplates(false)
  }

  /**
   * 清空对话
   */
  const clearChat = () => {
    if (confirm('确定要清空对话记录吗？')) {
      setMessages([
        {
          id: 1,
          type: 'assistant',
          content: '对话已清空。我可以继续为您提供帮助。',
          timestamp: new Date()
        }
      ])
    }
  }

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * 处理键盘事件
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  /**
   * 格式化时间（避免水合化错误）
   */
  const formatTime = (date: Date) => {
    // 在客户端才显示时间，避免服务端和客户端时区差异
    if (typeof window === 'undefined') {
      return '--:--' // 服务端返回占位符
    }
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 获取当前模式配置
  const currentMode = professionalModes.find(m => m.id === professionalMode)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← 返回
            </button>
            <h1 className="text-xl font-semibold text-gray-900">AI助手</h1>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              在线
            </span>
            {/* 当前专业模式显示 */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${currentMode?.color}-100 text-${currentMode?.color}-800`}>
              {currentMode?.icon} {currentMode?.name}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">模型:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{model}</span>
              <span className={`px-2 py-1 rounded ${apiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {apiKey ? 'API已配置' : 'API未配置'}
              </span>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ⚙️ 设置
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              📝 模板
            </button>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              🗑️ 清空
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* 设置面板 */}
        {showSettings && (
          <div className="w-96 bg-white border-r border-gray-200 p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">DeepSeek API 配置</h2>
            
            <div className="space-y-6">
              {/* 专业模式选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  专业模式 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {professionalModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setProfessionalMode(mode.id)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        professionalMode === mode.id
                          ? `border-${mode.color}-500 bg-${mode.color}-50`
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{mode.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{mode.name}</div>
                          <div className="text-sm text-gray-600">{mode.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="请输入您的DeepSeek API Key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  在 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DeepSeek平台</a> 获取您的API Key
                </p>
              </div>

              {/* 模型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模型
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="deepseek-chat">deepseek-chat</option>
                  <option value="deepseek-coder">deepseek-coder</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  推荐使用 deepseek-chat 进行文本对话
                </p>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API 地址
                </label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.deepseek.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  DeepSeek官方API地址，通常无需修改
                </p>
              </div>

              {/* 保存按钮 */}
              <div className="flex space-x-3">
                <button
                  onClick={saveSettings}
                  disabled={!apiKey.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存配置
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
              </div>

              {/* 使用说明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">📖 使用说明</h3>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• 选择合适的专业模式获得更精准的专业回答</li>
                  <li>• 需要先在DeepSeek平台注册账号并获取API Key</li>
                  <li>• API Key将保存在浏览器本地，不会上传到服务器</li>
                  <li>• 不同专业模式会使用对应的专业提示词</li>
                  <li>• 配置完成后可以开始AI对话</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 模板面板 */}
        {showTemplates && !showSettings && (
          <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI模板</h2>
            <p className="text-sm text-gray-600 mb-4">当前模式：{currentMode?.icon} {currentMode?.name}</p>
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => useTemplate(template)}
                >
                  <h3 className="font-medium text-gray-900 mb-1">{template.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <p className="text-xs text-blue-600">{template.prompt}</p>
                </div>
              ))}
            </div>
            
            {/* 其他模式的模板 */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">其他专业模板</h3>
              <div className="space-y-2">
                {templates.filter(t => t.mode !== professionalMode && t.mode !== 'general').map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer opacity-75"
                    onClick={() => useTemplate(template)}
                  >
                    <h4 className="text-sm font-medium text-gray-800">{template.title}</h4>
                    <p className="text-xs text-gray-500">需要切换到对应专业模式</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col">
          {/* 专业模式快速切换 */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <span className="text-sm text-gray-600 whitespace-nowrap">专业模式：</span>
              {professionalModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => changeProfessionalMode(mode.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    professionalMode === mode.id
                      ? `bg-${mode.color}-100 text-${mode.color}-800 border border-${mode.color}-300`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {mode.icon} {mode.name}
                </button>
              ))}
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    <ClientTime date={message.timestamp} />
                  </div>
                </div>
              </div>
            ))}

            {/* 加载指示器 */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">{currentMode?.icon} {currentMode?.name}正在思考...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`以${currentMode?.name}身份回答您的问题...`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  disabled={loading}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                发送
              </button>
            </div>
            
            {/* 快捷操作 - 根据专业模式动态显示 */}
            <div className="mt-3 flex flex-wrap gap-2">
              {professionalMode === 'general' && (
                <>
                  <button
                    onClick={() => sendMessage('帮我分析一个车险理赔案例')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    车险理赔分析
                  </button>
                  <button
                    onClick={() => sendMessage('生成财产险查勘报告')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    财产险查勘
                  </button>
                  <button
                    onClick={() => sendMessage('如何写公估结论？')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    公估结论指导
                  </button>
                </>
              )}
              
              {professionalMode === 'investigation' && (
                <>
                  <button
                    onClick={() => sendMessage('制定现场查勘计划')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    查勘计划
                  </button>
                  <button
                    onClick={() => sendMessage('现场证据收集要点')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    证据收集
                  </button>
                  <button
                    onClick={() => sendMessage('事故现场摄影指导')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    现场摄影
                  </button>
                </>
              )}
              
              {professionalMode === 'assessment' && (
                <>
                  <button
                    onClick={() => sendMessage('车辆损失评估方法')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    车辆评估
                  </button>
                  <button
                    onClick={() => sendMessage('财产损失计算公式')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    损失计算
                  </button>
                  <button
                    onClick={() => sendMessage('营业中断损失评估')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    中断损失
                  </button>
                </>
              )}
              
              {professionalMode === 'reporting' && (
                <>
                  <button
                    onClick={() => sendMessage('公估报告结构规范')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    报告结构
                  </button>
                  <button
                    onClick={() => sendMessage('损失评估章节写作')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    评估章节
                  </button>
                  <button
                    onClick={() => sendMessage('结论意见撰写技巧')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    结论撰写
                  </button>
                </>
              )}
              
              {professionalMode === 'legal' && (
                <>
                  <button
                    onClick={() => sendMessage('保险法条款解释')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    法条解释
                  </button>
                  <button
                    onClick={() => sendMessage('理赔程序合规要求')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    合规要求
                  </button>
                  <button
                    onClick={() => sendMessage('争议处理策略')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    争议处理
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      {messages.length <= 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 专业模式使用提示</h3>
          <ul className="text-blue-800 space-y-1 text-xs">
            <li>• 选择合适的专业模式获得更精准的专业回答</li>
            <li>• 每种模式都有专门的提示词和知识背景</li>
            <li>• 可随时切换模式以获得不同角度的建议</li>
            <li>• 使用模板快速生成对应专业内容</li>
            <li>• 支持多轮对话，AI会记住上下文</li>
          </ul>
        </div>
      )}
    </div>
  )
} 