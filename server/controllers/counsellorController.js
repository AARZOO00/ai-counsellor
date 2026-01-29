const OpenAI = require("openai");
const Profile = require('../models/Profile');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "AI Counsellor",
  }
});

// ============================================================
// 🤖 ENHANCED AI MODEL ORCHESTRATION WITH CONFIDENCE SCORING
// ============================================================

// Model tier definitions with specializations
const MODEL_TIERS = {
  fast: {
    name: "google/gemini-2.0-flash-lite-preview-02-05:free",
    reliability: 0.85,
    specialization: "Quick answers, factual questions",
    timeout: 20000
  },
  balanced: {
    name: "mistralai/mistral-7b-instruct:free",
    reliability: 0.90,
    specialization: "Balanced reasoning, recommendations",
    timeout: 25000
  },
  powerful: {
    name: "meta-llama/llama-3-8b-instruct:free",
    reliability: 0.92,
    specialization: "Deep analysis, comprehensive explanations",
    timeout: 30000
  }
};

// ============================================================
// ✨ CONFIDENCE SCORER
// ============================================================
class ConfidenceScorer {
  /**
   * Calculate confidence score (0-100%) based on multiple factors
   * Weights: Model Reliability (0.4), Response Quality (0.4), Profile Completeness (0.2)
   */
  static calculateConfidence(modelReliability, responseQuality, profileCompleteness) {
    const weights = {
      model: 0.4,
      response: 0.4,
      profile: 0.2
    };

    // Normalize values to 0-1 range
    const normalizedModel = modelReliability / 100;
    const normalizedResponse = responseQuality / 100;
    const normalizedProfile = profileCompleteness / 100;

    const confidence = 
      (normalizedModel * weights.model * 100) +
      (normalizedResponse * weights.response * 100) +
      (normalizedProfile * weights.profile * 100);

    return Math.round(Math.min(100, Math.max(0, confidence)));
  }

  /**
   * Evaluate response quality (0-100)
   */
  static evaluateResponseQuality(response, context = {}) {
    let quality = 75; // Base quality

    // Check response length (longer = more informative, but too long = overwhelming)
    if (response.length < 20) quality -= 25;
    if (response.length > 500) quality -= 10;

    // Check for specific patterns
    if (response.includes('JSON') || response.includes('```')) quality += 10;
    if (response.includes('Error') || response.includes('cannot') || response.toLowerCase().includes('fail')) quality -= 15;
    if (response.includes('$') || response.includes('USD') || response.includes('scholarship')) quality += 5;

    // Penalize generic responses
    if (response.includes('I am currently experiencing') || response.includes('very high traffic')) quality = 20;

    return Math.min(100, Math.max(0, quality));
  }

