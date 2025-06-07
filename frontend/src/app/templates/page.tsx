'use client'

import { useState, useEffect } from 'react'

/**
 * 模板类型定义
 */
interface Template {
  id: string | number | null
  type: string
  title: string
  content: string
  isDefault?: boolean
  isActive?: boolean
  category?: string
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * 模板类型配置
 */
interface TemplateType {
  id: string
  title: string
  icon: string
}

/**
 * 模板管理页面
 * 
 * 提供报告模板的查看、编辑和管理功能
 */
export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 模板类型
  const templateTypes: TemplateType[] = [
    { id: 'accident_details', title: '事故经过及索赔', icon: '📋' },
    { id: 'policy_summary', title: '保单内容摘要', icon: '📄' },
    { id: 'site_investigation', title: '现场查勘情况', icon: '🔍' },
    { id: 'cause_analysis', title: '事故原因分析', icon: '🔬' },
    { id: 'loss_assessment', title: '损失核定', icon: '💰' },
    { id: 'conclusion', title: '公估结论', icon: '✅' },
    { id: 'comprehensive', title: '完整公估报告', icon: '📊' }
  ]

  /**
   * 加载模板列表
   */
  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/v1/templates', {
        headers: {
          'Content-Type': 'application/json',
          // TODO: 添加认证头
        },
      })

      if (!response.ok) {
        throw new Error('获取模板列表失败')
      }

      const result = await response.json()
      
      // 检查API响应格式
      if (result.success && Array.isArray(result.data)) {
        setTemplates(result.data)
      } else if (Array.isArray(result)) {
        // 兼容直接返回数组的情况
        setTemplates(result)
      } else {
        console.error('API返回的数据格式不正确:', result)
        throw new Error(result.error || '数据格式错误')
      }
    } catch (err) {
      console.error('加载模板失败:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      
      // 使用模拟数据作为后备（转换API格式到前端期望格式）
      setTemplates([
        {
          id: 'accident_details',
          type: 'accident_details',
          title: '事故经过及索赔',
          content: '根据现场勘查和当事人陈述，事故发生经过如下：\n\n1. 事故发生时间：{事故时间}\n2. 事故发生地点：{事故地点}\n3. 天气条件：{天气情况}\n4. 道路状况：{道路状况}\n5. 事故经过：{详细经过}\n\n当事人陈述：\n- 投保人陈述：{投保人陈述}\n- 第三方陈述：{第三方陈述}\n\n证据材料：\n- 现场照片：{照片数量}张\n- 交警认定书：{是否有}\n- 其他证据：{其他证据}',
          isDefault: true,
          isActive: true,
          category: 'basic',
          description: '记录事故发生的详细经过和索赔情况',
          createdAt: '2024-01-15',
          updatedAt: '2024-03-01'
        },
        {
          id: 'loss_assessment',
          type: 'loss_assessment',
          title: '损失核定',
          content: '根据现场查勘和相关资料，损失核定情况如下：\n\n一、受损财产清单\n{财产清单}\n\n二、损失程度评估\n1. 完全损毁：{完全损毁项目}\n2. 部分损坏：{部分损坏项目}\n3. 可修复项目：{可修复项目}\n\n三、损失金额核定\n1. 直接损失：￥{直接损失金额}\n2. 间接损失：￥{间接损失金额}\n3. 合计损失：￥{总损失金额}\n\n四、核定依据\n- 市场价格调研：{价格依据}\n- 专业评估报告：{评估报告}\n- 维修报价单：{维修报价}',
          isDefault: true,
          isActive: true,
          category: 'assessment',
          description: '评估和核定保险损失金额',
          createdAt: '2024-01-20',
          updatedAt: '2024-02-28'
        },
        {
          id: 'conclusion',
          type: 'conclusion',
          title: '公估结论',
          content: '综合本次事故的调查情况，现作出如下公估结论：\n\n一、事故责任认定\n{责任认定结果}\n\n二、保险责任分析\n1. 保险标的：{保险标的}\n2. 承保风险：{承保风险}\n3. 免责条款：{免责条款分析}\n4. 责任结论：{责任结论}\n\n三、损失核定结论\n1. 认定损失：￥{认定损失}\n2. 免赔额：￥{免赔额}\n3. 赔偿金额：￥{赔偿金额}\n\n四、处理建议\n{处理建议}\n\n以上结论供保险公司理赔参考。',
          isDefault: true,
          isActive: true,
          category: 'conclusion',
          description: '基于调查得出的专业公估结论',
          createdAt: '2024-02-01',
          updatedAt: '2024-03-05'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  /**
   * 保存模板
   */
  const saveTemplate = async (templateData: Template) => {
    try {
      setSaving(true)
      const isEdit = templateData.id && templateData.id !== null

      const response = await fetch(
        isEdit ? `/api/v1/templates/${templateData.id}` : '/api/v1/templates',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            // TODO: 添加认证头
          },
          body: JSON.stringify(templateData)
        }
      )

      if (!response.ok) {
        throw new Error('保存模板失败')
      }

      const result = await response.json()
      
      if (result.success) {
        // 更新本地状态
        const templateData = result.data
        if (isEdit) {
          setTemplates(prev => prev.map(t => t.id === templateData.id ? templateData : t))
        } else {
          setTemplates(prev => [...prev, templateData])
        }
      } else {
        throw new Error(result.error || '保存失败')
      }

      setSelectedTemplate(null)
      alert('模板保存成功')
    } catch (err) {
      console.error('保存模板失败:', err)
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  /**
   * 删除模板
   */
  const deleteTemplate = async (templateId: string | number | null) => {
    if (!templateId) return
    if (!confirm('确定要删除这个模板吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // TODO: 添加认证头
        },
      })

      if (!response.ok) {
        throw new Error('删除模板失败')
      }

      setTemplates(prev => prev.filter(t => t.id !== templateId))
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null)
      }
      alert('模板删除成功')
    } catch (err) {
      console.error('删除模板失败:', err)
      alert(err instanceof Error ? err.message : '删除失败')
    }
  }

  /**
   * 获取模板类型信息
   */
  const getTemplateTypeInfo = (type: string): TemplateType => {
    return templateTypes.find(t => t.id === type) || { id: type, title: type, icon: '📝' }
  }

  // 页面加载时获取模板列表
  useEffect(() => {
    loadTemplates()
  }, [])

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
            <h1 className="text-xl font-semibold text-gray-900">模板管理</h1>
            <span className="text-sm text-gray-500">
              ({templates.length} 个模板)
            </span>
          </div>
          
          <button
            onClick={() => setSelectedTemplate({ 
              id: null, 
              type: '', 
              title: '', 
              content: '', 
              isDefault: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            新建模板
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}

      <div className="flex h-screen">
        {/* 左侧模板列表 */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">模板列表</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 确保templates是数组且有内容才进行map操作 */}
                {Array.isArray(templates) && templates.length > 0 ? (
                  templates.map((template) => {
                    const typeInfo = getTemplateTypeInfo(template.type)
                    return (
                      <div
                        key={template.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-lg">{typeInfo.icon}</span>
                              <h3 className="font-medium text-gray-900 text-sm">{template.title}</h3>
                              {(template.isDefault || template.isActive) && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                  {template.isDefault ? '默认' : '活跃'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{typeInfo.title}</p>
                            <p className="text-xs text-gray-500">
                              更新: {template.updatedAt}
                            </p>
                          </div>
                          
                          {!template.isDefault && template.category !== 'basic' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteTemplate(template.id)
                              }}
                              className="text-red-600 hover:text-red-800 text-xs ml-2"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-gray-600">暂无模板</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右侧模板编辑 */}
        <div className="flex-1 flex flex-col">
          {selectedTemplate ? (
            <TemplateEditor
              template={selectedTemplate}
              templateTypes={templateTypes}
              onSave={saveTemplate}
              onCancel={() => setSelectedTemplate(null)}
              saving={saving}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  选择或创建模板
                </h3>
                <p className="text-gray-600 mb-4">
                  从左侧选择一个模板进行编辑，或创建新的模板
                </p>
                <button
                  onClick={() => setSelectedTemplate({ 
                    id: null, 
                    type: '', 
                    title: '', 
                    content: '', 
                    isDefault: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  })}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  新建模板
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 模板编辑器组件属性类型
 */
interface TemplateEditorProps {
  template: Template
  templateTypes: TemplateType[]
  onSave: (template: Template) => void
  onCancel: () => void
  saving: boolean
}

/**
 * 模板编辑器组件
 */
function TemplateEditor({ template, templateTypes, onSave, onCancel, saving }: TemplateEditorProps) {
  const [formData, setFormData] = useState<Template>(template)

  // 当template变化时更新formData
  useEffect(() => {
    setFormData(template)
  }, [template])

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('请输入模板标题')
      return
    }
    if (!formData.type) {
      alert('请选择模板类型')
      return
    }
    if (!formData.content.trim()) {
      alert('请输入模板内容')
      return
    }

    // 更新时间戳
    const updatedTemplate = {
      ...formData,
      updatedAt: new Date().toISOString()
    }

    onSave(updatedTemplate)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 编辑器头部 */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {template.id ? '编辑模板' : '新建模板'}
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模板标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="请输入模板标题"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模板类型 *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={template.isDefault}
              >
                <option value="">请选择模板类型</option>
                {templateTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 模板内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模板内容 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="请输入模板内容，使用 {变量名} 格式定义变量"
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>

          {/* 变量提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 使用提示</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 使用 {`{变量名}`} 格式定义可替换的变量</li>
              <li>• 变量名应该简洁明了，如 {`{事故时间}`}、{`{损失金额}`}</li>
              <li>• 支持 Markdown 格式，可以使用标题、列表等格式</li>
              <li>• 保存后可以在报告生成时使用该模板</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 