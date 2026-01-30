import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, type User, signOut as firebaseSignOut, deleteUser, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ProjectService } from '../services/db';
import { LessonService, UserSkillsService } from '../services/lessonService';

interface AuthContextType {
    currentUser: User | null;
    userRole: 'learner' | 'client' | 'admin' | null;
    isEmailVerified: boolean;
    isAdmin: boolean;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    sendVerification: () => Promise<void>;
    bypassVerification: () => Promise<void>;
    deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'learner' | 'client' | 'admin' | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const role = data.role as 'learner' | 'client' | 'admin';
                        setUserRole(role);
                        setIsAdmin(role === 'admin');

                        // User is verified if either Firebase says so, or we have a manual override in DB
                        setIsEmailVerified(user.emailVerified || data.manualVerified === true);

                    } else {
                        // Default to learner if no profile found (e.g. new signup)
                        setUserRole('learner');
                        setIsAdmin(false);
                        setIsEmailVerified(user.emailVerified);
                    }
                } catch (e) {
                    console.error("Error fetching user role", e);
                }
            } else {
                setUserRole(null);
                setIsAdmin(false);
                setIsEmailVerified(false);
            }
            // Set current user ONLY after role/verification is checked to avoid UI flicker
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const logout = () => firebaseSignOut(auth);

    const refreshUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            const user = auth.currentUser;
            setCurrentUser(user);

            // Re-check DB for manual bypass too
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            const manual = docSnap.exists() ? docSnap.data().manualVerified === true : false;

            setIsEmailVerified(user.emailVerified || manual);
        }
    };

    const sendVerification = async () => {
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
        }
    };

    const bypassVerification = async () => {
        if (auth.currentUser) {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                manualVerified: true
            });
            await refreshUser();
        }
    };

    const deleteAccount = async () => {
        if (!currentUser) throw new Error("No user logged in");

        const userId = currentUser.uid;

        try {
            // 1. Clean up Firestore data (Projects)
            await ProjectService.deleteUserProjects(userId);

            // 2. Clean up Learning data (Skills, Progress, AI Lessons)
            await UserSkillsService.deleteUserData(userId);

            // 3. Delete Auth User
            await deleteUser(currentUser);
        } catch (e) {
            console.error("Account deletion failed:", e);
            throw e;
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, userRole, isAdmin, isEmailVerified, loading, logout, refreshUser, sendVerification, bypassVerification, deleteAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
