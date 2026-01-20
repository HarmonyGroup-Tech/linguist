import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    Trash2,
    ShieldAlert,
    XCircle,
    CheckCircle2
} from 'lucide-react';

export default function DeleteAccount() {
    const { currentUser, userRole, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [confirmStep, setConfirmStep] = useState(1); // Start at the first warning
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If user is not logged in, redirect to login
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await deleteAccount();
            navigate('/');
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to delete account. You may need to sign out and sign back in to perform this sensitive action.");
            setIsDeleting(false);
            setConfirmStep(1); // Reset to first step on error
        }
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/settings')}
                    className="mb-8 flex items-center gap-2 text-gray-500 hover:text-brand-dark dark:hover:text-white transition-colors group font-bold"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Settings
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-red-500/5 relative overflow-hidden"
                >
                    {/* Header Decor */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />

                    <div className="text-center space-y-8">
                        <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-[2rem] flex items-center justify-center animate-pulse">
                            <ShieldAlert className="w-12 h-12 text-red-600" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-black text-brand-dark dark:text-white leading-tight">
                                {confirmStep === 1 ? "Permanently delete your account?" : "One last check!"}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium max-w-lg mx-auto leading-relaxed">
                                {confirmStep === 1
                                    ? "This action will immediately wipe your progress, streaks, XP, and all personal translations. You cannot undo this."
                                    : "You are about to purge everything. Your Linguist journey ends here. Are you absolutely certain?"
                                }
                            </p>
                        </div>

                        {/* Visual Warning Items */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-red-50 dark:border-red-900/20 shadow-sm">
                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Lose all XP & Levels</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-red-50 dark:border-red-900/20 shadow-sm">
                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Wipe learning history</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-red-50 dark:border-red-900/20 shadow-sm">
                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Reset Ling energy</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-red-50 dark:border-red-900/20 shadow-sm">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">GDPR Compliant Purge</span>
                            </div>
                        </div>

                        <div className="space-y-4 PT-8">
                            <button
                                onClick={() => confirmStep === 1 ? setConfirmStep(2) : handleDelete()}
                                disabled={isDeleting}
                                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-3xl text-xl shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Purging Data...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-6 h-6" />
                                        {confirmStep === 1 ? "I understand, continue" : "DELETE MY ACCOUNT FOREVER"}
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => navigate('/settings')}
                                disabled={isDeleting}
                                className="w-full py-5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-black rounded-3xl text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                                Nevermind, take me back
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-2xl text-sm font-bold border border-red-200 dark:border-red-800/30 flex items-start gap-3 text-left"
                            >
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-black mb-1">Security Restriction</p>
                                    <p className="font-medium opacity-90">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <p className="text-center mt-8 text-sm text-gray-400 dark:text-gray-500 font-medium">
                    Signed in as <span className="text-gray-600 dark:text-gray-300 font-bold">{currentUser.email}</span>
                </p>
            </div>
        </div>
    );
}
