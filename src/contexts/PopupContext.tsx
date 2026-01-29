import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import LinguPopup from '../components/LinguPopup';

interface PopupOptions {
    title?: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface PopupContextType {
    showAlert: (message: string, type?: 'info' | 'warning' | 'error' | 'success') => void;
    showConfirm: (message: string, onConfirm: () => void, options?: Partial<PopupOptions>) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
    const [popup, setPopup] = useState<PopupOptions | null>(null);

    const showAlert = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
        setPopup({ message, type });
    };

    const showConfirm = (message: string, onConfirm: () => void, options?: Partial<PopupOptions>) => {
        setPopup({
            message,
            type: 'confirm',
            onConfirm,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            ...options
        });
    };

    const handleClose = () => {
        if (popup?.onCancel) popup.onCancel();
        setPopup(null);
    };

    const handleConfirm = () => {
        if (popup?.onConfirm) popup.onConfirm();
        setPopup(null);
    };

    return (
        <PopupContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <AnimatePresence>
                {popup && (
                    <LinguPopup
                        {...popup}
                        onClose={handleClose}
                        onConfirm={handleConfirm}
                    />
                )}
            </AnimatePresence>
        </PopupContext.Provider>
    );
}

export function usePopup() {
    const context = useContext(PopupContext);
    if (!context) throw new Error('usePopup must be used within a PopupProvider');
    return context;
}
