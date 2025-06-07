"""
API依赖注入

提供通用的依赖注入功能，如数据库会话、用户认证等
"""

from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# 模拟用户类
class User:
    def __init__(self, id: int, username: str, email: str):
        self.id = id
        self.username = username
        self.email = email

# 模拟数据库会话
class Session:
    def __init__(self):
        pass
    
    def query(self, model):
        return MockQuery()
    
    def add(self, obj):
        pass
    
    def commit(self):
        pass
    
    def rollback(self):
        pass
    
    def refresh(self, obj):
        pass
    
    def delete(self, obj):
        pass

class MockQuery:
    def filter(self, *args):
        return self
    
    def first(self):
        return None
    
    def all(self):
        return []
    
    def order_by(self, *args):
        return self
    
    def offset(self, n):
        return self
    
    def limit(self, n):
        return self

security = HTTPBearer(auto_error=False)

def get_db() -> Generator[Session, None, None]:
    """获取数据库会话"""
    db = Session()
    try:
        yield db
    finally:
        pass

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """获取当前认证用户"""
    # 模拟用户认证
    # 在实际应用中，这里应该验证JWT token
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未提供认证信息",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 模拟返回用户
    return User(id=1, username="demo_user", email="demo@example.com") 