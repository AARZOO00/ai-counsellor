import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { universitiesAPI, counsellorAPI } from '../services/api';
import './UniversitiesPage.css';

function UniversitiesPage() {
  const { user, logout } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  
  // ✅ FIX: Use ref to persist data across renders and prevent flicker
  const universitiesCache = useRef(null);
  const isInitialLoad = useRef(true);

  // ✅ FIX: Prevent multiple simultaneous API calls
  const loadingRef = useRef(false);

  useEffect(() => {
    // Only load on initial mount
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadUniversities();
    }
  }, []);

  const loadUniversities = async () => {
    // Prevent duplicate API calls
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching universities...');
      const response = await universitiesAPI.getAll();
      
      // ✅ FIX: Handle correct response structure
      const list = Array.isArray(response?.data?.universities) 
        ? response.data.universities 
        : [];

      console.log(`✅ Received ${list.length} universities`);

      // Cache the data to prevent flicker
      universitiesCache.current = list;
      setUniversities(list);
      setError(null);
    } catch (error) {
      console.error('❌ Load universities error:', error);
      setError(error.message);
      
      // Use cached data if available to prevent "No Universities Yet" flicker
      if (universitiesCache.current && universitiesCache.current.length > 0) {
        console.log('📦 Using cached universities:', universitiesCache.current.length);
        setUniversities(universitiesCache.current);
      } else {
        setUniversities([]);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🤖 Generating recommendations...');
      const response = await counsellorAPI.recommend();
      console.log('✅ Recommendations generated');
      
      // Wait a moment for data to be saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload universities
      await loadUniversities();
    } catch (error) {
      console.error('❌ Generate recommendations error:', error);
      setError('Failed to generate recommendations. Please try again.');
      setLoading(false);
      alert('Failed to generate recommendations. Please try again.');
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

  // ✅ FIX: Filter logic with safe guards
  const filteredUniversities = (universities || []).filter(uni => {
    if (!uni) return false;
    
    const uniStatus = uni.status || 'Recommended';
    if (filter !== 'all' && uniStatus.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (categoryFilter !== 'all' && (uni.category || 'Target') !== categoryFilter) {
      return false;
    }
    return true;
  });

  // ✅ FIX: Compute stats safely
  const stats = {
    total: (universities || []).length,
    recommended: (universities || []).filter(u => (u?.status || 'Recommended') === 'Recommended').length,
    shortlisted: (universities || []).filter(u => u?.status === 'Shortlisted').length,
    locked: (universities || []).filter(u => u?.status === 'Locked').length
  };

  // ✅ FIX: Improved conditional rendering to prevent flicker
  // Show loading skeletons ONLY if loading AND no cached data
  const showLoadingState = loading && universities.length === 0;

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

        {/* Error message if any */}
        {error && !showLoadingState && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '16px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ✅ FIX: Improved conditional rendering */}
        {showLoadingState ? (
          // Show loading skeleton only on initial load with NO data
          <>
            <div className="stats-grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="skeleton-card" style={{ height: '80px' }}></div>
              ))}
            </div>
            <div className="universities-grid">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text" style={{width: '40%', marginBottom: '20px'}}></div>
                  <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                    <div className="skeleton" style={{width: '30%', height: '60px', borderRadius: '8px'}}></div>
                    <div className="skeleton" style={{width: '30%', height: '60px', borderRadius: '8px'}}></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : universities.length === 0 ? (
          // Show empty state ONLY if truly no universities
          <div className="empty-state-large">
            <div className="empty-icon">🎓</div>
            <h2>No Universities Yet</h2>
            <p>Let the AI Counsellor analyze your profile and recommend universities that match your goals.</p>
            <button onClick={generateRecommendations} className="btn btn-primary btn-large">
              Generate Recommendations
            </button>
          </div>
        ) : (
          // Show actual data
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Universities</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.recommended}</div>
                <div className="stat-label">Recommended</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.shortlisted}</div>
                <div className="stat-label">Shortlisted</div>
              </div>
              <div className="stat-card locked">
                <div className="stat-value">{stats.locked}</div>
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

            {/* Universities Grid */}
            <div className="universities-grid">
              {filteredUniversities.map(uni => (
                <div key={uni._id} className="university-card">
                  <div className="university-header">
                    <div>
                      <h3>{uni.name}</h3>
                      <p className="university-location">{uni.country}</p>
                    </div>
                    <div className="university-badges">
                      <span className={`badge badge-${(uni.category || 'target').toLowerCase()}`}>
                        {uni.category || '—'}
                      </span>
                      {uni.status === 'Locked' && (
                        <span className="badge badge-locked">🔒 Locked</span>
                      )}
                    </div>
                  </div>

                  <div className="university-program">
                    <strong>Program:</strong> {uni.programs?.[0] || uni.program || '—'}
                  </div>

                  <div className="university-details">
                    <div className="detail-item">
                      <span className="detail-icon">💰</span>
                      <div>
                        <div className="detail-label">Tuition Fee</div>
                        <div className="detail-value">
                          {typeof uni.tuitionFee === 'number' ? `$${uni.tuitionFee.toLocaleString()}/year` : uni.tuitionFee || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">📊</span>
                      <div>
                        <div className="detail-label">Cost Level</div>
                        <div className="detail-value">
                          <span className={`badge badge-${(uni.costLevel || 'medium').toLowerCase()}`}>
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
                          <span className={`badge badge-${(uni.acceptanceChance || 'medium').toLowerCase()}`}>
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
                        <strong>{uni.requiredGPA || '3.0'}</strong>
                      </div>
                      <div className="requirement-item">
                        <span>IELTS:</span>
                        <strong>{uni.requiredIELTS || '6.5'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="university-analysis">
                    {uni.whyFits && (
                      <div className="analysis-item">
                        <h4>✅ Why it fits</h4>
                        <p>{uni.whyFits}</p>
                      </div>
                    )}
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
              ))}
            </div>

            {filteredUniversities.length === 0 && universities.length > 0 && (
              <div className="empty-state">
                <p>No universities match your filter. Try adjusting your filters.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default UniversitiesPage;
