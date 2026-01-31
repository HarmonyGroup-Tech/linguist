import { Link } from 'react-router-dom';
import { BookOpen, Globe, Feather, ArrowRight, Star } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-brand-gray dark:bg-gray-900 text-brand-dark dark:text-gray-100 font-sans selection:bg-brand-yellow selection:text-brand-dark transition-colors duration-300">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-brand-dark/5 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center transform hover:rotate-6 transition-transform">
                            <Feather className="w-6 h-6 text-brand-dark" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-bold text-brand-dark dark:text-white tracking-tight">
                            Linguist
                        </span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link to="/login" className="text-sm font-semibold text-brand-dark/70 dark:text-gray-400 hover:text-brand-dark dark:hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link
                            to="/login?mode=signup"
                            className="px-6 py-2.5 text-sm font-bold bg-brand-dark dark:bg-brand-yellow text-white dark:text-brand-dark hover:bg-black dark:hover:bg-white transition-all rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-40 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative">
                    {/* Background Blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-yellow/20 rounded-full blur-[100px] -z-10 animate-pulse" />
                    <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-brand-blob dark:bg-brand-yellow/10 rounded-full blur-[80px] -z-10" />

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-brand-dark/5 dark:border-white/5 shadow-sm mb-8 animate-fade-in-up">
                        <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                        <span className="text-sm font-medium text-brand-dark/60 dark:text-gray-400">The smartest way to learn languages</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-brand-dark dark:text-white">
                        Learn with <br />
                        <span className="relative inline-block">
                            <span className="relative z-10">Real Stories</span>
                            <span className="absolute bottom-2 left-0 w-full h-4 bg-brand-yellow/50 dark:bg-brand-yellow/30 -rotate-1 -z-0 rounded-full"></span>
                        </span>
                    </h1>
                    <p className="text-xl text-brand-dark/60 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Master languages through copyright-verified authentic literature.
                        Help translate the world's best stories while you learn.
                    </p>

                    <div className="flex justify-center gap-4 flex-col sm:flex-row">
                        <Link to="/login?mode=signup" className="px-8 py-4 bg-brand-yellow text-brand-dark rounded-2xl font-bold hover:bg-[#ffda66] hover:shadow-lg hover:shadow-brand-yellow/20 transition-all hover:scale-105 flex items-center justify-center gap-2 text-lg">
                            Start Learning Free <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/login?role=client" className="px-8 py-4 bg-white dark:bg-gray-800 text-brand-dark dark:text-white border border-brand-dark/10 dark:border-white/10 rounded-2xl font-bold hover:bg-brand-gray dark:hover:bg-gray-700 transition-all shadow-sm flex items-center justify-center">
                            I'm a Publisher
                        </Link>
                    </div>
                </div>

                {/* Features Split */}
                <div className="max-w-6xl mx-auto mt-32 grid md:grid-cols-2 gap-8">
                    {/* Learner Card */}
                    <div className="p-10 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-brand-dark/5 dark:border-white/5 shadow-xl shadow-brand-dark/5 hover:shadow-2xl hover:shadow-brand-yellow/10 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blob dark:bg-brand-yellow/5 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />

                        <div className="w-14 h-14 rounded-2xl bg-brand-yellow flex items-center justify-center mb-8 text-brand-dark group-hover:rotate-12 transition-transform shadow-lg shadow-brand-yellow/30">
                            <BookOpen className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-brand-dark dark:text-white">For Learners</h3>
                        <p className="text-brand-dark/60 dark:text-gray-400 mb-8 text-lg">
                            Immerse yourself in authentic texts tailored to your level. Use AI to understand context, not just definitions.
                        </p>
                        <ul className="space-y-4 text-brand-dark/80 dark:text-gray-300 font-medium">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-yellow" /> Learner from real books
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-yellow" /> AI-powered context lessons
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-yellow" /> Earn full book access
                            </li>
                        </ul>
                    </div>

                    {/* Publisher Card */}
                    <div className="p-10 rounded-[2.5rem] bg-brand-dark dark:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden border border-transparent dark:border-white/5">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-yellow/10 rounded-tr-[100px] -ml-10 -mb-10 transition-transform group-hover:scale-150 duration-700" />

                        <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-brand-yellow/20 flex items-center justify-center mb-8 text-white group-hover:-rotate-12 transition-transform backdrop-blur-md">
                            <Globe className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-3xl font-bold mb-4">For Publishers</h3>
                        <p className="text-white/60 dark:text-gray-400 mb-8 text-lg">
                            Get your literary works translated by passionate learners and verified by the community.
                        </p>
                        <ul className="space-y-4 text-white/80 dark:text-gray-300 font-medium">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-yellow" /> High-quality localizations
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-yellow" /> Cost-effective crowdsourcing
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-yellow" /> Global audience reach
                            </li>
                        </ul>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-900 border-t border-brand-dark/5 dark:border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                            <Feather className="w-5 h-5 text-brand-dark" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold text-brand-dark dark:text-white-80">
                            Linguist
                        </span>
                    </div>

                    <div className="flex items-center gap-8 text-sm font-bold text-brand-dark/50 dark:text-gray-400">
                        <Link to="/support" className="hover:text-brand-dark dark:hover:text-white transition-colors">Support</Link>
                        <Link to="/privacy" className="hover:text-brand-dark dark:hover:text-white transition-colors">Privacy Policy</Link>
                        <span>&copy; {new Date().getFullYear()} Harmony Group Digital</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
