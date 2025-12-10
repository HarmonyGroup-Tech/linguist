// Constants removed as they are handled by Netlify Function now

export interface LessonResponse {
    sourceTitle: string;
    sourceAuthor: string;
    context: string;
    targetSentence: string;
}

export async function generateLesson(topic: string, level: string): Promise<LessonResponse> {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // The function handles the model and prompt structure, 
                // but for flexibility we can pass partial params or move full logic here.
                // Given the function implementation, it expects "body" to be forwarded to OpenRouter.
                // So we reconstruct the OpenRouter body here.
                "model": "google/gemini-2.0-pro-exp-02-05:free",
                "response_format": { "type": "json_object" },
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a language teacher. Generate a language lesson snippet based on valid literary works.
            Output purely valid JSON with the following structure:
            {
              "sourceTitle": "Title of the book",
              "sourceAuthor": "Author name",
              "context": "A paragraph of text with 3-4 sentences.",
              "targetSentence": "One specific sentence from the context that is suitable for translation."
            }`
                    },
                    {
                        "role": "user",
                        "content": `Generate a ${level} level lesson about ${topic}.`
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        // Netlify function returns the OpenRouter response object
        const data = await response.json();
        const content = data.choices[0].message.content;
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
