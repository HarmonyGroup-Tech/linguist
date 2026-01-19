import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    orderBy,
    setDoc,
    Timestamp
} from 'firebase/firestore';

// --- Types ---
export interface Exercise {
    type: 'text-input' | 'drag-drop';
    context: string;
    targetSentence: string;
    correctTranslation: string;
    scrambledOptions?: string[]; // For drag-drop
    isNewVocabulary?: boolean; // If true, AI should prioritize drag-drop
}

export interface Lesson {
    id?: string;
    title: string;
    description: string;
    language: string;
    level: number; // 1-10 difficulty

    // Content (Backward compatibility + Single Exercise support)
    type: 'text-input' | 'drag-drop';
    category: 'standard' | 'quotation' | 'client-request';
    scrambledOptions?: string[];
    context: string;
    targetSentence: string;
    correctTranslation: string;

    // Multiple Exercises
    exercises?: Exercise[];

    // AI Generation Fields
    isAiGenerated?: boolean;
    generatedFromMistakes?: string[];

    sourceTitle?: string;
    sourceAuthor?: string;

    // Prerequisites (0-100 for each skill)
    requiredVocabulary: number;
    requiredGrammar: number;
    requiredReading: number;
    requiredWriting: number;

    // Rewards
    xpReward: number;
    vocabularyGain: number;
    grammarGain: number;
    readingGain: number;
    writingGain: number;

    // Metadata
    createdBy: string;
    createdAt: Date | Timestamp;
    isActive: boolean;
    order: number;
}

export interface UserSkills {
    userId: string;
    vocabulary: number; // 0-100
    grammar: number; // 0-100
    reading: number; // 0-100
    writing: number; // 0-100
    totalXP: number;
    streak: number;
    lastPracticeDate: string;
    completedLessons: string[];
    lings: number;          // Current balance (0-5)
    lastLingRefill: string; // ISO Date string
    targetLanguage: string; // The language the user is learning (e.g., German, Spanish)
    lessonsSinceLastClient: number; // Counter for client-work triggers
}

