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
    Timestamp
} from 'firebase/firestore';

// --- Types ---
export interface Lesson {
    id?: string;
    title: string;
    description: string;
    language: string;
    level: number; // 1-10 difficulty
    
    // Content
    context: string;
    targetSentence: string;
    correctTranslation: string;
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
     * Get all lessons (Admin view)
     */
    async getAllLessons(): Promise<Lesson[]> {
        try {
            const q = query(collection(db, 'lessons'), orderBy('order', 'asc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Lesson));
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
                where('isActive', '==', true),
                orderBy('order', 'asc')
            );
            const querySnapshot = await getDocs(q);
            const allLessons = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Lesson));

            // Filter by prerequisites
            return allLessons.filter(lesson => 
                userSkills.vocabulary >= lesson.requiredVocabulary &&
                userSkills.grammar >= lesson.requiredGrammar &&
                userSkills.reading >= lesson.requiredReading &&
                userSkills.writing >= lesson.requiredWriting &&
                !userSkills.completedLessons.includes(lesson.id!)
            );
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
                return docSnap.data() as UserSkills;
            } else {
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
                    completedLessons: []
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
                completedLessons: []
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
                completedLessons
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
            const defaultSkills: UserSkills = {
                userId,
                vocabulary: 0,
                grammar: 0,
                reading: 0,
                writing: 0,
                totalXP: 0,
                streak: 0,
                lastPracticeDate: "",
                completedLessons: []
            };
            
            // Using updateDoc will create if doesn't exist with setDoc behavior
            await updateDoc(userSkillsRef, defaultSkills as any).catch(async () => {
                // If document doesn't exist, this will create it
                const { setDoc } = await import('firebase/firestore');
                await setDoc(userSkillsRef, defaultSkills);
            });
        } catch (e) {
            console.error("Error initializing user skills:", e);
        }
    }
};
