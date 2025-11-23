const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Trying gemini-pro specifically as it's the most standard one
    const models = ['gemini-pro'];

    console.log("Testing models...");

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ Model ${modelName} is WORKING`);
            const response = await result.response;
            console.log(response.text());
        } catch (error) {
            console.log(`❌ Model ${modelName} failed: ${error.message}`);
        }
    }
}

listModels();
