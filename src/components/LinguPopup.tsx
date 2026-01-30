import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, XCircle, AlertTriangle } from 'lucide-react';
import LinguMascot from './LinguMascot';

interface LinguPopupProps {
    title?: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LinguPopup({
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    onClose,
    onConfirm
}: LinguPopupProps) {

    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle2,
                    color: 'text-green-500',
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    border: 'border-green-100 dark:border-green-800/50',
                    mascot: 'bounce' as const
                };
            case 'error':
                return {
                    icon: XCircle,
                    color: 'text-red-500',
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-100 dark:border-red-800/50',
                    mascot: 'wave' as const
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    color: 'text-orange-500',
                    bg: 'bg-orange-50 dark:bg-orange-900/20',
                    border: 'border-orange-100 dark:border-orange-800/50',
                    mascot: 'wave' as const
                };
            case 'confirm':
                return {
                    icon: AlertCircle,
                    color: 'text-blue-500',
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-100 dark:border-blue-800/50',
                    mascot: 'bounce' as const
                };
            default:
                return {
                    icon: Info,
                    color: 'text-blue-500',
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-100 dark:border-blue-800/50',
                    mascot: 'bounce' as const
                };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 relative"
            >
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="mb-6">
                        <LinguMascot size="md" animation={config.mascot} />
                    </div>

                    <div className={`w-12 h-12 ${config.bg} rounded-2xl flex items-center justify-center mb-4 border ${config.border}`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>

                    {title && (
                        <h3 className="text-xl font-black text-brand-dark dark:text-white mb-2">
                            {title}
                        </h3>
                    )}

                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="px-8 pb-8 flex gap-3">
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-100 dark:border-gray-600"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-2 py-4 bg-brand-dark text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10"
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-4 ${type === 'error' ? 'bg-red-500 shadow-red-500/20' : 'bg-brand-yellow text-brand-dark shadow-brand-yellow/30'} rounded-2xl font-black transition-all shadow-lg active:scale-95`}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
