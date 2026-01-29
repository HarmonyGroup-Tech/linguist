import React, { useState } from 'react';
import { ProjectService, UserProgressService, type Project } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Upload, Check, FileText, Feather, LayoutGrid, Settings, ArrowLeft, ChevronRight, Zap, Languages } from 'lucide-react';
import { SettingsService } from '../services/settingsService';
import MaintenancePage from './MaintenancePage';
import { motion, AnimatePresence } from 'framer-motion';
import { splitText, reassembleText } from '../services/ai';
import LinguMascot from '../components/LinguMascot';

export default function ClientDashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeTab, setActiveTab] = useState<'projects' | 'upload'>('projects');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReassembling, setIsReassembling] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [clientProfile, setClientProfile] = useState<any>(null);
    const [variety, setVariety] = useState(50); // Default 50% variety

    const refreshProjects = React.useCallback(() => {
        if (currentUser) {
            ProjectService.getMyProjects(currentUser.uid)
                .then(data => setProjects(data))
                .catch(console.error);
        }
    }, [currentUser]);

    const loadClientProfile = async () => {
        if (currentUser) {
            const profile = await UserProgressService.getUserProfile(currentUser.uid);
            setClientProfile(profile);
        }
    };

    React.useEffect(() => {
        checkMaintenance();
        refreshProjects();
        loadClientProfile();
    }, [refreshProjects, currentUser]);

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
        <div className="min-h-screen bg-brand-gray dark:bg-gray-900 text-brand-dark font-sans transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <LinguMascot size="sm" animation="bounce" />
                        <h1 className="hidden sm:block text-xl font-bold text-brand-dark dark:text-white tracking-tight">
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
                        {clientProfile && (
                            <div className="ml-4 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl border border-green-100 dark:border-green-900/40 flex items-center gap-2 shadow-sm">
                                <Zap className="w-4 h-4 fill-current" />
                                <span className="font-black text-sm">${(clientProfile.balance || 0).toFixed(2)}</span>
                            </div>
                        )}
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

                                    <button
                                        onClick={() => setSelectedProject(project)}
                                        className="flex items-center gap-2 text-sm font-bold text-brand-dark hover:translate-x-1 transition-transform group"
                                    >
                                        Review
                                        <ChevronRight className="w-5 h-5 text-brand-yellow" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Project Detail View Overlay */}
                <AnimatePresence>
                    {selectedProject && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="fixed inset-0 z-50 bg-brand-gray overflow-y-auto"
                        >
                            <div className="max-w-7xl mx-auto px-6 py-12">
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="flex items-center gap-2 text-gray-500 hover:text-brand-dark font-bold mb-8 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back to Projects
                                </button>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Left Panel: Segments */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h2 className="text-3xl font-bold text-brand-dark">{selectedProject.title}</h2>
                                                    <p className="text-gray-400 font-medium">Project ID: {selectedProject.id}</p>
                                                </div>
                                                <div className="px-4 py-2 bg-brand-yellow/10 text-brand-dark rounded-xl text-xs font-black border border-brand-yellow/20">
                                                    {selectedProject.status}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 px-4 py-2 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">
                                                    <div>Source Text ({selectedProject.sourceLanguage})</div>
                                                    <div>Translation (English)</div>
                                                </div>
                                                {(selectedProject.segments || []).map((s, idx) => (
                                                    <div key={idx} className="grid grid-cols-2 gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                        <div className="text-sm text-brand-dark/80 font-medium leading-relaxed">
                                                            {s.original}
                                                        </div>
                                                        <div className="space-y-2">
                                                            {s.translations && s.translations.length > 0 ? (
                                                                s.translations.map((t, tIdx) => (
                                                                    <div key={tIdx} className="text-sm text-blue-600 font-bold leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-50 relative group/trans">
                                                                        {t.content}
                                                                        <div className="text-[10px] text-blue-400 mt-1 flex justify-between items-center">
                                                                            <span>By {t.userName || 'Learner'}</span>
                                                                            <span className="opacity-0 group-hover/trans:opacity-100 transition-opacity">
                                                                                {t.timestamp?.toDate ? t.timestamp.toDate().toLocaleDateString() :
                                                                                    t.timestamp instanceof Date ? t.timestamp.toLocaleDateString() : 'Just now'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-sm text-blue-600 font-bold leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-50">
                                                                    {s.translated || <span className="text-gray-300 italic">Pending...</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Panel: AI Reassembly */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-24">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center">
                                                    <Zap className="w-6 h-6 text-brand-yellow" />
                                                </div>
                                                <h3 className="font-black text-xl text-brand-dark">AI Reassembly</h3>
                                            </div>

                                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                                Combine multiple user translations into a single, cohesive document polished by AI.
                                            </p>

                                            <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 min-h-[200px]">
                                                {selectedProject.finalTranslation ? (
                                                    <p className="text-sm text-brand-dark leading-relaxed whitespace-pre-wrap">
                                                        {selectedProject.finalTranslation}
                                                    </p>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                                                        <Languages className="w-12 h-12 opacity-20" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">No Polished Version Yet</p>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                disabled={isReassembling || selectedProject.progress < 100}
                                                onClick={async () => {
                                                    if (!selectedProject.id || !selectedProject.segments) return;
                                                    setIsReassembling(true);
                                                    try {
                                                        const translatedSegments = selectedProject.segments
                                                            .map(s => s.translated)
                                                            .filter(t => !!t);

                                                        const cohesive = await reassembleText(translatedSegments);
                                                        await ProjectService.updateFinalTranslation(selectedProject.id, cohesive);

                                                        // Update local state
                                                        setSelectedProject({
                                                            ...selectedProject,
                                                            finalTranslation: cohesive
                                                        });
                                                        refreshProjects();
                                                    } catch (e) {
                                                        alert("Failed to reassemble text. Try again.");
                                                    } finally {
                                                        setIsReassembling(false);
                                                    }
                                                }}
                                                className={`w-full py-4 rounded-xl font-black transition-all flex items-center justify-center gap-3 ${isReassembling || selectedProject.progress < 100
                                                    ? 'bg-gray-100 text-gray-400'
                                                    : 'bg-brand-dark text-white hover:bg-black hover:shadow-xl hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {isReassembling ? (
                                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Zap className="w-5 h-5 fill-current" />
                                                        Assemble Polished Text
                                                    </>
                                                )}
                                            </button>

                                            {selectedProject.progress < 100 && (
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-4 text-center tracking-tighter">
                                                    Polishing available at 100% completion
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                const targetTranslators = Math.floor(variety / 25) + 1;
                                const totalCost = (fileContent.length / 100) * 0.03 * targetTranslators;

                                await ProjectService.addProject({
                                    title, author,
                                    ownerId: currentUser.uid,
                                    content: fileContent.substring(0, 200) + "...", // Preview
                                    originalContent: fileContent,
                                    sourceLanguage: sourceLang,
                                    targetLanguage: "English",
                                    segments,
                                    status: 'Draft',
                                    progress: 0,
                                    varietyPercentage: variety,
                                    targetTranslators,
                                    totalCost
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

                            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-black text-brand-dark uppercase tracking-widest">Translation Variety</label>
                                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                        {Math.floor(variety / 25) + 1} Translators
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="25"
                                    value={variety}
                                    onChange={(e) => setVariety(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-dark"
                                />
                                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                                    <span>Single Voice</span>
                                    <span>Diverse Perspectives</span>
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

                            <div className="bg-brand-gray/50 rounded-2xl p-6 flex items-center justify-between border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Cost</p>
                                    <p className="text-2xl font-black text-brand-dark">
                                        ${((fileContent?.length || 0) / 100 * 0.03 * (Math.floor(variety / 25) + 1)).toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Balance</p>
                                    <p className={`text-lg font-bold ${clientProfile?.balance < ((fileContent?.length || 0) / 100 * 0.03 * (Math.floor(variety / 25) + 1)) ? 'text-red-500' : 'text-green-600'}`}>
                                        ${(clientProfile?.balance || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <button
                                disabled={isProcessing || !fileContent || (clientProfile?.balance < ((fileContent?.length || 0) / 100 * 0.03 * (Math.floor(variety / 25) + 1)))}
                                className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 mt-4 flex items-center justify-center gap-3 ${isProcessing || !fileContent || (clientProfile?.balance < ((fileContent?.length || 0) / 100 * 0.03 * (Math.floor(variety / 25) + 1))) ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed' : 'bg-brand-dark text-white hover:bg-black hover:shadow-xl'}`}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-brand-dark rounded-full animate-spin" />
                                        Processing Text with AI...
                                    </>
                                ) : (
                                    (clientProfile?.balance < ((fileContent?.length || 0) / 100 * 0.03 * (Math.floor(variety / 25) + 1)))
                                        ? 'Insufficient Balance'
                                        : 'Start Translation Project'
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
