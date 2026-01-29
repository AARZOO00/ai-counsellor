import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ForgotPasswordPage.css'; // Ensure ye CSS file bani ho

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      setMessage('✅ Password Reset Successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="fp-container"> {/* 🔥 Alag Class */}
      <div className="fp-card">    {/* 🔥 Alag Class */}
        <h2 className="fp-title">Reset Password</h2>
        <p className="fp-subtitle">Enter your email and new password to reset.</p>
        
        {message && <div className="fp-alert success">{message}</div>}
        {error && <div className="fp-alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="fp-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter registered email"
            />
          </div>

          <div className="fp-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />
          </div>

          <button type="submit" className="fp-btn">
            Update Password
          </button>
        </form>

        <div className="fp-footer">
          <Link to="/login" className="fp-link">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;