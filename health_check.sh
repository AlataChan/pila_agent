#!/bin/bash

# 公估报告智能撰写助手 - 系统健康检查脚本

echo "🔍 开始系统健康检查..."
echo "================================"

# 检查Docker容器状态
echo "📦 检查Docker容器状态..."
docker-compose ps --format table

echo ""
echo "🌐 检查服务端点..."

# 检查后端健康状态
echo "🔧 后端API健康检查:"
backend_health=$(curl -s -w "%{http_code}" http://localhost:8000/health -o /dev/null)
if [ "$backend_health" = "200" ]; then
    echo "✅ 后端API: 正常 (HTTP $backend_health)"
    # 显示API信息
    curl -s http://localhost:8000/ | jq . 2>/dev/null || echo "  API响应: OK"
else
    echo "❌ 后端API: 异常 (HTTP $backend_health)"
fi

echo ""

# 检查前端应用
echo "🎨 前端应用健康检查:"
frontend_health=$(curl -s -w "%{http_code}" http://localhost:3000 -o /dev/null)
if [ "$frontend_health" = "200" ]; then
    echo "✅ 前端应用: 正常 (HTTP $frontend_health)"
else
    echo "❌ 前端应用: 异常 (HTTP $frontend_health)"
fi

echo ""

# 检查数据库连接
echo "🗄️  数据库连接检查:"
pg_status=$(docker-compose exec -T postgres pg_isready -h localhost -p 5432 -U postgres 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL: 正常"
else
    echo "❌ PostgreSQL: 异常"
fi

echo ""

# 检查Redis连接
echo "⚡ Redis连接检查:"
redis_status=$(docker-compose exec -T redis redis-cli ping 2>/dev/null)
if [ "$redis_status" = "PONG" ]; then
    echo "✅ Redis: 正常"
else
    echo "❌ Redis: 异常"
fi

echo ""
echo "🔬 API端点功能测试..."

# 测试API文档
echo "📚 API文档:"
docs_status=$(curl -s -w "%{http_code}" http://localhost:8000/docs -o /dev/null)
if [ "$docs_status" = "200" ]; then
    echo "✅ API文档可访问: http://localhost:8000/docs"
else
    echo "❌ API文档不可访问"
fi

# 测试主要路由(可能需要认证)
echo ""
echo "🛡️  API认证检查:"
reports_status=$(curl -s -w "%{http_code}" http://localhost:8000/api/v1/reports/ -o /dev/null)
if [ "$reports_status" = "401" ]; then
    echo "✅ 报告API需要认证: 正常安全设置"
elif [ "$reports_status" = "200" ]; then
    echo "⚠️  报告API可直接访问: 请检查认证设置"
else
    echo "❌ 报告API异常 (HTTP $reports_status)"
fi

echo ""
echo "💾 系统资源使用情况:"
echo "Docker容器资源使用:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
echo "================================"
echo "🎯 健康检查完成!"

# 显示访问信息
echo ""
echo "🌍 应用访问地址:"
echo "  • 前端应用: http://localhost:3000"
echo "  • 后端API: http://localhost:8000"
echo "  • API文档: http://localhost:8000/docs"
echo "  • 数据库: localhost:5432"
echo "  • Redis: localhost:6379"

echo ""
echo "📋 常用命令:"
echo "  • 查看日志: docker-compose logs [service]"
echo "  • 重启服务: docker-compose restart [service]"
echo "  • 停止服务: docker-compose down"
echo "  • 重新构建: docker-compose up --build"

echo ""
echo "✨ 系统已准备就绪！" 