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

        setAvailableWords(prev => prev.filter(w => w.id !== wordObj.id));
        setSelectedWords(prev => [...prev, wordObj]);
        setCheckStatus('idle');
    };

    const handleWordDeselect = (wordObj: { id: number; word: string }) => {
        if (checkStatus === 'correct' || loading) return;

        setSelectedWords(prev => prev.filter(w => w.id !== wordObj.id));
        setAvailableWords(prev => [...prev, wordObj]);
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
        const parts = lesson.context.split(lesson.targetSentence);
        if (parts.length === 1) return [lesson.context, '', '']; // Fallback
        return [parts[0], lesson.targetSentence, parts[1]];
    };

    const [prefix, target, suffix] = splitContext();

    return (
        <div className="max-w-3xl mx-auto">
            {/* Context Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        {lesson.sourceTitle && (
                            <h3 className="font-bold text-brand-dark flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-yellow rounded-full"></span>
                                {lesson.sourceTitle}
                            </h3>
                        )}
                        {lesson.sourceAuthor && (
                            <p className="text-sm text-gray-500 ml-3">by {lesson.sourceAuthor}</p>
                        )}
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        {lesson.level} / 10
                    </span>
                </div>

                <div className="text-xl leading-loose font-serif text-gray-700">
                    <p className="mb-4 text-sm font-bold text-brand-yellow uppercase tracking-widest flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Translate to {lesson.language}
                    </p>
                    <p className="text-2xl font-bold text-brand-dark mb-6">
                        {lesson.correctTranslation}
                    </p>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-lg italic text-gray-500">
                        {prefix}
                        <span className="bg-brand-yellow/30 px-1 py-0.5 rounded mx-1 font-medium border-b-2 border-brand-yellow/50 text-brand-dark not-italic">
                            ...
                        </span>
                        {suffix}
                    </div>
                </div>
            </div>

            {/* Answer Area */}
            <div className="mb-8 min-h-[80px]">
                <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Form the sentence</p>

                <div className="flex flex-wrap gap-2 min-h-[60px] p-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 transition-colors">
                    <AnimatePresence>
                        {selectedWords.map((word) => (
                            <motion.button
                                key={word.id}
                                layoutId={`word-${word.id}`}
                                onClick={() => handleWordDeselect(word)}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="px-4 py-3 bg-white border-2 border-gray-200 shadow-[0_2px_0_0_rgba(229,231,235,1)] rounded-xl font-bold text-brand-dark hover:bg-gray-50 active:translate-y-[2px] active:shadow-none transition-all"
                            >
                                {word.word}
                            </motion.button>
                        ))}
                    </AnimatePresence>

                    {selectedWords.length === 0 && (
                        <div className="w-full flex items-center justify-center text-gray-400 italic text-sm">
                            Tap words below to build your answer
                        </div>
                    )}
                </div>
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
                <AnimatePresence>
                    {availableWords.map((word) => (
                        <motion.button
                            key={word.id}
                            layoutId={`word-${word.id}`}
                            onClick={() => handleWordSelect(word)}
                            className="px-4 py-3 bg-white border-2 border-gray-200 shadow-[0_2px_0_0_rgba(229,231,235,1)] rounded-xl font-bold text-brand-dark hover:bg-gray-50 active:translate-y-[2px] active:shadow-none transition-all"
                        >
                            {word.word}
                        </motion.button>
                    ))}
                    {availableWords.length === 0 && selectedWords.length > 0 && (
                        <div className="h-[52px]"></div> // Placeholder to prevent layout shift
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <motion.div
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                className="flex items-center justify-between"
            >
                {/* Status Message */}
                <div className="flex-1">
                    {checkStatus === 'incorrect' && (
                        <div className="flex items-center gap-2 text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl inline-flex animate-pulse">
                            <X className="w-5 h-5" />
                            <span>Try again!</span>
                        </div>
                    )}
                    {checkStatus === 'correct' && (
                        <div className="flex items-center gap-2 text-green-500 font-bold bg-green-50 px-4 py-2 rounded-xl inline-flex">
                            <Check className="w-5 h-5" />
                            <span>Perfect!</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {selectedWords.length > 0 && checkStatus !== 'correct' && (
                        <button
                            onClick={() => {
                                setAvailableWords(prev => [...prev, ...selectedWords].sort((a, b) => a.id - b.id)); // Simple reset, or preserve shuffle? 
                                // Actually, better to just put them back. For simplicity, just reset like useEffect
                                // But keeping IDs is safer.
                                setSelectedWords([]);
                                // Need to restore to available.
                                // The handleWordDeselect logic does one by one.
                                // Let's simplify: reset all
                                const all = [...availableWords, ...selectedWords].sort((a, b) => Math.random() - 0.5);
                                setAvailableWords(all);
                                setCheckStatus('idle');
                            }}
                            className="p-4 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-brand-dark transition-colors"
                            title="Reset"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </button>
                    )}

                    <button
                        onClick={handleCheck}
                        disabled={selectedWords.length === 0 || loading || checkStatus === 'correct'}
                        className={`
                            px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all
                            ${checkStatus === 'correct'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : selectedWords.length === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-brand-yellow text-brand-dark shadow-[0_4px_0_0_#e5bb20] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e5bb20]'
                            }
                        `}
                    >
                        {loading ? (
                            <span>Checking...</span>
                        ) : checkStatus === 'correct' ? (
                            <>
                                <Check className="w-6 h-6" />
                                <span>Correct!</span>
                            </>
                        ) : (
                            <>
                                <span>Check Answer</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
