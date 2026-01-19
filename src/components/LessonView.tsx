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

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <ProgressHeader index={currentExerciseIndex} total={activeExercises.length} category={lesson.category} originalTotal={(lesson.exercises?.length || 1)} />

            <div className="relative min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${lesson.id}-${currentExerciseIndex}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full"
                    >
                        {currentExercise.type === 'drag-drop' ? (
                            <DragDropView
                                lesson={{ ...lesson, ...currentExercise } as any}
                                onComplete={(ans, corr) => handleStepComplete(ans, corr)}
                                loading={loading}
                            />
                        ) : (() => {
                            const parts = currentExercise.context.split(currentExercise.targetSentence);
                            return (
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
                                        <p className="mb-4 text-sm font-bold text-brand-yellow uppercase tracking-widest flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4" />
                                            Translate to {lesson.language}
                                        </p>
                                        <p className="text-3xl font-bold text-brand-dark dark:text-white mb-8">
                                            {currentExercise.correctTranslation}
                                        </p>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-lg italic text-gray-400">
                                            {parts[0]}
                                            <span className="bg-brand-yellow/30 text-brand-dark dark:text-white font-medium px-2 py-0.5 rounded mx-1 box-decoration-clone border-b-2 border-brand-yellow/50 not-italic">
                                                ...
                                            </span>
                                            {parts[1]}
                                        </div>
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
                                            </div>
                                        </div>

                                        {!submitted && (
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={!input.trim() || loading}
                                                    className="px-10 py-4 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 text-lg bg-brand-yellow text-brand-dark"
                                                >
                                                    Check Answer
                                                    <Send className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            );
                        })()}
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
                            <div className="max-w-4xl mx-auto flex items-center justify-between text-white">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                        {showStatus === 'success' ? (
                                            <CheckCircle2 className="w-10 h-10" />
                                        ) : (
                                            <X className="w-10 h-10" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black mb-1">
                                            {showStatus === 'success' ? 'EXCELLENT!' : 'Incorrect'}
                                        </h4>
                                        {showStatus === 'failure' && (
                                            <div className="space-y-1">
                                                <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Correct Answer:</p>
                                                <p className="text-xl font-bold">{currentExercise.targetSentence}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={moveToNext}
                                    className="px-10 py-4 bg-white text-brand-dark rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    Continue
                                    <ArrowRight className="w-6 h-6" />
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
