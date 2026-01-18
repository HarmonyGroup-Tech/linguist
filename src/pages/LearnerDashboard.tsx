import { useEffect, useState } from 'react';
import LessonView from '../components/LessonView';
import SkillProgress from '../components/SkillProgress';
import LessonPath from '../components/LessonPath';
import QuotationsView from '../components/QuotationsView';
import { LogOut, Flame, Award, Feather, Map, Quote, Diamond, Moon, Sun, Play, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { UserSkillsService, LessonService, type Lesson, type UserSkills } from '../services/lessonService';
import { recommendNextLesson } from '../services/ai';
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
    const [nextLingRefill, setNextLingRefill] = useState<string>('');
    const [recommendation, setRecommendation] = useState<{ lesson: Lesson; reason: string } | null>(null);
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

            // AI Logic: Decision Branch
            // If user made a mistake (simple string comparison for now), generate a NEW lesson.
            // If user was correct, recommend an EXISTING lesson.

            const normalizedUser = userTranslation.trim().toLowerCase();
            const normalizedCorrect = currentLesson.correctTranslation?.trim().toLowerCase();
            const isCorrect = normalizedUser === normalizedCorrect;

            console.log("Mistake Check:", {
                user: normalizedUser,
                correct: normalizedCorrect,
                isCorrect,
                hasCorrectTranslation: !!currentLesson.correctTranslation
            });

            if (!isCorrect && currentLesson.correctTranslation) {
                // 1. GENERATE PERSONALIZED LESSON
                console.log("Mistake detected, generating personalized lesson...");
                setIsGenerating(true);

                import('../services/ai').then(async ({ generatePersonalizedLesson }) => {
                    try {
                        const newLessonData = await generatePersonalizedLesson(
                            [`Expected: "${currentLesson.correctTranslation}" but got: "${userTranslation}"`],
                            `Level ${userSkills.vocabulary > 20 ? 'Intermediate' : 'Beginner'}`,
                            currentLesson.title
                        );

                        if (newLessonData) {
                            // Save the new lesson
                            const newLessonId = await LessonService.createLesson({
                                ...newLessonData,
                                createdBy: 'AI_TUTOR',
                                createdAt: new Date(),
                                // Ensure defaults
                                isActive: true
                            } as any);

                            const fullLesson = { ...newLessonData, id: newLessonId };

                            setRecommendation({
                                lesson: fullLesson,
                                reason: "We noticed you struggled with this. Here is a custom lesson to help you master it!"
                            });
                        } else {
                            // Fallback to standard recommendation if generation fails
                            await runStandardRecommendation(lessons);
                        }
                    } catch (error) {
                        console.error("Error in personalized generation:", error);
                        await runStandardRecommendation(lessons);
                    } finally {
                        setIsGenerating(false);
                    }
                });

            } else {
                // 2. STANDARD RECOMMENDATION (Existing Logic)
                await runStandardRecommendation(lessons);
            }

        } catch (error) {
            console.error('Error completing lesson:', error);
        }
    };

    const runStandardRecommendation = async (lessons: Lesson[]) => {
        if (!currentLesson || !currentLesson.correctTranslation) return;

        const mappedLessons = lessons.map(l => {
            if (l.id) return {
                id: l.id,
                title: l.title,
                description: l.description,
                type: l.type
            };
            return null;
        }).filter(l => l !== null) as { id: string; title: string; description: string; type: string }[];

        const recommendationResult = await recommendNextLesson(
            currentLesson.title,
            currentLesson.description,
            "Correct", // Assumption since we are in the 'else' block or fallback
            currentLesson.correctTranslation,
            mappedLessons
        );

        if (recommendationResult) {
            const recommendedLesson = lessons.find(l => l.id === recommendationResult.recommendedLessonId);
            if (recommendedLesson) {
                setRecommendation({
                    lesson: recommendedLesson,
                    reason: recommendationResult.reason
                });
            }
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
                        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                            <Award className="w-5 h-5" />
                            <span className="font-bold">{userSkills.totalXP} XP</span>
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

                {/* Review & Recommendation Modal */}
                <AnimatePresence>
                    {recommendation && !isGenerating && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20 relative overflow-hidden"
                            >
                                {/* Decorative Background Blob */}
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-yellow/20 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-yellow/20 mx-auto">
                                        <Sparkles className="w-8 h-8 text-brand-dark" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-center text-brand-dark dark:text-white mb-2">
                                        AI Recommendation
                                    </h3>
                                    <p className="text-center text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                        Based on your recent performance, here is the best next step for you.
                                    </p>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm text-2xl shrink-0">
                                                🎯
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-brand-dark dark:text-white text-lg">
                                                    {recommendation.lesson.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Level {recommendation.lesson.level} • {recommendation.lesson.category === 'quotation' ? 'Workout' : 'Standard Lesson'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 italic bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                            "{recommendation.reason}"
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => {
                                                handleLessonSelect(recommendation.lesson);
                                                setRecommendation(null);
                                            }}
                                            className="w-full py-4 bg-brand-dark text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-5 h-5 fill-current" />
                                            Start Recommended Lesson
                                        </button>
                                        <button
                                            onClick={() => setRecommendation(null)}
                                            className="w-full py-4 text-gray-500 font-bold hover:text-brand-dark dark:hover:text-white transition-colors"
                                        >
                                            Maybe Later
                                        </button>
                                    </div>
                                </div>
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
                        <button
                            onClick={() => setCurrentLesson(null)}
                            className="mb-6 text-sm font-semibold text-gray-600 hover:text-brand-dark transition-colors"
                        >
                            ← Back to Lessons
                        </button>
                        <LessonView
                            lesson={currentLesson}
                            loading={false}
                            onComplete={handleLessonComplete}
                        />
                    </div>
                ) : (
                    <>
                        {/* Skills Progress */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">Your Skills</h2>
                            <SkillProgress
                                vocabulary={userSkills.vocabulary}
                                grammar={userSkills.grammar}
                                reading={userSkills.reading}
                                writing={userSkills.writing}
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => setActiveTab('path')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'path'
                                    ? 'bg-brand-dark text-white shadow-lg'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Map className="w-5 h-5" />
                                Learning Path
                            </button>
                            <button
                                onClick={() => setActiveTab('workouts')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'workouts'
                                    ? 'bg-violet-600 text-white shadow-lg'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Quote className="w-5 h-5" />
                                Workouts
                            </button>
                        </div>

                        {activeTab === 'path' ? (
                            <div className="space-y-8">
                                {/* Infinite Learning / Empty State */}
                                {availableLessons.filter(l => !l.category || l.category === 'standard').every(l => userSkills.completedLessons.includes(l.id!)) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gradient-to-r from-brand-dark to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                    <Sparkles className="w-6 h-6 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold">Path Completed!</h3>
                                                    <p className="text-gray-300">You've finished all standard lessons.</p>
                                                </div>
                                            </div>

                                            <p className="mb-6 text-gray-200 max-w-lg">
                                                Don't stop now! The AI can generate infinite new lessons tailored to your level to keep your streak alive.
                                            </p>

                                            <button
                                                onClick={() => {
                                                    setIsGenerating(true);
                                                    import('../services/ai').then(async ({ generatePersonalizedLesson }) => {
                                                        try {
                                                            const newLessonData = await generatePersonalizedLesson(
                                                                ["User requested advanced practice"],
                                                                "Advanced", // Auto-scale ideally
                                                                "General Practice"
                                                            );

                                                            if (newLessonData) {
                                                                const newLessonId = await LessonService.createLesson({
                                                                    ...newLessonData,
                                                                    createdBy: 'AI_TUTOR',
                                                                    createdAt: new Date(),
                                                                    active: true
                                                                } as any);

                                                                const fullLesson = { ...newLessonData, id: newLessonId };
                                                                setRecommendation({
                                                                    lesson: fullLesson,
                                                                    reason: "Here is a fresh lesson to keep you moving forward!"
                                                                });
                                                            }
                                                        } catch (e) {
                                                            console.error(e);
                                                        } finally {
                                                            setIsGenerating(false);
                                                        }
                                                    });
                                                }}
                                                className="px-6 py-3 bg-white text-brand-dark font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                                            >
                                                <Play className="w-5 h-5 fill-current" />
                                                Generate New Lesson
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                <LessonPath
                                    lessons={availableLessons.filter(l => !l.category || l.category === 'standard')}
                                    userSkills={userSkills}
                                    onLessonSelect={handleLessonSelect}
                                />
                            </div>
                        ) : (
                            <div>
                                <QuotationsView
                                    lessons={availableLessons.filter(l => l.category === 'quotation')}
                                    onSelect={handleLessonSelect}
                                    completedLessonIds={userSkills.completedLessons}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
