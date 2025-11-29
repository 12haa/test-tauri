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

export const registerUser = async (data: RegisterData): Promise<ApiResponse<User>> => {
  console.log('📝 registerUser called with:', { username: data.username, password: '***' });
  try {
    // Check if user exists
    const existingUser = await dbApi.selectUsers({ username: data.username });
    console.log('🔍 Existing user check:', existingUser);

    if (existingUser.length > 0) {
      console.warn('⚠️ Username already exists');
      return { ok: false, error: 'Username already exists' };
    }

    // Insert new user
    const result = await dbApi.insertUser({
      username: data.username,
      password: data.password,
    });
    console.log('✅ User inserted:', result);

    if (result.length > 0) {
      return { ok: true, data: { id: result[0].id, username: result[0].username } };
    }
    return { ok: false, error: 'Failed to register' };
  } catch (error: unknown) {
    console.error('💥 Register error:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Database error' };
  }
};

export const loginUser = async (data: LoginData): Promise<ApiResponse<User>> => {
  console.log('🔑 loginUser called with:', { username: data.username, password: '***' });
  try {
    const users = await dbApi.selectUsers({ username: data.username });
    console.log('🔍 User lookup result:', users);

    if (users.length > 0) {
      console.log('👤 User found, checking password...');
      // Simple password comparison
      if (users[0].password === data.password) {
        console.log('✅ Password match!');
        return { ok: true, data: { id: users[0].id, username: users[0].username } };
      } else {
        console.warn('❌ Password mismatch');
      }
    } else {
      console.warn('❌ User not found');
    }
    return { ok: false, error: 'Invalid credentials' };
  } catch (error: unknown) {
    console.error('💥 Login error:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Database error' };
  }
};
