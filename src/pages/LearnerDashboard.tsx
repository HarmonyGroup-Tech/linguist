import { useEffect, useState } from 'react';
import { generateLesson as fetchLesson } from '../services/ai';
import LessonView from '../components/LessonView';
import { LogOut, Award, Flame, Feather } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserProgressService } from '../services/db';

export default function LearnerDashboard() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState<any>(null);
    const [streak, setStreak] = useState(0);
    const [xp, setXp] = useState(0);

    // Initial Data Load
    useEffect(() => {
        if (currentUser) {
            UserProgressService.getUserProgress(currentUser.uid).then(progress => {
                setStreak(progress.streak);
                setXp(progress.totalXP);
            });
        }
    }, [currentUser]);

    const loadNewLesson = async () => {
        setLoading(true);
        try {
            // Fetch User Language
            let learningLanguage = "Spanish"; // Default
            if (currentUser) {
                const userDoc = await UserProgressService.getUserProfile(currentUser.uid); // Need to helper for this or direct query
                if (userDoc?.learningLanguage) {
                    learningLanguage = userDoc.learningLanguage;
                }
            }

            // Real AI Call
            const topic = "travel";
            const newLesson = await fetchLesson(topic, "B2", learningLanguage);
            setLesson({
                id: Date.now().toString(), // Temp ID
                ...newLesson
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNewLesson();
    }, []);

    const handleLessonComplete = async (translation: string) => {
        console.log("Translation submitted:", translation);
        const xpGain = 50;
        setXp(prev => prev + xpGain);

        if (currentUser) {
            await UserProgressService.updateUserXP(currentUser.uid, xpGain);
        }
        loadNewLesson();
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

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
                            Linguist <span className="text-gray-400 font-medium ml-2">Coach</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                            <Flame className="w-5 h-5 fill-current" />
                            <span className="font-bold">{streak}</span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                            <Award className="w-5 h-5" />
                            <span className="font-bold">{xp} XP</span>
                        </div>

                        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-brand-dark">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-4xl font-bold mb-3 text-brand-dark">Daily Practice</h2>
                    <p className="text-gray-500 text-lg">Translate the snippet below to unlock the next chapter.</p>
                </div>

                {lesson ? (
                    <LessonView
                        lesson={lesson}
                        loading={loading}
                        onComplete={handleLessonComplete}
                    />
                ) : (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-brand-yellow"></div>
                    </div>
                )}
            </main>
        </div>
    );
}
