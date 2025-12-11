import React, { useState } from 'react';
import { ProjectService } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, FileText, Feather, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientDashboard() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'projects' | 'upload'>('projects');

    const [projects, setProjects] = useState<any[]>([]);

    const refreshProjects = React.useCallback(() => {
        if (currentUser) {
            ProjectService.getMyProjects(currentUser.uid)
                .then(data => setProjects(data))
                .catch(console.error);
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
        <div className="min-h-screen bg-brand-gray text-brand-dark font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center">
                            <Feather className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-bold text-brand-dark tracking-tight">
                            Linguist <span className="text-gray-400 font-medium ml-2">Publisher Console</span>
                        </h1>
                    </div>
                    <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-brand-dark">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="py-12 px-6 max-w-7xl mx-auto">
                <div className="flex gap-8 mb-10 border-b border-gray-200 pb-1">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`pb-4 px-2 text-sm font-bold transition-colors relative ${activeTab === 'projects' ? 'text-brand-dark' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        My Projects
                        {activeTab === 'projects' && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-dark" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`pb-4 px-2 text-sm font-bold transition-colors relative ${activeTab === 'upload' ? 'text-brand-dark' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Upload Content
                        {activeTab === 'upload' && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-dark" />
                        )}
                    </button>
                </div>

                {activeTab === 'projects' && (
                    <div className="grid gap-6">
                        {projects.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <LayoutGrid className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-brand-dark">No projects yet</h3>
                                <p className="text-gray-400 mb-6">Upload your first text to start translating.</p>
                                <button onClick={() => setActiveTab('upload')} className="px-6 py-2 bg-brand-yellow text-brand-dark font-bold rounded-xl shadow-lg shadow-brand-yellow/20 hover:shadow-xl transition-all">
                                    Create Project
                                </button>
                            </div>
                        )}
                        {projects.map(project => (
                            <div key={project.id} className="p-8 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-brand-yellow/10 flex items-center justify-center text-brand-dark/80">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-brand-dark mb-1">{project.title}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{project.author}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Progress</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-yellow" style={{ width: `${project.progress}%` }} />
                                            </div>
                                            <span className="text-sm font-bold text-brand-dark">{project.progress}%</span>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${project.status === 'Review' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {project.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'upload' && (
                    <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50">
                        <h2 className="text-2xl font-bold mb-8 text-brand-dark">Upload New Work</h2>
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
                                refreshProjects();
                                form.reset();
                            }
                        }}>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-brand-dark mb-2 ml-1">Title</label>
                                    <input name="title" required className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all font-medium" placeholder="e.g. The Hobbit" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-dark mb-2 ml-1">Author</label>
                                    <input name="author" required className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all font-medium" placeholder="e.g. J.R.R. Tolkien" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-brand-dark mb-2 ml-1">Source Text</label>
                                <div className="border-3 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-brand-dark/20 transition-all cursor-pointer group">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-brand-dark transition-colors" />
                                    </div>
                                    <p className="font-medium group-hover:text-brand-dark transition-colors">Drag and drop text file or click to browse</p>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-brand-dark text-white font-bold rounded-xl shadow-lg hover:bg-black transition-colors hover:shadow-xl transform hover:-translate-y-0.5 mt-4">
                                Start Translation Project
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
