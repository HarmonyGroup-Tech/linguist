// Constants removed as they are handled by Netlify Function now

export interface LessonResponse {
    sourceTitle: string;
    sourceAuthor: string;
    context: string;
    targetSentence: string;
}

export async function generateLesson(topic: string, level: string, language: string = "German"): Promise<LessonResponse> {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "gemini-2.0-flash", // Body ignored by function but kept for documentation
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a language teacher. Generate a language lesson snippet in ${language} for a COMPLETE BEGINNER starting from absolute scratch.
            
CRITICAL: You MUST respond with ONLY valid JSON - no markdown formatting, no code blocks, no extra text.
CRITICAL: Use ONLY the most basic common words (e.g., 'hello', 'the', 'is', 'book', 'man', 'woman'). No complex literary metaphors.

The JSON must follow this exact structure:
{
  "sourceTitle": "Basic Topic",
  "sourceAuthor": "Modern Tutor",
  "context": "A paragraph of text with 2-3 very simple sentences in ${language}.",
  "targetSentence": "One short, simple sentence from the context suitable for translation."
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

        const data = await response.json();

        if (!data || !data.choices || !data.choices.length) {
            console.error("Invalid AI Response structure:", data);
            throw new Error("Invalid AI Response: Missing 'choices'");
        }

        let content = data.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        return JSON.parse(content) as LessonResponse;
    } catch (error) {
        console.error("AI Generation failed:", error);

        // Mock lessons updated to be slightly more generic or just fail
        return {
            sourceTitle: "The Metamorphosis",
            sourceAuthor: "Franz Kafka",
            context: "Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt. Er lag auf seinem panzerartig harten Rücken und sah, wenn er den Kopf ein wenig hob, seinen gewölbten, braunen, von bogenförmigen Versteifungen geteilten Bauch.",
            targetSentence: "Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt."
        };
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
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a helpful language tutor. A user just completed a lesson. Analyze their performance and recommend the best next lesson from the provided list.
                        
CRITICAL: You MUST respond with ONLY valid JSON.

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
Else, suggest a progression.

Available Lessons:
${JSON.stringify(candidateLessons)}

Respond with JSON.`
                    }
                ]
            })
        });

        if (!response.ok) return null;

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
    topic: string = "General",
    language: string = "German"
): Promise<any | null> {
    try {
        console.log(`Generating personalized ${language} lesson for level ${userLevel}`);

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": `You are an expert ${language} curriculum designer for students starting from ABSOLUTE SCRATCH. 
                        Create a structured lesson to help a student fix specific mistakes they made while learning ${language}.
                        
                        CRITICAL rules:
                        1. Respond with ONLY valid JSON.
                        2. All instructional content in the 'context' and 'targetSentence' MUST be in ${language}.
                        3. Use the SIMPLEST possible vocabulary. Avoid rare words or complex conjugation.
                        4. The 'level' should be a number from 1 to 10 (1=Beginner, 10=Master). For beginners, stay at 1.
                        
                        JSON Structure:
                        {
                          "title": "Short title in English",
                          "description": "Short description in English",
                          "language": "${language}",
                          "level": 1,
                          "type": "text-input",
                          "category": "standard",
                          "context": "A very short paragraph (2 simple sentences) in ${language} using basic verbs and nouns.",
                          "targetSentence": "One short sentence from the context in ${language}.",
                          "correctTranslation": "The English translation of the target sentence.",
                          "vocabularyGain": 5,
                          "grammarGain": 15,
                          "readingGain": 5,
                          "writingGain": 10,
                          "xpReward": 20
                        }`
                    },
                    {
                        "role": "user",
                        "content": `Student's Recent Mistakes: 
                        ${mistakes.length > 0 ? mistakes.map(m => `- ${m}`).join('\n') : "No mistakes yet - just starting out!"}
                        
                        Current Experience: This student is starting from COMPLETE SCRATCH.
                        Focus Language: ${language}
                        Topic Context: ${topic}
                        
                        Create a lesson that is extremely accessible for someone who knows zero words in ${language}. 
                        Ensure the content matches Level 1 (Absolute Beginner).`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`AI Generation API failed: ${response.status}`, errorText);
            throw new Error(`AI Generation API failed: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.choices || !data.choices.length) return null;

        let content = data.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const lessonData = JSON.parse(content);

        return {
            ...lessonData,
            isActive: true,
            order: 999,
            requiredVocabulary: 0,
            requiredGrammar: 0,
            requiredReading: 0,
            requiredWriting: 0,
            isAiGenerated: true,
            generatedFromMistakes: mistakes
        };

    } catch (error) {
        console.error("Error generating personalized lesson:", error);
        return null;
    }
}
