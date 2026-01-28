import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssessmentPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AssessmentPage({ sessionId }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/assessment/questions`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) return;

    const newResponse = {
      question: questions[currentQuestion].question,
      answer: currentAnswer,
      category: questions[currentQuestion].category
    };

    const newResponses = [...responses, newResponse];
    setResponses(newResponses);
    setCurrentAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment(newResponses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(responses[currentQuestion - 1]?.answer || '');
      setResponses(responses.slice(0, -1));
    }
  };

  const submitAssessment = async (finalResponses) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/assessment/submit`, {
        sessionId: sessionId,
        responses: finalResponses
      });

      setResults(response.data.results);
      setIsComplete(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setResponses([]);
    setCurrentAnswer('');
    setIsComplete(false);
    setResults(null);
  };

  if (loading) {
    return (
      <div className="assessment-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing your responses...</p>
        </div>
      </div>
    );
  }

  if (isComplete && results) {
    return (
      <div className="assessment-page">
        <div className="results-container">
          <h1>🎉 Your Career Assessment Results</h1>
          
          <div className="results-section">
            <h2>🎯 Top Career Recommendations</h2>
            <div className="career-list">
              {results.topCareerPaths?.map((career, index) => (
                <div key={index} className="career-item">
                  <div className="career-rank">{index + 1}</div>
                  <div className="career-info">
                    <h3>{career}</h3>
                    {results.careerDetails?.[career] && (
                      <p>{results.careerDetails[career]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="results-section">
            <h2>💪 Your Key Strengths</h2>
            <div className="strengths-grid">
              {results.strengths?.map((strength, index) => (
                <div key={index} className="strength-badge">
                  {strength}
                </div>
              ))}
            </div>
          </div>

          <div className="results-section">
            <h2>📚 Skills to Develop</h2>
            <div className="skills-list">
              {results.skillsToDevelop?.map((skill, index) => (
                <div key={index} className="skill-item">
                  <span className="skill-icon">✓</span>
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="results-section">
            <h2>🚀 Next Steps</h2>
            <div className="steps-list">
              {results.nextSteps?.map((step, index) => (
                <div key={index} className="step-item">
                  <span className="step-number">{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {results.overallRecommendation && (
            <div className="results-section">
              <h2>📝 Overall Recommendation</h2>
              <div className="recommendation-text">
                {results.overallRecommendation}
              </div>
            </div>
          )}

          <div className="results-actions">
            <button onClick={resetAssessment} className="btn btn-secondary">
              Take Again
            </button>
            <button 
              onClick={() => window.location.href = '/resources'} 
              className="btn btn-primary"
            >
              Explore Resources
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      <div className="assessment-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="question-counter">
          Question {currentQuestion + 1} of {questions.length}
        </div>

        {questions.length > 0 && (
          <div className="question-card">
            <h2 className="question-text">
              {questions[currentQuestion].question}
            </h2>

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="answer-input"
              rows="6"
            />

            <div className="question-actions">
              {currentQuestion > 0 && (
                <button onClick={handlePrevious} className="btn btn-secondary">
                  Previous
                </button>
              )}
              <button 
                onClick={handleNext} 
                className="btn btn-primary"
                disabled={!currentAnswer.trim()}
              >
                {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        )}

        <div className="assessment-tips">
          <h3>💡 Tips for Better Results</h3>
          <ul>
            <li>Be honest and specific in your answers</li>
            <li>Take your time to think through each question</li>
            <li>Provide examples when possible</li>
            <li>Consider both your current skills and interests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AssessmentPage;