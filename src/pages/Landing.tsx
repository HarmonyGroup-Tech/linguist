import { Link } from 'react-router-dom';
import { BookOpen, Globe, Feather, ArrowRight } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Feather className="w-6 h-6 text-primary" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            Linguist
                        </span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                            Sign In
                        </Link>
                        <Link
                            to="/login?mode=signup"
                            className="px-4 py-2 text-sm font-medium bg-primary hover:bg-blue-600 transition-colors rounded-full"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full -z-10" />

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                        The Authentic <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-pink-500">
                            Language Coach
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Master languages through copyright-verified authentic literature.
                        Help translate the world's best stories while you learn.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link to="/login?mode=signup" className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-transform hover:scale-105 flex items-center gap-2">
                            Start Learning <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/login?role=client" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-full font-bold hover:bg-white/20 transition-all">
                            For Publishers
                        </Link>
                    </div>
                </div>

                {/* Features Split */}
                <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-2 gap-12">
                    <div className="p-8 rounded-3xl bg-slate-800/50 border border-white/5 hover:border-sidebar-primary/50 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">For Learners</h3>
                        <ul className="space-y-3 text-slate-400">
                            <li>• Learn from real books, not generic phrases</li>
                            <li>• Context-rich lessons powered by AI</li>
                            <li>• Earn access to full localized content</li>
                        </ul>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-800/50 border border-white/5 hover:border-accent/50 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">For Publishers</h3>
                        <ul className="space-y-3 text-slate-400">
                            <li>• Crowdsourced, high-quality translation</li>
                            <li>• Verify with community voting</li>
                            <li>• Reach global audiences faster</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
