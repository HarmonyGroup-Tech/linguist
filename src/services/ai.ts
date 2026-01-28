// Constants removed as they are handled by Netlify Function now

export interface LessonResponse {
    sourceTitle: string;
    sourceAuthor: string;
    context: string;
    targetSentence: string;
}

export async function generateLesson(topic: string, level: string, language: string = "German", userXP: number = 0): Promise<any> {
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
2. LEVEL CALIBRATION: The user has ${userXP} XP. 
   - If XP < 500: Use extremely basic vocabulary (pronouns, 'to be'). Introduce ONLY 1-2 NEW WORDS.
   - If XP 500-1500: Introduce 3 NEW WORDS. Use slightly more diverse sentence structures.
   - If XP > 1500: Introduce 4-5 NEW WORDS. Avoid basic 'Ich bin...' patterns unless relevant.
3. SLOW PROGRESSION: Use familiar words for the rest of the sentence to build confidence.
4. REPETITION: Prioritize repeating words the user has likely seen in previous basic introductions.
5. 'correctTranslation' MUST be English.
6. 'targetSentence' MUST be the ${language} translation.
7. 'scrambledOptions' MUST be the individual words of the 'targetSentence'.
8. ABSOLUTELY NO ${language} in anything except 'targetSentence' and 'scrambledOptions'.
9. VOCABULARY SCAFFOLDING: 'text-input' (typing) exercises MUST ONLY use words that were introduced in a 'drag-drop' exercise within the SAME lesson. 
11. ABSOLUTELY NO ANSWER LEAKS: Never include the 'targetSentence' or its literal translation in the 'description' or 'context' fields. These fields are for pedagogical hints only.
12. For 'context', if you mention the word/phrase, use English or explain its usage without giving away the full 'targetSentence'.

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
            type: lessonData.exercises[0].type || 'text-input', // Backward compatibility
            context: lessonData.exercises[0].context || "",
            targetSentence: lessonData.exercises[0].targetSentence || "",
            correctTranslation: lessonData.exercises[0].correctTranslation || "",
            scrambledOptions: lessonData.exercises[0].scrambledOptions || []
        };
    } catch (error) {
        console.error("AI Generation failed:", error);
        return null;
    }
}

/**
 * Generates a real-world client translation request.
 */
export async function generateClientRequest(language: string = "German", userXP: number = 0): Promise<any | null> {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a translation agency. A global client needs a sentence translated from ${language} to English.
                        
                        CRITICAL rules:
                        1. Respond with ONLY valid JSON.
                        2. COMPLETELY ADAPT the length and complexity to the student's XP (${userXP}).
                        3. If XP < 1000, the sentence should be extremely simple (Greetings, basic needs).
                        4. ALL 'context' and instructions MUST be in ENGLISH.
                        5. 'targetSentence' MUST be in ${language}.
                        6. 'correctTranslation' MUST be in English.
                        
                        JSON Structure:
                        {
                          "title": "Client Request: [Client Name]",
                          "description": "A formal message from a client needing translation help (English).",
                          "context": "The formal request description in ENGLISH. (e.g. 'A traveler needs help saying goodbye')",
                          "targetSentence": "The specific sentence in ${language}.",
                          "correctTranslation": "Accurate English translation.",
                          "xpReward": 100
                        }
                        
                        CRITICAL: The 'description' and 'context' MUST NOT leak the final answer. Do not say things like 'Translate: Hello' in the description. Just describe the scenario.`
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
            context: clientData.context || "",
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
    language: string = "German",
    userXP: number = 0
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
                        4. LEVEL CALIBRATION: The user has ${userXP} XP.
                        5. ADAPTIVE GROWTH: 
                           - If XP < 500: INTRODUCE ONLY 1-2 NEW WORDS. (Basic level).
                           - If XP 500-1500: INTRODUCE 3 NEW WORDS.
                           - If XP > 1500: INTRODUCE 4-5 NEW WORDS. Move past basic introductions.
                        6. REPETITION: Heavily prioritize repeating basic pronouns and high-frequency nouns.
                        7. 'targetSentence' MUST be in ${language}.
                        8. 'correctTranslation' MUST be in English.
                        9. SCAFFOLDING: Do not use a word in a 'text-input' exercise unless it was introduced in a 'drag-drop' exercise earlier in the three-step sequence. Introduction MUST come before typing practice.
10. NEGATIVE CONSTRAINT: Strictly FORBIDDEN to use unknown vocabulary in 'text-input' slots. If the student hasn't 'built' the word with tiles yet, they cannot be expected to 'type' it yet. Introduction via tiles is mandatory for every single new word.
11. ANSWER LEAK GUARD: Do not put the target sentence or its answer in the 'description' or 'context' fields. English descriptions only.
                        
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

        // Ensure all exercises have context
        const exercises = (lessonData.exercises || []).map((ex: any) => ({
            ...ex,
            context: ex.context || ""
        }));

        // Add default fields for backward compat and metadata
        const firstEx = exercises[0] || { type: 'text-input', context: "", targetSentence: "", correctTranslation: "" };

        return {
            ...lessonData,
            exercises,
            type: firstEx.type,
            context: firstEx.context,
            targetSentence: firstEx.targetSentence,
            correctTranslation: firstEx.correctTranslation,
            scrambledOptions: firstEx.scrambledOptions || [],
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


/**
 * Splits a long text into learner-friendly segments using AI.
 */
export async function splitText(text: string): Promise<string[]> {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a linguistic expert helper.
                        
CRITICAL Task: Split the user's text into small, standalone segments suitable for translation exercises.
Rules:
1. Each segment should be 1-2 sentences max.
2. Keep segments logically complete (don't split a clause in a weird place).
3. Return ONLY a JSON array of strings.
4. Do not include any markdown or "Here is the list". just the raw JSON.
5. Example: ["Sentence 1.", "Sentence 2."]
`
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ]
            })
        });

        if (!response.ok) throw new Error("AI Split failed");
        const data = await response.json();
        let content = data.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        return JSON.parse(content);
    } catch (e) {
        console.error("Error splitting text:", e);
        // Fallback: simple sentence splitting if AI fails
        return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    }
}

/**
 * Reassembles translated segments into a cohesive text.
 */
export async function reassembleText(segments: string[]): Promise<string> {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a professional editor.
                        
Task: Take the provided list of translated segments and combine them into a single, flowing text.
Rules:
1. Smooth out any disjointed transitions caused by segmentation.
2. Maintain the original meaning perfectly.
3. Return ONLY the final text string. No quotes, no markdown.`
                    },
                    {
                        "role": "user",
                        "content": JSON.stringify(segments)
                    }
                ]
            })
        });

        if (!response.ok) throw new Error("AI Reassemble failed");
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (e) {
        console.error("Error reassembling text:", e);
        return segments.join(" ");
    }
}
