import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResourcesPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ResourcesPage() {
  const [resources, setResources] = useState(null);
  const [activeTab, setActiveTab] = useState('careers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response = await axios.get(`${API_URL}/resources`);
      setResources(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading resources:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="resources-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-page">
      <div className="resources-header">
        <h1>📚 Career Resources & Learning Paths</h1>
        <p>Explore curated resources to help you achieve your career goals</p>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'careers' ? 'active' : ''}`}
          onClick={() => setActiveTab('careers')}
        >
          Career Paths
        </button>
        <button 
          className={`tab ${activeTab === 'learning' ? 'active' : ''}`}
          onClick={() => setActiveTab('learning')}
        >
          Learning Paths
        </button>
        <button 
          className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skill Development
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'careers' && (
          <div className="careers-grid">
            {resources?.careerPaths?.map((career) => (
              <div key={career.id} className="career-card">
                <h3>{career.title}</h3>
                <p className="career-description">{career.description}</p>
                
                <div className="career-detail">
                  <h4>🎯 Required Skills</h4>
                  <div className="skills-tags">
                    {career.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="career-detail">
                  <h4>🎓 Education</h4>
                  <p>{career.education}</p>
                </div>

                <div className="career-detail">
                  <h4>💰 Average Salary</h4>
                  <p className="salary">{career.averageSalary}</p>
                </div>

                <div className="career-detail">
                  <h4>📖 Learning Resources</h4>
                  <ul className="resources-list">
                    {career.resources.map((resource, index) => (
                      <li key={index}>{resource}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="learning-paths">
            {resources?.learningPaths?.map((path) => (
              <div key={path.id} className="learning-card">
                <h3>{path.title}</h3>
                <div className="steps-container">
                  {path.steps.map((step, index) => (
                    <div key={index} className="learning-step">
                      <div className="step-number">{index + 1}</div>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="skills-section">
            {resources?.skillDevelopment?.map((category, index) => (
              <div key={index} className="skill-category">
                <h3>{category.category}</h3>
                <div className="resource-cards">
                  {category.resources.map((resource, idx) => (
                    <div key={idx} className="resource-card">
                      <h4>{resource.name}</h4>
                      <p className="resource-type">{resource.type}</p>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        Visit Resource
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourcesPage;