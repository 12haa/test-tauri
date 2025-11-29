import { useState, useEffect } from 'react';
import { dbApi } from '../db/client';

interface User {
  id: number;
  username: string;
  password: string;
  createdAt?: Date | null;
  created_at?: number;
}

export const UserList = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dbApi.selectUsers();
      setUserList(result);
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (user: User) => {
    if (user.createdAt) {
      return new Date(user.createdAt).toLocaleString();
    }
    if (user.created_at) {
      return new Date(user.created_at * 1000).toLocaleString();
    }
    return 'N/A';
  };

  const maskPassword = (password: string) => {
    if (!password || password.length === 0) return '***';
    if (password.length <= 3) return '***';
    return password.substring(0, 2) + '*'.repeat(Math.max(3, password.length - 2));
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontSize: '18px' }}>
        ⏳ Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          border: '1px solid #f44336',
        }}
      >
        ❌ Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ margin: 0, color: '#333' }}>👥 Registered Users</h2>
        <button
          onClick={fetchUsers}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
        >
          🔄 Refresh
        </button>
      </div>

      {userList.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            color: '#666',
          }}
        >
          <p style={{ fontSize: '18px', margin: 0 }}>📭 No users found in database</p>
        </div>
      ) : (
        <>
          <div
            style={{
              overflowX: 'auto',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
              <thead>
                <tr style={{ backgroundColor: '#2196F3', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                    Username
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                    Password
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user, index) => (
                  <tr
                    key={user.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e3f2fd')}
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? '#ffffff' : '#f9f9f9')
                    }
                  >
                    <td
                      style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', color: '#666' }}
                    >
                      #{user.id}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #e0e0e0',
                        fontWeight: '500',
                      }}
                    >
                      {user.username}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #e0e0e0',
                        fontFamily: 'monospace',
                        color: '#999',
                      }}
                    >
                      {maskPassword(user.password)}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #e0e0e0',
                        color: '#666',
                        fontSize: '14px',
                      }}
                    >
                      {formatDate(user)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '12px 16px',
              backgroundColor: '#e8f5e9',
              borderRadius: '6px',
              display: 'inline-block',
              fontSize: '14px',
              color: '#2e7d32',
              fontWeight: '500',
            }}
          >
            📊 Total users: <strong>{userList.length}</strong>
          </div>
        </>
      )}
    </div>
  );
};
