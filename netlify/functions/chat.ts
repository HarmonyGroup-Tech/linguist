import type { Handler, HandlerEvent } from '@netlify/functions';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const messages = body.messages || [];

        if (!GEMINI_API_KEY) {
            throw new Error("No API Configuration found (Missing GEMINI_API_KEY)");
        }

        // Convert OpenAI messages to Gemini Content
        let systemInstruction = "";
        const contents: any[] = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemInstruction += msg.content + "\n";
            } else if (msg.role === 'user') {
                const text: string = (contents.length === 0 && systemInstruction)
                    ? systemInstruction + "\n" + msg.content
                    : msg.content;

                contents.push({
                    role: "user",
                    parts: [{ text: text }]
                });
                if (contents.length === 1) systemInstruction = "";
            } else if (msg.role === 'assistant') {
                contents.push({
                    role: "model",
                    parts: [{ text: msg.content }]
                });
            }
        }

        // Using gemini-2.0-flash as confirmed available via ListModels
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini Error (${response.status}):`, errorText);
            throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

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

    } catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process request", details: String(error) })
        };
    }
};
