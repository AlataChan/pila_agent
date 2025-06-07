"""
公估报告智能撰写助手 - 后端主应用入口

Main FastAPI application entry point for the insurance assessment report assistant.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI(
    title="公估报告智能撰写助手 API",
    description="AI-powered insurance assessment report writing assistant API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


# 注册API路由
try:
    from app.api.v1.reports import router as reports_router
    from app.api.v1.files import router as files_router
    from app.api.v1.ai import router as ai_router
    from app.api.v1.templates import router as templates_router
    
    app.include_router(reports_router, prefix="/api/v1/reports", tags=["reports"])
    app.include_router(files_router, prefix="/api/v1/files", tags=["files"])
    app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
    app.include_router(templates_router, prefix="/api/v1/templates", tags=["templates"])
except ImportError as e:
    print(f"Warning: Could not import API routes: {e}")


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/")
async def root():
    """根端点"""
    return {
        "message": "公估报告智能撰写助手 API", 
        "version": "1.0.0",
        "features": [
            "报告管理",
            "文件上传与OCR",
            "AI章节生成",
            "智能模板"
        ]
    }


@app.get("/api/info")
async def api_info():
    """API信息"""
    return {
        "title": "公估报告智能撰写助手",
        "version": "1.0.0",
        "endpoints": {
            "reports": "/api/v1/reports",
            "files": "/api/v1/files", 
            "ai": "/api/v1/ai",
            "templates": "/api/v1/templates"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 