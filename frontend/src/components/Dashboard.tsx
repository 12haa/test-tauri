import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="loader">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user.username}!</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-card">
          <h2>Your Dashboard</h2>
          <p>You are now logged in to your Tauri desktop application.</p>
          <div className="user-info">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Username:</strong> {user.username}</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>About This Application</h3>
          <p>This is a Tauri desktop application with user authentication capabilities. You can now build upon this foundation to add more features.</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;