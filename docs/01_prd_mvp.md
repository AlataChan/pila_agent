# 公估报告智能撰写助手 - MVP 产品需求文档

## 1. 引言与目标 (MVP)

### 1.1 项目背景
保险理赔报告撰写耗时且重复性工作多。本项目旨在通过AI技术，辅助公估师快速生成报告初稿，提高工作效率。

### 1.2 MVP目标
*   **核心流程验证**：验证从资料上传、OCR识别、AI辅助核心章节生成到报告初稿导出的核心流程。
*   **核心价值体现**：让用户体验到AI在报告撰写中带来的效率提升，特别是在“事故经过”和“保单摘要”等关键章节。
*   **快速迭代基础**：构建一个可快速迭代和扩展的基础版本，为后续功能完善收集用户反馈。

### 1.3 关键指标 (MVP)
*   **核心章节AI生成可用性**：用户对AI生成的“事故经过”和“保单摘要”章节初稿的接受度 ≥ 70% (即只需少量修改)。
*   **核心流程耗时**：从上传主要索赔资料到生成包含核心AI章节的报告初稿 ≤ 5分钟。

---

## 2. 范围与核心功能 (MVP)

### 2.1 范围说明 (MVP)
*   **险种**：优先支持 **1种核心险种** (例如：企业财产险)。
*   **资料格式**：优先支持 **PDF 和常见图片格式** (JPG, PNG) 的OCR处理。
*   **用户角色**：主要面向 **公估师**。

### 2.2 核心功能 (MVP)
1.  **单险种资料清单预设**：
    *   内置针对所选核心险种的索赔资料清单模板。
2.  **资料上传与OCR**：
    *   支持上传PDF和图片文件。
    *   集成OCR服务 (如 `MarkItDown` 或其他成熟方案)，将上传文件内容转换为文本。
    *   在聊天界面显示已上传文件及OCR状态。
3.  **清单初步核对**：
    *   根据预设清单，提示用户已上传哪些资料，哪些可能遗漏 (简单提示，非强制校验)。
4.  **AI辅助核心章节生成 (工作流 + 单AI服务接口模式)**：
    *   **AI服务接口**：后端提供统一的LLM调用服务。
    *   **工作流驱动**：
        *   **任务节点1: 生成“事故经过及索赔”**：工作流收集OCR文本中与事故描述相关的内容，结合特定提示词，调用AI服务接口生成该章节草稿。
        *   **任务节点2: 生成“保单内容摘要”**：工作流收集OCR文本中与保单信息相关的内容，结合特定提示词，调用AI服务接口生成该章节草稿。
    *   **提示工程**：为上述每个任务节点设计专门的、精细化的提示词。
5.  **草稿预览与基础富文本编辑**：
    *   提供半屏滑出式编辑面板。
    *   内嵌 `TipTap` 编辑器，支持基础的富文本编辑功能 (如标题、段落、加粗、列表)。
    *   用户可在此编辑AI生成的章节内容，并手动撰写其他章节。
6.  **模板化章节处理**：
    *   对于格式高度固定的章节 (如封面、目录、签章页)，提供基础模板，用户可手动填写关键信息。
7.  **Word报告初稿导出**：
    *   将编辑好的内容（AI生成 + 人工编辑 + 模板内容）整合，一键导出为 `.docx` 格式的报告初稿。
8.  **基础草稿保存**：
    *   支持手动保存当前编辑的报告草稿。

### 2.3 AI辅助章节示例 (MVP)
*   **三、被保险人及标的概况** (部分依赖用户输入或简单提取)
*   **四、事故经过及索赔** (AI重点辅助生成)
*   **五、现场查勘情况** (AI辅助整理用户提供的查勘记录文本，或引导用户填写结构化信息)
*   **七、损失核定** (初期引导用户填写结构化表格，AI辅助简单文本描述)

---

## 3. 非功能需求 (MVP)

### 性能
*   单页OCR时延：尽力优化，目标 ≤ 10 秒。
*   核心AI章节生成响应：≤ 60 秒。

### 可用性
*   核心流程可用，允许少量体验瑕疵。

### 安全
*   基础的通信加密 (HTTPS)。
*   用户身份验证。

### 可扩展性
*   后端服务模块化设计，便于后续增加险种和AI辅助章节。
*   AI服务接口设计应考虑未来扩展性。

---

## 4. 交互与界面设计 (MVP 简化版)

### 4.1 聊天式文件上传
*   简化实现，主要关注文件上传和OCR状态反馈。

### 4.2 半屏滑出编辑面板
*   核心功能：`TipTap` 编辑器，支持基础编辑。
*   顶部工具栏：保存草稿、导出Word。

### 4.3 保存机制
*   手动“保存草稿”功能。

---

## 5. 技术架构 (MVP 核心组件)

