import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">
          Discover Your Perfect Career Path
        </h1>
        <p className="hero-subtitle">
          Get personalized career guidance powered by AI. Chat with our counsellor, 
          take assessments, and explore career opportunities tailored to your interests and skills.
        </p>
        <div className="hero-buttons">
          <Link to="/chat" className="btn btn-primary btn-large">
            Start Chatting
          </Link>
          <Link to="/assessment" className="btn btn-secondary btn-large">
            Take Assessment
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>AI-Powered Chat</h3>
            <p>Have natural conversations with our AI counsellor about your career aspirations and get instant guidance.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Career Assessment</h3>
            <p>Take our comprehensive assessment to discover career paths that match your skills and interests.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Learning Resources</h3>
            <p>Access curated resources, courses, and guides to help you develop skills for your dream career.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Roadmap</h3>
            <p>Get a customized action plan with clear steps to achieve your career goals.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join thousands of students who have found their career path with AI Career Counsellor</p>
        <Link to="/chat" className="btn btn-primary btn-large">
          Get Started Now
        </Link>
      </div>
    </div>
  );
}

export default HomePage;