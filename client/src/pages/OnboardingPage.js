import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './OnboardingPage.css';

function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Academic Background
    currentEducationLevel: '',
    degree: '',
    major: '',
    graduationYear: new Date().getFullYear(),
    gpa: '',
    
    // Study Goals
    intendedDegree: '',
    fieldOfStudy: '',
    targetIntakeYear: new Date().getFullYear() + 1,
    preferredCountries: [],
    
    // Budget
    budgetPerYear: {
      min: '',
      max: ''
    },
    fundingPlan: '',
    
    // Exams
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

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

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

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic client-side validation for required onboarding fields
    if (!formData.currentEducationLevel) {
      setLoading(false);
      alert('Please complete Academic Background (step 1).');
      setStep(1);
      return;
    }

    if (!formData.intendedDegree) {
      setLoading(false);
      alert('Please complete Study Goals (step 2) and select an intended degree.');
      setStep(2);
      return;
    }

    if (!formData.fundingPlan) {
      setLoading(false);
      alert('Please complete Budget & Funding (step 3) and select a funding plan.');
      setStep(3);
      return;
    }

    // Ensure user is logged in (token present)
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      alert('You must be logged in to complete onboarding. Redirecting to login.');
      return navigate('/login');
    }

    try {
      await profileAPI.create(formData);
      // Refresh authenticated user so `onboardingCompleted` (or similar) becomes available
      await refreshUser();
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      // Show more informative message when available
      const serverMessage = error.response?.data?.message || error.response?.data || error.message;
      alert(`Failed to complete onboarding. ${serverMessage}`);
      setLoading(false);
    }
  };

  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'Ireland', 'New Zealand'];

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Complete Your Profile</h1>
          <p>Help us understand your background and goals</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
          <p className="step-indicator">Step {step} of 4</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {/* Step 1: Academic Background */}
          {step === 1 && (
            <div className="form-step">
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

              <div className="form-actions">
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Study Goals */}
          {step === 2 && (
            <div className="form-step">
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
                <label className="form-label">Preferred Countries (Select all that apply) *</label>
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

              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  ← Previous
                </button>
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="btn btn-primary"
                  disabled={formData.preferredCountries.length === 0}
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="form-step">
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

              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  ← Previous
                </button>
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Exams & Readiness */}
          {step === 4 && (
            <div className="form-step">
              <h2>📝 Exams & Readiness</h2>

              <div className="exam-section">
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

              <div className="exam-section">
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

              <div className="exam-section">
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

              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  ← Previous
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Completing...' : 'Complete Profile ✓'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;