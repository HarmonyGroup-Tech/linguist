import React, { useState } from 'react';
import GooglePayButton from '@google-pay/button-react';
import { motion } from 'framer-motion';
import { X, Zap, Loader } from 'lucide-react';
import { PaymentService } from '../services/paymentService';
import { UserProgressService } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { usePopup } from '../contexts/PopupContext';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AMOUNTS = [10, 25, 50, 100];

export default function TopUpModal({ isOpen, onClose, onSuccess }: TopUpModalProps) {
    const { currentUser } = useAuth();
    const { showAlert } = usePopup();
    const [selectedAmount, setSelectedAmount] = useState<number>(AMOUNTS[0]);
    const [isVerifying, setIsVerifying] = useState(false);

    if (!isOpen) return null;

    const handlePaymentDataLoad = async (paymentData: any) => {
        if (!currentUser) return;

        setIsVerifying(true);
        try {
            const result = await PaymentService.verifyTransaction(paymentData);
            if (result.success) {
                await UserProgressService.incrementBalance(currentUser.uid, selectedAmount);
                showAlert(`Successfully topped up $${selectedAmount}!`, "success");
                onSuccess();
                onClose();
            } else {
                showAlert("Payment verification failed. Please try again.", "error");
            }
        } catch (error) {
            console.error("Top-up error:", error);
            showAlert("An error occurred during payment. Please try again.", "error");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md overflow-hidden relative shadow-2xl"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-brand-dark" />
                        </div>
                        <h2 className="text-2xl font-black text-brand-dark dark:text-white">Top-up Balance</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="space-y-4">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Select Amount</label>
                        <div className="grid grid-cols-2 gap-4">
                            {AMOUNTS.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setSelectedAmount(amount)}
                                    className={`py-4 rounded-2xl font-black text-lg transition-all border-2 ${selectedAmount === amount
                                            ? 'bg-brand-dark dark:bg-brand-yellow text-white dark:text-brand-dark border-brand-dark dark:border-brand-yellow shadow-lg shadow-brand-dark/10'
                                            : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                                        }`}
                                >
                                    ${amount}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col items-center gap-6">
                        {isVerifying ? (
                            <div className="flex flex-col items-center gap-4 text-brand-dark dark:text-gray-300">
                                <Loader className="w-8 h-8 animate-spin" />
                                <p className="font-bold">Verifying Payment...</p>
                            </div>
                        ) : (
                            <div className="w-full">
                                <GooglePayButton
                                    environment="TEST"
                                    buttonColor="black"
                                    buttonType="buy"
                                    buttonSizeMode="fill"
                                    paymentRequest={PaymentService.getGooglePayConfig(selectedAmount.toString())}
                                    onLoadPaymentData={handlePaymentDataLoad}
                                    className="w-full h-[52px]"
                                />
                                <p className="text-[10px] text-center text-gray-400 mt-4 font-bold uppercase tracking-tight">
                                    Secure transaction powered by Google
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-yellow opacity-5 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl pointer-events-none" />
            </motion.div>
        </div>
    );
}
