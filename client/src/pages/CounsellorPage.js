import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { counsellorAPI } from '../services/api';
import AdmissionSimulator from '../components/AdmissionSimulator'; // Simulator Import
import './CounsellorPage.css';

function CounsellorPage() {
  const { logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your AI Study Abroad Counsellor. I can recommend universities, analyze your profile, or calculate your admission chances. What would you like to do?",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- 🔊 AI SPEAK FUNCTION ---
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1; 
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- 🎤 VOICE INPUT FUNCTION ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser not supported. Please use Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    window.speechSynthesis.cancel(); 

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await counsellorAPI.chat({
        message: input,
        conversationHistory: messages
      });

      const aiText = response.data.message;
      setMessages(prev => [...prev, { role: 'assistant', content: aiText, timestamp: new Date() }]);
      speak(aiText);

    } catch (error) {
      const errText = "I'm having trouble connecting to the server. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: errText, timestamp: new Date() }]);
      speak(errText);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    setActionLoading(true);
    window.speechSynthesis.cancel();
    const loadingText = "Searching for universities...";
    setMessages(prev => [...prev, { role: 'assistant', content: loadingText, timestamp: new Date() }]);
    speak(loadingText);

    try {
      const response = await counsellorAPI.recommend();
      const unis = response.data.universities;
      const resultText = `I found ${unis.length} universities. Check the list below:\n` + unis.map(u => `• ${u.name}`).join('\n');
      
      setMessages(prev => [...prev, { role: 'assistant', content: resultText, timestamp: new Date() }]);
      speak(`I found ${unis.length} universities for you.`);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to fetch recommendations.", timestamp: new Date() }]);
    } finally {
      setActionLoading(false);
    }
  };

  const analyzeProfile = async () => {
    setActionLoading(true);
    const loadingText = "Analyzing your profile...";
    setMessages(prev => [...prev, { role: 'assistant', content: loadingText, timestamp: new Date() }]);
    speak(loadingText);

    try {
      const response = await counsellorAPI.analyze();
      const resultText = "Profile Analysis Complete. Check the details above.";
      setMessages(prev => [...prev, { role: 'assistant', content: JSON.stringify(response.data.analysis), timestamp: new Date() }]);
      speak(resultText);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Analysis failed.", timestamp: new Date() }]);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header"><h2>🎓 AI Study Abroad</h2></div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item"><span className="nav-icon">📊</span>Dashboard</Link>
          <Link to="/counsellor" className="nav-item active"><span className="nav-icon">🤖</span>AI Counsellor</Link>
          <Link to="/universities" className="nav-item"><span className="nav-icon">🎓</span>Universities</Link>
          <Link to="/application" className="nav-item"><span className="nav-icon">📝</span>Applications</Link>
          <Link to="/profile" className="nav-item"><span className="nav-icon">👤</span>Profile</Link>
        </nav>
        <div className="sidebar-footer">
            <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="counsellor-main">
        <div className="counsellor-header">
          <h1>🤖 AI Counsellor</h1>
          <p>Get personalized guidance for your study abroad journey</p>
        </div>

        <div className="counsellor-container">
          {/* LEFT SIDE: CHAT */}
          <div className="messages-area">
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === 'assistant' ? '🤖' : '👤'}</div>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))}
              {loading && <div className="message assistant"><div className="typing-indicator">...</div></div>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or use the mic..."
                className="chat-input"
                disabled={loading || actionLoading}
              />
              <button 
                type="button" 
                onClick={startListening}
                style={{
                  background: isListening ? 'red' : '#4CAF50',
                  color: 'white', border: 'none', borderRadius: '50%',
                  width: '40px', height: '40px', marginRight: '10px', cursor: 'pointer'
                }}
              >
                {isListening ? '🛑' : '🎙️'}
              </button>
              <button type="submit" className="btn-send" disabled={loading || !input.trim()}>Send</button>
            </form>
          </div>

          {/* RIGHT SIDE: ACTIONS & SIMULATOR */}
          <div className="quick-actions-panel">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
                <button className="action-btn" onClick={getRecommendations} disabled={actionLoading}>Get Recommendations</button>
                <button className="action-btn" onClick={analyzeProfile} disabled={actionLoading}>Analyze Profile</button>
            </div>
            
            {/* 🔥 SIMULATOR ADDED HERE CORRECTLY */}
            <div style={{ marginTop: '30px' }}>
                <AdmissionSimulator />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CounsellorPage;