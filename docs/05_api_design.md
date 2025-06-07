# API 接口设计文档 (MVP)

本文档详细描述了“公估报告智能撰写助手”MVP版本所需的核心业务API服务接口。API将遵循RESTful原则，使用JSON格式进行数据交换，并基于FastAPI自动生成OpenAPI (Swagger) 文档。

## 1. 通用约定

*   **Base URL**: `/api/v1`
*   **认证**: 所有需要认证的接口将在Header中携带 `Authorization: Bearer <JWT_TOKEN>`。
*   **请求/响应格式**: `application/json`。
*   **错误处理**: 
    *   `400 Bad Request`: 请求参数错误或无效。
    *   `401 Unauthorized`: 未认证或认证失败。
    *   `403 Forbidden`: 已认证但无权限访问资源。
    *   `404 Not Found`: 请求的资源不存在。
    *   `422 Unprocessable Entity`: 请求格式正确，但包含语义错误 (FastAPI默认验证错误)。
    *   `500 Internal ServerError`: 服务器内部错误。
    错误响应体示例:
    ```json
    {
      "detail": "Error message or validation details"
    }
    ```
*   **日期时间格式**: ISO 8601 (e.g., `2024-07-16T10:00:00Z`)。

## 2. API 接口定义

### 2.1 用户认证 (Auth)

#### 2.1.1 `POST /auth/register` - 用户注册
*   **描述**: 创建新用户账户。
*   **请求体**:
    ```json
    {
      "username": "string (unique)",
      "email": "string (unique, valid email format)",
      "password": "string (min length 8)",
      "full_name": "string (optional)"
    }
    ```
*   **成功响应 (201 Created)**:
    ```json
    {
      "id": "integer",
      "username": "string",
      "email": "string",
      "full_name": "string (nullable)",
      "is_active": true,
      "created_at": "datetime"
    }
    ```
*   **失败响应**: `400` (如用户名/邮箱已存在, 密码不符合要求), `422`。

#### 2.1.2 `POST /auth/login` - 用户登录
*   **描述**: 用户登录以获取JWT访问令牌。
*   **请求体** (使用OAuth2 Password Flow，FastAPI内置支持):
    *   `username`: `string` (form data)
    *   `password`: `string` (form data)
*   **成功响应 (200 OK)**:
    ```json
    {
      "access_token": "string (JWT)",
      "token_type": "bearer"
    }
    ```
*   **失败响应**: `400`, `401` (用户名或密码错误)。

#### 2.1.3 `GET /auth/me` - 获取当前用户信息
*   **描述**: 获取当前已认证用户的信息。
*   **认证**: 需要。
*   **成功响应 (200 OK)**:
    ```json
    {
      "id": "integer",
      "username": "string",
      "email": "string",
      "full_name": "string (nullable)",
      "is_active": true,
      "is_superuser": false,
      "created_at": "datetime",
      "updated_at": "datetime"
    }
    ```
*   **失败响应**: `401`。

### 2.2 文件管理 (Files)

#### 2.2.1 `POST /files/upload` - 上传文件并触发OCR
*   **描述**: 上传单个文件 (PDF, JPG, PNG等)，系统将保存文件并异步触发OCR处理。
*   **认证**: 需要。
*   **请求类型**: `multipart/form-data`
    *   `file`: 文件本身。
    *   `report_draft_id`: `integer` (可选, 如果文件直接关联到某个报告草稿)。
*   **成功响应 (202 Accepted)**: 表示文件已接收并开始处理。
    ```json
    {
      "id": "integer (file_id)",
      "file_name": "string",
      "file_type": "string",
      "file_size_bytes": "integer",
      "storage_path": "string",
      "ocr_status": "pending", // 或 "processing"
      "uploaded_at": "datetime",
      "report_draft_id": "integer (nullable)"
    }
    ```
*   **失败响应**: `400` (文件类型不支持, 文件过大等), `401`, `422`。

