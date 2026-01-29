require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.log("❌ Error: GEMINI_API_KEY missing in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    console.log("🔍 Checking available models for your API Key...");
    // Available models fetch karein
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init to get access
    
    // Asli magic yahan hai: Google se pucho "Mere liye kya available hai?"
    // Note: SDK ka direct 'listModels' method use karte hain agar available ho,
    // nahi toh hum simple fetch try karenge.
    
    // Direct REST API call to be 100% sure regardless of SDK version
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
      console.log("\n✅ AVAILABLE MODELS:");
      data.models.forEach(m => {
        // Sirf 'generateContent' wale models dikhayein
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- ${m.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log("❌ Error:", data);
    }

  } catch (error) {
    console.error("❌ Failed:", error.message);
  }
}

listModels();