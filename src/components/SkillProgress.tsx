import { motion } from 'framer-motion';
import { BookOpen, MessageSquare, FileText, PenTool } from 'lucide-react';

interface SkillProgressProps {
    vocabulary: number;
    grammar: number;
    reading: number;
    writing: number;
}

const skillConfig = [
    {
        key: 'vocabulary',
        label: 'Vocabulary',
        icon: BookOpen,
        color: '#FF6B6B',
        bgColor: 'bg-red-50'
    },
    {
        key: 'grammar',
        label: 'Grammar',
        icon: MessageSquare,
        color: '#4ECDC4',
        bgColor: 'bg-teal-50'
    },
    {
        key: 'reading',
        label: 'Reading',
        icon: FileText,
        color: '#45B7D1',
        bgColor: 'bg-blue-50'
    },
    {
        key: 'writing',
        label: 'Writing',
        icon: PenTool,
        color: '#FFA07A',
        bgColor: 'bg-orange-50'
    }
];

export default function SkillProgress({ vocabulary, grammar, reading, writing }: SkillProgressProps) {
    const skills = {
        vocabulary,
        grammar,
        reading,
        writing
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skillConfig.map(({ key, label, icon: Icon, color, bgColor }) => {
                const value = skills[key as keyof typeof skills];

                return (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
                                <Icon className="w-6 h-6" style={{ color }} />
                            </div>
                            <span className="text-3xl font-bold" style={{ color }}>
                                {value}
                            </span>
                        </div>

                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-gray-600">{label}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${value}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 font-medium">
                            Level {value}/100
                        </p>
                    </motion.div>
                );
            })}
        </div>
    );
}
