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
    increment
} from 'firebase/firestore';

// --- Types ---
export interface Project {
    id?: string;
    title: string;
    author: string;
    ownerId: string;
    content: string; // Full text or link to storage
    status: 'Draft' | 'Translating' | 'Review' | 'Completed';
    progress: number;
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
    }
};
