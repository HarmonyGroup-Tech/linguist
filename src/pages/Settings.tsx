import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Shield,
    Trash2,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    Database,
    Lock,
    UserCircle,
    Brain,
    Trophy,
    Zap,
    Briefcase
} from 'lucide-react';

export default function Settings() {
    const { currentUser, userRole, logout, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmStep, setConfirmStep] = useState(0); // 0: Idle, 1: First Warning, 2: Final Confirmation
    const [error, setError] = useState<string | null>(null);

    const dataPoints = [
        {
            icon: Lock,
            title: "Authentication",
            description: "Your email and encrypted credentials are used to secure your account and manage your daily sessions.",
            details: ["Email Address", "Unique User ID", "Last Login Timestamp"]
        },
        {
            icon: Brain,
            title: "Learning Intelligence",
            description: "Our AI analyzes your performance to create a custom path. We track your strengths and weaknesses.",
            details: ["Skill Levels (Grammar, Vocab...)", "Mistake History", "Personalized AI Lessons"]
        },
        {
            icon: Zap,
            title: "Engagement & Energy",
            description: "We store your consistency metrics to help maintain your learning momentum.",
            details: ["Daily Streak Count", "Ling Energy Balance", "Refill Timestamps"]
        },
        {
            icon: Trophy,
            title: "Progression",
            description: "Your achievements and completed lessons are recorded to show your growth over time.",
            details: ["Total XP Points", "Completed Lesson IDs", "Badge Progress"]
        }
    ];

    if (userRole === 'client') {
        dataPoints.push({
            icon: Briefcase,
            title: "Project Data",
            description: "We store information about the translation projects you upload to facilitate the learning environment.",
            details: ["Project Titles & Authors", "Source Content", "Translation Progress"]
        });
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await deleteAccount();
            navigate('/');
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to delete account. You may need to re-login to perform this action for security reasons.");
            setIsDeleting(false);
            setConfirmStep(0);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-300 flex items-center gap-2 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-semibold hidden sm:inline">Back</span>
                    </button>

                    <h1 className="text-xl md:text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-brand-yellow" />
                        Privacy & Settings
                    </h1>

                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-12 pb-24">
                {/* Data Transparency Section */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end gap-3 mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-brand-dark dark:text-white mb-2">Data Transparency</h2>
                            <p className="text-gray-500 dark:text-gray-400">Everything we collect to make your learning experience possible.</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-bold border border-green-100 dark:border-green-800/50">
                            <CheckCircle2 className="w-4 h-4" />
                            GDPR Compliant
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dataPoints.map((point, i) => (
                            <motion.div
                                key={point.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group"
                            >
                                <div className="p-3 bg-brand-yellow/10 dark:bg-brand-yellow/5 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                                    <point.icon className="w-6 h-6 text-brand-yellow" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">{point.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                                    {point.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {point.details.map(detail => (
                                        <span key={detail} className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 bg-gray-50 dark:bg-gray-900 text-gray-400 rounded-lg">
                                            {detail}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Account Actions Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-brand-dark dark:text-white">Account Management</h2>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-50 dark:border-gray-700/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark font-black text-xl">
                                    {currentUser?.email?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-brand-dark dark:text-white">{currentUser?.email}</p>
                                    <p className="text-sm text-gray-500 uppercase tracking-widest font-black">{userRole}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div className="p-6 md:p-8 bg-red-50/30 dark:bg-red-900/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-red-600 dark:text-red-500 flex items-center gap-2">
                                        <AlertTriangle className="w-6 h-6" />
                                        Danger Zone
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                                        Deleting your account will permanently remove all your progress, XP, streaks, and data. This action cannot be undone.
                                        <button
                                            onClick={() => navigate('/account/delete')}
                                            className="text-red-600 dark:text-red-500 font-bold ml-1 hover:underline text-xs"
                                        >
                                            Open dedicated deletion page →
                                        </button>
                                    </p>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setConfirmStep(1)}
                                        disabled={isDeleting}
                                        className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Delete Account
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="mt-4 p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-sm font-bold animate-shake">
                                    {error}
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmStep > 0 && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeleting && setConfirmStep(0)}
                            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg relative shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />

                            <div className="text-center space-y-6">
                                <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-10 h-10 text-red-600" />
                                </div>

                                <h2 className="text-3xl font-black text-brand-dark dark:text-white leading-tight">
                                    {confirmStep === 1 ? "Are you absolutely sure?" : "Final check!"}
                                </h2>

                                <p className="text-gray-600 dark:text-gray-400">
                                    {confirmStep === 1
                                        ? "This will wipe your entire learning history. You will lose your 25 Lings capacity, your streak, and all your hard-earned XP."
                                        : "Once you click that button, there is no turning back. All your records will be purged from our systems forever."
                                    }
                                </p>

                                <div className="space-y-3 pt-4">
                                    <button
                                        onClick={() => confirmStep === 1 ? setConfirmStep(2) : handleDeleteAccount()}
                                        disabled={isDeleting}
                                        className="w-full py-5 bg-red-600 text-white font-black rounded-3xl text-xl shadow-xl shadow-red-600/30 hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            "Purging Data..."
                                        ) : confirmStep === 1 ? (
                                            "I understand, proceed"
                                        ) : (
                                            "DELETE FOREVER"
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setConfirmStep(0)}
                                        disabled={isDeleting}
                                        className="w-full py-5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                    >
                                        Maintain my progress
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
