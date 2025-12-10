import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, RefreshCw } from 'lucide-react';

interface LessonData {
    id: string;
    context: string;
    targetSentence: string;
    sourceTitle: string;
    sourceAuthor: string;
    translation?: string; // Correct translation for verification (hidden initially)
}

interface LessonViewProps {
    lesson: LessonData;
    onComplete: (userTranslation: string) => void;
    loading: boolean;
}

export default function LessonView({ lesson, onComplete, loading }: LessonViewProps) {
    const [input, setInput] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setSubmitted(true);
        // In a real app, we might wait for animation or validaton before calling onComplete
        setTimeout(() => onComplete(input), 1500);
    };

    // Highlight target sentence in context
    const parts = lesson.context.split(lesson.targetSentence);

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center justify-between text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    <span>{lesson.sourceTitle} <span className="text-slate-600">by</span> {lesson.sourceAuthor}</span>
                </div>
                <span>Level: B2</span>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Context Display */}
                <div className="text-lg leading-relaxed text-slate-300 font-serif mb-8">
                    {parts[0]}
                    <span className="bg-primary/20 text-white font-medium px-1 rounded mx-1 box-decoration-clone">
                        {lesson.targetSentence}
                    </span>
                    {parts[1]}
                </div>

                {/* Interaction Area */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block text-sm font-medium text-slate-400">Translate the highlighted sentence:</label>

                    <div className="relative">
                        <textarea
                            className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-32"
                            placeholder="Enter your translation..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={submitted || loading}
                        />

                        <AnimatePresence>
                            {submitted && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center flex-col gap-3"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw className="w-8 h-8 text-primary" />
                                    </motion.div>
                                    <p className="text-primary font-medium">Analyzing translation...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!input.trim() || submitted || loading}
                            className="px-8 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
                        >
                            Submit Translation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
