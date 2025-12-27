import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LessonService, Lesson } from '../services/lessonService';
import LessonEditor from '../components/LessonEditor';
import { LogOut, Plus, Edit2, Trash2, Check, X, Feather, BookOpen, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all');

    useEffect(() => {
        loadLessons();
    }, []);

    const loadLessons = async () => {
        setLoading(true);
        const data = await LessonService.getAllLessons();
        setLessons(data);
        setLoading(false);
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
        if (confirm('Are you sure you want to delete this lesson?')) {
            await LessonService.deleteLesson(lessonId);
            await loadLessons();
        }
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

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const filteredLessons = lessons.filter(lesson => {
        if (filter === 'active') return lesson.isActive;
        if (filter === 'draft') return !lesson.isActive;
        return true;
    });

    const stats = {
        total: lessons.length,
        active: lessons.filter(l => l.isActive).length,
        draft: lessons.filter(l => !l.isActive).length
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
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            Linguist <span className="text-brand-yellow font-medium ml-2">Admin</span>
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="py-12 px-6 max-w-7xl mx-auto">
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
                    <button
                        onClick={handleNewLesson}
                        className="px-6 py-3 bg-brand-yellow text-brand-dark rounded-xl font-bold shadow-lg shadow-brand-yellow/20 hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Lesson
                    </button>
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
                                {filteredLessons.map((lesson) => (
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
            </main>

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
