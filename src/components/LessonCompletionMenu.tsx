import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Home, Trophy, ArrowRight } from 'lucide-react';
import LinguMascot from './LinguMascot';

interface LessonCompletionMenuProps {
    score: number; // 0-100
    onNext: () => void;
    onPractice: () => void;
    onMenu: () => void;
}

export default function LessonCompletionMenu({ score, onNext, onPractice, onMenu }: LessonCompletionMenuProps) {
    const isPerfect = score === 100;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
                {/* Lingu at the top */}
                <div className="pt-10 pb-6 flex flex-col items-center">
                    <LinguMascot size="lg" animation={isPerfect ? 'bounce' : 'wave'} />
                    <h2 className="text-3xl font-black text-brand-dark dark:text-white mt-6">
                        {isPerfect ? 'Perfect Session!' : 'Lesson Complete!'}
                    </h2>
                    <div className="mt-4 flex flex-col items-center">
                        <div className="text-5xl font-black text-brand-yellow drop-shadow-sm">
                            {score}%
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
                            Success Accuracy
                        </p>
                    </div>
                </div>

                <div className="px-10 pb-10 space-y-4">
                    <button
                        onClick={onNext}
                        className="w-full py-5 bg-brand-yellow text-brand-dark rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-brand-yellow/30 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Next Lesson
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onPractice}
                            className="py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-900/30"
                        >
                            <Sparkles className="w-4 h-4" />
                            Practice
                        </button>
                        <button
                            onClick={onMenu}
                            className="py-4 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-100 dark:border-gray-600"
                        >
                            <Home className="w-4 h-4" />
                            Main Menu
                        </button>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            </motion.div>
        </div>
    );
}
