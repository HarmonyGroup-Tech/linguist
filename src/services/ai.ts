// Constants removed as they are handled by Netlify Function now

export interface LessonResponse {
    sourceTitle: string;
    sourceAuthor: string;
    context: string;
    targetSentence: string;
}

export async function generateLesson(topic: string, level: string, language: string = "Spanish"): Promise<LessonResponse> {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3.2-3b-instruct:free",
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a language teacher. Generate a language lesson snippet in ${language} based on valid literary works.
            
CRITICAL: You MUST respond with ONLY valid JSON - no markdown formatting, no code blocks, no extra text.

The JSON must follow this exact structure:
{
  "sourceTitle": "Title of the book",
  "sourceAuthor": "Author name",
  "context": "A paragraph of text with 3-4 sentences in ${language}.",
  "targetSentence": "One specific sentence from the context that is suitable for translation."
}`
                    },
                    {
                        "role": "user",
                        "content": `Generate a ${level} level lesson about ${topic} in ${language}. Respond with ONLY the JSON object, nothing else.`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
            console.error("API Error Response:", errorData);
            throw new Error(`API Error: ${response.status} - ${errorData.message || errorData.error || 'Unknown error'}`);
        }

        // Netlify function returns the OpenRouter response object
        const data = await response.json();

        if (!data || !data.choices || !data.choices.length) {
            console.error("Invalid AI Response structure:", data);
            throw new Error("Invalid AI Response: Missing 'choices'");
        }

        let content = data.choices[0].message.content;

        // Strip markdown code blocks if present (some models add ```json ... ```)
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        return JSON.parse(content) as LessonResponse;
    } catch (error) {
        console.error("AI Generation failed:", error);
        // Fallback Mock for Demo/Stability if API fails
        return {
            sourceTitle: "The Alchemist",
            sourceAuthor: "Paulo Coelho",
            context: "The boy's name was Santiago. Dusk was falling as the boy arrived with his herd at an abandoned church. The roof had fallen in long ago, and an enormous sycamore had grown on the spot where the sacristy had once stood.",
            targetSentence: "The roof had fallen in long ago, and an enormous sycamore had grown on the spot where the sacristy had once stood."
        };
    }
}
