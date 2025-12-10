const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = 'https://linguist.app';
const SITE_NAME = 'Linguist';

export interface LessonResponse {
    sourceTitle: string;
    sourceAuthor: string;
    context: string;
    targetSentence: string;
}

export async function generateLesson(topic: string, level: string): Promise<LessonResponse> {
    if (!OPENROUTER_API_KEY) {
        console.warn("OpenRouter API Key missing, returning mock.");
        return {
            sourceTitle: "The Alchemist",
            sourceAuthor: "Paulo Coelho",
            context: "The boy's name was Santiago. Dusk was falling as the boy arrived with his herd at an abandoned church. The roof had fallen in long ago, and an enormous sycamore had grown on the spot where the sacristy had once stood.",
            targetSentence: "The roof had fallen in long ago, and an enormous sycamore had grown on the spot where the sacristy had once stood."
        };
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
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

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content) as LessonResponse;
    } catch (error) {
        console.error("AI Generation failed:", error);
        throw error;
    }
}
