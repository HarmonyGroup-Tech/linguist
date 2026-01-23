import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SystemSettings {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    lastUpdated: Date;
}

export const SettingsService = {
    /**
     * Get current system settings
     */
    async getSettings(): Promise<SystemSettings> {
        try {
            const docRef = doc(db, 'settings', 'system');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as SystemSettings;
            } else {
                // Return defaults if no settings exist
                return {
                    maintenanceMode: false,
                    maintenanceMessage: 'We\'re currently performing system maintenance. Please check back soon!',
                    lastUpdated: new Date()
                };
            }
        } catch (e) {
            console.error('Error fetching settings:', e);
            return {
                maintenanceMode: false,
                maintenanceMessage: 'We\'re currently performing system maintenance. Please check back soon!',
                lastUpdated: new Date()
            };
        }
    },

    /**
     * Update maintenance mode status (Admin only)
     */
    async setMaintenanceMode(enabled: boolean, message?: string): Promise<void> {
        try {
            const docRef = doc(db, 'settings', 'system');
            await setDoc(docRef, {
                maintenanceMode: enabled,
                maintenanceMessage: message || 'We\'re currently performing system maintenance. Please check back soon!',
                lastUpdated: new Date()
            }, { merge: true });
        } catch (e) {
            console.error('Error updating maintenance mode:', e);
            throw e;
        }
    }
};
