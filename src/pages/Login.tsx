import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Feather, Loader, Mail, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LinguMascot from '../components/LinguMascot';
import { EmailService } from '../services/emailService';

export default function Login() {
    const [searchParams] = useSearchParams();
    const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
    const [role, setRole] = useState<'learner' | 'client'>((searchParams.get('role') as 'client') || 'learner');
    const [language, setLanguage] = useState('German'); // Default language
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [logoClicks, setLogoClicks] = useState(0);
    const { currentUser, isEmailVerified, refreshUser, sendVerification, bypassVerification } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                // Create user document with role
                await setDoc(doc(db, "users", cred.user.uid), {
                    email,
                    role,
                    learningLanguage: role === 'learner' ? language : null,
                    createdAt: new Date()
                });
                await sendEmailVerification(cred.user);
                await EmailService.sendProfessionalVerification(email);
                setVerificationSent(true);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            // ProtectedRoute will handle redirect based on role
            navigate(role === 'client' ? '/client' : '/learn');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to authenticate');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoClick = () => {
        /* Developer cheat code disabled for launch
        const next = logoClicks + 1;
        setLogoClicks(next);
        if (next >= 5) {
            bypassVerification();
            setLogoClicks(0);
        }
        */
    };

    // If logged in but not verified, show verification screen
    if (currentUser && !isEmailVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-gray relative overflow-hidden font-sans">
                {/* Background Decor */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-yellow/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-blob blur-[100px] rounded-full" />

                <div className="w-full max-w-md p-6 relative z-10 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <button
                            onClick={handleLogoClick}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-yellow mb-8 shadow-xl shadow-brand-yellow/30 hover:rotate-12 transition-transform relative group"
                        >
                            <Mail className="w-10 h-10 text-brand-dark" strokeWidth={2.5} />
                        </button>
                        <h2 className="text-4xl font-black text-brand-dark mb-4 tracking-tight">Verify Email</h2>
                        <p className="text-gray-500 font-medium leading-relaxed px-4">
                            We've sent a magic link to <span className="text-brand-dark font-bold">{currentUser.email}</span>. Click it to start your journey!
                        </p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100 space-y-6">
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => refreshUser()}
                                className="w-full py-5 bg-brand-dark text-white font-black rounded-2xl shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <CheckCircle2 className="w-6 h-6 text-brand-yellow" />
                                I've verified my email
                            </button>

                            <button
                                onClick={async () => {
                                    await sendVerification();
                                    setVerificationSent(true);
                                }}
                                disabled={verificationSent}
                                className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
                            >
                                {verificationSent ? "Email Sent!" : "Resend Link"}
                                {!verificationSent && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>

                        <div className="pt-4 text-center">
                            <button
                                onClick={() => auth.signOut()}
                                className="text-sm font-bold text-gray-400 hover:text-brand-dark transition-colors"
                            >
                                Use a different email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-gray relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-yellow/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-blob blur-[100px] rounded-full" />

            <div className="w-full max-w-md p-6 relative z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block hover:scale-110 transition-transform">
                        <LinguMascot size="lg" animation="bounce" />
                    </Link>
                    <h2 className="text-3xl font-bold text-brand-dark mb-2 tracking-tight">
                        {isSignup ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-base text-gray-500 font-medium">
                        {isSignup ? 'Start your journey with Linguist' : 'Sign in to continue learning'}
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        {isSignup && (
                            <>
                                <div className="flex p-1.5 bg-gray-50 border border-gray-200 rounded-2xl mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setRole('learner')}
                                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === 'learner' ? 'bg-white text-brand-dark shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        Learner
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('client')}
                                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === 'client' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        Publisher
                                    </button>
                                </div>

                                {role === 'learner' && (
                                    <div>
                                        <label className="block text-sm font-bold text-brand-dark mb-2 ml-1">I want to learn</label>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all font-medium appearance-none"
                                        >
                                            <option value="German">German</option>
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-brand-dark mb-2 ml-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all font-medium"
                                    placeholder="hello@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-brand-dark mb-2 ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-brand-yellow text-brand-dark font-bold rounded-2xl shadow-lg shadow-brand-yellow/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center text-lg mt-4"
                        >
                            {loading ? <Loader className="w-6 h-6 animate-spin" /> : (isSignup ? 'Create Account' : 'Sign In')}
                        </button>

                        {isSignup && (
                            <p className="text-[11px] text-center text-gray-400 font-medium px-4 leading-relaxed">
                                By creating an account, you agree to Linguist's{' '}
                                <Link to="/privacy" className="text-brand-dark hover:underline font-bold underline decoration-brand-yellow/30">
                                    Privacy Policy
                                </Link>
                            </p>
                        )}
                    </form>

                    <div className="mt-8 text-center bg-gray-50 rounded-xl py-4">
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-sm font-semibold text-gray-500 hover:text-brand-dark transition-colors"
                        >
                            {isSignup ? "Already have an account? " : "New to Linguist? "}
                            <span className="text-brand-dark underline decoration-brand-yellow decoration-2 underline-offset-2">
                                {isSignup ? 'Sign in' : 'Create account'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
