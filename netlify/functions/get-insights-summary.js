// --- netlify/functions/get-insights-summary.js ---

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { geminiResponse, chatgptResponse } = JSON.parse(event.body);

        const summaryPrompt = `
            You are an expert analyst. Below are two responses to the same prompt, one from Gemini and one from ChatGPT.
            Provide a concise, strategic summary comparing the two.
            Focus on the differences in tone, structure, key information provided, and overall approach.
            Conclude with a recommendation on which response might be better for different use cases (e.g., quick overview vs. detailed explanation).

            --- GEMINI RESPONSE ---
            ${geminiResponse}

            --- CHATGPT RESPONSE ---
            ${chatgptResponse}
            
            --- YOUR SUMMARY ---
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(summaryPrompt);
        const response = await result.response;
        const summaryText = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ summary: summaryText }),
        };

    } catch (error) {
        console.error('Insights Summary Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate insights summary.' }),
        };
    }
};
