import { API_CONFIG } from '../config/config';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * HTTP Client for making API requests to the backend
 */
class HttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Make an HTTP request with timeout support
   */
  private async request<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`🌐 HTTP ${options.method} ${url}`);

      const response = await fetch(url, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ HTTP ${response.status}:`, data);
        return {
          ok: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      console.log(`✅ HTTP ${response.status}:`, data);
      return {
        ok: true,
        data: data as T,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('⏱️ Request timeout');
          return { ok: false, error: 'Request timeout' };
        }
        console.error('💥 Request error:', error.message);
        return { ok: false, error: error.message };
      }

      console.error('💥 Unknown error:', error);
      return { ok: false, error: 'Unknown error occurred' };
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Export a singleton instance
export const httpClient = new HttpClient(API_CONFIG.BASE_URL);
