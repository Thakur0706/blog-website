const { GoogleGenAI } = require("@google/genai");
const { BLOG_SYSTEM_INSTRUCTION } = require("./blogInstruction");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function main(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: BLOG_SYSTEM_INSTRUCTION,
    }
  });
  return response.text;
  
}
module.exports = { main };

