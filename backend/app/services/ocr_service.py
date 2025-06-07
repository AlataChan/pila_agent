"""
OCR服务

提供文件OCR识别功能
"""

import asyncio
from typing import NamedTuple


class OCRResult(NamedTuple):
    """OCR识别结果"""
    text: str
    confidence: float


class OCRService:
    """OCR服务类"""
    
    async def process_file(self, file_path: str) -> OCRResult:
        """处理文件OCR识别"""
        # 模拟OCR处理
        await asyncio.sleep(2)  # 模拟处理时间
        
        # 模拟OCR结果
        mock_text = """
        保险理赔申请书
        
        申请人：张三
        保险单号：ABC123456789
        事故时间：2024年12月1日
        事故地点：北京市朝阳区某路段
        
        事故经过：
        2024年12月1日上午10时许，被保险车辆在行驶过程中与前方车辆发生追尾事故。
        事故造成车辆前保险杠损坏，需要维修。
        
        损失情况：
        1. 前保险杠更换：3000元
        2. 前大灯维修：1500元
        3. 其他维修费用：500元
        
        总计损失：5000元
        """
        
        return OCRResult(text=mock_text.strip(), confidence=0.95) 