#### 2.2.2 `GET /files/{file_id}` - 获取文件信息
*   **描述**: 获取指定文件的元数据和OCR状态。
*   **认证**: 需要。
*   **路径参数**: `file_id: integer`。
*   **成功响应 (200 OK)**:
    ```json
    {
      "id": "integer",
      "user_id": "integer",
      "file_name": "string",
      "file_type": "string",
      "file_size_bytes": "integer",
      "storage_path": "string",
      "ocr_status": "string (pending, processing, completed, failed)",
      "ocr_result_text": "string (nullable, available if ocr_status is 'completed')",
      "uploaded_at": "datetime",
      "report_draft_id": "integer (nullable)"
    }
    ```
*   **失败响应**: `401`, `403` (非文件所有者), `404`。

#### 2.2.3 `GET /files/{file_id}/ocr-result` - 获取文件OCR结果 (如果已完成)
*   **描述**: 单独获取指定文件的OCR文本结果。
*   **认证**: 需要。
*   **路径参数**: `file_id: integer`。
*   **成功响应 (200 OK)**:
    ```json
    {
      "file_id": "integer",
      "ocr_status": "completed",
      "ocr_result_text": "string"
    }
    ```
*   **失败响应**: `401`, `403`, `404` (文件不存在或OCR未完成/失败)。

### 2.3 报告草稿管理 (Report Drafts)

#### 2.3.1 `POST /reports` - 创建新的报告草稿
*   **描述**: 创建一个新的空白报告草稿。
*   **认证**: 需要。
*   **请求体**:
    ```json
    {
      "title": "string",
      "insurance_type": "string (optional)"
    }
    ```
*   **成功响应 (201 Created)**:
    ```json
    {
      "id": "integer (report_id)",
      "user_id": "integer",
      "title": "string",
      "insurance_type": "string (nullable)",
      "status": "draft",
      "content_json": {},
      "version": 1,
      "created_at": "datetime",
      "updated_at": "datetime"
    }
    ```
*   **失败响应**: `400`, `401`, `422`。

#### 2.3.2 `GET /reports` - 获取用户报告草稿列表
*   **描述**: 获取当前用户创建的所有报告草稿列表，支持分页。
*   **认证**: 需要。
*   **查询参数**:
    *   `skip`: `integer (default 0)`
    *   `limit`: `integer (default 20, max 100)`
    *   `status`: `string (optional, e.g., 'draft', 'completed')`
*   **成功响应 (200 OK)**:
    ```json
    [
      {
        "id": "integer",
        "title": "string",
        "insurance_type": "string (nullable)",
        "status": "string",
        "version": "integer",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
      // ... more reports
    ]
    ```
*   **失败响应**: `401`。

#### 2.3.3 `GET /reports/{report_id}` - 获取特定报告草稿详情
*   **描述**: 获取指定报告草稿的完整内容。
*   **认证**: 需要。
*   **路径参数**: `report_id: integer`。
*   **成功响应 (200 OK)**:
    ```json
    {
      "id": "integer",
      "user_id": "integer",
      "title": "string",
      "insurance_type": "string (nullable)",
      "status": "string",
      "content_json": { /* 详细的报告章节内容 */ },
      "version": "integer",
      "created_at": "datetime",
      "updated_at": "datetime",
      "associated_files": [
        {
          "id": "integer (file_id)",
          "file_name": "string",
          "ocr_status": "string"
        }
        // ... other associated files
      ]
    }
    ```
*   **失败响应**: `401`, `403` (非报告所有者), `404`。

#### 2.3.4 `PUT /reports/{report_id}` - 更新报告草稿内容
*   **描述**: 更新指定报告草稿的标题、险种或特定章节内容。
*   **认证**: 需要。
*   **路径参数**: `report_id: integer`。
*   **请求体** (部分更新，只提供需要修改的字段):
    ```json
    {
      "title": "string (optional)",
      "insurance_type": "string (optional)",
      "content_json": {
        "chapter_key_to_update": "<p>New HTML/Markdown content for the chapter</p>",
        // ... other chapters to update
      }
    }
    ```
