import { motion } from 'framer-motion';
import { Lock, Check, Play, Star, Sparkles } from 'lucide-react';
import { Lesson, UserSkills, LessonService } from '../services/lessonService';

interface LessonPathProps {
    lessons: Lesson[];
    userSkills: UserSkills;
    onLessonSelect: (lesson: Lesson) => void;
    lings?: number;
}

export default function LessonPath({ lessons, userSkills, onLessonSelect, lings = 25 }: LessonPathProps) {
    const getLessonStatus = (lesson: Lesson): 'completed' | 'available' | 'locked' => {
        if (userSkills.completedLessons.includes(lesson.id!)) {
            return 'completed';
        }

        if (LessonService.checkPrerequisites(userSkills, lesson)) {
            return 'available';
        }

        return 'locked';
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    icon: Check,
                    bgColor: 'bg-green-500',
                    borderColor: 'border-green-500',
                    textColor: 'text-white',
                    hoverBg: 'hover:bg-green-600',
                    shadow: 'shadow-green-100'
                };
            case 'available':
                return {
                    icon: Play,
                    bgColor: 'bg-brand-yellow',
                    borderColor: 'border-brand-yellow',
                    textColor: 'text-brand-dark',
                    hoverBg: 'hover:bg-yellow-400',
                    shadow: 'shadow-yellow-100'
                };
            default: // locked
                return {
                    icon: Lock,
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-400',
                    hoverBg: 'hover:bg-gray-200',
                    shadow: 'shadow-none'
                };
        }
    };

    return (
        <div className="relative">
            {/* Horizontal Scroll Container */}
            <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-8 pt-4 px-4 scrollbar-hide snap-x">
                {lessons.map((lesson, index) => {
                    const status = getLessonStatus(lesson);
                    const config = getStatusConfig(status);
                    const Icon = config.icon;
                    const isClickable = status === 'available' || status === 'completed';

                    return (
                        <div key={lesson.id} className="flex-shrink-0 flex items-center snap-center">
                            {/* Connection Line */}
                            {index > 0 && (
                                <div className={`w-8 md:w-12 h-1 ${status === 'locked' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-brand-yellow/30'}`} />
                            )}

                            {/* Lesson Node */}
                            <div className="flex flex-col items-center gap-3">
                                <motion.button
                                    whileHover={isClickable ? { scale: 1.1, y: -5 } : {}}
                                    whileTap={isClickable ? { scale: 0.9 } : {}}
                                    onClick={() => isClickable && onLessonSelect(lesson)}
                                    disabled={!isClickable}
                                    className={`
                                        w-16 h-16 rounded-3xl border-4 flex items-center justify-center transition-all shadow-lg
                                        ${config.borderColor} ${config.bgColor} ${config.shadow}
                                        ${status === 'available' ? 'ring-8 ring-brand-yellow/20 animate-pulse-slow' : ''}
                                        ${!isClickable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                    `}
                                >
                                    <Icon className={`w-7 h-7 ${config.textColor}`} strokeWidth={3} />
                                </motion.button>

                                <div className="text-center w-32">
                                    <p className={`text-xs font-bold truncate px-2 ${status === 'locked' ? 'text-gray-400' : 'text-brand-dark dark:text-gray-200'}`}>
                                        {lesson.title}
                                    </p>
                                    {lesson.isAiGenerated && (
                                        <div className="flex justify-center mt-1">
                                            <Sparkles className="w-3 h-3 text-brand-yellow" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {lessons.length === 0 && (
                    <div className="flex items-center justify-center w-full py-12 text-gray-400">
                        <Star className="w-5 h-5 mr-2" />
                        <span className="font-bold">Your journey begins here...</span>
                    </div>
                )}
            </div>

            {/* Fade Edges for scrolling */}
            <div className="absolute top-0 left-0 bottom-8 w-12 bg-gradient-to-r from-brand-gray/50 dark:from-gray-900/50 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-brand-gray/50 dark:from-gray-900/50 to-transparent pointer-events-none" />
        </div>
    );
}
