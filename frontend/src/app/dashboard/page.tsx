/**
 * 仪表板页面
 */

'use client';

import React, { useState, useEffect } from 'react';
// import { api } from '@/lib/api'; // 暂时注释掉，等认证系统完成后再启用

interface Report {
  id: number;
  title: string;
  status: string;
  insurance_type: string;
  created_at: string;
  updated_at: string;
}

interface User {
  name: string;
  email: string;
}

export default function DashboardPage() {
  const [user] = useState<User>({
    name: '张三',
    email: 'zhangsan@example.com'
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * 加载报告列表
   */
  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 暂时使用模拟数据，等认证系统完成后再连接API
      // const data = await api.reports.list();
      // setReports(data);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 使用模拟数据
      setReports([
        {
          id: 1,
          title: '车辆保险理赔报告_20241201',
          status: 'draft',
          insurance_type: '车险',
          created_at: '2024-12-01',
          updated_at: '2024-12-01'
        },
        {
          id: 2,
          title: '企业财产险理赔报告_20241130',
          status: 'completed',
          insurance_type: '企业财产险',
          created_at: '2024-11-30',
          updated_at: '2024-12-01'
        },
        {
          id: 3,
          title: '责任险理赔报告_20241129',
          status: 'review',
          insurance_type: '责任险',
          created_at: '2024-11-29',
          updated_at: '2024-11-30'
        },
        {
          id: 4,
          title: '货运险理赔报告_20241128',
          status: 'archived',
          insurance_type: '其他',
          created_at: '2024-11-28',
          updated_at: '2024-11-29'
        }
      ]);
    } catch (err) {
      console.error('加载报告失败:', err);
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除报告
   */
  const deleteReport = async (reportId: number) => {
    if (!confirm('确定要删除这个报告吗？此操作不可恢复。')) {
      return;
    }

    try {
      // 暂时使用模拟删除，等认证系统完成后再连接API
      // await api.reports.delete(reportId.toString());
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 从列表中移除已删除的报告
      setReports(prev => prev.filter(report => report.id !== reportId));
      alert('报告删除成功');
    } catch (err) {
      console.error('删除报告失败:', err);
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  /**
   * 查看报告
   */
  const viewReport = (reportId: number) => {
    window.location.href = `/reports/${reportId}/view`;
  };

  /**
   * 编辑报告
   */
  const editReport = (reportId: number) => {
    window.location.href = `/reports/${reportId}/edit`;
  };

  /**
   * 创建新报告
   */
  const createNewReport = () => {
    window.location.href = '/reports/create';
  };

  /**
   * 文件上传处理
   */
  const handleFileUpload = () => {
    window.location.href = '/files/upload';
  };

  /**
   * 启动AI助手
   */
  const launchAIAssistant = () => {
    window.location.href = '/ai/assistant';
  };

  /**
   * 管理模板
   */
  const manageTemplates = () => {
    window.location.href = '/templates';
  };

  // 页面加载时获取报告列表
  useEffect(() => {
    loadReports();
  }, []);

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      review: '审核中',
      completed: '已完成',
      archived: '已归档'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-800',
      review: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-2">📄</span>
              <span className="text-xl font-bold text-gray-900">
                公估报告智能撰写助手
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎回来，{user.name}</span>
              <button
                onClick={() => {
                  // TODO: 实现登出逻辑
                  window.location.href = '/auth/login';
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            仪表板
          </h1>
          <p className="text-gray-600">
            管理您的公估报告，创建新报告或编辑现有报告
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <p className="text-sm text-gray-600">总报告数</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📝</div>
              <div>
                <p className="text-sm text-gray-600">草稿</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🔍</div>
              <div>
                <p className="text-sm text-gray-600">审核中</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'review').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作区域 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">我的报告</h2>
              <button
                onClick={createNewReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                创建新报告
              </button>
            </div>
          </div>
          
          {/* 报告列表 */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  还没有报告
                </h3>
                <p className="text-gray-600 mb-4">
                  创建您的第一个公估报告开始使用
                </p>
                <button
                  onClick={createNewReport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  创建新报告
                </button>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {report.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {getStatusText(report.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>险种: {report.insurance_type}</span>
                        <span>创建: {report.created_at}</span>
                        <span>更新: {report.updated_at}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewReport(report.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => editReport(report.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📤</div>
              <h3 className="text-lg font-semibold mb-2">上传文件</h3>
              <p className="text-gray-600 mb-4 text-sm">
                上传PDF或图片文件进行OCR识别
              </p>
              <button
                onClick={handleFileUpload}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                上传文件
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">AI助手</h3>
              <p className="text-gray-600 mb-4 text-sm">
                使用AI助手快速生成报告章节
              </p>
              <button
                onClick={launchAIAssistant}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                启动AI助手
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">报告模板</h3>
              <p className="text-gray-600 mb-4 text-sm">
                查看和管理报告模板
              </p>
              <button
                onClick={manageTemplates}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                管理模板
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 