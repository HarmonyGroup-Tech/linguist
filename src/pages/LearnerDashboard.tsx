import { useEffect, useState } from 'react';
import LessonView from '../components/LessonView';
// import SkillProgress from '../components/SkillProgress'; -- Removed for UX simplification
import LessonPath from '../components/LessonPath';
import QuotationsView from '../components/QuotationsView';
import { LogOut, Flame, Award, Feather, Map, Quote, Diamond, Moon, Sun, Play, Sparkles, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    Lesson,
    UserSkills,
    LessonService,
    UserSkillsService
} from '../services/lessonService';
import { generatePersonalizedLesson } from '../services/ai';
import { SettingsService } from '../services/settingsService';
import MaintenancePage from './MaintenancePage';
import { motion, AnimatePresence } from 'framer-motion';

export default function LearnerDashboard() {
    const { logout, currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userSkills, setUserSkills] = useState<UserSkills | null>(null);
    const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [levelUpSkills, setLevelUpSkills] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'path' | 'workouts'>('path');
    const [nextLingRefill, setNextLingRefill] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');

    // Timer for ling refill
    useEffect(() => {
        if (!userSkills || userSkills.lings >= 25) return;

        const updateTimer = () => {
            const lastRefill = new Date(userSkills.lastLingRefill || new Date().toISOString());
            const nextRefill = new Date(lastRefill.getTime() + 4 * 60 * 60 * 1000); // +4 hours
            const now = new Date();
            const diff = nextRefill.getTime() - now.getTime();

            if (diff <= 0) {
                // Should re-fetch or just wait for next interaction
                setNextLingRefill('Ready');
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setNextLingRefill(`${hours}h ${minutes}m`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [userSkills]);

    useEffect(() => {
        if (currentUser) {
            checkMaintenance();
            loadUserData();
        }
    }, [currentUser]);

    const checkMaintenance = async () => {
        try {
            const settings = await SettingsService.getSettings();
            setMaintenanceMode(settings.maintenanceMode);
            setMaintenanceMessage(settings.maintenanceMessage);
        } catch (e) {
            console.error('Error checking maintenance mode:', e);
        }
    };

    const loadUserData = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // Initialize user skills if needed
            await UserSkillsService.initializeUserSkills(currentUser.uid);

            // Load user skills
            const skills = await UserSkillsService.getUserSkills(currentUser.uid);
            setUserSkills(skills);

            // Load available lessons
            const lessons = await LessonService.getAvailableLessons(skills);
            setAvailableLessons(lessons);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonSelect = async (lesson: Lesson) => {
        // Ling Check for Standard Lessons
        if ((!lesson.category || lesson.category === 'standard') && !userSkills?.completedLessons.includes(lesson.id!)) {
            if ((userSkills?.lings || 0) <= 0) {
                alert("Out of Lings! Practice with Quotations while you wait for a refill.");
                return;
            }
        }
        setCurrentLesson(lesson);
    };

    const handleLessonComplete = async (userTranslation: string) => {
        if (!currentUser || !currentLesson || !userSkills) return;

        console.log('Translation submitted:', userTranslation);

        // Track which skills leveled up
        const skillsBeforeUpdate = { ...userSkills };

        try {
            // Complete lesson and update skills
            // Check if we need to consume a ling
            const consumeLing = (!currentLesson.category || currentLesson.category === 'standard') && !userSkills.completedLessons.includes(currentLesson.id!);

            const updatedSkills = await UserSkillsService.completeLesson(
                currentUser.uid,
                currentLesson.id!,
                {
                    vocabularyGain: currentLesson.vocabularyGain,
                    grammarGain: currentLesson.grammarGain,
                    readingGain: currentLesson.readingGain,
                    writingGain: currentLesson.writingGain,
                    xpReward: currentLesson.xpReward
                }
            );

            if (consumeLing) {
                await UserSkillsService.consumeLing(currentUser.uid);
                updatedSkills.lings = Math.max(0, updatedSkills.lings - 1);
            }

            // Check for level ups
            const levelsUp: string[] = [];
            if (updatedSkills.vocabulary > skillsBeforeUpdate.vocabulary) levelsUp.push('vocabulary');
            if (updatedSkills.grammar > skillsBeforeUpdate.grammar) levelsUp.push('grammar');
            if (updatedSkills.reading > skillsBeforeUpdate.reading) levelsUp.push('reading');
            if (updatedSkills.writing > skillsBeforeUpdate.writing) levelsUp.push('writing');

            if (levelsUp.length > 0) {
                setLevelUpSkills(levelsUp);
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 3000);
            }

            setUserSkills(updatedSkills);
            setCurrentLesson(null);

            // Reload lessons to update available list
            const lessons = await LessonService.getAvailableLessons(updatedSkills);
            setAvailableLessons(lessons);

        } catch (error) {
            console.error('Error completing lesson:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (loading || !userSkills) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-gray">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-brand-yellow"></div>
            </div>
        );
    }

    // Show maintenance page if maintenance mode is enabled
    if (maintenanceMode) {
        return <MaintenancePage message={maintenanceMessage} />;
    }

    return (
        <div className="min-h-screen bg-brand-gray text-brand-dark font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-yellow rounded-lg md:rounded-xl flex items-center justify-center">
                            <Feather className="w-5 h-5 md:w-6 md:h-6 text-brand-dark" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-lg md:text-xl font-bold text-brand-dark dark:text-white tracking-tight">
                            Linguist <span className="hidden sm:inline text-gray-400 font-medium ml-2">Learn</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-8">
                        <div className="hidden sm:flex items-center gap-2 text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-900/30">
                            <Flame className="w-5 h-5 fill-current" />
                            <span className="font-bold">{userSkills.streak}</span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-yellow-100 dark:border-yellow-900/30 shadow-sm">
                            <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                            <span className="font-bold text-sm md:text-lg">{userSkills.totalXP}</span>
                        </div>

                        <div className="flex items-center gap-2 text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 md:px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/30 relative group cursor-help">
                            <Diamond className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                            <span className="font-bold text-sm md:text-base">{userSkills.lings ?? 25}</span>
                            {userSkills.lings < 25 && (
                                <span className="hidden md:inline text-xs font-normal ml-1 opacity-70">
                                    {nextLingRefill}
                                </span>
                            )}
                            {/* Tooltip */}
                            <div className="absolute top-full mt-2 right-0 bg-gray-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-48 text-center pointer-events-none z-50">
                                Refills 1 Ling every 4 hours.
                                <br />
                                Max 25 Lings.
                            </div>
                        </div>

                        <div className="flex items-center gap-1 md:gap-3">
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-brand-dark"
                                title="Privacy & Settings"
                            >
                                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-brand-dark"
                                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
                            </button>
                            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-brand-dark" title="Logout">
                                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="py-6 md:py-12 px-4 md:px-6 max-w-7xl mx-auto">
                {/* AI Generation Loading Overlay */}
                <AnimatePresence>
                    {isGenerating && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full"
                            >
                                <div className="w-16 h-16 bg-brand-yellow/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Sparkles className="w-8 h-8 text-brand-dark animate-spin-slow" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2 text-center">
                                    Analyzing your mistake...
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                                    Creating a personalized lesson just for you.
                                </p>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Level Up Celebration */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-8 py-4 rounded-2xl shadow-2xl"
                        >
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8" />
                                <div>
                                    <p className="font-bold text-lg">Level Up!</p>
                                    <p className="text-sm opacity-90">
                                        {levelUpSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')} improved!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Current Lesson View */}
                {currentLesson ? (
                    <div className="mb-8 md:mb-12">
                        <LessonView
                            lesson={currentLesson}
                            loading={false}
                            onComplete={handleLessonComplete}
                        />
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {/* Hero Section / Next Lesson Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-700 mb-8 md:mb-12 text-center"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-yellow rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg shadow-brand-yellow/30">
                                <Feather className="w-8 h-8 md:w-10 md:h-10 text-brand-dark" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark dark:text-white mb-2 md:mb-3 leading-tight">Ready for your next step?</h2>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6 md:mb-8 max-w-md mx-auto">
                                The AI has analyzed your progress and prepared a fresh lesson in {userSkills.targetLanguage || 'German'} just for you.
                            </p>

                            <button
                                onClick={async () => {
                                    if (!currentUser || !userSkills) return;

                                    setIsGenerating(true);
                                    try {
                                        const next = await LessonService.getNextLesson(userSkills);
                                        console.log('[Dashboard] Next Step Decision:', next);

                                        if (next === 'AI_TRIGGER') {
                                            // Generate personalized AI lesson every 10 lessons
                                            const { generatePersonalizedLesson } = await import('../services/ai');
                                            const aiLesson = await generatePersonalizedLesson(
                                                [], // Could extract recent mistakes here
                                                `Level ${Math.floor(userSkills.totalXP / 100)}`, // User level as string
                                                "Personalized Review",
                                                userSkills.targetLanguage || "German",
                                                userSkills.totalXP || 0
                                            );

                                            const lessonId = await LessonService.createLesson({
                                                ...aiLesson,
                                                createdBy: currentUser.uid,
                                                isAiGenerated: true,
                                                createdAt: new Date(),
                                                isActive: true
                                            } as any);

                                            // Reset AI counter
                                            await UserSkillsService.updateSkills(currentUser.uid, {
                                                lessonsSinceAiGeneration: 0
                                            });

                                            const lesson = await LessonService.getLessonById(lessonId);
                                            if (lesson) handleLessonSelect(lesson);

                                        } else if (next === 'CLIENT_TRIGGER') {
                                            // Check if we actually have pending projects
                                            const { ProjectService } = await import('../services/db');
                                            const pendingProjects = await ProjectService.getPendingProjects();

                                            if (pendingProjects.length > 0) {
                                                // Generate client translation task
                                                const { generateClientRequest } = await import('../services/ai');
                                                const clientLesson = await generateClientRequest(
                                                    userSkills.targetLanguage || "German",
                                                    userSkills.totalXP || 0
                                                );

                                                const lessonId = await LessonService.createLesson({
                                                    ...clientLesson,
                                                    createdBy: currentUser.uid,
                                                    category: 'client-request',
                                                    createdAt: new Date(),
                                                    isActive: true
                                                } as any);

                                                // Reset client counter
                                                await UserSkillsService.updateSkills(currentUser.uid, {
                                                    lessonsSinceClientTask: 0
                                                });

                                                const lesson = await LessonService.getLessonById(lessonId);
                                                if (lesson) handleLessonSelect(lesson);
                                            } else {
                                                // No projects available, skip client task and get standard lesson
                                                const standardNext = await LessonService.getNextLesson({
                                                    ...userSkills,
                                                    lessonsSinceClientTask: 0 // Reset counter since we're skipping
                                                });

                                                if (standardNext && typeof standardNext !== 'string') {
                                                    handleLessonSelect(standardNext);
                                                }
                                            }

                                        } else if (next === null) {
                                            // No more database lessons - fallback to AI generation
                                            const { generatePersonalizedLesson } = await import('../services/ai');
                                            const aiLesson = await generatePersonalizedLesson(
                                                [],
                                                `Level ${Math.floor(userSkills.totalXP / 100)}`,
                                                "Advanced Practice",
                                                userSkills.targetLanguage || "German",
                                                userSkills.totalXP || 0
                                            );

                                            const lessonId = await LessonService.createLesson({
                                                ...aiLesson,
                                                createdBy: currentUser.uid,
                                                isAiGenerated: true,
                                                createdAt: new Date(),
                                                isActive: true
                                            } as any);

                                            const lesson = await LessonService.getLessonById(lessonId);
                                            if (lesson) handleLessonSelect(lesson);

                                        } else {
                                            // Standard database lesson
                                            handleLessonSelect(next);
                                        }

                                    } catch (e) {
                                        console.error('Error loading next lesson:', e);
                                    } finally {
                                        setIsGenerating(false);
                                    }
                                }}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-10 py-4 md:py-5 bg-brand-dark text-white rounded-xl md:rounded-2xl font-bold text-lg md:text-xl shadow-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                            >
                                <Play className="w-5 h-5 md:w-6 md:h-6 fill-current group-hover:text-brand-yellow transition-colors" />
                                Start Next Lesson
                            </button>
                        </motion.div>

                        {/* Journey */}
                        <div className="space-y-4">
                            <LessonPath
                                lessons={availableLessons.filter(l => !l.category || l.category === 'standard')}
                                userSkills={userSkills}
                                onLessonSelect={handleLessonSelect}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}
