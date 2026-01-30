import { db } from '../config/firebase';
export { db } from '../config/firebase';
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
    increment
} from 'firebase/firestore';

// --- Types ---
export interface UserTranslation {
    userId: string;
    userName?: string;
    content: string;
    timestamp: any;
    excluded?: boolean;
}

export interface TranslationSegment {
    id: string;
    original: string;
    translated: string; // The "primary" one (eg: first submitted or AI picked)
    translations?: UserTranslation[]; // List of all community contributions
    status: 'pending' | 'draft' | 'approved';
    lockedBy?: string | null;
    lockedAt?: any;
}

export interface Project {
    id?: string;
    title: string;
    author: string;
    ownerId: string;
    content: string; // Used for display or fast access
    originalContent?: string; // Storing the full original text if needed separately
    sourceLanguage?: string;
    targetLanguage?: string;
    segments?: TranslationSegment[];
    status: 'Draft' | 'Translating' | 'Review' | 'Completed';
    progress: number;
    finalTranslation?: string;
    targetTranslators?: number; // How many people should translate each segment
    varietyPercentage?: number; // 0-100% variety slider value
    totalCost?: number; // Total cost in USD
    createdAt: Date;
}

export interface UserProgress {
    streak: number;
    totalXP: number;
    lastPracticeDate: string; // ISO date string YYYY-MM-DD
}

