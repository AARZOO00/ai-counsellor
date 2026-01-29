import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    universitiesShortlisted: 0,
    applicationsDraft: 0,
    applicationsSubmitted: 0,
    pendingTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Token check
      if (!token) {
        console.error("No token found");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // 1. Load Profile and Stats parallelly
      const [profileRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/profile/me', config),
        axios.get('http://localhost:5001/api/dashboard/stats', config)
      ]);

      setProfile(profileRes.data);
      setStats(statsRes.data);

      // 2. AUTO-GENERATE TASKS (Check & Create if empty)
      // Ye line backend ko signal degi ki agar tasks nahi hain to bana do
      try {
        await axios.post('http://localhost:5001/api/todos/auto-generate', {}, config);
      } catch (genError) {
        console.warn("Auto-generate tasks skipped or failed:", genError.message);
      }

      // 3. Fetch Tasks (Ab naye tasks aa jayenge agar generate hue to)
      const todosRes = await axios.get('http://localhost:5001/api/todos', config);
      setRecentTasks(todosRes.data.slice(0, 3)); // Sirf top 3 tasks dikhayein

      setLoading(false);
    } catch (error) {
      console.error('Dashboard load error:', error);
      // Agar profile nahi mili (404), tab bhi loading false karein taaki empty state dikhe
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>🎓 AI Study Abroad</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/counsellor" className="nav-item">
            <span className="nav-icon">🤖</span>
            AI Counsellor
          </Link>
          <Link to="/universities" className="nav-item">
            <span className="nav-icon">🎓</span>
            Universities
          </Link>
          <Link to="/application" className="nav-item">
            <span className="nav-icon">📝</span>
            Applications
          </Link>
          <Link to="/profile" className="nav-item">
            <span className="nav-icon">👤</span>
            Profile
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.fullName?.charAt(0) || 'U'}</div>
            <div>
              <p className="user-name">{user?.fullName || 'User'}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
            <p>Here's your study abroad journey overview</p>
          </div>
          <Link to="/counsellor" className="btn btn-primary">
            Talk to AI Counsellor
          </Link>
        </header>

        {/* Status Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <h3>{stats.universitiesShortlisted}</h3>
              <p>Shortlisted Universities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <h3>{stats.applicationsDraft}</h3>
              <p>Applications in Draft</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.applicationsSubmitted}</h3>
              <p>Submitted Applications</p>
            </div>
          </div>
          <div className="stat-card alert">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingTasks}</h3>
              <p>Pending Tasks</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content-grid">
          {/* Profile Summary */}
          <div className="content-card profile-summary-card">
            <div className="card-header">
              <h3>📋 Profile Summary</h3>
            </div>
            {profile ? (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="label">Target Degree:</span>
                  <span className="value">{profile.intendedDegree} in {profile.fieldOfStudy}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Target Country:</span>
                  <span className="value">{profile.preferredCountries?.join(', ')}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Budget:</span>
                  <span className="value">${profile.budgetPerYear?.min} - ${profile.budgetPerYear?.max}/year</span>
                </div>
                <div className="detail-row">
                  <span className="label">GPA:</span>
                  <span className="value">{profile.gpa}</span>
                </div>
                <Link to="/profile" className="btn btn-outline btn-sm" style={{marginTop: '15px'}}>
                  Edit Profile
                </Link>
              </div>
            ) : (
              <div className="empty-state">
                <p>Profile not completed yet.</p>
                <Link to="/profile" className="btn btn-primary btn-sm">Create Profile</Link>
              </div>
            )}
          </div>

          {/* Pending Tasks */}
          <div className="content-card tasks-card">
            <div className="card-header">
              <h3>✅ Pending Tasks</h3>
              <Link to="/dashboard" className="view-all-link">View All</Link>
            </div>
            
            {recentTasks.length > 0 ? (
              <div className="tasks-list">
                {recentTasks.map(task => (
                  <div key={task._id} className="task-item">
                    <div className={`priority-indicator ${task.priority}`}></div>
                    <div className="task-content">
                      <p className="task-title">{task.title}</p>
                      <span className="task-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="task-status">{task.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No pending tasks. Great job! 🎉</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;