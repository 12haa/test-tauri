import type { User } from './client';

// Web browser storage using localStorage
const USERS_KEY = 'app_users';

class WebStorage {
  private getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async select(tableName: string, where?: { username?: string }): Promise<User[]> {
    if (tableName !== 'users') return [];

    let users = this.getUsers();

    if (where?.username) {
      users = users.filter((u) => u.username === where.username);
    }

    return users;
  }

  async insert(tableName: string, values: Omit<User, 'id' | 'created_at'>): Promise<User[]> {
    if (tableName !== 'users') return [];

    const users = this.getUsers();
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

    const newUser: User = {
      id: newId,
      username: values.username,
      password: values.password,
      created_at: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
    };

    users.push(newUser);
    this.saveUsers(users);

    return [newUser];
  }

  async init(): Promise<void> {
    // Initialize storage if needed
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
  }
}

export const webStorage = new WebStorage();
