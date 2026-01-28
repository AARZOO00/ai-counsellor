import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ChatPage({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversation();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/conversation/${sessionId}`);
      if (response.data.messages && response.data.messages.length > 0) {
        setMessages(response.data.messages);
      } else {
        // Welcome message
        setMessages([{
          role: 'assistant',
          content: "Hello! I'm your AI Career Counsellor. I'm here to help you explore career options, understand your strengths, and plan your professional journey. What would you like to talk about today?",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
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
      const response = await axios.post(`${API_URL}/chat/message`, {
        message: input,
        sessionId: sessionId
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
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

  const clearChat = async () => {
    try {
      await axios.delete(`${API_URL}/chat/conversation/${sessionId}`);
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your AI Career Counsellor. I'm here to help you explore career options, understand your strengths, and plan your professional journey. What would you like to talk about today?",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <h2>💬 Career Counsellor Chat</h2>
          <button onClick={clearChat} className="btn-clear">Clear Chat</button>
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? '🎓' : '👤'}
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
              <div className="message-avatar">🎓</div>
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
            placeholder="Type your message here..."
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" className="btn-send" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>

      <div className="chat-suggestions">
        <h3>Suggested Questions:</h3>
        <div className="suggestions-grid">
          <button onClick={() => setInput("What career paths match my interests in technology?")} className="suggestion-btn">
            Career Paths in Tech
          </button>
          <button onClick={() => setInput("How do I choose between multiple career options?")} className="suggestion-btn">
            Choosing Career Options
          </button>
          <button onClick={() => setInput("What skills should I develop for data science?")} className="suggestion-btn">
            Skills for Data Science
          </button>
          <button onClick={() => setInput("How can I transition to a new career?")} className="suggestion-btn">
            Career Transition
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;