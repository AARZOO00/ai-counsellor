import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import './ProfilePage.css';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    currentEducationLevel: '',
    degree: '',
    major: '',
    graduationYear: new Date().getFullYear(),
    gpa: '',
    intendedDegree: '',
    fieldOfStudy: '',
    targetIntakeYear: new Date().getFullYear() + 1,
    preferredCountries: [],
    budgetPerYear: {
      min: '',
      max: ''
    },
    fundingPlan: '',
    ielts: {
      status: 'Not Started',
      score: ''
    },
    toefl: {
      status: 'Not Started',
      score: ''
    },
    gre: {
      status: 'Not Started',
      score: ''
    },
    gmat: {
      status: 'Not Started',
      score: ''
    },
    sopStatus: 'Not Started'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const profile = response?.data?.profile || {};
      setFormData(prev => ({
        ...prev,
        ...profile,
        // Merge nested objects to preserve defaults when API returns partial data
        ielts: { ...(prev.ielts || {}), ...(profile.ielts || {}) },
        toefl: { ...(prev.toefl || {}), ...(profile.toefl || {}) },
        gre: { ...(prev.gre || {}), ...(profile.gre || {}) },
        gmat: { ...(prev.gmat || {}), ...(profile.gmat || {}) },
        budgetPerYear: { ...(prev.budgetPerYear || {}), ...(profile.budgetPerYear || {}) },
        preferredCountries: Array.isArray(profile.preferredCountries) ? profile.preferredCountries : (prev.preferredCountries || [])
      }));
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCountryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        preferredCountries: [...formData.preferredCountries, value]
      });
    } else {
      setFormData({
        ...formData,
        preferredCountries: formData.preferredCountries.filter(c => c !== value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await profileAPI.create(formData);
      alert('Profile updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'Ireland', 'New Zealand'];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
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
          <Link to="/application" className="nav-item">
            <span className="nav-icon">📝</span>
            Applications
          </Link>
          <Link to="/profile" className="nav-item active">
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
        <div className="profile-header">
          <div>
            <h1>👤 Edit Profile</h1>
            <p>Update your information to get better recommendations</p>
          </div>
          <Link to="/dashboard" className="btn btn-outline">
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Academic Background */}
          <div className="form-section">
            <h2>📚 Academic Background</h2>
            
            <div className="form-group">
              <label className="form-label">Current Education Level *</label>
              <select
                name="currentEducationLevel"
                className="form-select"
                value={formData.currentEducationLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select Level</option>
                <option value="High School">High School</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Degree/Program</label>
                <input
                  type="text"
                  name="degree"
                  className="form-input"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g., B.Tech, B.Sc"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Major/Field *</label>
                <input
                  type="text"
                  name="major"
                  className="form-input"
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  className="form-input"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  min="2000"
                  max="2030"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GPA (out of 4.0) *</label>
                <input
                  type="number"
                  name="gpa"
                  className="form-input"
                  value={formData.gpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder="e.g., 3.5"
                  required
                />
              </div>
            </div>
          </div>

          {/* Study Goals */}
          <div className="form-section">
            <h2>🎯 Study Goals</h2>

            <div className="form-group">
              <label className="form-label">Intended Degree *</label>
              <select
                name="intendedDegree"
                className="form-select"
                value={formData.intendedDegree}
                onChange={handleChange}
                required
              >
                <option value="">Select Degree</option>
                <option value="Bachelor">Bachelor's</option>
                <option value="Master">Master's</option>
                <option value="MBA">MBA</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Field of Study *</label>
              <input
                type="text"
                name="fieldOfStudy"
                className="form-input"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="e.g., Data Science, Business Analytics"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Intake Year</label>
              <select
                name="targetIntakeYear"
                className="form-select"
                value={formData.targetIntakeYear}
                onChange={handleChange}
              >
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                <option value={new Date().getFullYear() + 2}>{new Date().getFullYear() + 2}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Countries *</label>
              <div className="checkbox-grid">
                {countries.map(country => (
                  <label key={country} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={country}
                      checked={formData.preferredCountries.includes(country)}
                      onChange={handleCountryChange}
                    />
                    <span>{country}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="form-section">
            <h2>💰 Budget & Funding</h2>

            <div className="form-group">
              <label className="form-label">Budget Range per Year (USD) *</label>
              <div className="form-row">
                <input
                  type="number"
                  name="budgetPerYear.min"
                  className="form-input"
                  value={formData.budgetPerYear.min}
                  onChange={handleChange}
                  placeholder="Min (e.g., 20000)"
                  required
                />
                <input
                  type="number"
                  name="budgetPerYear.max"
                  className="form-input"
                  value={formData.budgetPerYear.max}
                  onChange={handleChange}
                  placeholder="Max (e.g., 50000)"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Funding Plan *</label>
              <select
                name="fundingPlan"
                className="form-select"
                value={formData.fundingPlan}
                onChange={handleChange}
                required
              >
                <option value="">Select Funding Plan</option>
                <option value="Self-funded">Self-funded</option>
                <option value="Scholarship">Scholarship-dependent</option>
                <option value="Loan">Loan-dependent</option>
                <option value="Mixed">Mixed (Self + Scholarship/Loan)</option>
              </select>
            </div>
          </div>

          {/* Exams */}
          <div className="form-section">
            <h2>📝 Exams & Readiness</h2>

            <div className="exam-group">
              <h3>IELTS</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="ielts.status"
                    className="form-select"
                    value={formData.ielts.status}
                    onChange={handleChange}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                {formData.ielts.status === 'Completed' && (
                  <div className="form-group">
                    <label className="form-label">Score</label>
                    <input
                      type="number"
                      name="ielts.score"
                      className="form-input"
                      value={formData.ielts.score}
                      onChange={handleChange}
                      step="0.5"
                      min="0"
                      max="9"
                      placeholder="e.g., 7.5"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="exam-group">
              <h3>TOEFL</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="toefl.status"
                    className="form-select"
                    value={formData.toefl.status}
                    onChange={handleChange}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                {formData.toefl.status === 'Completed' && (
                  <div className="form-group">
                    <label className="form-label">Score</label>
                    <input
                      type="number"
                      name="toefl.score"
                      className="form-input"
                      value={formData.toefl.score}
                      onChange={handleChange}
                      min="0"
                      max="120"
                      placeholder="e.g., 100"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="exam-group">
              <h3>GRE</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="gre.status"
                    className="form-select"
                    value={formData.gre.status}
                    onChange={handleChange}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                {formData.gre.status === 'Completed' && (
                  <div className="form-group">
                    <label className="form-label">Score</label>
                    <input
                      type="number"
                      name="gre.score"
                      className="form-input"
                      value={formData.gre.score}
                      onChange={handleChange}
                      min="260"
                      max="340"
                      placeholder="e.g., 320"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Statement of Purpose (SOP) Status</label>
              <select
                name="sopStatus"
                className="form-select"
                value={formData.sopStatus}
                onChange={handleChange}
              >
                <option value="Not Started">Not Started</option>
                <option value="Draft">Draft</option>
                <option value="Ready">Ready</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions-sticky">
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ProfilePage;