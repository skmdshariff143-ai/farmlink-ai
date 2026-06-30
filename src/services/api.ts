export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

const API_BASE = "/api";

export const apiClient = {
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP error! Status: ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to establish network connection",
      };
    }
  },

  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  },

  async post<T = any>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async patch<T = any>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