```mermaid
flowchart LR
  subgraph 前端 (React + Next.js)
    A[用户界面] -->|上传文件| B(REST API)
    A -->|编辑内容| D[TipTap 编辑器]
    A -->|导出报告| F[下载链接]
  end

  subgraph 后端 (FastAPI)
    B --> C[核心业务逻辑]
    C --> G[OCR 服务 (MarkItDown/云服务)]
    C --> H[AI 服务接口 (LLM调用)]
    C --> I[报告渲染 (python-docx)]
    C --> J[任务队列 (Celery - 可选，初期可同步处理)]
    J --> G
    J --> H
    C --> K[数据库 (PostgreSQL - 存储草稿、用户信息)]
    C --> L[对象存储 (MinIO - 存储上传文件)]
  end
```
*   **AI 服务接口 (H)**：负责根据不同任务节点的指令（Prompt）和上下文数据，调用大语言模型生成文本。
*   **任务队列 (J)**：对于耗时操作如OCR、AI生成，初期可考虑同步处理简化复杂度，若性能瓶颈明显再引入Celery等异步队列。

---

## 6. 接口与数据模型 (MVP 核心)

### 6.1 OpenAPI 接口列表 (MVP 核心)
```yaml
openapi: "3.1.0"
info:
  title: ZDReporter MVP API
  version: v0.1.0
paths:
  /api/upload:
    post:
      summary: "上传文件并触发OCR"
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file: 
                  type: string
                  format: binary
      responses:
        "200":
          description: "文件上传成功，OCR任务已启动"
          content:
            application/json:
              schema:
                type: object
                properties:
                  taskId: string
                  fileName: string
                  status: string # e.g., "processing_ocr"

  /api/reports/drafts:
    post:
      summary: "创建或更新报告草稿"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ReportDraftInput"
      responses:
        "200":
          description: "草稿保存成功"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReportDraft"

  /api/reports/{reportId}/generate-chapter:
    post:
      summary: "请求AI生成特定章节内容"
      parameters:
        - in: path
          name: reportId
          schema:
            type: string
          required: true
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                chapterKey: 
                  type: string # e.g., "accident_details", "policy_summary"
                  description: "要生成的章节标识"
                contextText: 
                  type: string
                  description: "用于生成该章节的上下文信息 (如OCR结果片段)"
      responses:
        "200":
          description: "章节内容生成成功"
          content:
            application/json:
              schema:
                type: object
                properties:
                  generatedText: string

  /api/reports/{reportId}/export:
    get:
      summary: "导出报告Word文档"
      parameters:
        - in: path
          name: reportId
          schema:
            type: string
          required: true
      responses:
        "200":
          description: "Word文档下载链接或文件流"
          content:
            application/vnd.openxmlformats-officedocument.wordprocessingml.document:
              schema:
                type: string
                format: binary

components:
  schemas:
    ReportDraftInput:
      type: object
      properties:
        title: 
          type: string
        insuranceType: 
          type: string # 核心险种标识
        content: 
          type: object # JSON结构存储各章节内容
          additionalProperties:
            type: string 
        uploadedFileIds: 
          type: array
          items:
            type: string
    ReportDraft:
      type: object
      properties:
        id: 
          type: string
        title: 
          type: string
        insuranceType: 
          type: string
        content: 
          type: object
        createdAt: 
          type: string
          format: date-time
        updatedAt: 
          type: string
          format: date-time
```

### 6.2 数据模型简述 (MVP)
*   **User** (id, username, password_hash)
*   **UploadedFile** (id, userId, fileName, filePath, ocrText, status, createdAt)
*   **ReportDraft** (id, userId, title, insuranceType, content_json, createdAt, updatedAt)
    *   `content_json`: 以JSON格式存储报告各章节的文本内容，键为章节标识 (e.g., `"cover"`, `"accident_details"`)。

---

## 7. 部署与运维 (MVP 简化)
*   **容器化**：使用 `docker-compose.yml` 编排本地开发和测试环境。
*   **CI/CD**：初期可手动部署，或配置简单的GitHub Actions实现自动化构建和部署到测试环境。
*   **监控**：基础的应用日志。
*   **备份**：数据库定期手动备份或使用云服务商提供的基础备份功能。

---

## 8. 里程碑与时间计划 (3个月MVP)

*   **第一个月：核心后端与AI集成**
    *   环境搭建，技术选型敲定 (OCR, LLM API)。
    *   用户认证、文件上传与OCR服务集成。
    *   核心AI服务接口开发 (至少支持1-2个章节的提示词工程与调用逻辑)。
    *   数据库模型设计与实现。
    *   核心API接口定义与初步实现。
*   **第二个月：核心前端与流程打通**
    *   基础前端框架搭建。
    *   文件上传界面、聊天式交互雏形。
    *   半屏编辑器集成 (`TipTap`) 与基础编辑功能实现。
    *   AI生成内容能够显示在编辑器中。
    *   报告草稿保存功能。
    *   Word导出功能初步实现。
*   **第三个月：测试、优化与交付准备**
    *   核心流程端到端测试与Bug修复。
    *   针对核心险种和核心AI章节进行提示词优化和效果调优。
    *   用户体验优化，界面微调。
    *   编写基础的用户操作说明。
    *   准备MVP版本演示和发布。

---

## 9. MVP之后可能迭代的方向
*   支持更多险种。
*   AI辅助更多报告章节的生成。
*   增强富文本编辑器的功能 (表格、图片插入等)。
*   Office文档 (Word/Excel) 内容的深度解析与利用。
*   更完善的版本管理与历史追溯。
*   多人协作功能。
*   细粒度的实时进度推送。
*   更全面的审计日志。
*   性能优化和高可用部署方案。