import { useEffect, useState } from 'react';
import { generateLesson as fetchLesson } from '../services/ai';
import LessonView from '../components/LessonView';
import { LogOut, Award, Flame } from 'lucide-react';
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
            // Real AI Call
            const topic = "travel";
            const newLesson = await fetchLesson(topic, "B2");
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
        <div className="min-h-screen bg-background text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Linguist <span className="text-slate-500 font-normal text-sm ml-2">Coach</span>
                    </h1>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-orange-400">
                            <Flame className="w-5 h-5 fill-current" />
                            <span className="font-bold">{streak}</span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-400">
                            <Award className="w-5 h-5" />
                            <span className="font-bold">{xp} XP</span>
                        </div>

                        <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <LogOut className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center mb-10">
                    <h2 className="text-3xl font-bold mb-2">Daily Practice</h2>
                    <p className="text-slate-400">Translate the snippet below to unlock the next chapter.</p>
                </div>

                {lesson ? (
                    <LessonView
                        lesson={lesson}
                        loading={loading}
                        onComplete={handleLessonComplete}
                    />
                ) : (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}
            </main>
        </div>
    );
}
