const Anthropic = require('@anthropic-ai/sdk');
const Conversation = require('../models/Conversation');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const COUNSELLOR_SYSTEM_PROMPT = `You are an expert AI Career Counsellor helping students discover their ideal career paths. Your role is to:

1. Ask thoughtful questions to understand the student's interests, skills, and goals
2. Provide personalized career recommendations based on their responses
3. Offer practical advice on education paths, skill development, and career planning
4. Be encouraging, empathetic, and supportive
5. Provide specific, actionable guidance

Keep responses conversational, warm, and under 200 words. Focus on being helpful and motivating.`;

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({ sessionId });
    
    if (!conversation) {
      conversation = new Conversation({
        sessionId,
        messages: []
      });
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Prepare messages for Claude
    const messages = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get response from Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: COUNSELLOR_SYSTEM_PROMPT,
      messages: messages
    });

    const assistantMessage = response.content[0].text;

    // Add assistant response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: assistantMessage
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      message: assistantMessage,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await Conversation.findOne({ sessionId });
    
    if (!conversation) {
      return res.json({ messages: [] });
    }

    res.json({ messages: conversation.messages });
  } catch (error) {
    console.error('Get Conversation Error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

exports.clearConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Conversation.findOneAndDelete({ sessionId });
    res.json({ message: 'Conversation cleared successfully' });
  } catch (error) {
    console.error('Clear Conversation Error:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
};