import { useEffect, useState } from 'react';
import LessonView from '../components/LessonView';
import SkillProgress from '../components/SkillProgress';
import LessonPath from '../components/LessonPath';
import { LogOut, Flame, Award, Feather } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserSkillsService, LessonService, type Lesson, type UserSkills } from '../services/lessonService';
import { motion, AnimatePresence } from 'framer-motion';

export default function LearnerDashboard() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userSkills, setUserSkills] = useState<UserSkills | null>(null);
    const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [levelUpSkills, setLevelUpSkills] = useState<string[]>([]);

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

    const handleLessonSelect = (lesson: Lesson) => {
        setCurrentLesson(lesson);
    };

    const handleLessonComplete = async (userTranslation: string) => {
        if (!currentUser || !currentLesson || !userSkills) return;

        console.log('Translation submitted:', userTranslation);

        // Track which skills leveled up
        const skillsBeforeUpdate = { ...userSkills };

        try {
            // Complete lesson and update skills
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

                        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-brand-dark">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="py-12 px-6 max-w-7xl mx-auto">
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
                            lesson={{
                                id: currentLesson.id!,
                                context: currentLesson.context,
                                targetSentence: currentLesson.targetSentence,
                                sourceTitle: currentLesson.sourceTitle || '',
                                sourceAuthor: currentLesson.sourceAuthor || '',
                                correctTranslation: currentLesson.correctTranslation
                            }}
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

                        {/* Lesson Path */}
                        <div>
                            <LessonPath
                                lessons={availableLessons}
                                userSkills={userSkills}
                                onLessonSelect={handleLessonSelect}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
