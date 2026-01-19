import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, RefreshCw, Send, Sparkles } from 'lucide-react';

import { Lesson } from '../services/lessonService';
import DragDropView from './DragDropView';

interface LessonViewProps {
    lesson: Lesson;
    onComplete: (userTranslation: string) => Promise<void>;
    loading: boolean;
}

export default function LessonView({ lesson, onComplete, loading }: LessonViewProps) {
    const [input, setInput] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Reset submitted state when lesson changes
    useEffect(() => {
        setSubmitted(false);
        setShowSuccess(false);
        setInput('');
    }, [lesson.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        handleComplete(input);
    };

    const handleComplete = (answer: string) => {
        setSubmitted(true);

        // Show checking animation, then success, then load next
        setTimeout(() => {
            setShowSuccess(true);
            setTimeout(async () => {
                await onComplete(answer);
            }, 1500); // Wait to show success before loading next
        }, 800);
    };

    if (lesson.type === 'drag-drop') {
        return (
            <DragDropView
                lesson={lesson}
                onComplete={handleComplete}
                loading={loading}
            />
        );
    }

    // Highlight target sentence in context
    const parts = lesson.context.split(lesson.targetSentence);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                {/* Header Info */}
                <div className="flex items-center justify-between text-gray-400 text-sm font-medium mb-8 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2">
                        <Book className="w-4 h-4 text-brand-yellow" />
                        <span className="text-brand-dark">{lesson.sourceTitle} <span className="text-gray-400 font-normal">by</span> {lesson.sourceAuthor}</span>
                    </div>
                    {lesson.isAiGenerated && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-brand-dark text-xs font-bold uppercase tracking-wider rounded-lg border border-yellow-100">
                            <Sparkles className="w-3.5 h-3.5" />
                            Personalized
                        </div>
                    )}
                </div>

                {/* Context Display */}
                <div className="text-xl leading-relaxed text-gray-600 font-serif mb-10">
                    {parts[0]}
                    <span className="bg-brand-yellow/30 text-brand-dark font-medium px-2 py-0.5 rounded mx-1 box-decoration-clone border-b-2 border-brand-yellow/50">
                        {lesson.targetSentence}
                    </span>
                    {parts[1]}
                </div>

                {/* Interaction Area */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-3">
                            <Sparkles className="w-4 h-4 text-brand-yellow" />
                            Your Translation
                        </label>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-brand-yellow/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
                            <textarea
                                className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-brand-yellow rounded-2xl text-brand-dark placeholder-gray-400 focus:outline-none focus:bg-white transition-all resize-none h-40 text-lg shadow-inner"
                                placeholder="Type your translation here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={submitted || loading}
                            />

                            <AnimatePresence>
                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-col gap-4 z-10"
                                    >
                                        {showSuccess ? (
                                            <>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 200 }}
                                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                                                >
                                                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-center"
                                                >
                                                    <p className="text-green-600 font-bold text-2xl mb-1">Great work!</p>
                                                    <p className="text-gray-600 text-sm">+50 XP</p>
                                                </motion.div>
                                            </>
                                        ) : (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="p-3 bg-brand-yellow/20 rounded-full"
                                                >
                                                    <RefreshCw className="w-8 h-8 text-brand-dark" />
                                                </motion.div>
                                                <p className="text-brand-dark font-bold text-lg">Checking your work...</p>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={!input.trim() || submitted || loading}
                            className="px-10 py-4 bg-brand-yellow text-brand-dark font-bold rounded-2xl shadow-lg shadow-brand-yellow/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all flex items-center gap-3 text-lg"
                        >
                            Submit Translation <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
