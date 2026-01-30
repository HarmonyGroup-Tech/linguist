import { db } from '../config/firebase';
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    increment
} from 'firebase/firestore';

export interface ClientProfile {
    uid: string;
    email: string;
    role: string;
    balance: number;
    displayName?: string;
}

export const AdminService = {
    /**
     * Fetch all users with the 'client' role
     */
    async getClients(): Promise<ClientProfile[]> {
        try {
            const q = query(
                collection(db, 'users'),
                where('role', '==', 'client')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            } as ClientProfile));
        } catch (e) {
            console.error("Error fetching clients:", e);
            throw e;
        }
    },

    /**
     * Add balance to a specific client
     */
    async addBalance(clientId: string, amount: number): Promise<void> {
        try {
            const userRef = doc(db, 'users', clientId);
            await updateDoc(userRef, {
                balance: increment(amount)
            });
        } catch (e) {
            console.error("Error adding balance:", e);
            throw e;
        }
    }
};
