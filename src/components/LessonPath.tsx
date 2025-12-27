import { motion } from 'framer-motion';
import { Lock, Check, Play, Star } from 'lucide-react';
import { Lesson, UserSkills, LessonService } from '../services/lessonService';

interface LessonPathProps {
    lessons: Lesson[];
    userSkills: UserSkills;
    onLessonSelect: (lesson: Lesson) => void;
}

export default function LessonPath({ lessons, userSkills, onLessonSelect }: LessonPathProps) {
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
                    ringColor: 'ring-green-200'
                };
            case 'available':
                return {
                    icon: Play,
                    bgColor: 'bg-brand-yellow',
                    borderColor: 'border-brand-yellow',
                    textColor: 'text-brand-dark',
                    hoverBg: 'hover:bg-yellow-400',
                    ringColor: 'ring-brand-yellow/30'
                };
            default: // locked
                return {
                    icon: Lock,
                    bgColor: 'bg-gray-200',
                    borderColor: 'border-gray-300',
                    textColor: 'text-gray-400',
                    hoverBg: 'hover:bg-gray-300',
                    ringColor: 'ring-gray-200'
                };
        }
    };

    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-brand-yellow fill-brand-yellow" />
                Your Learning Path
            </h3>

            <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
                {lessons.map((lesson, index) => {
                    const status = getLessonStatus(lesson);
                    const config = getStatusConfig(status);
                    const Icon = config.icon;
                    const isClickable = status === 'available' || status === 'completed';

                    return (
                        <div key={lesson.id} className="flex items-center gap-4">
                            {/* Connection Line */}
                            {index > 0 && (
                                <div className="absolute left-[30px] -mt-6 w-0.5 h-6 bg-gray-200" />
                            )}

                            {/* Lesson Node */}
                            <motion.button
                                whileHover={isClickable ? { scale: 1.05 } : {}}
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                                onClick={() => isClickable && onLessonSelect(lesson)}
                                disabled={!isClickable}
                                className={`
                                    relative flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all
                                    ${config.borderColor} ${config.bgColor} ${isClickable ? config.hoverBg : 'cursor-not-allowed'}
                                    ${status === 'available' ? 'ring-4 ' + config.ringColor + ' shadow-lg' : ''}
                                `}
                            >
                                {/* Icon Circle */}
                                <div className={`
                                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                                    ${status === 'completed' ? 'bg-white/20' : status === 'available' ? 'bg-white/30' : 'bg-white/50'}
                                `}>
                                    <Icon className={`w-6 h-6 ${config.textColor}`} />
                                </div>

                                {/* Lesson Info */}
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-bold ${config.textColor}`}>
                                            {lesson.title}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'locked' ? 'bg-white/50 text-gray-500' : 'bg-white/30 ' + config.textColor
                                            }`}>
                                            Level {lesson.level}
                                        </span>
                                    </div>

                                    {lesson.description && (
                                        <p className={`text-sm ${status === 'locked' ? 'text-gray-400' : config.textColor} opacity-90`}>
                                            {lesson.description}
                                        </p>
                                    )}

                                    {/* Prerequisites (for locked lessons) */}
                                    {status === 'locked' && (
                                        <div className="flex gap-1 mt-2">
                                            {lesson.requiredVocabulary > userSkills.vocabulary && (
                                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                                                    Need Vocab {lesson.requiredVocabulary}
                                                </span>
                                            )}
                                            {lesson.requiredGrammar > userSkills.grammar && (
                                                <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-semibold">
                                                    Need Grammar {lesson.requiredGrammar}
                                                </span>
                                            )}
                                            {lesson.requiredReading > userSkills.reading && (
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                                    Need Reading {lesson.requiredReading}
                                                </span>
                                            )}
                                            {lesson.requiredWriting > userSkills.writing && (
                                                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold">
                                                    Need Writing {lesson.requiredWriting}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Rewards (for available lessons) */}
                                    {status === 'available' && (
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-xs px-2 py-0.5 bg-white/40 text-brand-dark rounded-full font-bold">
                                                +{lesson.xpReward} XP
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Order Badge */}
                                <div className={`
                                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                                    ${status === 'locked' ? 'bg-white/50 text-gray-500' : 'bg-white/30 ' + config.textColor}
                                `}>
                                    {lesson.order}
                                </div>
                            </motion.button>
                        </div>
                    );
                })}
            </div>

            {lessons.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No lessons available yet</p>
                    <p className="text-sm text-gray-400 mt-1">Check back soon for new content!</p>
                </div>
            )}
        </div>
    );
}
