import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <h1 className="logo">🎓 AI Study Abroad</h1>
          <div className="nav-buttons">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Journey to Study Abroad<br />
            <span className="gradient-text">Guided by AI</span>
          </h1>
          <p className="hero-subtitle">
            No more confusion. No random browsing. Get a personalized, step-by-step plan 
            from profile building to university applications—all guided by your AI counsellor.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Start Your Journey
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-large">
              See How It Works
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card card-1">
            <span className="emoji">🎯</span>
            <p>Dream Universities</p>
          </div>
          <div className="floating-card card-2">
            <span className="emoji">✅</span>
            <p>Action Plan</p>
          </div>
          <div className="floating-card card-3">
            <span className="emoji">🤖</span>
            <p>AI Guidance</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Complete Your Profile</h3>
            <p>Tell us about your academics, goals, budget, and exam readiness. This builds your foundation.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Get AI Recommendations</h3>
            <p>Your AI counsellor analyzes your profile and recommends Dream, Target, and Safe universities.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Shortlist & Lock Universities</h3>
            <p>Review recommendations, understand risks, and commit to your top choices.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Follow Your Action Plan</h3>
            <p>Get personalized to-dos, document checklists, and deadlines for each university.</p>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Why Choose AI Study Abroad?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Focused Strategy</h3>
            <p>Lock universities to stay focused. No more endless browsing.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Decisions</h3>
            <p>Get intelligent recommendations based on your unique profile.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <h3>Clear Insights</h3>
            <p>Understand your strengths, gaps, and acceptance chances.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✅</div>
            <h3>Action-Oriented</h3>
            <p>Get tasks, not just advice. Know exactly what to do next.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3>Commitment System</h3>
            <p>Lock your choices to prevent decision paralysis.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📝</div>
            <h3>Application Tracking</h3>
            <p>Track SOPs, documents, and deadlines in one place.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Start Your Study Abroad Journey?</h2>
        <p>Join students who are making confident, informed decisions with AI guidance</p>
        <Link to="/register" className="btn btn-primary btn-large">
          Get Started Free
        </Link>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 AI Study Abroad. Built with ❤️ by Aarzoo</p>
      </footer>
    </div>
  );
}

export default LandingPage;