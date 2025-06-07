'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 新建报告页面
 * 
 * 提供报告基本信息填写和创建功能
 */
export default function CreateReportPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    insurance_type: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const insuranceTypes = [
    { value: '企业财产险', label: '企业财产险' },
    { value: '车险', label: '车险' },
    { value: '责任险', label: '责任险' },
    { value: '其他', label: '其他' }
  ]

  /**
   * 提交表单创建报告
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('请输入报告标题')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: 添加认证头
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || '创建报告失败')
      }
      
      // 跳转到报告编辑页面
      router.push(`/reports/${result.data.id}/edit`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* 页面头部 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← 返回
          </button>
          <h1 className="text-3xl font-bold text-gray-900">创建新报告</h1>
          <p className="text-gray-600 mt-2">填写报告基本信息，开始撰写公估报告</p>
        </div>

        {/* 创建表单 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 报告标题 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                报告标题 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="请输入报告标题，如：车辆保险理赔报告_20241201"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* 保险类型 */}
            <div>
              <label htmlFor="insurance_type" className="block text-sm font-medium text-gray-700 mb-2">
                保险类型
              </label>
              <select
                id="insurance_type"
                value={formData.insurance_type}
                onChange={(e) => setFormData(prev => ({ ...prev, insurance_type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择保险类型</option>
                {insuranceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '创建中...' : '创建报告'}
              </button>
            </div>
          </form>
        </div>

        {/* 提示信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">💡 使用提示</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• 报告标题建议包含保险类型、案件编号或日期等信息，便于后续管理</li>
            <li>• 选择正确的保险类型有助于AI生成更准确的内容</li>
            <li>• 创建后可以随时修改报告信息和内容</li>
            <li>• 支持上传相关文档进行OCR识别，提升撰写效率</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 