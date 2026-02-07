
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ No GEMINI_API_KEY found in .env.local');
        return;
    }

    console.log(`Test Key: ${apiKey.substring(0, 10)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
        console.log('Sending prompt to Gemini...');
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();
        console.log('✅ Gemini Response:', text);
    } catch (error) {
        console.error('❌ Gemini Error:', error);
    }
}

testGemini();
