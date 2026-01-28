import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { universitiesAPI, todosAPI } from '../services/api';
import './ApplicationPage.css';

function ApplicationPage() {
  const { user, logout } = useAuth();
  const [lockedUniversities, setLockedUniversities] = useState([]);
  const [todos, setTodos] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Document',
    priority: 'Medium',
    deadline: ''
  });

  useEffect(() => {
    loadApplicationData();
  }, []);

  const loadApplicationData = async () => {
    try {
      const [universitiesRes, todosRes] = await Promise.all([
        universitiesAPI.getAll({ status: 'Locked' }),
        todosAPI.getAll()
      ]);

      setLockedUniversities(universitiesRes.data.universities);
      setTodos(todosRes.data.todos);

      if (universitiesRes.data.universities.length > 0 && !selectedUniversity) {
        setSelectedUniversity(universitiesRes.data.universities[0]._id);
      }
    } catch (error) {
      console.error('Load application data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todoId) => {
    try {
      await todosAPI.toggle(todoId);
      await loadApplicationData();
    } catch (error) {
      console.error('Toggle todo error:', error);
    }
  };

  const deleteTodo = async (todoId) => {
    const confirm = window.confirm('Are you sure you want to delete this task?');
    if (!confirm) return;

    try {
      await todosAPI.delete(todoId);
      await loadApplicationData();
    } catch (error) {
      console.error('Delete todo error:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await todosAPI.create({
        ...newTask,
        universityId: selectedUniversity
      });
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        category: 'Document',
        priority: 'Medium',
        deadline: ''
      });
      await loadApplicationData();
    } catch (error) {
      console.error('Add task error:', error);
      alert('Failed to add task');
    }
  };

  const getUniversityTodos = (universityId) => {
    return todos.filter(todo => todo.universityId?._id === universityId);
  };

  const getTaskStats = (universityId) => {
    const universityTodos = getUniversityTodos(universityId);
    return {
      total: universityTodos.length,
      completed: universityTodos.filter(t => t.completed).length,
      pending: universityTodos.filter(t => !t.completed).length,
      percentage: universityTodos.length > 0 
        ? Math.round((universityTodos.filter(t => t.completed).length / universityTodos.length) * 100)
        : 0
    };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  const selectedUni = lockedUniversities.find(u => u._id === selectedUniversity);
  const universityTodos = selectedUniversity ? getUniversityTodos(selectedUniversity) : [];
  const stats = selectedUniversity ? getTaskStats(selectedUniversity) : { total: 0, completed: 0, pending: 0, percentage: 0 };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>🎓 AI Study Abroad</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
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
          <Link to="/application" className="nav-item active">
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
        <div className="application-header">
          <div>
            <h1>📝 Applications</h1>
            <p>Track and manage your university applications</p>
          </div>
        </div>

        {lockedUniversities.length === 0 ? (
          <div className="empty-state-large">
            <div className="empty-icon">🔒</div>
            <h2>No Locked Universities</h2>
            <p>You need to lock at least one university to start preparing your application.</p>
            <Link to="/universities" className="btn btn-primary btn-large">
              Browse Universities
            </Link>
          </div>
        ) : (
          <div className="application-container">
            {/* University Tabs */}
            <div className="university-tabs">
              {lockedUniversities.map(uni => {
                const uniStats = getTaskStats(uni._id);
                return (
                  <button
                    key={uni._id}
                    className={`university-tab ${selectedUniversity === uni._id ? 'active' : ''}`}
                    onClick={() => setSelectedUniversity(uni._id)}
                  >
                    <div className="tab-header">
                      <h3>{uni.name}</h3>
                      <span className="tab-country">{uni.country}</span>
                    </div>
                    <div className="tab-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uniStats.percentage}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {uniStats.completed}/{uniStats.total} tasks
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Application Details */}
            {selectedUni && (
              <div className="application-details">
                <div className="details-header">
                  <div>
                    <h2>{selectedUni.name}</h2>
                    <p>{selectedUni.program} • {selectedUni.country}</p>
                  </div>
                  <div className="header-badges">
                    <span className={`badge badge-${selectedUni.category.toLowerCase()}`}>
                      {selectedUni.category}
                    </span>
                    <span className="badge badge-locked">🔒 Locked</span>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="progress-overview">
                  <div className="progress-stat">
                    <div className="stat-circle">
                      <svg width="100" height="100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#667eea"
                          strokeWidth="8"
                          strokeDasharray={`${stats.percentage * 2.51} 251`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="stat-value">{stats.percentage}%</div>
                    </div>
                    <div className="stat-label">Completed</div>
                  </div>

                  <div className="progress-stats-grid">
                    <div className="progress-stat-item">
                      <div className="stat-number">{stats.total}</div>
                      <div className="stat-name">Total Tasks</div>
                    </div>
                    <div className="progress-stat-item completed">
                      <div className="stat-number">{stats.completed}</div>
                      <div className="stat-name">Completed</div>
                    </div>
                    <div className="progress-stat-item pending">
                      <div className="stat-number">{stats.pending}</div>
                      <div className="stat-name">Pending</div>
                    </div>
                  </div>
                </div>

                {/* Tasks Section */}
                <div className="tasks-section">
                  <div className="section-header">
                    <h3>📋 Application Tasks</h3>
                    <button 
                      onClick={() => setShowAddTask(!showAddTask)}
                      className="btn btn-primary btn-sm"
                    >
                      + Add Task
                    </button>
                  </div>

                  {/* Add Task Form */}
                  {showAddTask && (
                    <form onSubmit={handleAddTask} className="add-task-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Task Title *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={newTask.title}
                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            placeholder="e.g., Submit SOP"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-textarea"
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          placeholder="Task details..."
                          rows="3"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <select
                            className="form-select"
                            value={newTask.category}
                            onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                          >
                            <option value="Exam">Exam</option>
                            <option value="Document">Document</option>
                            <option value="Application">Application</option>
                            <option value="General">General</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Priority</label>
                          <select
                            className="form-select"
                            value={newTask.priority}
                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Deadline</label>
                          <input
                            type="date"
                            className="form-input"
                            value={newTask.deadline}
                            onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="button" onClick={() => setShowAddTask(false)} className="btn btn-secondary">
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Add Task
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Tasks List */}
                  <div className="tasks-list">
                    {universityTodos.length === 0 ? (
                      <div className="empty-state">
                        <p>No tasks yet. Click "Add Task" to get started!</p>
                      </div>
                    ) : (
                      <>
                        {/* Pending Tasks */}
                        {universityTodos.filter(t => !t.completed).length > 0 && (
                          <div className="tasks-group">
                            <h4>Pending Tasks ({universityTodos.filter(t => !t.completed).length})</h4>
                            {universityTodos.filter(t => !t.completed).map(todo => (
                              <div key={todo._id} className="task-card">
                                <div className="task-checkbox-wrapper">
                                  <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleTodo(todo._id)}
                                    className="task-checkbox"
                                  />
                                </div>
                                <div className="task-content">
                                  <h4>{todo.title}</h4>
                                  {todo.description && <p>{todo.description}</p>}
                                  <div className="task-meta">
                                    <span className={`badge badge-${todo.category.toLowerCase()}`}>
                                      {todo.category}
                                    </span>
                                    <span className={`badge badge-${todo.priority.toLowerCase()}`}>
                                      {todo.priority}
                                    </span>
                                    {todo.deadline && (
                                      <span className="task-deadline">
                                        📅 {new Date(todo.deadline).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteTodo(todo._id)}
                                  className="btn-delete"
                                  title="Delete task"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Completed Tasks */}
                        {universityTodos.filter(t => t.completed).length > 0 && (
                          <div className="tasks-group">
                            <h4>Completed Tasks ({universityTodos.filter(t => t.completed).length})</h4>
                            {universityTodos.filter(t => t.completed).map(todo => (
                              <div key={todo._id} className="task-card completed">
                                <div className="task-checkbox-wrapper">
                                  <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleTodo(todo._id)}
                                    className="task-checkbox"
                                  />
                                </div>
                                <div className="task-content">
                                  <h4>{todo.title}</h4>
                                  {todo.description && <p>{todo.description}</p>}
                                  <div className="task-meta">
                                    <span className="completion-badge">
                                      ✓ Completed {new Date(todo.completedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteTodo(todo._id)}
                                  className="btn-delete"
                                  title="Delete task"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Application Info */}
                <div className="application-info">
                  <h3>📌 Important Information</h3>
                  <div className="info-grid">
                    <div className="info-card">
                      <h4>Required Documents</h4>
                      <ul>
                        <li>Statement of Purpose (SOP)</li>
                        <li>Letters of Recommendation (2-3)</li>
                        <li>Official Transcripts</li>
                        <li>English Proficiency Test Score</li>
                        <li>Standardized Test Scores (if required)</li>
                        <li>Resume/CV</li>
                        <li>Passport Copy</li>
                      </ul>
                    </div>

                    <div className="info-card">
                      <h4>Application Timeline</h4>
                      <ul>
                        <li><strong>3-4 months before:</strong> Prepare documents</li>
                        <li><strong>2-3 months before:</strong> Take required exams</li>
                        <li><strong>1-2 months before:</strong> Submit application</li>
                        <li><strong>After submission:</strong> Track application status</li>
                      </ul>
                    </div>

                    <div className="info-card">
                      <h4>Tips for Success</h4>
                      <ul>
                        <li>Start early and don't procrastinate</li>
                        <li>Tailor your SOP to each university</li>
                        <li>Get strong letters of recommendation</li>
                        <li>Proofread everything multiple times</li>
                        <li>Meet all deadlines</li>
                        <li>Keep track of application status</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ApplicationPage;