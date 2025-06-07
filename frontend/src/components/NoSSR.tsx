'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
}

/**
 * 禁用服务端渲染的包装组件
 * 用于避免可能的水合化错误
 */
const NoSSR = ({ children }: NoSSRProps) => {
  return <>{children}</>;
};

// 导出动态组件，禁用SSR
export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
  loading: () => <div className="animate-pulse">加载中...</div>
}); 