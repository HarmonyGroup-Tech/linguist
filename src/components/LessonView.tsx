import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, RefreshCw, Send, Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';

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
        // Check against targetSentence (The language being learned)
        const isCorrect = normalize(input) === normalize(currentExercise.targetSentence);

        handleStepComplete(input, isCorrect);
    };

    const handleStepComplete = (answer: string, isCorrect: boolean) => {
        setSubmitted(true);

        if (isCorrect) {
            setShowStatus('success');
            // Automatic move removed per user request for manual control
        } else {
            setShowStatus('failure');
            // Add to failed list to redo at the end
            setActiveExercises(prev => [...prev, currentExercise]);
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

    const originalTotal = lesson.exercises?.length || 1;

    if (!currentExercise) return null;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Progress Header */}
            <div className="max-w-4xl mx-auto px-4 md:px-0 mb-6 md:mb-10">
                <ProgressHeader
                    index={currentExerciseIndex}
                    total={activeExercises.length}
                    category={lesson.category}
                    originalTotal={originalTotal}
                />
            </div>

            <div className="max-w-4xl mx-auto px-2 md:px-0 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${lesson.id}-${currentExerciseIndex}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-6 md:p-10">
                            {currentExercise.type === 'drag-drop' ? (
                                <DragDropView
                                    lesson={{ ...lesson, ...currentExercise } as any}
                                    onComplete={(ans, corr) => handleStepComplete(ans, corr)}
                                    loading={loading}
                                />
                            ) : (() => {
                                const context = currentExercise.context || "";
                                const parts = context.split(currentExercise.targetSentence);
                                return (
                                    <div className="relative overflow-hidden">
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

                                        <div className="space-y-4 md:space-y-6">
                                            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-brand-yellow/20 text-brand-dark dark:text-brand-yellow rounded-full text-sm font-semibold uppercase tracking-wider border border-brand-yellow/30">
                                                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                Translate
                                            </div>
                                            <p className="text-2xl md:text-4xl font-bold text-brand-dark dark:text-white leading-tight">
                                                {currentExercise.correctTranslation}
                                            </p>
                                            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 text-base md:text-lg italic text-gray-400">
                                                {(currentExercise.context || "").includes(currentExercise.targetSentence) ? (
                                                    <>
                                                        {parts[0]}
                                                        <span className="bg-brand-yellow/30 text-brand-dark dark:text-white font-medium px-2 py-0.5 rounded mx-1 box-decoration-clone border-b-2 border-brand-yellow/50 not-italic">
                                                            ...
                                                        </span>
                                                        {parts[1]}
                                                    </>
                                                ) : (
                                                    currentExercise.context || ""
                                                )}
                                            </div>
                                        </div>

                                        {/* Interaction Area */}
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <div className="space-y-4 md:space-y-6">
                                                    <div className="relative group">
                                                        <input
                                                            type="text"
                                                            value={input}
                                                            onChange={(e) => setInput(e.target.value)}
                                                            placeholder="Focus through the target language..."
                                                            className="w-full text-xl md:text-2xl p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-brand-yellow dark:focus:border-brand-yellow text-brand-dark dark:text-white rounded-xl md:rounded-2xl outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 shadow-inner"
                                                            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubmit(e)}
                                                            readOnly={submitted || loading}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    {!submitted && (
                                                        <button
                                                            type="submit"
                                                            disabled={!input.trim() || loading}
                                                            className="w-full py-4 md:py-6 bg-brand-dark dark:bg-brand-yellow text-white dark:text-brand-dark rounded-xl md:rounded-2xl font-bold text-lg md:text-xl shadow-lg hover:bg-gray-800 dark:hover:bg-yellow-400 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2 md:gap-3 group"
                                                        >
                                                            Check Answer
                                                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Feedback Overlay - Unified and Manual */}
                <AnimatePresence>
                    {submitted && showStatus !== 'none' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`fixed bottom-0 left-0 right-0 p-8 z-50 transition-colors ${showStatus === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 text-white p-4 md:p-0">
                                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                        {showStatus === 'success' ? (
                                            <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" />
                                        ) : (
                                            <X className="w-8 h-8 md:w-10 md:h-10" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xl md:text-2xl font-black mb-1">
                                            {showStatus === 'success' ? 'EXCELLENT!' : 'Incorrect'}
                                        </h4>
                                        {showStatus === 'failure' && (
                                            <div className="space-y-1">
                                                <p className="text-white/80 text-xs md:text-sm font-bold uppercase tracking-wider">Correct Answer:</p>
                                                <p className="text-lg md:text-xl font-bold">{currentExercise.targetSentence}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={moveToNext}
                                    className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-white text-brand-dark rounded-xl md:rounded-2xl font-black text-lg md:text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    Continue
                                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
