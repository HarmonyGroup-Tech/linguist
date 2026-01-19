import { useEffect, useState } from 'react';
import LessonView from '../components/LessonView';
// import SkillProgress from '../components/SkillProgress'; -- Removed for UX simplification
import LessonPath from '../components/LessonPath';
import QuotationsView from '../components/QuotationsView';
import { LogOut, Flame, Award, Feather, Map, Quote, Diamond, Moon, Sun, Play, Sparkles } from 'lucide-react';
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

    // Timer for ling refill
    useEffect(() => {
        if (!userSkills || userSkills.lings >= 5) return;

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
            loadUserData();
        }
    }, [currentUser]);

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

            // Decision: After completing, we just reload and let the user click "Start Next Lesson" 
            // OR the horizontal path will show the next one clearly.
            // Simplified: No automatic popup since the UX should be "clean".

            // Reset client counter if it was a client request
            if (currentLesson.category === 'client-request') {
                await UserSkillsService.updateSkills(currentUser.uid, {
                    lessonsSinceLastClient: 0
                });
            }

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

    return (
        <div className="min-h-screen bg-brand-gray text-brand-dark font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
                            <Feather className="w-6 h-6 text-brand-dark" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-bold text-brand-dark tracking-tight">
                            Linguist <span className="text-gray-400 font-medium ml-2">Learn</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                            <Flame className="w-5 h-5 fill-current" />
                            <span className="font-bold">{userSkills.streak}</span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100 shadow-sm">
                            <Award className="w-5 h-5" />
                            <span className="font-bold text-lg">{userSkills.totalXP}</span>
                        </div>

                        <div className="flex items-center gap-2 text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 relative group cursor-help">
                            <Diamond className="w-5 h-5 fill-current" />
                            <span className="font-bold">{userSkills.lings ?? 5}</span>
                            {userSkills.lings < 5 && (
                                <span className="text-xs font-normal ml-1 opacity-70">
                                    {nextLingRefill}
                                </span>
                            )}
                            {/* Tooltip */}
                            <div className="absolute top-full mt-2 right-0 bg-gray-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-48 text-center pointer-events-none">
                                Refills 1 Ling every 4 hours.
                                <br />
                                Max 5 Lings.
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-brand-dark"
                                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </button>
                            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-brand-dark">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="py-12 px-6 max-w-7xl mx-auto">
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
                    <div className="mb-12">
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
                            className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-gray-700 mb-12 text-center"
                        >
                            <div className="w-20 h-20 bg-brand-yellow rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-yellow/30">
                                <Feather className="w-10 h-10 text-brand-dark" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-3xl font-bold text-brand-dark dark:text-white mb-3">Ready for your next step?</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                The AI has analyzed your progress and prepared a fresh lesson in {userSkills.targetLanguage || 'German'} just for you.
                            </p>

                            <button
                                onClick={async () => {
                                    // 1. Check if there's already an available lesson
                                    const nextAvailable = availableLessons.find(l =>
                                        (!l.category || l.category === 'standard') &&
                                        !userSkills.completedLessons.includes(l.id!)
                                    );

                                    if (nextAvailable) {
                                        handleLessonSelect(nextAvailable);
                                        return;
                                    }

                                    // 2. Otherwise generate a new one
                                    setIsGenerating(true);
                                    try {
                                        const { generatePersonalizedLesson, generateClientRequest } = await import('../services/ai');
                                        const { ProjectService } = await import('../services/db');

                                        // Check for real pending projects first
                                        const pendingProjects = await ProjectService.getPendingProjects();
                                        const hasRealWork = pendingProjects.length > 0;

                                        // Trigger Client Work every 3-7 lessons if level > 5 (approx 500 XP) AND real work exists
                                        const shouldTriggerClient = (userSkills.lessonsSinceLastClient >= 3) && (userSkills.totalXP >= 500) && hasRealWork;

                                        let newLessonData;
                                        if (shouldTriggerClient) {
                                            newLessonData = await generateClientRequest(userSkills.targetLanguage || "German", userSkills.totalXP);
                                        }

                                        // Fallback or standard generation
                                        if (!newLessonData) {
                                            newLessonData = await generatePersonalizedLesson(
                                                [], // No new mistakes, just progression
                                                "Absolute Beginner",
                                                "Introduction",
                                                userSkills.targetLanguage || "German"
                                            );
                                        }

                                        if (newLessonData) {
                                            const newLessonId = await LessonService.createLesson({
                                                ...newLessonData,
                                                createdBy: currentUser.uid,
                                                createdAt: new Date(),
                                                isActive: true
                                            } as any);

                                            handleLessonSelect({ ...newLessonData, id: newLessonId });
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    } finally {
                                        setIsGenerating(false);
                                    }
                                }}
                                className="inline-flex items-center gap-3 px-10 py-5 bg-brand-dark text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                            >
                                <Play className="w-6 h-6 fill-current group-hover:text-brand-yellow transition-colors" />
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
