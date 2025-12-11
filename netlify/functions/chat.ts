import type { Handler, HandlerEvent } from '@netlify/functions';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const hasKey = !!OPENROUTER_API_KEY;
    console.log("Checking API Configuration...");
    console.log("OPENROUTER_API_KEY present:", hasKey);
    console.log("Environment Keys:", Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')));

    if (!OPENROUTER_API_KEY) {
        console.error("Missing OPENROUTER_API_KEY");
        return { statusCode: 500, body: JSON.stringify({ error: 'Missing API Key configuration. Check Netlify Environment Variables.' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://linguist.app",
                "X-Title": "Linguist",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API Error:", response.status, errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Upstream API Error: ${response.status}`, details: errorText })
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process request" })
        };
    }
};
