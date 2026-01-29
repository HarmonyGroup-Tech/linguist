import React from 'react';
import { motion } from 'framer-motion';

interface LinguMascotProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    animation?: 'wave' | 'bounce' | 'none';
}

export default function LinguMascot({ className = "", size = 'md', animation = 'bounce' }: LinguMascotProps) {
    const sizeMap = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
        xl: 'w-48 h-48',
    };

    const animations = {
        bounce: {
            y: [0, -10, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        wave: {
            rotate: [0, 15, -15, 15, 0],
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        none: {}
    };

    return (
        <motion.div
            className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}
            animate={animations[animation] as any}
        >
            <img
                src="/assets/branding/lingu.png"
                alt="Lingu Mascot"
                className="w-full h-full object-contain"
            />
            {/* Subtle glow behind the mascot */}
            <div className="absolute inset-0 bg-brand-yellow/20 blur-2xl -z-10 rounded-full scale-150" />
        </motion.div>
    );
}
