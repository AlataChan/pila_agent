/**
 * API客户端配置
 */

// 获取API基础URL
const getApiBaseUrl = () => {
  // 在客户端使用环境变量，在服务端使用内部地址
  if (typeof window === 'undefined') {
    // 服务端渲染时使用内部Docker网络地址
    return process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
  }
  // 客户端使用外部地址
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * API请求封装
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // TODO: 添加认证头
    // const token = getAuthToken();
    // if (token) {
    //   config.headers = {
    //     ...config.headers,
    //     'Authorization': `Bearer ${token}`,
    //   };
    // }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API请求失败: ${url}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload(endpoint: string, formData: FormData): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      // 不设置Content-Type，让浏览器自动设置multipart/form-data
    };

    // TODO: 添加认证头
    // const token = getAuthToken();
    // if (token) {
    //   config.headers = {
    //     'Authorization': `Bearer ${token}`,
    //   };
    // }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`文件上传失败: ${url}`, error);
      throw error;
    }
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient(API_BASE_URL);

/**
 * API端点常量
 */
export const API_ENDPOINTS = {
  // 报告相关
  REPORTS: '/api/v1/reports',
  REPORT_BY_ID: (id: string) => `/api/v1/reports/${id}`,
  REPORT_CHAPTERS: (id: string, chapterId: string) => `/api/v1/reports/${id}/chapters/${chapterId}`,
  REPORT_EXPORT: (id: string, format: string) => `/api/v1/reports/${id}/export?format=${format}`,
  
  // AI相关
  AI_CHAT: '/api/v1/ai/chat',
  AI_GENERATE: (reportId: string) => `/api/v1/ai/generate/${reportId}`,
  
  // 文件相关
  FILES_UPLOAD: '/api/v1/files/upload',
  
  // 模板相关
  TEMPLATES: '/api/v1/templates',
  TEMPLATE_BY_ID: (id: string) => `/api/v1/templates/${id}`,
};

/**
 * 具体的API调用函数
 */
export const api = {
  // 报告相关
  reports: {
    list: () => apiClient.get(API_ENDPOINTS.REPORTS),
    getById: (id: string) => apiClient.get(API_ENDPOINTS.REPORT_BY_ID(id)),
    create: (data: any) => apiClient.post(API_ENDPOINTS.REPORTS, data),
    update: (id: string, data: any) => apiClient.put(API_ENDPOINTS.REPORT_BY_ID(id), data),
    delete: (id: string) => apiClient.delete(API_ENDPOINTS.REPORT_BY_ID(id)),
    updateChapter: (reportId: string, chapterId: string, data: any) => 
      apiClient.put(API_ENDPOINTS.REPORT_CHAPTERS(reportId, chapterId), data),
  },

  // AI相关
  ai: {
    chat: (data: any) => apiClient.post(API_ENDPOINTS.AI_CHAT, data),
    generate: (reportId: string, data: any) => 
      apiClient.post(API_ENDPOINTS.AI_GENERATE(reportId), data),
  },

  // 文件相关
  files: {
    upload: (formData: FormData) => apiClient.upload(API_ENDPOINTS.FILES_UPLOAD, formData),
  },

  // 模板相关
  templates: {
    list: () => apiClient.get(API_ENDPOINTS.TEMPLATES),
    getById: (id: string) => apiClient.get(API_ENDPOINTS.TEMPLATE_BY_ID(id)),
    create: (data: any) => apiClient.post(API_ENDPOINTS.TEMPLATES, data),
    update: (id: string, data: any) => apiClient.put(API_ENDPOINTS.TEMPLATE_BY_ID(id), data),
    delete: (id: string) => apiClient.delete(API_ENDPOINTS.TEMPLATE_BY_ID(id)),
  },
}; 