/**
 * 首页组件
 * 
 * 公估报告智能撰写助手的主页面
 */

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-2">📄</span>
              <span className="ml-2 text-xl font-bold text-gray-900">
                公估报告智能撰写助手
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn-secondary">
                登录
              </Link>
              <Link href="/register" className="btn-primary">
                注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄区域 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            AI驱动的公估报告撰写助手
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            通过人工智能技术，帮助公估师快速生成高质量的保险理赔报告初稿，
            大幅提升工作效率，让专业人员专注于更有价值的分析工作。
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
              开始使用
            </Link>
            <Link href="/demo" className="btn-secondary text-lg px-8 py-3">
              查看演示
            </Link>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="card text-center">
            <div className="text-4xl mb-4">📤</div>
            <h3 className="text-lg font-semibold mb-2">智能文件上传</h3>
            <p className="text-gray-600">
              支持PDF和图片格式，自动OCR识别文字内容
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">AI章节生成</h3>
            <p className="text-gray-600">
              基于上传资料，智能生成事故经过、损失核定等关键章节
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">富文本编辑</h3>
            <p className="text-gray-600">
              内置专业编辑器，支持实时编辑和格式调整
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">📥</div>
            <h3 className="text-lg font-semibold mb-2">一键导出</h3>
            <p className="text-gray-600">
              快速导出为标准Word格式，符合行业规范
            </p>
          </div>
        </div>

        {/* 工作流程 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center mb-8">简单四步，完成报告</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">上传资料</h3>
              <p className="text-gray-600 text-sm">
                上传保单、现场照片等相关文件
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">AI分析</h3>
              <p className="text-gray-600 text-sm">
                系统自动识别文字并分析关键信息
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">生成草稿</h3>
              <p className="text-gray-600 text-sm">
                AI生成报告各章节的初稿内容
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">编辑导出</h3>
              <p className="text-gray-600 text-sm">
                完善细节后导出专业报告
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 公估报告智能撰写助手. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 