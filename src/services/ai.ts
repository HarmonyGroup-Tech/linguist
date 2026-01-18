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
    }
}

export async function recommendNextLesson(
    completedLessonTitle: string,
    completedLessonDescription: string,
    userAnswer: string,
    correctAnswer: string,
    availableLessons: { id: string; title: string; description: string; type: string }[]
): Promise<{ recommendedLessonId: string; reason: string } | null> {
    try {
        // Filter available lessons to a manageable size (e.g., top 10) to avoid token limits
        const candidateLessons = availableLessons.slice(0, 10).map(l => ({
            id: l.id,
            title: l.title,
            description: l.description,
            type: l.type
        }));

        if (candidateLessons.length === 0) return null;

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
                        "content": `You are a helpful language tutor. A user just completed a lesson. Analyze their performance and recommend the best next lesson from the provided list.
                        
CRITICAL: You MUST respond with ONLY valid JSON - no markdown, no code blocks.

Structure:
{
  "recommendedLessonId": "id_of_the_lesson",
  "reason": "Short explanation of why this lesson is good based on their mistakes or need for new topics."
}`
                    },
                    {
                        "role": "user",
                        "content": `
User just completed: "${completedLessonTitle}" (${completedLessonDescription}).
Correct Answer: "${correctAnswer}"
User Answer: "${userAnswer}"

Analyze if they made mistakes (typos, grammar, wrong words).
If they made mistakes, find a lesson that helps practice that.
If they were perfect, suggest a lesson that introduces new related concepts or is slightly harder.
Do NOT recommend lessons that are not in the list.

Available Lessons:
${JSON.stringify(candidateLessons)}

Respond with JSON.`
                    }
                ]
            })
        });

        if (!response.ok) {
            console.error("AI Recommendation API failed");
            return null;
        }

        const data = await response.json();
        if (!data || !data.choices || !data.choices.length) return null;

        let content = data.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        return JSON.parse(content);
    } catch (error) {
        console.error("Error getting recommendation:", error);
        return null;
    }
}

/**
 * Generates a completely NEW lesson based on user's specific mistakes.
 */
export async function generatePersonalizedLesson(
    mistakes: string[],
    userLevel: string = "Intermediate",
    topic: string = "General"
): Promise<any | null> {
    try {
        console.log("Generating personalized lesson for mistakes:", mistakes);

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
                        "content": `You are an expert language curriculum designer. 
                        Create a structured lesson to help a student fix specific mistakes.
                        
                        CRITICAL: Respond with ONLY valid JSON.
                        
                        JSON Structure:
                        {
                          "title": "Short title focusing on the concept",
                          "description": "Brief description of what this lesson practices",
                          "language": "Spanish",
                          "level": 5,
                          "type": "text-input",
                          "category": "standard",
                          "context": "A short paragraph (2-3 sentences) in Spanish that uses the concept correctly.",
                          "targetSentence": "One sentence from the context that the user must translate.",
                          "correctTranslation": "The English translation of the target sentence.",
                          "vocabularyGain": 5,
                          "grammarGain": 15,
                          "readingGain": 5,
                          "writingGain": 10,
                          "xpReward": 20,
                          "generatedFromMistakes": ["mistake 1", "mistake 2"]
                        }`
                    },
                    {
                        "role": "user",
                        "content": `Student's Recent Mistakes: 
                        ${mistakes.map(m => `- ${m}`).join('\n')}
                        
                        Current Level: ${userLevel}
                        Topic Context: ${topic}
                        
                        Create a lesson that specifically addresses these errors. 
                        Ensure the content is appropriate for the level.`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`AI Generation API failed: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`AI Generation API failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        if (!data || !data.choices || !data.choices.length) return null;

        let content = data.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const lessonData = JSON.parse(content);

        // Add required default fields that AI might miss or get wrong
        return {
            ...lessonData,
            isActive: true, // Auto-activate
            order: 999, // Put at the end or handle sorting later
            requiredVocabulary: 0,
            requiredGrammar: 0,
            requiredReading: 0,
            requiredWriting: 0,
            isAiGenerated: true,
            generatedFromMistakes: mistakes
        };

    } catch (error) {
        console.error("Error generating personalized lesson:", error);
        return null; // Fail gracefully
    }
}
