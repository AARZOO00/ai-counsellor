import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, counsellorAPI, universitiesAPI, todosAPI } from '../services/api';
import './DashboardPage.css';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profileRes, analysisRes, universitiesRes, todosRes] = await Promise.all([
        profileAPI.get(),
        counsellorAPI.analyze(),
        universitiesAPI.getAll({ status: 'Locked' }),
        todosAPI.getAll({ completed: false })
      ]);

      setProfile(profileRes.data.profile);
      setAnalysis(analysisRes.data.analysis);
      setUniversities(universitiesRes.data.universities);
      setTodos(todosRes.data.todos);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageInfo = (stage) => {
    const stages = {
      building_profile: {
        title: 'Building Profile',
        description: 'Complete your profile to get started',
        icon: '📝',
        color: '#ed8936'
      },
      discovering_universities: {
        title: 'Discovering Universities',
        description: 'Explore and shortlist universities',
        icon: '🔍',
        color: '#4299e1'
      },
      finalizing_universities: {
        title: 'Finalizing Universities',
        description: 'Lock your final university choices',
        icon: '🎯',
        color: '#9f7aea'
      },
      preparing_applications: {
        title: 'Preparing Applications',
        description: 'Complete application requirements',
        icon: '✅',
        color: '#48bb78'
      }
    };
    return stages[stage] || stages.building_profile;
  };

  const toggleTodo = async (todoId) => {
    try {
      await todosAPI.toggle(todoId);
      loadDashboardData();
    } catch (error) {
      console.error('Toggle todo error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const stageInfo = getStageInfo(user.currentStage);

  return (
    <div className="dashboard-page">
      {/* Sidebar Navigation */}
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
            <div className="user-avatar">{user.fullName.charAt(0)}</div>
            <div>
              <p className="user-name">{user.fullName}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user.fullName.split(' ')[0]}! 👋</h1>
            <p>Here's your study abroad journey overview</p>
          </div>
        </div>

        {/* Current Stage Card */}
        <div className="stage-card" style={{ borderLeftColor: stageInfo.color }}>
          <div className="stage-icon" style={{ background: stageInfo.color }}>
            {stageInfo.icon}
          </div>
          <div className="stage-info">
            <h3>Current Stage: {stageInfo.title}</h3>
            <p>{stageInfo.description}</p>
          </div>
          <Link to="/counsellor" className="btn btn-primary">
            Talk to AI Counsellor
          </Link>
        </div>

        <div className="dashboard-grid">
          {/* Profile Summary */}
          <div className="dashboard-card">
            <h2>📋 Profile Summary</h2>
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Education:</span>
                <span className="detail-value">{profile?.currentEducationLevel} in {profile?.major}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Target:</span>
                <span className="detail-value">{profile?.intendedDegree} in {profile?.fieldOfStudy}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">GPA:</span>
                <span className="detail-value">{profile?.gpa}/4.0</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Countries:</span>
                <span className="detail-value">{profile?.preferredCountries.join(', ')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Budget:</span>
                <span className="detail-value">
                  ${profile?.budgetPerYear.min.toLocaleString()} - ${profile?.budgetPerYear.max.toLocaleString()}/year
                </span>
              </div>
            </div>
            <Link to="/profile" className="btn btn-outline btn-sm">
              Edit Profile
            </Link>
          </div>

          {/* Profile Strength */}
          <div className="dashboard-card">
            <h2>💪 Profile Strength</h2>
            <div className="strength-items">
              <div className="strength-item">
                <span className="strength-label">Academics</span>
                <span className={`badge badge-${profile?.profileStrength.academics.toLowerCase()}`}>
                  {profile?.profileStrength.academics}
                </span>
              </div>
              <div className="strength-item">
                <span className="strength-label">Exams</span>
                <span className={`badge badge-${profile?.profileStrength.exams === 'Completed' ? 'success' : 'warning'}`}>
                  {profile?.profileStrength.exams}
                </span>
              </div>
              <div className="strength-item">
                <span className="strength-label">Documents</span>
                <span className={`badge badge-${profile?.profileStrength.documents === 'Ready' ? 'success' : 'warning'}`}>
                  {profile?.profileStrength.documents}
                </span>
              </div>
            </div>

            {analysis && (
              <div className="analysis-section">
                <h3>🎯 Key Strengths</h3>
                <ul className="analysis-list">
                  {analysis.strengths?.slice(0, 3).map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>

                {analysis.gaps && analysis.gaps.length > 0 && (
                  <>
                    <h3>⚠️ Areas to Improve</h3>
                    <ul className="analysis-list warning">
                      {analysis.gaps.slice(0, 2).map((gap, index) => (
                        <li key={index}>{gap}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Locked Universities */}
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>🔒 Locked Universities ({universities.length})</h2>
              <Link to="/universities" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>
            {universities.length > 0 ? (
              <div className="universities-list">
                {universities.map(uni => (
                  <div key={uni._id} className="university-item">
                    <div className="university-info">
                      <h3>{uni.name}</h3>
                      <p>{uni.country} • {uni.program}</p>
                      <div className="university-badges">
                        <span className={`badge badge-${uni.category.toLowerCase()}`}>
                          {uni.category}
                        </span>
                        <span className="badge badge-info">
                          ${uni.tuitionFee?.toLocaleString()}/year
                        </span>
                      </div>
                    </div>
                    <Link to="/application" className="btn btn-primary btn-sm">
                      View Application
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No universities locked yet</p>
                <Link to="/universities" className="btn btn-primary">
                  Discover Universities
                </Link>
              </div>
            )}
          </div>

          {/* To-Do List */}
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>✅ Pending Tasks ({todos.length})</h2>
              <Link to="/application" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>
            {todos.length > 0 ? (
              <div className="todos-list">
                {todos.slice(0, 5).map(todo => (
                  <div key={todo._id} className="todo-item">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo._id)}
                      className="todo-checkbox"
                    />
                    <div className="todo-info">
                      <h4>{todo.title}</h4>
                      <p>{todo.description}</p>
                      <div className="todo-meta">
                        <span className={`badge badge-${todo.priority.toLowerCase()}`}>
                          {todo.priority}
                        </span>
                        {todo.deadline && (
                          <span className="todo-deadline">
                            Due: {new Date(todo.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
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