# 公估报告智能撰写助手

基于AI技术的保险理赔公估报告智能生成系统，帮助公估师快速生成高质量的报告初稿。

## 📋 功能特性

### 🎯 核心功能
- **智能报告生成**: 基于AI技术自动生成报告各章节内容
- **文件管理**: 支持PDF、图片文件上传及OCR文字识别
- **模板管理**: 提供标准模板库和自定义模板功能  
- **报告编辑**: 富文本编辑器，支持实时保存和协作
- **AI助手**: 智能对话，提供专业理赔指导
- **多格式导出**: 支持Word、PDF格式导出

### 🔧 技术特性
- **前后端分离**: React + Next.js前端，FastAPI后端
- **响应式设计**: 支持桌面端和移动端
- **实时协作**: WebSocket实时同步
- **安全认证**: JWT Token认证体系
- **高性能**: Redis缓存，数据库优化

## 🏗️ 系统架构

```mermaid
graph TB
    subgraph "前端层"
        A[React + Next.js]
        B[TypeScript]
        C[Tailwind CSS]
    end
    
    subgraph "API网关"
        D[FastAPI]
        E[JWT认证]
        F[CORS中间件]
    end
    
    subgraph "业务服务层"
        G[报告服务]
        H[文件服务]
        I[AI服务]
        J[用户服务]
        K[模板服务]
    end
    
    subgraph "数据存储层"
        L[PostgreSQL]
        M[Redis缓存]
        N[文件存储]
    end
    
    subgraph "外部服务"
        O[OpenAI API]
        P[OCR服务]
        Q[邮件服务]
    end
    
    A --> D
    D --> G
    D --> H
    D --> I
    D --> J
    D --> K
    
    G --> L
    H --> L
    I --> O
    H --> P
    
    G --> M
    H --> N
```

## 📁 项目结构

```
pila_agent/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── app/             # Next.js页面
│   │   │   ├── dashboard/   # 仪表板
│   │   │   ├── reports/     # 报告管理
│   │   │   ├── files/       # 文件管理
│   │   │   ├── ai/          # AI助手
│   │   │   └── templates/   # 模板管理
│   │   ├── components/      # 可复用组件
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── types/           # TypeScript类型
│   │   └── utils/           # 工具函数
│   ├── package.json
│   └── next.config.js
│
├── backend/                  # 后端代码
│   ├── app/
│   │   ├── api/             # API路由
│   │   │   └── v1/          # API版本1
│   │   │       ├── auth.py      # 认证接口
│   │   │       ├── reports.py   # 报告接口
│   │   │       ├── files.py     # 文件接口
│   │   │       ├── ai.py        # AI接口
│   │   │       └── templates.py # 模板接口
│   │   ├── core/            # 核心配置
│   │   ├── db/              # 数据库
│   │   │   ├── models.py    # 数据模型
│   │   │   └── config.py    # 数据库配置
│   │   ├── schemas/         # Pydantic模式
│   │   ├── services/        # 业务逻辑服务
│   │   └── utils/           # 工具函数
│   ├── requirements.txt
│   └── main.py
│
├── docker-compose.yml        # Docker编排
├── README.md
└── .gitignore
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Python 3.8+
- PostgreSQL 13+
- Redis 6+

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd pila_agent
```

2. **后端设置**
```bash
cd backend
pip install -r requirements.txt

# 设置环境变量
export DATABASE_URL="postgresql://user:password@localhost/dbname"
export REDIS_URL="redis://localhost:6379"
export OPENAI_API_KEY="your-openai-api-key"

# 启动后端服务
python main.py
```

