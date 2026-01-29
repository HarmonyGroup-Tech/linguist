import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Sparkles, Zap, Trophy, Map } from 'lucide-react';
import LinguMascot from './LinguMascot';

interface OnboardingStep {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
}

const steps: OnboardingStep[] = [
    {
        title: "Willkommen, Learner!",
        description: "I'm Lingu, your feathered guide to mastering German. Let's get you ready for your first linguistic flight!",
        icon: Sparkles,
        color: "brand-yellow"
    },
    {
        title: "Energy & Focus",
        description: "You have 10 Lings for daily practice. They refill every 4 hours. Use them to unlock new lessons on your path!",
        icon: Zap,
        color: "blue-500"
    },
    {
        title: "The Learning Path",
        description: "Follow the golden nodes! Each one is a unique lesson designed by AI to grow your vocabulary and grammar.",
        icon: Map,
        color: "green-500"
    },
    {
        title: "Consistency is Key",
        description: "Master a little bit every day to build your streak. Higher streaks earn you more XP and faster refills!",
        icon: Trophy,
        color: "orange-500"
    }
];

export default function LinguOnboarding({ onComplete }: { onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"
            >
                {/* Close Button */}
                <button
                    onClick={onComplete}
                    className="absolute top-8 right-8 p-2 text-gray-400 hover:text-brand-dark dark:hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Visual Side */}
                    <div className="bg-brand-gray dark:bg-gray-900/50 p-12 flex flex-col items-center justify-center relative md:w-5/12 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
                        <LinguMascot size="xl" animation={currentStep === 0 ? "wave" : "bounce"} />
                        <div className="mt-8 flex gap-2">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-brand-yellow' : 'w-2 bg-gray-200 dark:bg-gray-700'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="p-12 md:w-7/12 flex flex-col justify-between">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-${step.color}/10 flex items-center justify-center`}>
                                    <step.icon className={`w-8 h-8 text-${step.color}`} />
                                </div>
                                <h2 className="text-3xl font-black text-brand-dark dark:text-white leading-tight">
                                    {step.title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="pt-12 flex items-center justify-between">
                            <button
                                onClick={onComplete}
                                className="text-gray-400 font-bold hover:text-brand-dark dark:hover:text-white transition-colors"
                            >
                                Skip Tour
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-8 py-4 bg-brand-dark dark:bg-white dark:text-brand-dark text-white font-black rounded-2xl shadow-xl flex items-center gap-3 hover:translate-x-2 transition-all active:scale-95"
                            >
                                {currentStep === steps.length - 1 ? "Let's Go!" : "Next Step"}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
