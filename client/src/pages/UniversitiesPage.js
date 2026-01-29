import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { universitiesAPI, counsellorAPI } from '../services/api';
import './UniversitiesPage.css';

function UniversitiesPage() {
  const { user, logout } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [filter, setFilter] = useState('all'); // all, recommended, shortlisted, locked
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, Dream, Target, Safe
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    setLoading(true); // Ensure loading state is set on refresh
    try {
      const response = await universitiesAPI.getAll();
      // Ensure we always set an array (API might return undefined/null)
      const list = Array.isArray(response?.data?.universities) ? response.data.universities : [];
      setUniversities(list);
    } catch (error) {
      console.error('Load universities error:', error);
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      await counsellorAPI.recommend();
      await loadUniversities();
    } catch (error) {
      console.error('Generate recommendations error:', error);
      alert('Failed to generate recommendations. Please try again.');
      setLoading(false);
    }
  };

  const handleShortlist = async (universityId) => {
    setActionLoading(universityId);
    try {
      await universitiesAPI.shortlist(universityId);
      await loadUniversities();
    } catch (error) {
      console.error('Shortlist error:', error);
      alert('Failed to shortlist university');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLock = async (universityId) => {
    const confirm = window.confirm(
      'Are you sure you want to lock this university? This will create application tasks and mark this as your committed choice.'
    );
    
    if (!confirm) return;

    setActionLoading(universityId);
    try {
      await universitiesAPI.lock(universityId);
      await loadUniversities();
      alert('University locked! Application tasks have been created.');
    } catch (error) {
      console.error('Lock error:', error);
      alert('Failed to lock university');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlock = async (universityId) => {
    const confirm = window.confirm(
      'Are you sure you want to unlock this university? This will delete all associated application tasks.'
    );
    
    if (!confirm) return;

    setActionLoading(universityId);
    try {
      await universitiesAPI.unlock(universityId);
      await loadUniversities();
    } catch (error) {
      console.error('Unlock error:', error);
      alert('Failed to unlock university');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (universityId) => {
    const confirm = window.confirm('Are you sure you want to remove this university from your list?');
    
    if (!confirm) return;

    setActionLoading(universityId);
    try {
      await universitiesAPI.remove(universityId);
      await loadUniversities();
    } catch (error) {
      console.error('Remove error:', error);
      alert('Failed to remove university');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUniversities = (universities || []).filter(uni => {
    const uniStatus = (uni && uni.status) ? uni.status : '';
    if (filter !== 'all' && uniStatus.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (categoryFilter !== 'all' && (uni && uni.category) !== categoryFilter) {
      return false;
    }
    return true;
  });

  const stats = {
    total: (universities || []).length,
    recommended: (universities || []).filter(u => u.status === 'Recommended').length,
    shortlisted: (universities || []).filter(u => u.status === 'Shortlisted').length,
    locked: (universities || []).filter(u => u.status === 'Locked').length
  };

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
          <Link to="/universities" className="nav-item active">
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
        <div className="universities-header">
          <div>
            <h1>🎓 Universities</h1>
            <p>Discover, shortlist, and lock your university choices</p>
          </div>
          {/* Hide button if loading or empty (optional, keeping it clean) */}
          {universities.length > 0 && !loading && (
            <button 
              onClick={generateRecommendations} 
              className="btn btn-primary"
              disabled={loading}
            >
              Regenerate
            </button>
          )}
        </div>

        {/* LOGIC: If loading, show Skeletons. 
            If NOT loading AND no universities, show Empty State.
            Else show Data. */}
            
        {universities.length === 0 && !loading ? (
          <div className="empty-state-large">
            <div className="empty-icon">🎓</div>
            <h2>No Universities Yet</h2>
            <p>Let the AI Counsellor analyze your profile and recommend universities that match your goals.</p>
            <button onClick={generateRecommendations} className="btn btn-primary btn-large">
              Generate Recommendations
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards - Only show if we have data or are loading */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{loading ? '-' : stats.total}</div>
                <div className="stat-label">Total Universities</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{loading ? '-' : stats.recommended}</div>
                <div className="stat-label">Recommended</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{loading ? '-' : stats.shortlisted}</div>
                <div className="stat-label">Shortlisted</div>
              </div>
              <div className="stat-card locked">
                <div className="stat-value">{loading ? '-' : stats.locked}</div>
                <div className="stat-label">Locked 🔒</div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
              <div className="filter-group">
                <label>Status:</label>
                <div className="filter-buttons">
                  {['all', 'recommended', 'shortlisted', 'locked'].map(status => (
                    <button 
                      key={status}
                      className={`filter-btn ${filter === status ? 'active' : ''}`}
                      onClick={() => setFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Category:</label>
                <div className="filter-buttons">
                  {['all', 'Dream', 'Target', 'Safe'].map(cat => (
                    <button 
                      key={cat}
                      className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Universities Grid with Skeleton Logic */}
            <div className="universities-grid">
              {loading ? (
                // SKELETON LOADING STATE
                [1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="skeleton-card">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text" style={{width: '40%', marginBottom: '20px'}}></div>
                    
                    <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                         <div className="skeleton" style={{width: '30%', height: '60px', borderRadius: '8px'}}></div>
                         <div className="skeleton" style={{width: '30%', height: '60px', borderRadius: '8px'}}></div>
                         <div className="skeleton" style={{width: '30%', height: '60px', borderRadius: '8px'}}></div>
                    </div>
                    
                    <div className="skeleton skeleton-text" style={{height: '80px', borderRadius: '8px'}}></div>
                    <div className="skeleton" style={{height: '40px', marginTop: '20px', borderRadius: '6px'}}></div>
                  </div>
                ))
              ) : (
                // REAL DATA STATE
                filteredUniversities.map(uni => (
                  <div key={uni._id} className="university-card">
                    <div className="university-header">
                      <div>
                        <h3>{uni.name}</h3>
                        <p className="university-location">{uni.country}</p>
                      </div>
                      <div className="university-badges">
                                <span className={`badge badge-${(uni.category || '').toLowerCase()}`}>
                                  {uni.category || '—'}
                                </span>
                        {uni.status === 'Locked' && (
                          <span className="badge badge-locked">🔒 Locked</span>
                        )}
                      </div>
                    </div>

                    <div className="university-program">
                      <strong>Program:</strong> {uni.program}
                    </div>

                    <div className="university-details">
                      <div className="detail-item">
                        <span className="detail-icon">💰</span>
                        <div>
                          <div className="detail-label">Tuition Fee</div>
                            <div className="detail-value">${uni.tuitionFee?.toLocaleString() || '—'}/year</div>
                        </div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">📊</span>
                        <div>
                          <div className="detail-label">Cost Level</div>
                          <div className="detail-value">
                            <span className={`badge badge-${(uni.costLevel || '').toLowerCase()}`}>
                              {uni.costLevel || '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">🎯</span>
                        <div>
                          <div className="detail-label">Acceptance Chance</div>
                          <div className="detail-value">
                            <span className={`badge badge-${(uni.acceptanceChance || '').toLowerCase()}`}>
                              {uni.acceptanceChance || '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="university-requirements">
                      <h4>Requirements</h4>
                      <div className="requirements-grid">
                        <div className="requirement-item">
                          <span>GPA:</span>
                          <strong>{uni.requiredGPA}</strong>
                        </div>
                        <div className="requirement-item">
                          <span>IELTS:</span>
                          <strong>{uni.requiredIELTS}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="university-analysis">
                      <div className="analysis-item">
                        <h4>✅ Why it fits</h4>
                        <p>{uni.whyFits}</p>
                      </div>
                      {uni.risks && uni.risks.length > 0 && (
                        <div className="analysis-item risks">
                          <h4>⚠️ Key Risks</h4>
                          <ul>
                            {uni.risks.map((risk, index) => (
                              <li key={index}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="university-actions">
                      {uni.status === 'Recommended' && (
                        <>
                          <button 
                            onClick={() => handleShortlist(uni._id)}
                            className="btn btn-primary"
                            disabled={actionLoading === uni._id}
                          >
                            {actionLoading === uni._id ? 'Processing...' : 'Shortlist'}
                          </button>
                          <button 
                            onClick={() => handleRemove(uni._id)}
                            className="btn btn-outline"
                            disabled={actionLoading === uni._id}
                          >
                            Remove
                          </button>
                        </>
                      )}

                      {uni.status === 'Shortlisted' && (
                        <>
                          <button 
                            onClick={() => handleLock(uni._id)}
                            className="btn btn-success"
                            disabled={actionLoading === uni._id}
                          >
                            {actionLoading === uni._id ? 'Locking...' : 'Lock University 🔒'}
                          </button>
                          <button 
                            onClick={() => handleRemove(uni._id)}
                            className="btn btn-outline"
                            disabled={actionLoading === uni._id}
                          >
                            Remove
                          </button>
                        </>
                      )}

                      {uni.status === 'Locked' && (
                        <>
                          <Link to="/application" className="btn btn-primary">
                            View Application
                          </Link>
                          <button 
                            onClick={() => handleUnlock(uni._id)}
                            className="btn btn-danger"
                            disabled={actionLoading === uni._id}
                          >
                            {actionLoading === uni._id ? 'Unlocking...' : 'Unlock'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredUniversities.length === 0 && !loading && universities.length > 0 && (
              <div className="empty-state">
                <p>No universities found with the selected filters.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default UniversitiesPage;