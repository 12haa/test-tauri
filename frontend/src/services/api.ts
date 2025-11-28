const API_BASE_URL = 'http://localhost:8000';

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

export const registerUser = async (data: RegisterData): Promise<ApiResponse<User>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return { ok: false, error: 'Network error' };
  }
};

export const loginUser = async (data: LoginData): Promise<ApiResponse<User>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return { ok: false, error: 'Network error' };
  }
};