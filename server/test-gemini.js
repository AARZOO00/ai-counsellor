require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
  console.log("Testing Gemini Key...");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY .env mein nahi mili!");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Available models ki list nikalein
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("👉 Trying generateContent with 'gemini-1.5-flash'...");
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log("✅ Success! Response:", response.text());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("404")) {
        console.log("💡 Suggestion: Shayad model ka naam galat hai ya API Key restricted hai.");
    }
  }
}

testKey();