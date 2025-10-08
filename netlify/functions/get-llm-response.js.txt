// --- netlify/functions/get-llm-response.js ---

// IMPORTANT: You must install these packages in your project (`npm install @google/generative-ai openai`)
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Initialize clients with API keys from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt, model } = JSON.parse(event.body);
        let textResponse = '';

        if (model === 'gemini') {
            const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            textResponse = response.text();
        } else if (model === 'chatgpt') {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
            });
            textResponse = completion.choices[0].message.content;
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid model specified' }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ response: textResponse }),
        };

    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch response from LLM.' }),
        };
    }
};
