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

// ============================================
// 🧠 MULTI-MODEL AI ORCHESTRATION
// ============================================

// Model definitions with different specializations
const AI_MODELS = {
  // Fast, lightweight - good for quick recommendations
  FAST: {
    name: "google/gemini-2.0-flash-lite-preview-02-05:free",
    weight: 0.2,
    timeout: 15000,
    specialization: "Quick recommendations"
  },
  // Balanced - good for general advice
  BALANCED: {
    name: "mistralai/mistral-7b-instruct:free",
    weight: 0.5,
    timeout: 20000,
    specialization: "General intelligence"
  },
  // Powerful - good for deep reasoning
  POWERFUL: {
    name: "meta-llama/llama-3-8b-instruct:free",
    weight: 0.3,
    timeout: 25000,
    specialization: "Deep reasoning"
  }
};


// ============================================
// 📊 CONFIDENCE SCORING SYSTEM
// ============================================

class ConfidenceScorer {
  constructor() {
    this.scores = {};
  }

  // Score based on model reliability
  scoreByModel(modelName) {
    const scores = {
      "google/gemini-2.0-flash-lite-preview-02-05:free": 0.85, // Very reliable
      "mistralai/mistral-7b-instruct:free": 0.80, // Reliable
      "meta-llama/llama-3-8b-instruct:free": 0.75, // Good
    };
    return scores[modelName] || 0.7;
  }

  // Score based on response length and detail
  scoreByResponseQuality(response) {
    if (!response) return 0;
    const length = response.length;
    const hasDetails = /[,;:]/.test(response); // Has structured info
    const quality = Math.min(length / 500, 1.0) * 0.7 + (hasDetails ? 0.3 : 0);
    return Math.min(quality, 1.0);
  }

  // Score based on user profile completeness
  scoreByProfileCompleteness(profile) {
    if (!profile) return 0;
    const fields = ['gpa', 'intendedDegree', 'fieldOfStudy', 'preferredCountries', 'fundingPlan'];
    const filled = fields.filter(f => profile[f]).length;
    return (filled / fields.length) * 0.5 + 0.5; // 50-100%
  }

  // Combined confidence score (0-100%)
  calculateConfidence(profile, response, modelName) {
    const modelScore = this.scoreByModel(modelName);
    const responseScore = this.scoreByResponseQuality(response);
    const profileScore = this.scoreByProfileCompleteness(profile);

    // Weighted average
    const confidence = (
      modelScore * 0.4 +
      responseScore * 0.4 +
      profileScore * 0.2
    ) * 100;

    return Math.round(confidence);
  }
}

const scorer = new ConfidenceScorer();

// ============================================
// 🔄 SMART MODEL ROUTING
// ============================================

// Determine best model based on query type
const selectModelByQuery = (message) => {
  const lowerMsg = message.toLowerCase();

  // Quick answers → Fast model
  if (lowerMsg.match(/^(what|which|how many|list)/i)) {
    return [AI_MODELS.FAST];
  }

  // Reasoning → Powerful model
  if (lowerMsg.match(/(why|explain|compare|pros and cons|advice)/i)) {
    return [AI_MODELS.POWERFUL, AI_MODELS.BALANCED];
  }

  // Default → Balanced approach
  return [AI_MODELS.BALANCED, AI_MODELS.FAST];
};

// ============================================
// 🎯 INTELLIGENT RESPONSE GENERATION
// ============================================

