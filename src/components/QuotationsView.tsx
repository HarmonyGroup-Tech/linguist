import { motion } from 'framer-motion';
import { Quote, Check, Clock } from 'lucide-react';
import { Lesson } from '../services/lessonService';

interface QuotationsViewProps {
    lessons: Lesson[];
    onSelect: (lesson: Lesson) => void;
    completedLessonIds: string[];
}

export default function QuotationsView({ lessons, onSelect, completedLessonIds }: QuotationsViewProps) {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                        <Quote className="w-8 h-8 opacity-80" />
                        Daily Wisdom
                    </h2>
                    <p className="text-violet-100 max-w-lg text-lg">
                        Master the language through timeless wisdom. Translate famous quotes to earn bonus XP.
                    </p>
                </div>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {lessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.includes(lesson.id!);

                    return (
                        <motion.button
                            key={lesson.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(lesson)}
                            className={`
                                relative p-6 rounded-2xl text-left transition-all border-2
                                ${isCompleted
                                    ? 'bg-white border-green-100 hover:border-green-200'
                                    : 'bg-white border-gray-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100'
                                }
                            `}
                        >
                            {isCompleted && (
                                <div className="absolute top-4 right-4 text-green-500 bg-green-50 rounded-full p-1">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}

                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                                        {lesson.sourceTitle || "Unknown Source"}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                                        by {lesson.sourceAuthor || "Unknown Author"}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full font-bold">
                                            {lesson.level} / 10
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold">
                                            +{lesson.xpReward} XP
                                        </span>
                                    </div>
                                    {!isCompleted && (
                                        <span className="text-xs text-violet-600 font-bold flex items-center gap-1">
                                            Start <Clock className="w-3 h-3" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {lessons.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Quote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-500">No quotes available</h3>
                    <p className="text-gray-400">Check back later for new daily wisdom.</p>
                </div>
            )}
        </div>
    );
}
