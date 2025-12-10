import React, { useState } from 'react';
import { ProjectService } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientDashboard() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'projects' | 'upload'>('projects');

    const [projects, setProjects] = useState<any[]>([]);
    // const [loading, setLoading] = useState(true);

    const refreshProjects = React.useCallback(() => {
        if (currentUser) {
            ProjectService.getMyProjects(currentUser.uid)
                .then(data => setProjects(data))
                .catch(console.error);
            // .finally(() => setLoading(false));
        }
    }, [currentUser]);

    React.useEffect(() => {
        refreshProjects();
    }, [refreshProjects]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-pink-500">
                        Linguist <span className="text-slate-500 font-normal text-sm ml-2">Publisher Console</span>
                    </h1>
                    <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <LogOut className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </header>

            <main className="py-12 px-6 max-w-7xl mx-auto">
                <div className="flex gap-8 mb-10 border-b border-white/10 pb-1">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'projects' ? 'text-white' : 'text-slate-400'}`}
                    >
                        My Projects
                        {activeTab === 'projects' && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'upload' ? 'text-white' : 'text-slate-400'}`}
                    >
                        Upload Content
                        {activeTab === 'upload' && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                        )}
                    </button>
                </div>

                {activeTab === 'projects' && (
                    <div className="grid gap-6">
                        {projects.map(project => (
                            <div key={project.id} className="p-6 bg-slate-800/30 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{project.title}</h3>
                                        <p className="text-sm text-slate-400">{project.author}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-sm text-slate-400 mb-1">Progress</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-accent" style={{ width: `${project.progress}%` }} />
                                            </div>
                                            <span className="text-sm font-bold">{project.progress}%</span>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${project.status === 'Review' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                        {project.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'upload' && (
                    <div className="max-w-2xl mx-auto bg-slate-800/30 border border-white/5 rounded-3xl p-8">
                        <h2 className="text-2xl font-bold mb-6">Upload New Work</h2>
                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                            const author = (form.elements.namedItem('author') as HTMLInputElement).value;

                            if (currentUser && title && author) {
                                await ProjectService.addProject({
                                    title, author,
                                    ownerId: currentUser.uid,
                                    content: "Placeholder content",
                                    status: 'Draft',
                                    progress: 0
                                });
                                setActiveTab('projects');
                                // Refresh list
                                refreshProjects(); // Use the refresh function from the hook
                                form.reset(); // Clear the form
                            }
                        }}>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                                    <input name="title" required className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl" placeholder="e.g. The Hobbit" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Author</label>
                                    <input name="author" required className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl" placeholder="e.g. J.R.R. Tolkien" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Source Text</label>
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-900/30 hover:border-accent/30 transition-all cursor-pointer">
                                    <Upload className="w-8 h-8 mb-4" />
                                    <p>Drag and drop text file or click to browse</p>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-violet-600 transition-colors">
                                Start Translation Project
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
