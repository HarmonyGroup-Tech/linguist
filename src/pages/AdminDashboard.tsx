import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LessonService, type Lesson } from '../services/lessonService';
import LessonEditor from '../components/LessonEditor';
import { useTheme } from '../contexts/ThemeContext';
import { usePopup } from '../contexts/PopupContext';
import { AdminService, type ClientProfile } from '../services/adminService';
import { SettingsService } from '../services/settingsService';
import { parseCSV } from '../utils/csvParser';
import { LogOut, Plus, Edit2, Trash2, Check, Feather, BookOpen, TrendingUp, Upload, Moon, Sun, Settings, Users, DollarSign, Wallet, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
    const { logout, currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { showAlert, showConfirm } = usePopup();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all');
    const [uploadResult, setUploadResult] = useState<{ success: number, errors: string[] } | null>(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'lessons' | 'clients'>('lessons');
    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
    const [loadAmount, setLoadAmount] = useState<string>('');

    useEffect(() => {
        loadLessons();
        loadMaintenanceSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'clients') {
            loadClients();
        }
    }, [activeTab]);

    const loadClients = async () => {
        setLoadingClients(true);
        try {
            const data = await AdminService.getClients();
            setClients(data);
        } catch (e) {
            console.error('Error loading clients:', e);
            showAlert('Failed to load client list', 'error');
        } finally {
            setLoadingClients(false);
        }
    };

    const loadLessons = async () => {
        setLoading(true);
        const data = await LessonService.getAllLessons();
        setLessons(data);
        setLoading(false);
    };

    const loadMaintenanceSettings = async () => {
        try {
            const settings = await SettingsService.getSettings();
            setMaintenanceMode(settings.maintenanceMode);
            setMaintenanceMessage(settings.maintenanceMessage || '');
        } catch (e) {
            console.error('Error loading maintenance settings:', e);
        }
    };

    const toggleMaintenanceMode = async () => {
        try {
            const newMode = !maintenanceMode;
            await SettingsService.setMaintenanceMode(newMode, maintenanceMessage);
            setMaintenanceMode(newMode);
            showAlert(newMode ? '🔧 Maintenance mode ENABLED. All dashboards are now blocked.' : '✅ Maintenance mode DISABLED. System is accessible.', "success");
        } catch (e) {
            console.error('Error toggling maintenance mode:', e);
            showAlert('Failed to toggle maintenance mode', "error");
        }
    };

    const handleCreateLesson = async (lessonData: Omit<Lesson, 'id' | 'createdAt'>) => {
        await LessonService.createLesson(lessonData);
        await loadLessons();
        setShowEditor(false);
    };

    const handleUpdateLesson = async (lessonData: Omit<Lesson, 'id' | 'createdAt'>) => {
        if (editingLesson?.id) {
            await LessonService.updateLesson(editingLesson.id, lessonData);
            await loadLessons();
            setShowEditor(false);
            setEditingLesson(null);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        showConfirm('Are you sure you want to delete this lesson?', async () => {
            await LessonService.deleteLesson(lessonId);
            await loadLessons();
        }, { type: 'warning', confirmText: 'Delete' });
    };

    const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const csvText = e.target?.result as string;
            const { lessons, errors: parseErrors } = parseCSV(csvText, 'ADMIN');

            if (parseErrors.length > 0 && lessons.length === 0) {
                setUploadResult({ success: 0, errors: parseErrors });
                return;
            }

            const result = await LessonService.createLessonsFromCSV(lessons);
            setUploadResult({
                success: result.success,
                errors: [...parseErrors, ...result.errors]
            });
            await loadLessons();
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    };

    const handleToggleActive = async (lesson: Lesson) => {
        if (lesson.id) {
            await LessonService.updateLesson(lesson.id, { isActive: !lesson.isActive });
            await loadLessons();
        }
    };

    const handleEditClick = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setShowEditor(true);
    };

    const handleNewLesson = () => {
        setEditingLesson(null);
        setShowEditor(true);
    };

    const handleLoadBalance = async () => {
        if (!selectedClient || !loadAmount || isNaN(parseFloat(loadAmount))) return;

        try {
            const amount = parseFloat(loadAmount);
            await AdminService.addBalance(selectedClient.uid, amount);
            showAlert(`Successfully loaded $${amount.toFixed(2)} to ${selectedClient.email}`, 'success');
            setShowBalanceModal(false);
            setLoadAmount('');
            loadClients();
        } catch (e) {
            console.error('Error loading balance:', e);
            showAlert('Failed to update balance', 'error');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const filteredLessons = lessons.filter((lesson: Lesson) => {
        if (filter === 'active') return lesson.isActive;
        if (filter === 'draft') return !lesson.isActive;
        return true;
    });

    const stats = {
        total: lessons.length,
        active: lessons.filter((l: Lesson) => l.isActive).length,
        draft: lessons.filter((l: Lesson) => !l.isActive).length
    };

    return (
        <div className="min-h-screen bg-brand-gray text-brand-dark">
            {/* Header */}
            <header className="bg-brand-dark border-b border-gray-800 sticky top-0 z-40 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
                            <Feather className="w-6 h-6 text-brand-dark" strokeWidth={2.5} />
                        </div>
                        <h1 className="hidden sm:block text-xl font-bold text-white tracking-tight">
                            Linguist <span className="text-brand-yellow font-medium ml-2">Admin</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                            title="Privacy & Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="py-12 px-6 max-w-7xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('lessons')}
                        className={`pb-4 px-2 text-sm font-bold transition-colors relative flex items-center gap-2 ${activeTab === 'lessons' ? 'text-brand-yellow' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <BookOpen className="w-4 h-4" />
                        Lessons
                        {activeTab === 'lessons' && (
                            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-yellow" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`pb-4 px-2 text-sm font-bold transition-colors relative flex items-center gap-2 ${activeTab === 'clients' ? 'text-brand-yellow' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <Users className="w-4 h-4" />
                        Clients & Balances
                        {activeTab === 'clients' && (
                            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-yellow" />
                        )}
                    </button>
                </div>

                {activeTab === 'lessons' ? (
                    <>
                        {/* Maintenance Mode Control */}
                        <div className={`mb-8 p-6 rounded-2xl border-2 ${maintenanceMode ? 'bg-red-50 dark:bg-red-950/20 border-red-500' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className={`text-lg font-bold mb-2 ${maintenanceMode ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                        🔧 Maintenance Mode
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {maintenanceMode
                                            ? '⚠️ ACTIVE - All dashboards are currently blocked'
                                            : 'Block access to all dashboards (learner & client) for system maintenance'
                                        }
                                    </p>
                                    {maintenanceMode && (
                                        <div className="mt-3">
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Message shown to users:</label>
                                            <input
                                                type="text"
                                                value={maintenanceMessage}
                                                onChange={(e) => setMaintenanceMessage(e.target.value)}
                                                placeholder="We're performing system maintenance..."
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={toggleMaintenanceMode}
                                    className={`ml-6 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 ${maintenanceMode
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                        }`}
                                >
                                    {maintenanceMode ? '✅ Disable Maintenance' : '🔧 Enable Maintenance'}
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Lessons</p>
                                        <p className="text-4xl font-bold text-brand-dark mt-2">{stats.total}</p>
                                    </div>
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                        <BookOpen className="w-7 h-7 text-blue-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active</p>
                                        <p className="text-4xl font-bold text-green-600 mt-2">{stats.active}</p>
                                    </div>
                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                                        <Check className="w-7 h-7 text-green-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Drafts</p>
                                        <p className="text-4xl font-bold text-orange-600 mt-2">{stats.draft}</p>
                                    </div>
                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                                        <Edit2 className="w-7 h-7 text-orange-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${filter === 'all'
                                        ? 'bg-brand-dark text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    All ({stats.total})
                                </button>
                                <button
                                    onClick={() => setFilter('active')}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${filter === 'active'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Active ({stats.active})
                                </button>
                                <button
                                    onClick={() => setFilter('draft')}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${filter === 'draft'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Drafts ({stats.draft})
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCSVUpload}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label
                                    htmlFor="csv-upload"
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    Import CSV
                                </label>
                                <button
                                    onClick={() => {
                                        setEditingLesson(null);
                                        setShowEditor(true);
                                    }}
                                    className="px-6 py-3 bg-brand-yellow text-brand-dark rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    New Lesson
                                </button>
                            </div>
                        </div>

                        {/* Lessons Table */}
                        {loading ? (
                            <div className="flex justify-center py-24">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-brand-yellow"></div>
                            </div>
                        ) : filteredLessons.length === 0 ? (
                            <div className="bg-white rounded-2xl p-20 text-center border border-gray-100">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">
                                    {filter === 'all' ? 'No lessons yet' : `No ${filter} lessons`}
                                </h3>
                                <p className="text-gray-500 mb-6">Create your first lesson to get started</p>
                                <button
                                    onClick={handleNewLesson}
                                    className="px-6 py-3 bg-brand-yellow text-brand-dark rounded-xl font-bold shadow-lg shadow-brand-yellow/20"
                                >
                                    Create Lesson
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Lesson
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Language
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Level
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Prerequisites
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredLessons.map((lesson: Lesson) => (
                                            <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-dark font-bold">
                                                            {lesson.order}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-brand-dark">{lesson.title}</p>
                                                            {lesson.description && (
                                                                <p className="text-sm text-gray-500 truncate max-w-xs">{lesson.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                                    {lesson.language}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">
                                                        <TrendingUp className="w-3 h-3" />
                                                        {lesson.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1">
                                                        {lesson.requiredVocabulary > 0 && (
                                                            <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-bold">
                                                                V:{lesson.requiredVocabulary}
                                                            </span>
                                                        )}
                                                        {lesson.requiredGrammar > 0 && (
                                                            <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-bold">
                                                                G:{lesson.requiredGrammar}
                                                            </span>
                                                        )}
                                                        {lesson.requiredReading > 0 && (
                                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                                                                R:{lesson.requiredReading}
                                                            </span>
                                                        )}
                                                        {lesson.requiredWriting > 0 && (
                                                            <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-bold">
                                                                W:{lesson.requiredWriting}
                                                            </span>
                                                        )}
                                                        {lesson.requiredVocabulary === 0 && lesson.requiredGrammar === 0 &&
                                                            lesson.requiredReading === 0 && lesson.requiredWriting === 0 && (
                                                                <span className="text-xs text-gray-400 font-medium">None</span>
                                                            )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleToggleActive(lesson)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lesson.isActive
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                            }`}
                                                    >
                                                        {lesson.isActive ? 'Active' : 'Draft'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(lesson)}
                                                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLesson(lesson.id!)}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    /* Clients Tab */
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loadingClients ? (
                                <div className="col-span-full flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-brand-yellow"></div>
                                </div>
                            ) : clients.length === 0 ? (
                                <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-bold">No client accounts found.</p>
                                </div>
                            ) : (
                                clients.map(client => (
                                    <div key={client.uid} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Current Balance</p>
                                                <p className="text-2xl font-black text-brand-dark dark:text-white">${(client.balance || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <h4 className="font-bold text-brand-dark dark:text-white truncate">{client.displayName || 'Unnamed Client'}</h4>
                                            <p className="text-sm text-gray-500 truncate">{client.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedClient(client);
                                                setShowBalanceModal(true);
                                            }}
                                            className="w-full py-3 bg-brand-yellow text-brand-dark rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-yellow/10"
                                        >
                                            <Wallet className="w-4 h-4" />
                                            Load Balance
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Balance Modal */}
            <AnimatePresence>
                {showBalanceModal && selectedClient && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 text-brand-dark">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative"
                        >
                            <div className="p-8 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-[2rem] flex items-center justify-center mb-6">
                                    <DollarSign className="w-10 h-10 text-green-600" />
                                </div>

                                <h3 className="text-2xl font-black text-brand-dark dark:text-white mb-2">
                                    Load Balance
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">
                                    Funding account: <br />
                                    <span className="text-brand-dark dark:text-white font-bold">{selectedClient.email}</span>
                                </p>

                                <div className="w-full relative px-4 text-brand-dark">
                                    <div className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">$</div>
                                    <input
                                        type="number"
                                        value={loadAmount}
                                        onChange={(e) => setLoadAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-brand-yellow outline-none rounded-2xl text-2xl font-black text-brand-dark dark:text-white transition-all text-center"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="px-8 pb-8 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowBalanceModal(false);
                                        setLoadAmount('');
                                    }}
                                    className="flex-1 py-4 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-100 dark:border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLoadBalance}
                                    disabled={!loadAmount || parseFloat(loadAmount) <= 0}
                                    className="flex-[2] py-4 bg-brand-dark text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CSV Upload Result Modal */}
            {uploadResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-brand-dark mb-4">CSV Upload Results</h2>
                        <div className="mb-6">
                            <p className="text-lg">
                                <span className="font-bold text-green-600">{uploadResult.success}</span> lessons created successfully
                            </p>
                            {uploadResult.errors.length > 0 && (
                                <p className="text-lg">
                                    <span className="font-bold text-red-600">{uploadResult.errors.length}</span> errors encountered
                                </p>
                            )}
                        </div>
                        {uploadResult.errors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-700 mb-2">Errors:</h3>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-60 overflow-y-auto">
                                    {uploadResult.errors.map((error, i) => (
                                        <p key={i} className="text-sm text-red-700 mb-1">{error}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setUploadResult(null)}
                            className="w-full px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Editor Modal */}
            {showEditor && currentUser && (
                <LessonEditor
                    lesson={editingLesson}
                    onSave={editingLesson ? handleUpdateLesson : handleCreateLesson}
                    onCancel={() => {
                        setShowEditor(false);
                        setEditingLesson(null);
                    }}
                    userId={currentUser.uid}
                />
            )}
        </div>
    );
}
