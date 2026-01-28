const Anthropic = require('@anthropic-ai/sdk');
const Assessment = require('../models/Assessment');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    question: "What subjects or topics do you enjoy learning about the most?",
    category: "interests"
  },
  {
    id: 2,
    question: "What activities make you lose track of time because you enjoy them so much?",
    category: "interests"
  },
  {
    id: 3,
    question: "What are your strongest skills or abilities?",
    category: "skills"
  },
  {
    id: 4,
    question: "Do you prefer working with people, ideas, data, or things?",
    category: "work_style"
  },
  {
    id: 5,
    question: "What kind of impact do you want to make in the world?",
    category: "values"
  },
  {
    id: 6,
    question: "What is your current education level and field of study (if applicable)?",
    category: "background"
  },
  {
    id: 7,
    question: "Are you more interested in creative work, analytical work, or helping others?",
    category: "work_type"
  },
  {
    id: 8,
    question: "What are your long-term career goals or dream job?",
    category: "goals"
  }
];

exports.getQuestions = async (req, res) => {
  res.json({ questions: ASSESSMENT_QUESTIONS });
};

exports.submitAssessment = async (req, res) => {
  try {
    const { sessionId, responses } = req.body;

    if (!sessionId || !responses || responses.length === 0) {
      return res.status(400).json({ error: 'Invalid assessment data' });
    }

    // Create assessment prompt for Claude
    const assessmentPrompt = `Based on the following career assessment responses, provide personalized career recommendations:

${responses.map((r, i) => `Q${i + 1}: ${r.question}\nA: ${r.answer}`).join('\n\n')}

Please analyze these responses and provide:
1. Top 5 recommended career paths (with brief explanations)
2. Key strengths identified
3. Skills to develop
4. Next steps for career exploration

Format your response as JSON with the following structure:
{
  "topCareerPaths": ["career1", "career2", ...],
  "careerDetails": {"career1": "explanation", ...},
  "strengths": ["strength1", "strength2", ...],
  "skillsToDevelop": ["skill1", "skill2", ...],
  "nextSteps": ["step1", "step2", ...],
  "overallRecommendation": "detailed paragraph"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: assessmentPrompt
      }]
    });

    let analysisText = response.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    let analysis;
    
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback if JSON parsing fails
      analysis = {
        topCareerPaths: ["Software Developer", "Data Analyst", "Product Manager"],
        careerDetails: {},
        strengths: ["Problem Solving", "Communication"],
        skillsToDevelop: ["Leadership", "Technical Skills"],
        nextSteps: ["Research careers", "Skill development"],
        overallRecommendation: analysisText
      };
    }

    // Save assessment
    const assessment = new Assessment({
      sessionId,
      responses,
      results: {
        topCareerPaths: analysis.topCareerPaths,
        strengths: analysis.strengths,
        recommendations: JSON.stringify(analysis),
        confidence: 0.85
      }
    });

    await assessment.save();

    res.json({
      success: true,
      results: analysis
    });

  } catch (error) {
    console.error('Assessment Error:', error);
    res.status(500).json({ error: 'Failed to process assessment' });
  }
};

exports.getAssessmentResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const assessment = await Assessment.findOne({ sessionId }).sort({ completedAt: -1 });
    
    if (!assessment) {
      return res.status(404).json({ error: 'No assessment found' });
    }

    const results = JSON.parse(assessment.results.recommendations);
    res.json({ results });

  } catch (error) {
    console.error('Get Assessment Error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment results' });
  }
};