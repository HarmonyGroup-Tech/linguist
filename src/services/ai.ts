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
                "model": "mistralai/Mistral-7B-Instruct-v0.2",
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

        // Check if it's a rate limit error
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isRateLimit = errorMessage.includes('429') || errorMessage.includes('rate-limited');

        // Diverse fallback lessons for demo
        const mockLessons: LessonResponse[] = [
            {
                sourceTitle: isRateLimit ? "Demo Mode (API Rate Limited)" : "The Alchemist",
                sourceAuthor: "Paulo Coelho",
                context: "The boy's name was Santiago. Dusk was falling as the boy arrived with his herd at an abandoned church. The roof had fallen in long ago, and an enormous sycamore had grown on the spot where the sacristy had once stood.",
                targetSentence: "The roof had fallen in long ago, and an enormous sycamore had grown on the spot where the sacristy had once stood."
            },
            {
                sourceTitle: "One Hundred Years of Solitude",
                sourceAuthor: "Gabriel García Márquez",
                context: "Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice. At that time Macondo was a village of twenty adobe houses, built on the bank of a river of clear water that ran along a bed of polished stones.",
                targetSentence: "At that time Macondo was a village of twenty adobe houses, built on the bank of a river of clear water that ran along a bed of polished stones."
            },
            {
                sourceTitle: "The Little Prince",
                sourceAuthor: "Antoine de Saint-Exupéry",
                context: "Once when I was six years old I saw a magnificent picture in a book about the primeval forest. It was a picture of a boa constrictor swallowing an animal. In the book it said: 'Boa constrictors swallow their prey whole, without chewing it.'",
                targetSentence: "In the book it said: 'Boa constrictors swallow their prey whole, without chewing it.'"
            },
            {
                sourceTitle: "The Shadow of the Wind",
                sourceAuthor: "Carlos Ruiz Zafón",
                context: "I still remember the day my father took me to the Cemetery of Forgotten Books for the first time. It was the early summer of 1945, and we walked through the streets of a Barcelona trapped beneath ashen skies as dawn poured over Rambla de Santa Mónica.",
                targetSentence: "It was the early summer of 1945, and we walked through the streets of a Barcelona trapped beneath ashen skies as dawn poured over Rambla de Santa Mónica."
            },
            {
                sourceTitle: "Like Water for Chocolate",
                sourceAuthor: "Laura Esquivel",
                context: "Tita was so sensitive to onions, any time they were being chopped, they say she would just cry and cry. When she was still in my great-grandmother's belly her sobs were so loud that even Nacha, the cook, who was half-deaf, could hear them easily.",
                targetSentence: "When she was still in my great-grandmother's belly her sobs were so loud that even Nacha, the cook, who was half-deaf, could hear them easily."
            }
        ];

        // Return a random mock lesson
        return mockLessons[Math.floor(Math.random() * mockLessons.length)];
        // Return a random mock lesson
        return mockLessons[Math.floor(Math.random() * mockLessons.length)];
    }
}
