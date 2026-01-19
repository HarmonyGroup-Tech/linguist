import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, RefreshCw, Send, Sparkles, CheckCircle2, X } from 'lucide-react';

import { Lesson, Exercise } from '../services/lessonService';
import DragDropView from './DragDropView';

interface LessonViewProps {
    lesson: Lesson;
    onComplete: (userTranslation: string) => Promise<void>;
    loading: boolean;
}

export default function LessonView({ lesson, onComplete, loading }: LessonViewProps) {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [input, setInput] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showStatus, setShowStatus] = useState<'success' | 'failure' | 'none'>('none');
    const [failedExercises, setFailedExercises] = useState<Exercise[]>([]);
    const [lessonFinished, setLessonFinished] = useState(false);

    // Dynamic list of exercises that can grow if user fails
    const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);

    // List of exercises: if provided, use them; otherwise, create a virtual one from legacy fields
    useEffect(() => {
        const initial = lesson.exercises && lesson.exercises.length > 0
            ? lesson.exercises
            : [{
                type: lesson.type,
                context: lesson.context,
                targetSentence: lesson.targetSentence,
                correctTranslation: lesson.correctTranslation,
                scrambledOptions: lesson.scrambledOptions
            }];
        setActiveExercises(initial);
    }, [lesson]);

    const currentExercise = activeExercises[currentExerciseIndex];

    // Reset state when exercise changes
    useEffect(() => {
        setSubmitted(false);
        setShowStatus('none');
        setInput('');
    }, [currentExerciseIndex, lesson.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const normalize = (str: string) => str.toLowerCase().replace(/[.,!?;:]/g, '').trim();
        const isCorrect = normalize(input) === normalize(currentExercise.correctTranslation);

        handleStepComplete(input, isCorrect);
    };

    const handleStepComplete = (answer: string, isCorrect: boolean) => {
        setSubmitted(true);

        if (isCorrect) {
            setShowStatus('success');
            setTimeout(async () => {
                moveToNext();
            }, 1500);
        } else {
            setShowStatus('failure');
            // Add to failed list if not already there (to avoid infinite loop if they keep failing the redo)
            // Actually, the requirement says "at the end show the questions user failed AGAIN", 
            // implying they should keep appearing until right? 
            // "At the end of the lesson, show the question the user failed again to fix them"
            // Let's add it to the end of activeExercises.
            setActiveExercises(prev => [...prev, currentExercise]);

            // Still move to next after showing answer
            setTimeout(() => {
                moveToNext();
            }, 3000); // Give more time to read correct answer
        }
    };

    const moveToNext = async () => {
        if (currentExerciseIndex < activeExercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        } else {
            setLessonFinished(true);
            await onComplete(input);
        }
    };

    if (!currentExercise) return null;

    if (currentExercise.type === 'drag-drop') {
        return (
            <div className="space-y-6">
                <ProgressHeader index={currentExerciseIndex} total={activeExercises.length} category={lesson.category} originalTotal={(lesson.exercises?.length || 1)} />
                <DragDropView
                    lesson={{ ...lesson, ...currentExercise } as any}
                    onComplete={(ans, corr) => handleStepComplete(ans, corr)}
                    loading={loading}
                />
            </div>
        );
    }

    const parts = currentExercise.context.split(currentExercise.targetSentence);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <ProgressHeader index={currentExerciseIndex} total={activeExercises.length} category={lesson.category} originalTotal={(lesson.exercises?.length || 1)} />

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                {/* Header Info */}
                <div className="flex items-center justify-between text-gray-400 text-sm font-medium mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                    <div className="flex items-center gap-2">
                        <Book className="w-4 h-4 text-brand-yellow" />
                        <span className="text-brand-dark dark:text-gray-200">
                            {lesson.category === 'client-request' ? 'Official Correspondence' : (lesson.sourceTitle || 'Grammar Practice')}
                        </span>
                    </div>
                    {lesson.category === 'client-request' && (
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase rounded-lg border border-blue-100">
                            High Priority Client
                        </div>
                    )}
                </div>

                {/* Context Display */}
                <div className="text-xl leading-relaxed text-gray-600 dark:text-gray-300 font-serif mb-10">
                    {parts[0]}
                    <span className="bg-brand-yellow/30 text-brand-dark dark:text-white font-medium px-2 py-0.5 rounded mx-1 box-decoration-clone border-b-2 border-brand-yellow/50">
                        {currentExercise.targetSentence}
                    </span>
                    {parts[1]}
                </div>

                {/* Interaction Area */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-brand-dark dark:text-gray-200 mb-3">
                            <Sparkles className="w-4 h-4 text-brand-yellow" />
                            Your Translation
                        </label>

                        <div className="relative group">
                            <textarea
                                className="w-full p-6 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-brand-yellow rounded-2xl text-brand-dark dark:text-white placeholder-gray-400 focus:outline-none transition-all resize-none h-40 text-lg"
                                placeholder="Type your translation here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={submitted || loading}
                            />

                            <AnimatePresence>
                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-col gap-4 z-10 p-8 text-center"
                                    >
                                        {showStatus === 'success' ? (
                                            <>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                                                >
                                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                                </motion.div>
                                                <p className="text-green-600 font-bold text-xl">
                                                    Perfect!
                                                </p>
                                            </>
                                        ) : showStatus === 'failure' ? (
                                            <>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
                                                >
                                                    <X className="w-10 h-10 text-red-600" />
                                                </motion.div>
                                                <div className="space-y-2">
                                                    <p className="text-red-600 font-bold text-xl">Not quite...</p>
                                                    <div className="pt-2">
                                                        <p className="text-xs text-gray-400 uppercase font-black">Correct Answer</p>
                                                        <p className="text-brand-dark dark:text-white font-medium text-lg">
                                                            {currentExercise.correctTranslation}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-400 italic pt-2">
                                                        We'll try this one again at the end!
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <RefreshCw className="w-8 h-8 text-brand-yellow" />
                                                </motion.div>
                                                <p className="text-brand-dark dark:text-white font-bold">Checking work...</p>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!input.trim() || submitted || loading}
                            className={`px-10 py-4 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 text-lg
                                ${submitted ? 'opacity-0 pointer-events-none' : 'bg-brand-yellow text-brand-dark'}
                            `}
                        >
                            {currentExerciseIndex < activeExercises.length - 1 ? 'Next Step' : 'Finish Lesson'}
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ProgressHeader({ index, total, category, originalTotal }: { index: number, total: number, category?: string, originalTotal: number }) {
    return (
        <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    {Array.from({ length: total }).map((_, i) => {
                        const isRedo = i >= originalTotal;
                        return (
                            <div
                                key={i}
                                className={`h-2 rounded-full transition-all duration-500 ${i < index ? 'w-8 bg-green-500' :
                                    i === index ? 'w-12 bg-brand-yellow shadow-[0_0_10px_rgba(255,204,0,0.5)]' :
                                        isRedo ? 'w-4 bg-orange-100 dark:bg-orange-900/30' : 'w-8 bg-gray-200 dark:bg-gray-700'
                                    }`}
                            />
                        );
                    })}
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {index >= originalTotal ? (
                        <span className="text-orange-500 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Redo Mistake
                        </span>
                    ) : (
                        `Step ${index + 1} of ${originalTotal}`
                    )}
                </span>
            </div>
            {category === 'client-request' && (
                <span className="flex items-center gap-1.5 text-xs font-black text-blue-600 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    CLIENT WORK
                </span>
            )}
        </div>
    );
}
