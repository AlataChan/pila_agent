'use client'

import { useState, useEffect } from 'react'

interface ClientTimeProps {
  date: Date
  className?: string
}

/**
 * 客户端时间显示组件
 * 避免服务端和客户端时间显示不一致的水合错误
 */
export function ClientTime({ date, className }: ClientTimeProps) {
  const [timeString, setTimeString] = useState('--:--')
  
  useEffect(() => {
    // 只在客户端渲染时间
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    setTimeString(`${hours}:${minutes}`)
  }, [date])
  
  return <span className={className}>{timeString}</span>
} 