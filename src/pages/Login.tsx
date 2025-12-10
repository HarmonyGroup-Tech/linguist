import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Feather, Loader } from 'lucide-react';

export default function Login() {
    const [searchParams] = useSearchParams();
    const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
    const [role, setRole] = useState<'learner' | 'client'>((searchParams.get('role') as 'client') || 'learner');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
                    createdAt: new Date()
                });
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent/20 blur-[120px] rounded-full" />

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4 backdrop-blur-sm">
                        <Feather className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isSignup ? 'Create an Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-slate-400">
                        {isSignup ? 'Start your journey with Linguist' : 'Sign in to continue'}
                    </p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {isSignup && (
                            <div className="flex p-1 bg-slate-900/50 rounded-xl mb-6">
                                <button
                                    type="button"
                                    onClick={() => setRole('learner')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'learner' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Learner
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('client')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'client' ? 'bg-accent text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Publisher
                                </button>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : (isSignup ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