// --- Lesson Service ---
export const LessonService = {
    /**
     * Create a new lesson (Admin only)
     */
    async createLesson(lesson: Omit<Lesson, 'id' | 'createdAt'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, 'lessons'), {
                ...lesson,
                createdAt: new Date()
            });
            return docRef.id;
        } catch (e) {
            console.error("Error creating lesson:", e);
            throw e;
        }
    },

    /**
     * Update an existing lesson (Admin only)
     */
    async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<void> {
        try {
            const lessonRef = doc(db, 'lessons', lessonId);
            await updateDoc(lessonRef, updates);
        } catch (e) {
            console.error("Error updating lesson:", e);
            throw e;
        }
    },

    /**
     * Delete a lesson (Admin only)
     */
    async deleteLesson(lessonId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'lessons', lessonId));
        } catch (e) {
            console.error("Error deleting lesson:", e);
            throw e;
        }
    },

    /**
     * Create multiple lessons from CSV (Admin only)
     */
    async createLessonsFromCSV(lessons: Omit<Lesson, 'id' | 'createdAt'>[]): Promise<{ success: number, errors: string[] }> {
        const errors: string[] = [];
        let success = 0;

        for (let i = 0; i < lessons.length; i++) {
            try {
                await this.createLesson(lessons[i]);
                success++;
            } catch (e) {
                errors.push(`Lesson ${i + 1} (${lessons[i].title}): ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        }

        return { success, errors };
    },

    /**
     * Get all lessons (Admin view)
     */
    async getAllLessons(): Promise<Lesson[]> {
        try {
            const q = query(collection(db, 'lessons'), orderBy('order', 'asc'));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Default values
                    type: data.type || 'text-input',
                    category: data.category || 'standard'
                } as Lesson;
            });
        } catch (e) {
            console.error("Error fetching all lessons:", e);
            return [];
        }
    },

    /**
     * Get lessons available to a user based on their skill levels
     */
    async getAvailableLessons(userSkills: UserSkills): Promise<Lesson[]> {
        try {
            // Get all active lessons
            const q = query(
                collection(db, 'lessons'),
                where('isActive', '==', true)
            );
            const querySnapshot = await getDocs(q);
            const allLessons = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Default values for backward compatibility
                    type: data.type || 'text-input',
                    category: data.category || 'standard'
                } as Lesson;
            });

            // Filter for user-specific lessons: 
            // 1. Lessons created by 'ADMIN' (global)
            // 2. Lessons created by the specific user (AI-generated for them)
            const filteredLessons = allLessons.filter(lesson =>
                lesson.createdBy === 'ADMIN' ||
                lesson.createdBy === userSkills.userId
            );

            // Sort by AI priority first, then order
            filteredLessons.sort((a, b) => {
                // If one is AI and other isn't, AI comes first
                if (a.isAiGenerated && !b.isAiGenerated) return -1;
                if (!a.isAiGenerated && b.isAiGenerated) return 1;

                // If both are same AI status, use order
                return (a.order || 0) - (b.order || 0);
            });

            // Return ALL active lessons so the UI can show the full path (completed, available, locked)
            return filteredLessons;
        } catch (e) {
            console.error("Error fetching available lessons:", e);
            return [];
        }
    },

    /**
     * Get a single lesson by ID
     */
    async getLessonById(lessonId: string): Promise<Lesson | null> {
        try {
            const docRef = doc(db, 'lessons', lessonId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Lesson;
            }
            return null;
        } catch (e) {
            console.error("Error fetching lesson:", e);
            return null;
        }
    },

    /**
     * Get completed lessons for a user
     */
    async getCompletedLessons(userId: string, completedLessonIds: string[]): Promise<Lesson[]> {
        try {
            if (completedLessonIds.length === 0) return [];

            const lessons: Lesson[] = [];
            // Firestore 'in' queries are limited to 10 items, so batch them
            for (let i = 0; i < completedLessonIds.length; i += 10) {
                const batch = completedLessonIds.slice(i, i + 10);
                const q = query(
                    collection(db, 'lessons'),
                    where('__name__', 'in', batch)
                );
                const querySnapshot = await getDocs(q);
                lessons.push(...querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Lesson)));
            }
            return lessons;
        } catch (e) {
            console.error("Error fetching completed lessons:", e);
            return [];
        }
    },

    /**
     * Check if user meets prerequisites for a lesson
     */
    checkPrerequisites(userSkills: UserSkills, lesson: Lesson): boolean {
        return (
            userSkills.vocabulary >= lesson.requiredVocabulary &&
            userSkills.grammar >= lesson.requiredGrammar &&
            userSkills.reading >= lesson.requiredReading &&
            userSkills.writing >= lesson.requiredWriting
        );
    }
};

// --- User Skills Service ---
export const UserSkillsService = {
    /**
     * Get user's skill levels
     */
    async getUserSkills(userId: string): Promise<UserSkills> {
        try {
            const docRef = doc(db, 'userSkills', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as UserSkills;
                // Check and refill lings if needed
                return await this.ensureLings(data);
            } else {
                // Initialize new user with default skills
                // Initialize new user with default skills
                const defaultSkills: UserSkills = {
                    userId,
                    vocabulary: 0,
                    grammar: 0,
                    reading: 0,
                    writing: 0,
                    totalXP: 0,
                    streak: 0,
                    lastPracticeDate: "",
                    completedLessons: [],
                    lings: 25, // Start with full lings
                    lastLingRefill: new Date().toISOString(),
                    targetLanguage: "German", // Default for now, ideally selected at signup
                    lessonsSinceLastClient: 0
                };

                // Create the document
                await updateDoc(docRef, defaultSkills as any);
                return defaultSkills;
            }
        } catch (e) {
            console.error("Error fetching user skills:", e);
            // Return default skills on error
            return {
                userId,
                vocabulary: 0,
                grammar: 0,
                reading: 0,
                writing: 0,
                totalXP: 0,
                streak: 0,
                lastPracticeDate: "",
                completedLessons: [],
                lings: 25,
                lastLingRefill: new Date().toISOString(),
                targetLanguage: "German",
                lessonsSinceLastClient: 0
            };
        }
    },

    /**
     * Update user skills after completing a lesson
     */
    async completeLesson(userId: string, lessonId: string, skillGains: {
        vocabularyGain: number;
        grammarGain: number;
        readingGain: number;
        writingGain: number;
        xpReward: number;
    }): Promise<UserSkills> {
        try {
            const userSkillsRef = doc(db, 'userSkills', userId);
            const currentSkills = await this.getUserSkills(userId);

            // Calculate new skill levels (cap at 100)
            const newVocabulary = Math.min(100, currentSkills.vocabulary + skillGains.vocabularyGain);
            const newGrammar = Math.min(100, currentSkills.grammar + skillGains.grammarGain);
            const newReading = Math.min(100, currentSkills.reading + skillGains.readingGain);
            const newWriting = Math.min(100, currentSkills.writing + skillGains.writingGain);
            const newTotalXP = currentSkills.totalXP + skillGains.xpReward;

            // Update streak
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            let newStreak = currentSkills.streak;

            if (currentSkills.lastPracticeDate === yesterday) {
                newStreak += 1;
            } else if (currentSkills.lastPracticeDate !== today) {
                newStreak = 1;
            }

            // Add lesson to completed list
            const completedLessons = [...currentSkills.completedLessons];
            if (!completedLessons.includes(lessonId)) {
                completedLessons.push(lessonId);
            }

            const updatedSkills: UserSkills = {
                userId,
                vocabulary: newVocabulary,
                grammar: newGrammar,
                reading: newReading,
                writing: newWriting,
                totalXP: newTotalXP,
                streak: newStreak,
                lastPracticeDate: today,
                completedLessons,
                lings: currentSkills.lings,
                lastLingRefill: currentSkills.lastLingRefill,
                targetLanguage: currentSkills.targetLanguage || "German",
                lessonsSinceLastClient: (currentSkills.lessonsSinceLastClient || 0) + 1
            };

            await updateDoc(userSkillsRef, updatedSkills as any);
            return updatedSkills;
        } catch (e) {
            console.error("Error completing lesson:", e);
            throw e;
        }
    },

    /**
     * Initialize skills document (use setDoc with merge)
     */
    async initializeUserSkills(userId: string): Promise<void> {
        try {
            const userSkillsRef = doc(db, 'userSkills', userId);

            // First check if it exists to avoid overwriting!
            const docSnap = await getDoc(userSkillsRef);

            if (!docSnap.exists()) {
                const defaultSkills: UserSkills = {
                    userId,
                    vocabulary: 0,
                    grammar: 0,
                    reading: 0,
                    writing: 0,
                    totalXP: 0,
                    streak: 0,
                    lastPracticeDate: "",
                    completedLessons: [],
                    lings: 25,
                    lastLingRefill: new Date().toISOString(),
                    targetLanguage: "German",
                    lessonsSinceLastClient: 0
                };

                // Use setDoc for new document
                await setDoc(userSkillsRef, defaultSkills);
            } else {
                // Ensure existing users have new fields
                const data = docSnap.data() as UserSkills;
                if (typeof data.lings === 'undefined') {
                    await updateDoc(userSkillsRef, {
                        lings: 25,
                        lastLingRefill: new Date().toISOString(),
                        targetLanguage: data.targetLanguage || "German",
                        lessonsSinceLastClient: data.lessonsSinceLastClient || 0
                    } as any);
                } else if (typeof data.targetLanguage === 'undefined') {
                    await updateDoc(userSkillsRef, {
                        targetLanguage: "German",
                        lessonsSinceLastClient: 0
                    } as any);
                } else if (typeof data.lessonsSinceLastClient === 'undefined') {
                    await updateDoc(userSkillsRef, {
                        lessonsSinceLastClient: 0
                    } as any);
                }
            }
        } catch (e) {
            console.error("Error initializing user skills:", e);
        }
    },

    /**
     * Check and refill Lings based on time passed
     */
    async ensureLings(skills: UserSkills): Promise<UserSkills> {
        // If already full, just update timestamp to now (or keep old? Keep old to accumulate time? 
        // Logic: 1 ling every 4 hours.
        if (skills.lings >= 25) return skills;

        const lastRefill = new Date(skills.lastLingRefill || new Date().toISOString());
        const now = new Date();
        const diffMs = now.getTime() - lastRefill.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours >= 4) {
            const lingsToAdd = Math.floor(diffHours / 4);
            const newLings = Math.min(25, (skills.lings || 0) + lingsToAdd);

            // Only update if we actually added lings
            if (newLings > skills.lings) {
                // We shouldn't just reset lastRefill to now, we should advance it by the amount of time consumed
                // to keep the "partial" progress.
                // New time = Old time + (lingsToAdd * 4 hours)
                const timeAddedMs = lingsToAdd * 4 * 60 * 60 * 1000;
                const newRefillTime = new Date(lastRefill.getTime() + timeAddedMs).toISOString();

                // If we hit max, validation might be tricky with "partial" time. 
                // Simpler approach: If maxed out, set time to now.
                const finalRefillTime = newLings === 25 ? now.toISOString() : newRefillTime;

                const userSkillsRef = doc(db, 'userSkills', skills.userId);
                await updateDoc(userSkillsRef, {
                    lings: newLings,
                    lastLingRefill: finalRefillTime
                } as any);

                return {
                    ...skills,
                    lings: newLings,
                    lastLingRefill: finalRefillTime
                };
            }
        }

        return skills;
    },

    /**
     * Consume a Ling
     */
    async consumeLing(userId: string): Promise<boolean> {
        const skills = await this.getUserSkills(userId);
        if (skills.lings > 0) {
            const userSkillsRef = doc(db, 'userSkills', userId);
            await updateDoc(userSkillsRef, {
                lings: skills.lings - 1
            } as any);
            return true;
        }
        return false;
    },

    /**
     * Update arbitrary skills fields
     */
    async updateSkills(userId: string, updates: Partial<UserSkills>): Promise<void> {
        try {
            const userSkillsRef = doc(db, 'userSkills', userId);
            await updateDoc(userSkillsRef, updates as any);
        } catch (e) {
            console.error("Error updating user skills:", e);
            throw e;
        }
    }
};
