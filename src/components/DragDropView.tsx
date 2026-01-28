import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lesson } from '../services/lessonService';
import { Check, X, ArrowRight, RotateCcw } from 'lucide-react';

interface DragDropViewProps {
    lesson: Lesson;
    onComplete: (answer: string, isCorrect: boolean) => Promise<void> | void;
    loading?: boolean;
}

export default function DragDropView({ lesson, onComplete, loading }: DragDropViewProps) {
    const [availableWords, setAvailableWords] = useState<{ id: number; word: string }[]>([]);
    const [selectedWords, setSelectedWords] = useState<{ id: number; word: string }[]>([]);
    const [checkStatus, setCheckStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [shake, setShake] = useState(false);

    useEffect(() => {
        // Initialize words
        // Use targetSentence for tiles (The language being learned)
        let words: string[] = lesson.targetSentence.split(' ');

        // Shuffle words and add IDs
        const shuffled = words
            .sort(() => Math.random() - 0.5)
            .map((word, index) => ({ id: index, word }));

        setAvailableWords(shuffled);
        setSelectedWords([]);
        setCheckStatus('idle');
    }, [lesson]);

    const handleWordSelect = (wordObj: { id: number; word: string }) => {
        if (checkStatus === 'correct' || loading) return;

        // Don't remove from availableWords, just add to selectedWords
        setSelectedWords(prev => [...prev, wordObj]);
        setCheckStatus('idle');
    };

    const handleWordDeselect = (wordObj: { id: number; word: string }) => {
        if (checkStatus === 'correct' || loading) return;

        setSelectedWords(prev => prev.filter(w => w.id !== wordObj.id));
        setCheckStatus('idle');
    };

    const handleCheck = async () => {
        const userAnswer = selectedWords.map(w => w.word).join(' ');

        // Improve flexible matching (case check, punctuation)
        const normalize = (str: string) => str.toLowerCase().replace(/[.,!?;:]/g, '').trim();

        // Check against targetSentence (The language being learned)
        const isCorrect = normalize(userAnswer) === normalize(lesson.targetSentence);

        if (isCorrect) {
            setCheckStatus('correct');
        } else {
            setCheckStatus('incorrect');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }

        await onComplete(userAnswer, isCorrect);
    };

    const splitContext = () => {
        // Simple split logic to show context around the target sentence
        // This relies on the targetSentence being EXACTLY in the context
        const context = lesson.context || "";
        const parts = context.split(lesson.targetSentence);
        if (parts.length === 1) return [context, '', '']; // Fallback
        return [parts[0], lesson.targetSentence, parts[1]];
    };

    const [prefix, target, suffix] = splitContext();

    return (
        <div className="max-w-3xl mx-auto">
            {/* Context Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 md:mb-8">
                <div className="mb-4 md:mb-6 flex items-center justify-between">
                    <div>
                        {lesson.sourceTitle && (
                            <h3 className="font-bold text-brand-dark dark:text-white flex items-center gap-2 text-sm md:text-base">
                                <span className="w-1 h-5 md:h-6 bg-brand-yellow rounded-full"></span>
                                {lesson.sourceTitle}
                            </h3>
                        )}
                    </div>
                    <span className="px-2 md:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                        Level {lesson.level}
                    </span>
                </div>

                <div className="text-lg md:text-xl leading-relaxed md:leading-loose font-serif text-gray-700 dark:text-gray-300">
                    <p className="mb-3 md:mb-4 text-xs md:text-sm font-bold text-brand-yellow uppercase tracking-widest flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Translate to {lesson.language}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-brand-dark dark:text-white mb-4 md:mb-6">
                        {lesson.correctTranslation}
                    </p>
                    <div className="p-4 md:p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 text-base md:text-lg italic text-gray-500 underline-offset-4">
                        {prefix}
                        <span className="bg-brand-yellow/30 dark:bg-brand-yellow/20 px-1 py-0.5 rounded mx-1 font-medium border-b-2 border-brand-yellow/50 text-brand-dark dark:text-white not-italic">
                            ...
                        </span>
                        {suffix}
                    </div>
                </div>
            </div>

            {/* Answer Area */}
            <div className="mb-6 md:mb-8">
                <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-3 md:mb-4 uppercase tracking-wider">Form the sentence</p>

                <div className="flex flex-wrap gap-2 md:gap-3 min-h-[70px] md:min-h-[80px] p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 transition-colors">
                    <AnimatePresence>
                        {selectedWords.map((word) => (
                            <motion.button
                                key={word.id}
                                layoutId={`word-${word.id}`}
                                onClick={() => handleWordDeselect(word)}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="px-3 md:px-5 py-2.5 md:py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-[0_2px_0_0_rgba(229,231,235,1)] dark:shadow-[0_2px_0_0_rgba(31,41,55,1)] rounded-xl md:rounded-2xl font-bold text-brand-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:translate-y-[2px] active:shadow-none transition-all text-base md:text-lg"
                            >
                                {word.word}
                            </motion.button>
                        ))}
                    </AnimatePresence>

                    {selectedWords.length === 0 && (
                        <div className="w-full flex items-center justify-center text-gray-400 italic text-xs md:text-sm">
                            Tap words below to build your answer
                        </div>
                    )}
                </div>
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8 md:mb-12">
                <AnimatePresence>
                    {availableWords.map((word) => {
                        const isSelected = selectedWords.some(w => w.id === word.id);
                        return (
                            <motion.button
                                key={word.id}
                                layoutId={`word-${word.id}`}
                                onClick={() => !isSelected && handleWordSelect(word)}
                                disabled={isSelected}
                                transition={{ duration: 0.15 }}
                                className={`
                                    px-3 md:px-5 py-2.5 md:py-4 border-2 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all
                                    ${isSelected
                                        ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 text-transparent select-none'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-[0_2px_0_0_rgba(229,231,235,1)] dark:shadow-[0_2px_0_0_rgba(31,41,55,1)] text-brand-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:translate-y-[2px] active:shadow-none'
                                    }
                                `}
                            >
                                {word.word}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <motion.div
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                className="flex items-center justify-between gap-4"
            >
                <div className="flex-1">
                    {/* Status message removed: Parent LessonView handles unified feedback overlay */}
                </div>

                <div className="flex items-center gap-3 md:gap-4 shrink-0">
                    {selectedWords.length > 0 && checkStatus !== 'correct' && (
                        <button
                            onClick={() => {
                                const all = [...availableWords, ...selectedWords].sort(() => Math.random() - 0.5);
                                setAvailableWords(all);
                                setSelectedWords([]);
                                setCheckStatus('idle');
                            }}
                            className="p-3 md:p-4 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand-dark dark:hover:text-white transition-colors"
                            title="Reset"
                        >
                            <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    )}

                    <button
                        onClick={handleCheck}
                        disabled={selectedWords.length === 0 || loading || checkStatus === 'correct'}
                        className={`
                            px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all text-base md:text-xl
                            ${checkStatus === 'correct'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : selectedWords.length === 0
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border dark:border-gray-700'
                                    : 'bg-brand-dark dark:bg-brand-yellow text-white dark:text-brand-dark shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                            }
                        `}
                    >
                        {loading ? (
                            <span>Checking...</span>
                        ) : checkStatus === 'correct' ? (
                            <>
                                <Check className="w-5 h-5 md:w-6 md:h-6" />
                                <span>Correct!</span>
                            </>
                        ) : (
                            <>
                                <span>Check Answer</span>
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