const generateContentWithFallback = async (messages, selectedModels = null) => {
  const modelsToTry = selectedModels || [
    AI_MODELS.BALANCED,
    AI_MODELS.POWERFUL,
    AI_MODELS.FAST
  ];

  let lastError = null;
  let attempts = 0;

  for (const model of modelsToTry) {
    attempts++;
    try {
      console.log(`🧠 Attempt ${attempts}: Trying ${model.name}...`);

      const response = await openai.chat.completions.create(
        {
          model: model.name,
          messages: messages,
          timeout: model.timeout,
        },
        { timeout: model.timeout }
      );

      const reply = response.choices[0]?.message?.content;

      if (reply && reply.length > 10) {
        console.log(`✅ Success with ${model.name} (Attempt ${attempts})`);
        return {
          content: reply,
          model: model.name,
          specialization: model.specialization,
          isSuccess: true,
          attempts: attempts,
          confidence: 85 + (10 / attempts) // Higher confidence for fewer attempts
        };
      }
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ ${model.name} failed: ${error.message}`);
      console.log(`🔄 Switching to next model...`);
      
      // Add small delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // All models failed - return intelligent fallback
  console.error(`❌ All models failed. Using fallback response.`);
  return {
    content: "I'm experiencing high traffic right now! 😊\n\nHere are some popular topics I can help with:\n• Top universities in USA, UK, Canada\n• GPA requirements and scholarships\n• IELTS/TOEFL preparation\n• Statement of Purpose writing\n\nPlease ask me anything about study abroad!",
    model: "fallback",
    specialization: "Safe response",
    isSuccess: false,
    attempts: attempts,
    confidence: 40
  };
};

// ============================================
// 📄 JSON CLEANING
// ============================================

const cleanJSON = (text) => {
  if (!text) return "";
  try {
    // Try to find JSON array or object
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    const objectMatch = text.match(/\{[\s\S]*\}/);
    const match = arrayMatch || objectMatch;

    if (match) {
      return match[0];
    }
  } catch (e) {
    console.error("JSON parse error:", e);
  }
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// ============================================
// 🎤 CHAT CONTROLLER (Enhanced)
// ============================================

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const profile = await Profile.findOne({ userId: req.user.id });

    // Select models based on query type
    const selectedModels = selectModelByQuery(message);

    // Create system prompt with personalization
    const systemPrompt = `You are an expert Study Abroad Mentor with experience helping students worldwide.
    
User Profile:
- GPA: ${profile?.gpa || 'Not provided'}
- Target Degree: ${profile?.intendedDegree || 'Not specified'}
- Preferred Countries: ${profile?.preferredCountries?.join(', ') || 'Not specified'}
- Budget: $${profile?.budgetPerYear?.min || 'Not specified'} - $${profile?.budgetPerYear?.max || 'Not specified'}

Guidelines:
- Be encouraging and supportive
- Provide actionable advice
- Keep responses concise (2-3 sentences max)
- Include specific university names when relevant`;

    // Generate response with fallback
    const result = await generateContentWithFallback(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      selectedModels
    );

    // Calculate confidence
    const confidence = scorer.calculateConfidence(profile, result.content, result.model);

    res.json({
      success: true,
      message: result.content,
      metadata: {
        model: result.model,
        specialization: result.specialization,
        confidence: confidence,
        attempts: result.attempts,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(503).json({
      success: false,
      message: "I'm temporarily unavailable. Please try again in a moment!",
      error: error.message
    });
  }
};

// ============================================
// 🎓 UNIVERSITY RECOMMENDATION (Enhanced)
// ============================================

exports.recommendUniversities = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(400).json({ 
        success: false, 
        message: "Please complete your profile first" 
      });
    }

    // Build intelligent prompt
    const prompt = `Based on the following student profile, recommend 8 universities (mix of Dream, Target, Safe):

Profile:
- GPA: ${profile.gpa || '3.5'}
- Degree: ${profile.intendedDegree}
- Field: ${profile.fieldOfStudy}
- Preferred Countries: ${profile.preferredCountries?.join(', ') || 'USA, UK, Canada'}
- Budget: $${profile.budgetPerYear?.min || 20000} - $${profile.budgetPerYear?.max || 60000}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "name": "University Name",
    "country": "Country",
    "category": "Dream/Target/Safe",
    "acceptanceChance": "Low/Medium/High",
    "program": "Program Name",
    "tuitionFee": "$X,XXX",
    "whyFits": "2-3 reason sentences",
    "risks": ["Risk 1", "Risk 2"]
  }
]

Be realistic and specific. Only JSON array, no other text.`;

    // Use powerful model for recommendations
    const result = await generateContentWithFallback(
      [{ role: "user", content: prompt }],
      [AI_MODELS.POWERFUL, AI_MODELS.BALANCED]
    );

    try {
      const universities = JSON.parse(cleanJSON(result.content));

      // Calculate confidence
      const confidence = scorer.calculateConfidence(profile, JSON.stringify(universities), result.model);

      res.json({
        success: true,
        universities: universities,
        confidence: confidence,
        metadata: {
          model: result.model,
          generatedAt: new Date().toISOString(),
          studentProfile: {
            gpa: profile.gpa,
            degree: profile.intendedDegree,
            budget: `$${profile.budgetPerYear?.min}-${profile.budgetPerYear?.max}`
          }
        }
      });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Return safe fallback recommendations
      res.json({
        success: true,
        universities: [
          {
            name: "Arizona State University",
            country: "USA",
            category: "Safe",
            acceptanceChance: "High",
            program: profile.fieldOfStudy,
            tuitionFee: "$32,000",
            whyFits: "Affordable tuition with strong graduate programs in your field",
            risks: ["Large student body"]
          },
          {
            name: "University of Toronto",
            country: "Canada",
            category: "Target",
            acceptanceChance: "Medium",
            program: profile.fieldOfStudy,
            tuitionFee: "$45,000",
            whyFits: "Excellent ranking with lower cost than USA",
            risks: ["Competitive admission"]
          }
        ],
        confidence: 60,
        metadata: { fallback: true }
      });
    }
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(503).json({
      success: false,
      message: "Unable to generate recommendations at this time",
      error: error.message
    });
  }
};

// ============================================
// 📊 ACCEPTANCE CHANCE PREDICTION (New)
// ============================================

exports.predictChances = async (req, res) => {
  try {
    const { universityId } = req.body;
    const profile = await Profile.findOne({ userId: req.user.id });

    const prompt = `Given this student profile, what is their realistic chance of acceptance to a university?

Student:
- GPA: ${profile.gpa}
- Standardized Tests: IELTS ${profile.ielts?.score || 'Not taken'}, GRE ${profile.gre?.score || 'Not taken'}
- Field: ${profile.fieldOfStudy}

Provide:
1. Acceptance Probability (Low/Medium/High)
2. Key Strengths (2-3 points)
3. Areas to Improve (2-3 points)
4. Confidence Level (0-100%)

Format as JSON: {"probability":"High","confidence":85,"strengths":[],"improvements":[]}`;

    const result = await generateContentWithFallback(
      [{ role: "user", content: prompt }],
      [AI_MODELS.BALANCED, AI_MODELS.POWERFUL]
    );

    try {
      const prediction = JSON.parse(cleanJSON(result.content));
      res.json({
        success: true,
        prediction: prediction,
        model: result.model,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      res.json({
        success: true,
        prediction: {
          probability: "Medium",
          confidence: 65,
          strengths: ["Strong academic background", "Clear career goals"],
          improvements: ["Consider standardized test prep", "Build relevant experience"]
        }
      });
    }
  } catch (error) {
    res.status(503).json({ success: false, message: "Prediction service unavailable" });
  }
};

// ============================================
// 📝 PROFILE ANALYSIS
// ============================================

exports.analyzeProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    const prompt = `Analyze this student profile and provide honest feedback:
- GPA: ${profile.gpa}
- Target: ${profile.intendedDegree} in ${profile.fieldOfStudy}
- Test Scores: IELTS ${profile.ielts?.score || 'Not started'}
- SOP Status: ${profile.sopStatus}

Provide: Strengths, Gaps, Next Steps (2 sentences each)`;

    const result = await generateContentWithFallback(
      [{ role: "user", content: prompt }],
      [AI_MODELS.BALANCED]
    );

    res.json({
      success: true,
      analysis: result.content,
      confidence: scorer.calculateConfidence(profile, result.content, result.model)
    });
  } catch (error) {
    res.status(503).json({ success: false, message: "Analysis unavailable" });
  }
};

// ============================================
// ✍️ SOP REVIEW
// ============================================

exports.reviewSOP = async (req, res) => {
  try {
    const { sopText } = req.body;

    const prompt = `Review this Statement of Purpose for a study abroad application:

"${sopText}"

Provide feedback on:
1. Clarity (is the motivation clear?)
2. Structure (good flow?)
3. Grammar (any errors?)
4. Impact (compelling?)

Give 3-5 specific suggestions for improvement.`;

    const result = await generateContentWithFallback(
      [{ role: "user", content: prompt }],
      [AI_MODELS.POWERFUL, AI_MODELS.BALANCED]
    );

    res.json({
      success: true,
      feedback: result.content,
      confidence: 75
    });
  } catch (error) {
    res.status(503).json({ success: false, message: "SOP review unavailable" });
  }
};
