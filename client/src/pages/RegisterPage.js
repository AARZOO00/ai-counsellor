import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      alert("Account Created Successfully!");
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE: FORM */}
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Create Account</h1>
          <p>Start your study abroad journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="fullName" className="form-input" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" required />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" name="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>

      {/* RIGHT SIDE: CREATIVE DESIGN 🎨 */}
      <div className="auth-illustration">
        {/* Background Circles for decoration */}
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>

        <div className="illustration-content">
          <h2>Join the Future of <br/> Study Abroad</h2>
          <p>AI-powered guidance to get you into your dream university.</p>
          
          {/* Floating Glass Cards */}
          <div className="features-grid">
            <div className="glass-card">
              <span className="icon">🎓</span>
              <div>
                <strong>500+</strong>
                <span>Universities</span>
              </div>
            </div>
            <div className="glass-card">
              <span className="icon">🤖</span>
              <div>
                <strong>AI</strong>
                <span>Counsellor</span>
              </div>
            </div>
            <div className="glass-card">
              <span className="icon">🚀</span>
              <div>
                <strong>95%</strong>
                <span>Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;