import { motion } from 'framer-motion';
import { Wrench, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MaintenancePageProps {
    message?: string;
}

export default function MaintenancePage({ message }: MaintenancePageProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                {/* Maintenance Icon */}
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-brand-yellow rounded-3xl shadow-2xl shadow-brand-yellow/30 mb-6"
                    >
                        <Wrench className="w-12 h-12 text-brand-dark" />
                    </motion.div>
                </div>

                {/* Message Card */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-700">
                    <div className="text-center space-y-6">
                        <h1 className="text-3xl md:text-4xl font-black text-brand-dark dark:text-white leading-tight">
                            Under Maintenance
                        </h1>

                        <div className="max-w-md mx-auto space-y-4">
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                {message || "We're currently performing system maintenance to make Linguist even better."}
                            </p>

                            <div className="p-4 bg-brand-yellow/10 dark:bg-brand-yellow/5 rounded-2xl border border-brand-yellow/20">
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-bold">
                                    ⏱️ We'll be back online shortly. Thank you for your patience!
                                </p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-dark dark:bg-white text-white dark:text-brand-dark rounded-2xl font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                <Home className="w-5 h-5" />
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-600 font-medium">
                    If you have urgent concerns, please contact support at{' '}
                    <a href="mailto:ege.guler@harmonygroup.digital" className="text-brand-dark dark:text-brand-yellow hover:underline font-bold">
                        ege.guler@harmonygroup.digital
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