3. **前端设置**
```bash
cd frontend
npm install

# 启动前端开发服务器
npm run dev
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 📋 功能模块详解

### 1. 仪表板 (Dashboard)
- **路径**: `/dashboard`
- **功能**: 
  - 报告概览和统计
  - 快速创建报告
  - 最近活动展示
  - 系统公告

### 2. 报告管理 (Reports)
- **路径**: `/reports`
- **功能**:
  - 报告列表查看
  - 创建新报告: `/reports/create`
  - 编辑报告: `/reports/[id]/edit`
  - 查看报告: `/reports/[id]/view`
  - 删除和归档报告

### 3. 文件管理 (Files)
- **路径**: `/files`
- **功能**:
  - 文件上传: `/files/upload`
  - OCR识别处理
  - 文件预览和下载
  - 批量操作

### 4. AI助手 (AI Assistant)
- **路径**: `/ai/assistant`
- **功能**:
  - 智能对话咨询
  - 章节内容生成
  - 专业知识问答
  - 写作建议

### 5. 模板管理 (Templates)
- **路径**: `/templates`
- **功能**:
  - 查看模板库
  - 创建自定义模板
  - 编辑模板内容
  - 模板分类管理

## 🔌 API接口

### 后端API路由

#### 报告相关 `/api/v1/reports`
- `GET /` - 获取报告列表
- `POST /` - 创建新报告
- `GET /{id}` - 获取报告详情
- `PUT /{id}` - 更新报告
- `DELETE /{id}` - 删除报告
- `POST /{id}/export` - 导出报告

#### 文件相关 `/api/v1/files`
- `POST /upload` - 上传文件
- `GET /` - 获取文件列表
- `GET /{id}` - 获取文件详情
- `DELETE /{id}` - 删除文件
- `POST /{id}/ocr` - 触发OCR处理

#### AI相关 `/api/v1/ai`
- `POST /generate/{report_id}` - 生成章节内容
- `GET /templates/{chapter_type}` - 获取提示词模板
- `GET /history/{report_id}` - 获取生成历史
- `POST /chat` - AI对话

#### 模板相关 `/api/v1/templates`
- `GET /` - 获取模板列表
- `POST /` - 创建模板
- `GET /{id}` - 获取模板详情
- `PUT /{id}` - 更新模板
- `DELETE /{id}` - 删除模板
- `GET /types/available` - 获取可用模板类型

## 📊 数据模型

### 核心模型

#### 报告模型 (ReportDraft)
```python
class ReportDraft:
    id: int
    title: str
    insurance_type: InsuranceType
    status: ReportStatus
    owner_id: int
    
    # 报告章节
    accident_details: str
    policy_summary: str
    site_investigation: str
    cause_analysis: str
    loss_assessment: str
    conclusion: str
    
    created_at: datetime
    updated_at: datetime
```

#### 文件模型 (UploadedFile)
```python
class UploadedFile:
    id: int
    filename: str
    file_path: str
    file_size: int
    mime_type: str
    ocr_status: OCRStatus
    ocr_result: str
    report_id: int
    uploaded_by: int
    created_at: datetime
```

#### AI生成日志 (AIGenerationLog)
```python
class AIGenerationLog:
    id: int
    report_id: int
    chapter_type: str
    prompt_text: str
    generated_content: str
    model_name: str
    tokens_used: int
    generation_time: float
    created_at: datetime
```

## 🎨 UI组件规范

### 设计系统
- **色彩主题**: 蓝色系主色调，符合保险行业规范
- **字体**: 思源黑体，保证中文显示效果
- **间距**: 8px基础单位的倍数
- **圆角**: 8px标准圆角

### 组件库
- 按钮 (Button)
- 表单 (Form) 
- 表格 (Table)
- 对话框 (Modal)
- 提示信息 (Toast)
- 加载状态 (Loading)

## 🔒 安全特性

- **认证机制**: JWT Token认证
- **权限控制**: 基于角色的访问控制
- **数据加密**: 敏感数据加密存储
- **防护措施**: XSS、CSRF防护
- **审计日志**: 操作日志记录

## 📈 性能优化

- **前端优化**: 
  - 代码分割和懒加载
  - 图片优化和CDN
  - Service Worker缓存
  
- **后端优化**:
  - 数据库查询优化
  - Redis缓存策略
  - API响应压缩

## 🧪 测试策略

- **单元测试**: Jest + React Testing Library
- **集成测试**: Playwright端到端测试
- **API测试**: pytest + httpx
- **性能测试**: 压力测试和性能监控

## 📦 部署指南

### Docker部署
```bash
# 构建和启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 生产环境部署
1. 环境变量配置
2. 数据库迁移
3. 静态文件处理
4. Nginx反向代理
5. SSL证书配置

## 🛠️ 开发指南

### 代码规范
- 遵循TypeScript严格模式
- 使用ESLint和Prettier
- 遵循Git提交规范
- 组件和函数必须添加JSDoc注释

### 分支策略
- `main`: 生产环境分支
- `develop`: 开发环境分支
- `feature/*`: 功能开发分支
- `hotfix/*`: 紧急修复分支

### 提交规范
```
feat: 新功能
fix: 错误修复
docs: 文档更新
style: 代码格式修改
refactor: 代码重构
test: 测试相关
chore: 构建和工具修改
```

## 📄 更新日志

### v1.0.0 (2024-03-16)
- ✨ 完成仪表板页面功能实现
- ✨ 实现报告创建和编辑功能
- ✨ 添加文件上传和OCR处理
- ✨ 集成AI章节生成功能
- ✨ 实现模板管理系统
- ✨ 添加AI助手对话功能
- 🐛 修复多个UI和API问题
- 📝 完善项目文档

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码变更
4. 发起Pull Request
5. 代码审查和合并

## 📞 联系方式

- 项目维护者: 开发团队
- 邮箱: dev@example.com
- 问题反馈: GitHub Issues

## 📜 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**公估报告智能撰写助手** - 让保险理赔报告撰写更智能、更高效！ 