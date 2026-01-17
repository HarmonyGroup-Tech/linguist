import type { Handler, HandlerEvent } from '@netlify/functions';

const AIMLAPI_KEY = process.env.AIMLAPI_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const messages = body.messages || [];

        // 1. Try Gemini API first if Key exists
        if (GEMINI_API_KEY) {
            console.log("Using Gemini API");

            // Convert OpenAI messages to Gemini Content
            // Simple conversion: concatenate system prompt to first user message or use proper role mapping
            // Gemini roles: 'user', 'model'

            let systemInstruction = "";
            const contents: { role: string; parts: { text: string }[] }[] = [];

            for (const msg of messages) {
                if (msg.role === 'system') {
                    systemInstruction += msg.content + "\n";
                } else if (msg.role === 'user') {
                    // Prepend system instruction to first user message if valid
                    const text = (contents.length === 0 && systemInstruction)
                        ? systemInstruction + "\n" + msg.content
                        : msg.content;

                    contents.push({
                        role: "user",
                        parts: [{ text: text }]
                    });
                    // Clear system instruction once used
                    if (contents.length === 1) systemInstruction = "";
                } else if (msg.role === 'assistant') {
                    contents.push({
                        role: "model",
                        parts: [{ text: msg.content }]
                    });
                }
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents })
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            // Mock OpenAI Response format
            return {
                statusCode: 200,
                body: JSON.stringify({
                    choices: [{
                        message: {
                            role: "assistant",
                            content: text
                        }
                    }]
                })
            };
        }

        // 2. Fallback to AIMLAPI
        if (!AIMLAPI_KEY) {
            throw new Error("No API Configuration found (Missing GEMINI_API_KEY or AIMLAPI_KEY)");
        }

        console.log("Using AIMLAPI");
        const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AIMLAPI_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`AIMLAPI Error: ${response.status} ${await response.text()}`);
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
            body: JSON.stringify({ error: "Failed to process request", details: String(error) })
        };
    }
};