// --- Projects Service ---
export const ProjectService = {
    async addProject(project: Omit<Project, 'id' | 'createdAt'>) {
        try {
            // Deduct balance if totalCost is present
            if (project.totalCost && project.totalCost > 0) {
                const userRef = doc(db, 'users', project.ownerId);
                await updateDoc(userRef, {
                    balance: increment(-project.totalCost)
                });
            }

            const docRef = await addDoc(collection(db, 'projects'), {
                ...project,
                createdAt: new Date()
            });
            return docRef.id;
        } catch (e) {
            console.error("Error adding project: ", e);
            throw e;
        }
    },

    async getMyProjects(userId: string): Promise<Project[]> {
        try {
            const q = query(collection(db, 'projects'), where("ownerId", "==", userId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Project));
        } catch (e) {
            console.error("Error fetching projects: ", e);
            return [];
        }
    },

    async getPendingProjects(): Promise<Project[]> {
        try {
            // Fetch projects that are in 'Draft' or 'Translating' status
            const q = query(
                collection(db, 'projects'),
                where("status", "in", ['Draft', 'Translating'])
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Project));
        } catch (e) {
            console.error("Error fetching pending projects: ", e);
            return [];
        }
    },

    async submitTranslation(projectId: string, segmentId: string, translation: string, userId: string, userName?: string): Promise<void> {
        try {
            const docRef = doc(db, 'projects', projectId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return;

            const project = docSnap.data() as Project;
            const segments = [...(project.segments || [])];
            const segmentIndex = segments.findIndex(s => s.id === segmentId);

            if (segmentIndex === -1) return;

            // Update segment
            const userTrans: UserTranslation = {
                userId,
                userName,
                content: translation,
                timestamp: new Date()
            };

            const translations = [...(segments[segmentIndex].translations || [])];
            translations.push(userTrans);

            segments[segmentIndex] = {
                ...segments[segmentIndex],
                translated: translation, // Update primary (for now, last one wins)
                translations: translations,
                status: 'draft',
                lockedBy: null,
                lockedAt: null
            };

            // Calculate progress based on total required translations
            const targetLimit = project.targetTranslators || 1;
            const totalRequired = segments.length * targetLimit;
            let totalCompleted = 0;

            segments.forEach(s => {
                const count = s.translations?.length || 0;
                totalCompleted += Math.min(count, targetLimit);
            });

            const progress = Math.round((totalCompleted / totalRequired) * 100);

            // Determine status
            let status = project.status;
            if (status === 'Draft') status = 'Translating';
            if (progress === 100) status = 'Review';

            await updateDoc(docRef, {
                segments,
                progress,
                status
            } as any);
        } catch (e) {
            console.error("Error submitting translation:", e);
            throw e;
        }
    },

    async updateFinalTranslation(projectId: string, content: string): Promise<void> {
        try {
            const docRef = doc(db, 'projects', projectId);
            await updateDoc(docRef, {
                finalTranslation: content
            });
        } catch (e) {
            console.error("Error updating final translation:", e);
            throw e;
        }
    },

    async lockSegment(projectId: string, segmentId: string, userId: string): Promise<void> {
        try {
            const docRef = doc(db, 'projects', projectId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return;

            const project = docSnap.data() as Project;
            const segments = [...(project.segments || [])];
            const segmentIndex = segments.findIndex(s => s.id === segmentId);

            if (segmentIndex === -1) return;

            segments[segmentIndex] = {
                ...segments[segmentIndex],
                lockedBy: userId,
                lockedAt: new Date()
            };

            await updateDoc(docRef, { segments } as any);
        } catch (e) {
            console.error("Error locking segment:", e);
        }
    },

    async unlockSegment(projectId: string, segmentId: string): Promise<void> {
        try {
            const docRef = doc(db, 'projects', projectId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return;

            const project = docSnap.data() as Project;
            const segments = [...(project.segments || [])];
            const segmentIndex = segments.findIndex(s => s.id === segmentId);

            if (segmentIndex === -1) return;

            segments[segmentIndex] = {
                ...segments[segmentIndex],
                lockedBy: null,
                lockedAt: null
            };

            await updateDoc(docRef, { segments } as any);
        } catch (e) {
            console.error("Error unlocking segment:", e);
        }
    },

    async toggleTranslationExclusion(projectId: string, segmentId: string, translationIndex: number): Promise<void> {
        try {
            const docRef = doc(db, 'projects', projectId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return;

            const project = docSnap.data() as Project;
            const segments = [...(project.segments || [])];
            const segmentIndex = segments.findIndex(s => s.id === segmentId);

            if (segmentIndex === -1) return;

            const translations = [...(segments[segmentIndex].translations || [])];
            if (!translations[translationIndex]) return;

            // Toggle exclusion
            translations[translationIndex] = {
                ...translations[translationIndex],
                excluded: !translations[translationIndex].excluded
            };

            // Update primary 'translated' field to the first non-excluded translation
            const firstValid = translations.find(t => !t.excluded);

            segments[segmentIndex] = {
                ...segments[segmentIndex],
                translations,
                translated: firstValid ? firstValid.content : "",
                status: firstValid ? 'approved' : 'pending' // If all excluded, back to pending
            };

            await updateDoc(docRef, { segments } as any);
        } catch (e) {
            console.error("Error toggling exclusion:", e);
            throw e;
        }
    },

    async deleteUserProjects(userId: string): Promise<void> {
        try {
            const q = query(collection(db, 'projects'), where("ownerId", "==", userId));
            const querySnapshot = await getDocs(q);
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        } catch (e) {
            console.error("Error deleting user projects:", e);
            throw e;
        }
    }
};

// --- User Progress Service ---
export const UserProgressService = {
    async getUserProgress(userId: string): Promise<UserProgress> {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    streak: data.streak || 0,
                    totalXP: data.totalXP || 0,
                    lastPracticeDate: data.lastPracticeDate || ""
                };
            } else {
                return { streak: 0, totalXP: 0, lastPracticeDate: "" };
            }
        } catch (e) {
            console.error("Error fetching progress: ", e);
            return { streak: 0, totalXP: 0, lastPracticeDate: "" };
        }
    },

    async updateUserXP(userId: string, xpAmount: number) {
        const userRef = doc(db, 'users', userId);
        const today = new Date().toISOString().split('T')[0];

        try {
            // We need to check the last practice date to update streak logic properly
            // For simplicity in this step, we just increment XP and update date
            // A more robust implementation would use a transaction to check streak continuity
            await updateDoc(userRef, {
                totalXP: increment(xpAmount),
                lastPracticeDate: today
            });
        } catch (e) {
            console.error("Error updating XP: ", e);
        }
    },

    async getUserProfile(userId: string) {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                return {
                    ...data,
                    balance: data.balance || 0 // Ensure balance is always available
                };
            }
            return null;
        } catch (e) {
            console.error("Error fetching user profile:", e);
            return null;
        }
    }
};
