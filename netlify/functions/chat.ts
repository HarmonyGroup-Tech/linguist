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

        // Try gemini-1.5-flash-002 as it's a very stable specific version
        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-002:generateContent?key=${GEMINI_API_KEY}`;

        console.log("Calling Gemini:", geminiUrl);

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let details = errorText;

            // If 404, try to list models to help the user identify what's wrong
            if (response.status === 404) {
                try {
                    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
                    const modelsRes = await fetch(listUrl).then(r => r.json());
                    details = `Model not found. Available models for your key: ${JSON.stringify(modelsRes)}`;
                } catch (listError) {
                    details = `${errorText} (Additionally, failed to fetch available models: ${String(listError)})`;
                }
            }

            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Gemini API Error: ${response.status}`, details })
            };
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
