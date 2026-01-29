import React, { useState } from 'react';
import { counsellorAPI } from '../services/api';
import './AdmissionSimulator.css';

const AdmissionSimulator = () => {
  const [formData, setFormData] = useState({
    gpa: 3.2,
    testScore: 1200,
    targetUniversity: 'Arizona State University'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await counsellorAPI.predict(formData);
      setResult(res.data.prediction);
    } catch (error) {
      alert("AI traffic high. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simulator-container">
      <div className="simulator-header">
        <h3>🔮 Admission Chances Simulator</h3>
        <p>Adjust the sliders to see how your chances change!</p>
      </div>

      {/* --- SLIDERS SECTION (Feature 3: What If) --- */}
      <div className="controls-grid">
        <div className="control-group">
          <label>GPA: <span className="value-badge">{formData.gpa}</span></label>
          <input 
            type="range" min="1.0" max="4.0" step="0.1" 
            value={formData.gpa}
            onChange={(e) => setFormData({...formData, gpa: e.target.value})}
            className="slider gpa-slider"
          />
        </div>

        <div className="control-group">
          <label>SAT/GRE: <span className="value-badge">{formData.testScore}</span></label>
          <input 
            type="range" min="800" max="1600" step="10" 
            value={formData.testScore}
            onChange={(e) => setFormData({...formData, testScore: e.target.value})}
            className="slider score-slider"
          />
        </div>

        <div className="control-group full-width">
          <input 
            type="text" 
            placeholder="Target University (e.g. MIT, Stanford)"
            value={formData.targetUniversity}
            onChange={(e) => setFormData({...formData, targetUniversity: e.target.value})}
            className="uni-input"
          />
        </div>

        <button className="simulate-btn" onClick={handleSimulate} disabled={loading}>
          {loading ? '⚡ Calculating AI Prediction...' : '🚀 Calculate Chances'}
        </button>
      </div>

      {/* --- RESULTS SECTION (Feature 1 & 2: Predictor & Risk) --- */}
      {result && (
        <div className={`result-box fade-in ${result.trafficLight?.toLowerCase()}`}>
          
          {/* Traffic Light & Score */}
          <div className="score-section">
            <div className={`traffic-light ${result.trafficLight?.toLowerCase()}`}>
              <div className="light red"></div>
              <div className="light yellow"></div>
              <div className="light green"></div>
            </div>
            <div className="percentage">
              <h1>{result.chance}%</h1>
              <span>Approval Chance</span>
            </div>
          </div>

          <div className="analysis-section">
            {/* Risk Analyzer */}
            <div className="analysis-card risks">
              <h4>⚠️ Red Flags (Risks)</h4>
              <ul>
                {result.risks?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            {/* Success Factors */}
            <div className="analysis-card strengths">
              <h4>✅ Strong Points</h4>
              <ul>
                {result.goodFactors?.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>

            {/* AI Tip */}
            <div className="ai-tip-box">
              <strong>💡 AI "What If" Suggestion:</strong>
              <p>{result.whatIf}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionSimulator;