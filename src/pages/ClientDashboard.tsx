import React, { useState } from 'react';
import { ProjectService, type Project } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Upload, Check, FileText, Feather, LayoutGrid, Settings } from 'lucide-react';
import { SettingsService } from '../services/settingsService';
import MaintenancePage from './MaintenancePage';
import { motion } from 'framer-motion';
import { splitText } from '../services/ai';

export default function ClientDashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeTab, setActiveTab] = useState<'projects' | 'upload'>('projects');
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');

    const refreshProjects = React.useCallback(() => {
        if (currentUser) {
            ProjectService.getMyProjects(currentUser.uid)
                .then(data => setProjects(data))
                .catch(console.error);
        }
    }, [currentUser]);

    React.useEffect(() => {
        checkMaintenance();
        refreshProjects();
    }, [refreshProjects]);

    const checkMaintenance = async () => {
        try {
            const settings = await SettingsService.getSettings();
            setMaintenanceMode(settings.maintenanceMode);
            setMaintenanceMessage(settings.maintenanceMessage);
        } catch (e) {
            console.error('Error checking maintenance mode:', e);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Show maintenance page if maintenance mode is enabled
    if (maintenanceMode) {
        return <MaintenancePage message={maintenanceMessage} />;
    }

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
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-brand-dark"
                            title="Privacy & Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-brand-dark" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
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
                            if (!currentUser) return;

                            const form = e.target as HTMLFormElement;
                            const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                            const author = (form.elements.namedItem('author') as HTMLInputElement).value;
                            const sourceLang = (form.elements.namedItem('sourceLang') as HTMLSelectElement).value;

                            if (!title || !author || !sourceLang) {
                                alert("Please fill in all fields.");
                                return;
                            }

                            if (!fileContent) {
                                alert("Please upload a text file.");
                                return;
                            }

                            setIsProcessing(true);
                            try {
                                // 1. AI Split
                                const segmentsRaw = await splitText(fileContent);
                                const segments = segmentsRaw.map(s => ({
                                    id: crypto.randomUUID(),
                                    original: s,
                                    translated: "",
                                    status: 'pending' as const
                                }));

                                // 2. Create Project
                                await ProjectService.addProject({
                                    title, author,
                                    ownerId: currentUser.uid,
                                    content: fileContent.substring(0, 200) + "...", // Preview
                                    originalContent: fileContent,
                                    sourceLanguage: sourceLang,
                                    targetLanguage: "English",
                                    segments,
                                    status: 'Draft',
                                    progress: 0
                                });

                                setActiveTab('projects');
                                refreshProjects();
                                form.reset();
                                setFileContent(null);
                            } catch (error) {
                                console.error("Upload failed", error);
                                alert("Failed to process file. Please try again.");
                            } finally {
                                setIsProcessing(false);
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
                                <label className="block text-sm font-bold text-brand-dark mb-2 ml-1">Source Language</label>
                                <div className="relative">
                                    <select name="sourceLang" required className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent appearance-none font-medium cursor-pointer">
                                        <option value="" disabled selected>Select Language</option>
                                        <option value="German">German</option>
                                        <option value="French">French</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Portuguese">Portuguese</option>
                                        <option value="Russian">Russian</option>
                                        <option value="Japanese">Japanese</option>
                                        <option value="Chinese">Chinese</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <Feather className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-brand-dark mb-2 ml-1">Source Text (.txt)</label>
                                <div
                                    className={`border-3 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer group ${fileContent ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-200 hover:bg-gray-50 hover:border-brand-dark/20'}`}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file && file.type === "text/plain") {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => setFileContent(ev.target?.result as string);
                                            reader.readAsText(file);
                                        } else {
                                            alert("Please upload a .txt file");
                                        }
                                    }}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        accept=".txt"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => setFileContent(ev.target?.result as string);
                                                reader.readAsText(file);
                                            }
                                        }}
                                    />
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${fileContent ? 'bg-brand-yellow text-brand-dark' : 'bg-gray-50 text-gray-400 group-hover:scale-110'}`}>
                                        {fileContent ? <Check className="w-8 h-8" /> : <Upload className="w-8 h-8 group-hover:text-brand-dark" />}
                                    </div>
                                    <p className={`font-medium transition-colors ${fileContent ? 'text-brand-dark' : 'text-gray-400 group-hover:text-brand-dark'}`}>
                                        {fileContent ? 'File ready to process' : 'Drag and drop text file or click to browse'}
                                    </p>
                                </div>
                            </div>

                            <button
                                disabled={isProcessing}
                                className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 mt-4 flex items-center justify-center gap-3 ${isProcessing ? 'bg-gray-100 text-gray-400 shadow-none cursor-wait' : 'bg-brand-dark text-white hover:bg-black hover:shadow-xl'}`}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-brand-dark rounded-full animate-spin" />
                                        Processing Text with AI...
                                    </>
                                ) : (
                                    'Start Translation Project'
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
