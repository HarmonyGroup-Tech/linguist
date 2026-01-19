// Constants removed as they are handled by Netlify Function now

export interface LessonResponse {
    sourceTitle: string;
    sourceAuthor: string;
    context: string;
    targetSentence: string;
}

export async function generateLesson(topic: string, level: string, language: string = "German"): Promise<any> {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a language teacher creating a multi-step lesson in ${language} for an ABSOLUTE BEGINNER who knows ZERO ${language}.
            
CRITICAL: Respond with ONLY valid JSON.
CRITICAL: Generate exactly 3 exercises. 
CRITICAL: New words MUST use 'drag-drop' type. Simple practice uses 'text-input'.

PEDAGOGICAL RULES:
1. All 'context' and instructions MUST be in ENGLISH. Do not use ${language} in the 'context' field for Level 1.
2. 'correctTranslation' MUST be English.
3. 'targetSentence' MUST be the ${language} translation.
4. 'scrambledOptions' MUST be the individual words of the 'targetSentence'.
5. ABSOLUTELY NO ${language} in anything except 'targetSentence' and 'scrambledOptions'.

JSON Structure:
{
  "title": "Lesson Title (English)",
  "description": "Short description (English)",
  "exercises": [
    {
      "type": "drag-drop",
      "context": "English explanation of the grammar or word usage.",
      "targetSentence": "Full sentence in ${language}",
      "correctTranslation": "Full sentence in English",
      "scrambledOptions": ["word1", "word2", "word3"],
      "isNewVocabulary": true
    },
    ... (2 more)
  ],
  "sourceTitle": "Basic Topic",
  "sourceAuthor": "Modern Tutor"
}`
                    },
                    {
                        "role": "user",
                        "content": `Generate a beginners lesson about ${topic} in ${language}.`
                    }
                ]
            })
        });

        if (!response.ok) throw new Error("AI API failed");
        const data = await response.json();
        let content = data.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const lessonData = JSON.parse(content);

        return {
            ...lessonData,
            type: lessonData.exercises[0].type, // Backward compatibility
            context: lessonData.exercises[0].context,
            targetSentence: lessonData.exercises[0].targetSentence,
            correctTranslation: lessonData.exercises[0].correctTranslation,
            scrambledOptions: lessonData.exercises[0].scrambledOptions
        };
    } catch (error) {
        console.error("AI Generation failed:", error);
        return null;
    }
}

/**
 * Generates a real-world client translation request.
 */
export async function generateClientRequest(language: string = "German"): Promise<any | null> {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a translation agency. A global client needs a sentence translated from ${language} to English.
                        
                        CRITICAL: Respond with ONLY valid JSON.
                        The sentence should be relatively simple but sound formal/professional.
                        
                        JSON Structure:
                        {
                          "title": "Client Request: [Client Name]",
                          "description": "A formal message from a client needing translation help.",
                          "context": "The formal request or message in ${language}.",
                          "targetSentence": "The specific professional sentence to translate.",
                          "correctTranslation": "Accurate English translation.",
                          "xpReward": 100
                        }`
                    },
                    {
                        "role": "user",
                        "content": `Generate a client request for a student learning ${language}.`
                    }
                ]
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        let content = data.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const clientData = JSON.parse(content);

        return {
            ...clientData,
            type: 'text-input',
            category: 'client-request',
            level: 5,
            language,
            isActive: true,
            order: 999
        };
    } catch (error) {
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
        console.log(`Generating multi-exercise ${language} lesson for level ${userLevel}`);

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": `You are an expert ${language} curriculum designer for students starting from ABSOLUTE SCRATCH who know ZERO ${language}. 
                        Create a 3-step lesson to help a student fix specific mistakes or progress further.
                        
                        CRITICAL rules:
                        1. Respond with ONLY valid JSON.
                        2. Generate exactly 3 exercises in an array.
                        3. Use 'drag-drop' for any new vocabulary or if the user struggled previously.
                        4. Keep vocabulary EXTREMELY simple (Level 1).
                        5. ALL instructions and 'context' MUST be in ENGLISH.
                        6. 'targetSentence' MUST be in ${language}.
                        7. 'correctTranslation' MUST be in English.
                        
                        JSON Structure:
                        {
                          "title": "Focus Title (English)",
                          "description": "Progress description (English)",
                          "exercises": [
                            {
                              "type": "drag-drop",
                              "context": "English context or instruction (e.g. 'How to say hello')",
                              "targetSentence": "Sentence in ${language}",
                              "correctTranslation": "English translation",
                              "scrambledOptions": ["word1", "word2", "word3"]
                            },
                            ... (2 more, mix types if appropriate)
                          ]
                        }`
                    },
                    {
                        "role": "user",
                        "content": `Student's Recent Mistakes: 
                        ${mistakes.length > 0 ? mistakes.map(m => `- ${m}`).join('\n') : "No mistakes yet - just starting out!"}
                        
                        Current Experience: This student is starting from COMPLETE SCRATCH.
                        Focus Language: ${language}
                        Topic Context: ${topic}
                        
                        Create 3 exercises that are extremely accessible. Ensure Level 1 (Beginner) complexity.`
                    }
                ]
            })
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (!data || !data.choices || !data.choices.length) return null;

        let content = data.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const lessonData = JSON.parse(content);

        // Add default fields for backward compat and metadata
        const firstEx = lessonData.exercises[0];

        return {
            ...lessonData,
            type: firstEx.type,
            context: firstEx.context,
            targetSentence: firstEx.targetSentence,
            correctTranslation: firstEx.correctTranslation,
            scrambledOptions: firstEx.scrambledOptions,
            language,
            level: 1,
            category: 'standard',
            isActive: true,
            order: 999,
            xpReward: 50,
            vocabularyGain: 10,
            grammarGain: 10,
            readingGain: 5,
            writingGain: 5,
            isAiGenerated: true,
            generatedFromMistakes: mistakes
        };

    } catch (error) {
        console.error("Error generating personalized lesson:", error);
        return null;
    }
}