*   **成功响应 (200 OK)**:
    ```json
    {
      "id": "integer",
      "user_id": "integer",
      "title": "string",
      "insurance_type": "string (nullable)",
      "status": "string",
      "content_json": { /* 更新后的完整报告章节内容 */ },
      "version": "integer (可能已增加)",
      "updated_at": "datetime"
    }
    ```
*   **失败响应**: `400`, `401`, `403`, `404`, `422`。

#### 2.3.5 `DELETE /reports/{report_id}` - 删除报告草稿
*   **描述**: 删除指定的报告草稿。
*   **认证**: 需要。
*   **路径参数**: `report_id: integer`。
*   **成功响应 (204 No Content)**
*   **失败响应**: `401`, `403`, `404`。

### 2.4 AI辅助生成 (AI Assistance)

#### 2.4.1 `POST /reports/{report_id}/generate-chapter` - AI辅助生成特定章节内容
*   **描述**: 请求AI服务为指定报告的特定章节生成内容。
*   **认证**: 需要。
*   **路径参数**: `report_id: integer`。
*   **请求体**:
    ```json
    {
      "chapter_key": "string (e.g., 'accident_summary', 'policy_summary')",
      "context_file_ids": "array of integers (optional, file_ids whose OCR text should be used as context)",
      "additional_context": "string (optional, user-provided additional text context)"
    }
    ```
*   **成功响应 (200 OK)**: AI生成的内容已自动更新到报告草稿的对应章节。
    ```json
    {
      "report_id": "integer",
      "chapter_key": "string",
      "generated_content": "string (HTML/Markdown content generated by AI)",
      "updated_content_json": { /* 报告草稿更新后的完整 content_json */ }
    }
    ```
*   **失败响应**: `400` (无效章节键), `401`, `403`, `404` (报告或文件不存在), `422` (上下文不足或AI服务错误), `500`。

### 2.5 报告导出 (Report Export)

#### 2.5.1 `GET /reports/{report_id}/export/docx` - 导出报告为Word文档
*   **描述**: 将指定报告草稿的内容导出为 `.docx` 文件。
*   **认证**: 需要。
*   **路径参数**: `report_id: integer`。
*   **成功响应 (200 OK)**: 返回Word文件流。
    *   `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
    *   `Content-Disposition: attachment; filename="report_title.docx"`
*   **失败响应**: `401`, `403`, `404`, `500` (渲染错误)。

## 3. 数据模型 (Pydantic Schemas - 供参考)

FastAPI将使用Pydantic模型进行数据验证和序列化。以下是一些核心模型的简化示例，实际实现会更详细。

```python
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class FileBase(BaseModel):
    file_name: str
    file_type: Optional[str] = None
    report_draft_id: Optional[int] = None

class File(FileBase):
    id: int
    user_id: int
    file_size_bytes: Optional[int] = None
    storage_path: str
    ocr_status: str
    ocr_result_text: Optional[str] = None
    uploaded_at: datetime

    class Config:
        orm_mode = True

class ReportDraftBase(BaseModel):
    title: str
    insurance_type: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = {}

class ReportDraftCreate(ReportDraftBase):
    pass

class ReportDraftUpdate(BaseModel):
    title: Optional[str] = None
    insurance_type: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = None # For partial updates of chapters

class ReportDraft(ReportDraftBase):
    id: int
    user_id: int
    status: str
    version: int
    created_at: datetime
    updated_at: datetime
    # associated_files: List[File] = [] # Might be loaded separately

    class Config:
        orm_mode = True

class AIChapterGenerateRequest(BaseModel):
    chapter_key: str
    context_file_ids: Optional[List[int]] = []
    additional_context: Optional[str] = None

class AIChapterGenerateResponse(BaseModel):
    report_id: int
    chapter_key: str
    generated_content: str
    updated_content_json: Dict[str, Any]

```

本文档后续会根据项目进展和技术选型细化进行更新。