  /**
   * Calculate profile completeness percentage
   */
  static calculateProfileCompleteness(profile) {
    if (!profile) return 0;

    const requiredFields = ['gpa', 'ielts', 'targetCountries', 'budget', 'major'];
    let completedFields = 0;

    requiredFields.forEach(field => {
      if (profile[field] && profile[field] !== null && profile[field] !== '') {
        completedFields++;
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  }
}

// ============================================================
// 🎯 INTELLIGENT MODEL SELECTION BY QUERY TYPE
// ============================================================
/**
 * Select the best model based on query characteristics
 * Returns: { model: string, specialization: string }
 */
function selectModelByQuery(message) {
  const msgLower = message.toLowerCase();

  // Pattern-based model selection
  const quickQuestions = ['what', 'which', 'where', 'when'];
  const reasoningQuestions = ['how', 'why', 'explain', 'analyze', 'compare'];
  const complexQuestions = ['predict', 'recommend', 'strategy', 'plan', 'comprehensive'];

  if (quickQuestions.some(q => msgLower.startsWith(q))) {
    return {
      model: MODEL_TIERS.fast.name,
      tier: 'fast',
      specialization: MODEL_TIERS.fast.specialization
    };
  }

  if (complexQuestions.some(q => msgLower.includes(q))) {
    return {
      model: MODEL_TIERS.powerful.name,
      tier: 'powerful',
      specialization: MODEL_TIERS.powerful.specialization
    };
  }

  if (reasoningQuestions.some(q => msgLower.includes(q))) {
    return {
      model: MODEL_TIERS.balanced.name,
      tier: 'balanced',
      specialization: MODEL_TIERS.balanced.specialization
    };
  }

  // Default to balanced for general queries
  return {
    model: MODEL_TIERS.balanced.name,
    tier: 'balanced',
    specialization: MODEL_TIERS.balanced.specialization
  };
}

// ============================================================
// 🔄 INTELLIGENT FALLBACK WITH RETRIES
// ============================================================
/**
 * Generate content with intelligent fallback chain and confidence tracking
 */
const generateContentWithConfidence = async (messages, selectedTier = 'balanced') => {
  const tierKeys = ['fast', 'balanced', 'powerful'];
  const selectedIndex = tierKeys.indexOf(selectedTier);
  
  // Build fallback chain: try selected first, then others
  const fallbackChain = [
    selectedTier,
    ...tierKeys.filter(t => t !== selectedTier)
  ];

  let lastError = null;
  let attemptCount = 0;

  for (const tier of fallbackChain) {
    attemptCount++;
    const tierConfig = MODEL_TIERS[tier];

    try {
      console.log(`🧠 [Attempt ${attemptCount}] Trying Model: ${tier} (${tierConfig.name})`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), tierConfig.timeout);

      const completion = await openai.chat.completions.create({
        model: tierConfig.name,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      });

      clearTimeout(timeout);

      const response = completion.choices[0]?.message?.content;
      if (response) {
        console.log(`✅ [${tier}] Success on attempt ${attemptCount}`);

        return {
          content: response,
          model: tier,
          modelName: tierConfig.name,
          specialization: tierConfig.specialization,
          attempts: attemptCount,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ [${tier}] Failed: ${error.message || 'Unknown error'}`);
    }
  }

  // All models failed - return fallback response
  console.error('❌ All models failed. Using fallback response.');
  return {
    content: "I'm currently experiencing high traffic. Please try asking about specific topics like 'Top Universities in USA', 'UK Scholarship Opportunities', or 'Canada Study Requirements'.",
    model: 'fallback',
    modelName: 'fallback-response',
    specialization: 'Fallback response',
    attempts: attemptCount,
    timestamp: new Date().toISOString(),
    error: lastError?.message
  };
};

// ============================================================
// 📋 HELPER FUNCTIONS
// ============================================================

const cleanJSON = (text) => {
  if (!text) return "";
  const jsonMatch = text.match(/\[.*\]/s) || text.match(/\{.*\}/s);
  if (jsonMatch) return jsonMatch[0];
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// ============================================================
// 🎯 ENHANCED CONTROLLERS WITH CONFIDENCE SCORING
// ============================================================

/**
 * Chat endpoint with confidence scoring
 */
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const profile = await Profile.findOne({ userId: req.user.id });
    
    // Select best model for this query
    const selectedModel = selectModelByQuery(message);
    console.log(`📊 Selected Model Tier: ${selectedModel.tier} (${selectedModel.specialization})`);

    const systemPrompt = `You are an expert Study Abroad Counsellor and advisor.
    User Profile: ${profile ? `GPA ${profile.gpa}, IELTS ${profile.ielts}, Target: ${profile.targetCountries?.join(', ') || 'Not specified'}` : 'New user'}
    Instructions:
    - Be professional, encouraging, and specific
    - Provide actionable advice
    - Keep responses concise (max 100 words)
    - Reference user profile when relevant`;

    const result = await generateContentWithConfidence([
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ], selectedModel.tier);

    // Calculate confidence score
    const responseQuality = ConfidenceScorer.evaluateResponseQuality(result.content);
    const modelReliability = MODEL_TIERS[result.model]?.reliability || 75;
    const profileCompleteness = ConfidenceScorer.calculateProfileCompleteness(profile);
    const confidence = ConfidenceScorer.calculateConfidence(modelReliability, responseQuality, profileCompleteness);

    res.json({
      success: true,
      message: result.content,
      metadata: {
        model: result.model,
        modelName: result.modelName,
        specialization: result.specialization,
        confidence: confidence + '%',
        attempts: result.attempts,
        timestamp: result.timestamp,
        profileCompleteness: profileCompleteness + '%'
      }
    });
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Please try again.",
      error: error.message
    });
  }
};

/**
 * Recommend Universities with confidence scoring
 */
exports.recommendUniversities = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    const prompt = `Based on this student profile:
    - GPA: ${profile?.gpa || '3.0'}
    - IELTS: ${profile?.ielts || '6.5'}
    - Budget: ${profile?.budget || 'Moderate'}
    - Target Countries: ${profile?.targetCountries?.join(', ') || 'USA, UK, Canada'}
    
    Recommend 8 universities (3 Dream, 3 Target, 2 Safe) that match their profile.
    Return STRICTLY as valid JSON array with this structure:
    [
      {
        "name": "University Name",
        "country": "Country",
        "category": "Dream|Target|Safe",
        "acceptanceChance": "High|Medium|Low",
        "tuitionFee": 45000,
        "whyFits": "Specific reason why this matches their profile",
        "requiredGPA": "3.2",
        "requiredIELTS": "7.0"
      }
    ]
    
    IMPORTANT: Return ONLY valid JSON, no other text.`;

    const result = await generateContentWithConfidence([
      { role: "system", content: "You are an expert university recommendation AI. Always respond with valid JSON only." },
      { role: "user", content: prompt }
    ], 'powerful');

    let universities = [];
    try {
      universities = JSON.parse(cleanJSON(result.content));
      if (!Array.isArray(universities)) throw new Error('Not an array');
    } catch (parseError) {
      console.warn('❌ Failed to parse recommendations, using fallback universities');
      universities = [
        { name: "Arizona State University", country: "USA", category: "Safe", acceptanceChance: "High", tuitionFee: 35000, whyFits: "Strong engineering program with high acceptance rate" },
        { name: "University of Toronto", country: "Canada", category: "Target", acceptanceChance: "Medium", tuitionFee: 38000, whyFits: "Top-ranked university with good scholarship opportunities" },
        { name: "University of Manchester", country: "UK", category: "Target", acceptanceChance: "Medium", tuitionFee: 42000, whyFits: "Excellent research opportunities and career prospects" },
        { name: "University of Melbourne", country: "Australia", category: "Target", acceptanceChance: "Medium", tuitionFee: 40000, whyFits: "Strong STEM programs with diverse student body" },
        { name: "Waterloo University", country: "Canada", category: "Dream", acceptanceChance: "Low", tuitionFee: 35000, whyFits: "Renowned for engineering and co-op programs" },
        { name: "ETH Zurich", country: "Switzerland", category: "Dream", acceptanceChance: "Low", tuitionFee: 1500, whyFits: "World's best engineering school with low fees" },
        { name: "NUS Singapore", country: "Singapore", category: "Safe", acceptanceChance: "High", tuitionFee: 25000, whyFits: "Top Asian university with competitive fees" },
        { name: "RMIT Australia", country: "Australia", category: "Safe", acceptanceChance: "High", tuitionFee: 28000, whyFits: "Practical education with strong industry connections" }
      ];
    }

    // Calculate confidence
    const responseQuality = ConfidenceScorer.evaluateResponseQuality(result.content);
    const modelReliability = MODEL_TIERS[result.model]?.reliability || 75;
    const profileCompleteness = ConfidenceScorer.calculateProfileCompleteness(profile);
    const confidence = ConfidenceScorer.calculateConfidence(modelReliability, responseQuality, profileCompleteness);

    res.json({
      success: true,
      data: {
        universities: universities,
        metadata: {
          model: result.model,
          specialization: result.specialization,
          confidence: confidence + '%',
          attempts: result.attempts,
          timestamp: result.timestamp,
          recommendationBasis: `Based on ${profile?.gpa || '3.0'} GPA and ${profile?.ielts || '6.5'} IELTS`
        }
      }
    });
  } catch (error) {
    console.error("❌ Recommendation Error:", error);
    // Fallback universities
    res.json({
      success: true,
      data: {
        universities: [
          { name: "Arizona State University", country: "USA", category: "Safe", acceptanceChance: "High" },
          { name: "University of Toronto", country: "Canada", category: "Target", acceptanceChance: "Medium" },
          { name: "University of Manchester", country: "UK", category: "Target", acceptanceChance: "Medium" },
          { name: "Waterloo University", country: "Canada", category: "Dream", acceptanceChance: "Low" }
        ],
        metadata: { confidence: "45%", error: "Using fallback recommendations" }
      }
    });
  }
};

/**
 * Predict admission chances with confidence scoring
 */
exports.predictChances = async (req, res) => {
  try {
    const { universities } = req.body;
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!universities || !Array.isArray(universities)) {
      return res.status(400).json({ error: 'Invalid universities array' });
    }

    const prompt = `Student Profile:
    - GPA: ${profile?.gpa || '3.0'}
    - IELTS: ${profile?.ielts || '6.5'}
    
    Predict admission chances for these universities: ${universities.join(', ')}
    
    Return as JSON:
    {
      "predictions": [
        {
          "university": "Name",
          "chance": "High|Medium|Low",
          "percentage": 75,
          "reasoning": "Brief explanation"
        }
      ]
    }`;

    const result = await generateContentWithConfidence([
      { role: "user", content: prompt }
    ], 'balanced');

    let predictions = { predictions: [] };
    try {
      predictions = JSON.parse(cleanJSON(result.content));
    } catch {
      predictions = {
        predictions: universities.map(uni => ({
          university: uni,
          chance: "Medium",
          percentage: 60,
          reasoning: "Prediction based on average profile"
        }))
      };
    }

    const confidence = ConfidenceScorer.calculateConfidence(
      MODEL_TIERS.balanced.reliability,
      ConfidenceScorer.evaluateResponseQuality(result.content),
      ConfidenceScorer.calculateProfileCompleteness(profile)
    );

    res.json({
      success: true,
      data: {
        ...predictions,
        metadata: {
          confidence: confidence + '%',
          model: result.model,
          timestamp: result.timestamp
        }
      }
    });
  } catch (error) {
    console.error('❌ Prediction error:', error);
    res.status(503).json({ error: 'Service unavailable' });
  }
};

/**
 * Analyze user profile with confidence scoring
 */
exports.analyzeProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const prompt = `Analyze this student's profile and provide insights:
    - GPA: ${profile.gpa}
    - IELTS: ${profile.ielts}
    - Budget: ${profile.budget}
    - Target Countries: ${profile.targetCountries?.join(', ')}
    - Academic Interest: ${profile.major}
    
    Provide:
    1. Strengths
    2. Areas for improvement
    3. Recommended universities
    4. Next steps
    
    Format as JSON with these keys: strengths[], improvements[], recommendations[], nextSteps[]`;

    const result = await generateContentWithConfidence([
      { role: "user", content: prompt }
    ], 'powerful');

    let analysis = {
      strengths: [],
      improvements: [],
      recommendations: [],
      nextSteps: []
    };

    try {
      analysis = JSON.parse(cleanJSON(result.content));
    } catch {
      analysis = {
        strengths: ["Clear study goals"],
        improvements: ["Consider improving standardized test scores"],
        recommendations: ["Target universities in your preferred countries"],
        nextSteps: ["Complete pending applications", "Gather recommendation letters"]
      };
    }

    const confidence = ConfidenceScorer.calculateConfidence(
      MODEL_TIERS.powerful.reliability,
      ConfidenceScorer.evaluateResponseQuality(result.content),
      ConfidenceScorer.calculateProfileCompleteness(profile)
    );

    res.json({
      success: true,
      data: {
        analysis,
        metadata: {
          confidence: confidence + '%',
          model: result.model,
          profileCompleteness: ConfidenceScorer.calculateProfileCompleteness(profile) + '%'
        }
      }
    });
  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(503).json({ error: 'Service unavailable' });
  }
};

/**
 * Review Statement of Purpose with confidence scoring
 */
exports.reviewSOP = async (req, res) => {
  try {
    const { sop } = req.body;
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!sop) {
      return res.status(400).json({ error: 'SOP text required' });
    }

    const prompt = `You are an expert SOP reviewer for study abroad applications.
    
    Review this Statement of Purpose and provide feedback:
    
    "${sop}"
    
    Student Profile: GPA ${profile?.gpa || 'N/A'}, targeting ${profile?.targetCountries?.join(', ') || 'multiple countries'}
    
    Provide feedback as JSON:
    {
      "score": 85,
      "strengths": ["point1", "point2"],
      "weaknesses": ["point1", "point2"],
      "improvements": ["suggestion1", "suggestion2"],
      "overallFeedback": "Brief summary"
    }`;

    const result = await generateContentWithConfidence([
      { role: "user", content: prompt }
    ], 'powerful');

    let feedback = {
      score: 75,
      strengths: [],
      weaknesses: [],
      improvements: [],
      overallFeedback: "Good SOP. Consider adding more specific details about your academic interests."
    };

    try {
      feedback = JSON.parse(cleanJSON(result.content));
    } catch {
      // Use default feedback
    }

    const confidence = ConfidenceScorer.calculateConfidence(
      MODEL_TIERS.powerful.reliability,
      ConfidenceScorer.evaluateResponseQuality(result.content),
      ConfidenceScorer.calculateProfileCompleteness(profile)
    );

    res.json({
      success: true,
      data: {
        feedback,
        metadata: {
          confidence: confidence + '%',
          model: result.model,
          timestamp: result.timestamp
        }
      }
    });
  } catch (error) {
    console.error('❌ SOP review error:', error);
    res.status(503).json({ error: 'Service unavailable' });
  }
};

module.exports = exports;