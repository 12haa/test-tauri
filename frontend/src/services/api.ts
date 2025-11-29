import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/config';
import { dbApi } from '../db/client';

interface RegisterData {
  username: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface ApiResponse<T> {
  ok: boolean;
  error?: string;
  data?: T;
}

interface User {
  id: number;
  username: string;
}

interface BackendRegisterResponse {
  ok: boolean;
  id?: number;
  error?: string;
}

interface BackendLoginResponse {
  ok: boolean;
  user?: {
    id: number;
    username: string;
  };
  message?: string;
  error?: string;
}

/**
 * Register a new user via the backend API and store in local database
 */
export const registerUser = async (data: RegisterData): Promise<ApiResponse<User>> => {
  console.log('📝 registerUser called with:', { username: data.username, password: '***' });

  try {
    // Call backend API
    const response = await httpClient.post<BackendRegisterResponse>(
      API_CONFIG.ENDPOINTS.REGISTER,
      data
    );

    console.log('🔍 Backend response:', response);

    if (response.ok && response.data?.ok && response.data.id) {
      // Store user in local database
      try {
        await dbApi.insertUser({
          username: data.username,
          password: data.password, // Note: In production, don't store plain passwords
        });
        console.log('✅ User stored in local database');
      } catch (dbError) {
        console.warn('⚠️ Failed to store user in local database:', dbError);
        // Continue anyway since backend registration succeeded
      }

      return {
        ok: true,
        data: {
          id: response.data.id,
          username: data.username,
        },
      };
    }

    return {
      ok: false,
      error: response.data?.error || response.error || 'Registration failed',
    };
  } catch (error: unknown) {
    console.error('💥 Register error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Login user via the backend API and sync with local database
 */
export const loginUser = async (data: LoginData): Promise<ApiResponse<User>> => {
  console.log('🔑 loginUser called with:', { username: data.username, password: '***' });

  try {
    // Call backend API
    const response = await httpClient.post<BackendLoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, data);

    console.log('🔍 Backend response:', response);

    if (response.ok && response.data?.ok && response.data.user) {
      const user = response.data.user;

      // Sync user to local database
      try {
        const existingUsers = await dbApi.selectUsers({ username: user.username });
        if (existingUsers.length === 0) {
          // User doesn't exist locally, add them
          await dbApi.insertUser({
            username: user.username,
            password: data.password, // Store for offline access
          });
          console.log('✅ User synced to local database');
        } else {
          console.log('ℹ️ User already exists in local database');
        }
      } catch (dbError) {
        console.warn('⚠️ Failed to sync user to local database:', dbError);
        // Continue anyway since backend login succeeded
      }

      return {
        ok: true,
        data: {
          id: user.id,
          username: user.username,
        },
      };
    }

    return {
      ok: false,
      error: response.data?.error || response.error || 'Invalid credentials',
    };
  } catch (error: unknown) {
    console.error('💥 Login error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};
