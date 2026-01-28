import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { counsellorAPI, universitiesAPI } from '../services/api';
import './CounsellorPage.css';

function CounsellorPage() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Welcome message
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your AI Study Abroad Counsellor. I've analyzed your profile and I'm ready to help you discover the perfect universities for your goals. I can:\n\n• Recommend universities based on your profile\n• Explain why each university fits your goals\n• Help you shortlist universities\n• Create personalized action plans\n• Answer any questions about your study abroad journey\n\nWhat would you like to discuss today?",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await counsellorAPI.chat({
        message: input,
        conversationHistory: conversationHistory
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    setActionLoading(true);
    const loadingMessage = {
      role: 'assistant',
      content: "I'm analyzing your profile and searching for the best universities for you. This might take a moment...",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await counsellorAPI.recommend();
      const universities = response.data.universities;

      const resultMessage = {
        role: 'assistant',
        content: `Great! I've found ${universities.length} universities that match your profile:\n\n**Dream Universities (Ambitious):**\n${universities.filter(u => u.category === 'Dream').map(u => `• ${u.name}, ${u.country} - ${u.program}`).join('\n')}\n\n**Target Universities (Realistic):**\n${universities.filter(u => u.category === 'Target').map(u => `• ${u.name}, ${u.country} - ${u.program}`).join('\n')}\n\n**Safe Universities (Backup):**\n${universities.filter(u => u.category === 'Safe').map(u => `• ${u.name}, ${u.country} - ${u.program}`).join('\n')}\n\nYou can view detailed information about each university in the Universities section. Would you like me to explain why I recommended any specific university?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Recommendation error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I encountered an error while generating recommendations. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setActionLoading(false);
    }
  };

  const analyzeProfile = async () => {
    setActionLoading(true);
    const loadingMessage = {
      role: 'assistant',
      content: "Analyzing your profile in detail...",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await counsellorAPI.analyze();
      const analysis = response.data.analysis;

      const resultMessage = {
        role: 'assistant',
        content: `Here's my detailed analysis of your profile:\n\n**Your Strengths:**\n${analysis.strengths.map(s => `• ${s}`).join('\n')}\n\n**Areas to Improve:**\n${analysis.gaps.map(g => `• ${g}`).join('\n')}\n\n**Recommended Action Items:**\n${analysis.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n**Timeline:**\n${analysis.timeline}\n\nFocus on addressing the gaps while leveraging your strengths. Would you like specific guidance on any of these points?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I encountered an error while analyzing your profile. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setActionLoading(false);
    }
  };

  const quickActions = [
    { text: "Get university recommendations", action: getRecommendations },
    { text: "Analyze my profile", action: analyzeProfile },
    { text: "What are my chances?", message: "What are my acceptance chances based on my current profile?" },
    { text: "How to improve my profile?", message: "What can I do to improve my profile and increase my chances?" }
  ];

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
          <Link to="/counsellor" className="nav-item active">
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
      <main className="counsellor-main">
        <div className="counsellor-header">
          <div>
            <h1>🤖 AI Counsellor</h1>
            <p>Get personalized guidance for your study abroad journey</p>
          </div>
        </div>

        <div className="counsellor-container">
          <div className="messages-area">
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your study abroad journey..."
                className="chat-input"
                disabled={loading || actionLoading}
              />
              <button 
                type="submit" 
                className="btn-send" 
                disabled={loading || actionLoading || !input.trim()}
              >
                Send
              </button>
            </form>
          </div>

          <div className="quick-actions-panel">
            <h3>Quick Actions</h3>
            <p>Click to perform common tasks</p>
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="action-btn"
                  onClick={() => {
                    if (action.action) {
                      action.action();
                    } else if (action.message) {
                      setInput(action.message);
                    }
                  }}
                  disabled={actionLoading || loading}
                >
                  {action.text}
                </button>
              ))}
            </div>

            <div className="info-box">
              <h4>💡 Tips</h4>
              <ul>
                <li>Ask specific questions about universities</li>
                <li>Request explanations for recommendations</li>
                <li>Get help with application strategy</li>
                <li>Understand your acceptance chances</li>
              </ul>
            </div>

            <div className="info-box success">
              <h4>✅ What I Can Do</h4>
              <ul>
                <li>Recommend universities</li>
                <li>Analyze your profile</li>
                <li>Create action plans</li>
                <li>Answer questions</li>
                <li>Shortlist universities</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CounsellorPage;