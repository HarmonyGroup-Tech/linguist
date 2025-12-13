import type { Handler, HandlerEvent } from '@netlify/functions';

const AIMLAPI_KEY = process.env.AIMLAPI_KEY;

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const hasKey = !!AIMLAPI_KEY;
    console.log("Checking API Configuration...");
    console.log("AIMLAPI_KEY present:", hasKey);
    console.log("Environment Keys:", Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')));

    if (!AIMLAPI_KEY) {
        console.error("Missing AIMLAPI_KEY");
        return { statusCode: 500, body: JSON.stringify({ error: 'Missing API Key configuration. Check Netlify Environment Variables.' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');

        // Log sanitized request (for debugging)
        console.log("Request to AIML API:", {
            model: body.model,
            messageCount: body.messages?.length,
            hasResponseFormat: !!body.response_format
        });

        const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AIMLAPI_KEY} `,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AIML API Error:", {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: `Upstream API Error: ${response.status} `,
                    details: errorText,
                    message: "AI service temporarily unavailable. Please try again."
                })
            };
        }

        const data = await response.json();
        console.log("AIML API Response:", {
            hasChoices: !!data.choices,
            choicesLength: data.choices?.length
        });

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
