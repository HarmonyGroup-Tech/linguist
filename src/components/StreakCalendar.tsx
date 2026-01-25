import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakCalendarProps {
    streakHistory: string[]; // ['YYYY-MM-DD']
    onClose: () => void;
}

export default function StreakCalendar({ streakHistory, onClose }: StreakCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];

        // Padding for empty start days
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8 md:w-10 md:h-10" />);
        }

        const todayStr = new Date().toISOString().split('T')[0];

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isActive = streakHistory.includes(dateStr);
            const isToday = dateStr === todayStr;

            days.push(
                <div key={day} className="flex flex-col items-center justify-center">
                    <div
                        className={`
                            w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all relative
                            ${isActive
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : isToday
                                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-200'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        {day}
                        {isActive && (
                            <motion.div
                                layoutId="fire"
                                className="absolute -bottom-1 text-[10px]"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                🔥
                            </motion.div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-gray-100 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-brand-dark dark:text-white flex items-center gap-2">
                        <span className="text-orange-500">🔥</span> Streak History
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center justify-between mb-6 px-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="font-bold text-lg text-gray-800 dark:text-white">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-y-4 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-bold text-gray-400 uppercase">
                            {day}
                        </div>
                    ))}
                    {renderCalendarDays()}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Keep your streak alive by practicing every day!
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
