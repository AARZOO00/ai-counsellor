const Anthropic = require('@anthropic-ai/sdk');
const Profile = require('../models/Profile');
const University = require('../models/University');
const ToDo = require('../models/ToDo');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const COUNSELLOR_SYSTEM_PROMPT = `You are an expert AI Study Abroad Counsellor. Your role is to:

1. Understand the student's academic background, goals, budget, and exam readiness
2. Recommend universities categorized as Dream, Target, and Safe
3. Explain WHY each university fits and what the RISKS are
4. Take ACTIONS such as:
   - Shortlisting universities
   - Locking universities (commitment step)
   - Creating to-do tasks for applications
   - Updating task priorities

You must be:
- Honest about acceptance chances
- Clear about budget fit
- Specific about requirements
- Action-oriented (not just informative)

When recommending universities, always categorize them and explain the reasoning clearly.
When the user asks to shortlist or lock a university, confirm the action.
When creating tasks, be specific about deadlines and priorities.`;

// @desc    Chat with AI Counsellor
// @route   POST /api/counsellor/chat
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Get user profile
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(400).json({ 
        error: 'Profile not found. Please complete onboarding first.' 
      });
    }

    // Get shortlisted and locked universities
    const universities = await University.find({ 
      userId: req.user.id,
      status: { $in: ['Shortlisted', 'Locked'] }
    });

    // Build context
    const contextMessage = `
Student Profile:
- Education: ${profile.currentEducationLevel} in ${profile.major}
- Target: ${profile.intendedDegree} in ${profile.fieldOfStudy}
- GPA: ${profile.gpa}
- Budget: $${profile.budgetPerYear.min} - $${profile.budgetPerYear.max} per year
- Countries: ${profile.preferredCountries.join(', ')}
- IELTS: ${profile.ielts.status}${profile.ielts.score ? ` (Score: ${profile.ielts.score})` : ''}
- GRE: ${profile.gre.status}${profile.gre.score ? ` (Score: ${profile.gre.score})` : ''}
- SOP: ${profile.sopStatus}

Current Shortlisted Universities: ${universities.length > 0 ? universities.map(u => `${u.name} (${u.status})`).join(', ') : 'None'}

Student's question: ${message}
`;

    // Prepare messages
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: contextMessage
      }
    ];

    // Get AI response
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: COUNSELLOR_SYSTEM_PROMPT,
      messages: messages
    });

    const aiMessage = response.content[0].text;

    res.json({
      success: true,
      message: aiMessage,
      profile: profile.profileStrength
    });

  } catch (error) {
    console.error('Counsellor chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

// @desc    Get AI university recommendations
// @route   POST /api/counsellor/recommend
exports.recommendUniversities = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found' });
    }

    const prompt = `Based on this student profile, recommend 9 universities (3 Dream, 3 Target, 3 Safe):

Profile:
- Current: ${profile.currentEducationLevel} in ${profile.major}
- Target: ${profile.intendedDegree} in ${profile.fieldOfStudy}
- GPA: ${profile.gpa}
- Budget: $${profile.budgetPerYear.min} - $${profile.budgetPerYear.max}
- Countries: ${profile.preferredCountries.join(', ')}
- IELTS: ${profile.ielts.score || 'Not taken'}
- GRE: ${profile.gre.score || 'Not taken'}

For each university, provide:
1. University name
2. Country
3. Program name
4. Category (Dream/Target/Safe)
5. Tuition fee per year
6. Why it fits (2-3 sentences)
7. Key risks (1-2 points)
8. Cost level (Low/Medium/High)
9. Acceptance chance (Low/Medium/High)
10. Required GPA
11. Required IELTS score

Return as JSON array with this exact structure:
[{
  "name": "string",
  "country": "string",
  "program": "string",
  "category": "Dream/Target/Safe",
  "tuitionFee": number,
  "whyFits": "string",
  "risks": ["string"],
  "costLevel": "Low/Medium/High",
  "acceptanceChance": "Low/Medium/High",
  "requiredGPA": number,
  "requiredIELTS": number
}]`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    let recommendationsText = response.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = recommendationsText.match(/\[[\s\S]*\]/);
    let universities;
    
    if (jsonMatch) {
      universities = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse university recommendations');
    }

    // Save recommended universities to database
    const savedUniversities = await Promise.all(
      universities.map(uni => 
        University.create({
          userId: req.user.id,
          ...uni,
          status: 'Recommended'
        })
      )
    );

    res.json({
      success: true,
      universities: savedUniversities
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

// @desc    Analyze profile and suggest next steps
// @route   GET /api/counsellor/analyze
exports.analyzeProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found' });
    }

    const prompt = `Analyze this student profile and provide:
1. Profile strengths (3-4 points)
2. Profile gaps/weaknesses (2-3 points)
3. Immediate action items (3-5 tasks)
4. Timeline suggestions

Profile:
- Education: ${profile.currentEducationLevel}, GPA: ${profile.gpa}
- Target: ${profile.intendedDegree} in ${profile.fieldOfStudy}
- Budget: $${profile.budgetPerYear.min} - $${profile.budgetPerYear.max}
- IELTS: ${profile.ielts.status}
- GRE: ${profile.gre.status}
- SOP: ${profile.sopStatus}

Return as JSON:
{
  "strengths": ["string"],
  "gaps": ["string"],
  "actionItems": ["string"],
  "timeline": "string"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    let analysisText = response.content[0].text;
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    
    let analysis;
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse analysis');
    }

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze profile' });
  }
};