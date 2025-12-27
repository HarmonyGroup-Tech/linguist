import React, { useState, useEffect } from 'react';
import { Lesson } from '../services/lessonService';
import { X, Save, Eye } from 'lucide-react';

interface LessonEditorProps {
    lesson?: Lesson | null;
    onSave: (lesson: Omit<Lesson, 'id' | 'createdAt'>) => Promise<void>;
    onCancel: () => void;
    userId: string;
}

export default function LessonEditor({ lesson, onSave, onCancel, userId }: LessonEditorProps) {
    const [formData, setFormData] = useState<Omit<Lesson, 'id' | 'createdAt'>>({
        title: '',
        description: '',
        language: 'Spanish',
        level: 1,
        context: '',
        targetSentence: '',
        correctTranslation: '',
        sourceTitle: '',
        sourceAuthor: '',
        requiredVocabulary: 0,
        requiredGrammar: 0,
        requiredReading: 0,
        requiredWriting: 0,
        xpReward: 50,
        vocabularyGain: 5,
        grammarGain: 5,
        readingGain: 5,
        writingGain: 5,
        createdBy: userId,
        isActive: true,
        order: 0
    });

    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (lesson) {
            setFormData({
                title: lesson.title,
                description: lesson.description,
                language: lesson.language,
                level: lesson.level,
                context: lesson.context,
                targetSentence: lesson.targetSentence,
                correctTranslation: lesson.correctTranslation,
                sourceTitle: lesson.sourceTitle || '',
                sourceAuthor: lesson.sourceAuthor || '',
                requiredVocabulary: lesson.requiredVocabulary,
                requiredGrammar: lesson.requiredGrammar,
                requiredReading: lesson.requiredReading,
                requiredWriting: lesson.requiredWriting,
                xpReward: lesson.xpReward,
                vocabularyGain: lesson.vocabularyGain,
                grammarGain: lesson.grammarGain,
                readingGain: lesson.readingGain,
                writingGain: lesson.writingGain,
                createdBy: lesson.createdBy,
                isActive: lesson.isActive,
                order: lesson.order
            });
        }
    }, [lesson]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onCancel();
        } catch (error) {
            console.error('Error saving lesson:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between rounded-t-[2rem] z-10">
                    <h2 className="text-2xl font-bold text-brand-dark">
                        {lesson ? 'Edit Lesson' : 'Create New Lesson'}
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-brand-dark hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            {showPreview ? 'Hide' : 'Show'} Preview
                        </button>
                        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Basic Info */}
                    <section>
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    placeholder="e.g. Greetings and Introductions"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Language *</label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => updateField('language', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                >
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Portuguese">Portuguese</option>
                                    <option value="Japanese">Japanese</option>
                                    <option value="Chinese">Chinese</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-brand-dark mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none h-20"
                                placeholder="Brief description of what this lesson covers"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Difficulty Level (1-10)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.level}
                                    onChange={(e) => updateField('level', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Order</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.order}
                                    onChange={(e) => updateField('order', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => updateField('isActive', e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                                    />
                                    <span className="text-sm font-semibold text-brand-dark">Active/Published</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Content */}
                    <section>
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Lesson Content</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Context/Paragraph *</label>
                                <textarea
                                    required
                                    value={formData.context}
                                    onChange={(e) => updateField('context', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none h-32"
                                    placeholder="The full paragraph or context in the target language"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Target Sentence *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.targetSentence}
                                    onChange={(e) => updateField('targetSentence', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    placeholder="The specific sentence to translate (must be in the context)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Correct Translation *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.correctTranslation}
                                    onChange={(e) => updateField('correctTranslation', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    placeholder="The correct English translation"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-brand-dark mb-2">Source Title</label>
                                    <input
                                        type="text"
                                        value={formData.sourceTitle}
                                        onChange={(e) => updateField('sourceTitle', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                        placeholder="Book or source title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-brand-dark mb-2">Source Author</label>
                                    <input
                                        type="text"
                                        value={formData.sourceAuthor}
                                        onChange={(e) => updateField('sourceAuthor', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                        placeholder="Author name"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Prerequisites */}
                    <section>
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Prerequisites (Required Skill Levels)</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { key: 'requiredVocabulary', label: 'Vocabulary', color: 'var(--vocabulary-color)' },
                                { key: 'requiredGrammar', label: 'Grammar', color: 'var(--grammar-color)' },
                                { key: 'requiredReading', label: 'Reading', color: 'var(--reading-color)' },
                                { key: 'requiredWriting', label: 'Writing', color: 'var(--writing-color)' }
                            ].map(({ key, label, color }) => (
                                <div key={key}>
                                    <label className="block text-sm font-semibold text-brand-dark mb-2 flex items-center justify-between">
                                        <span>{label}</span>
                                        <span className="text-lg font-bold" style={{ color }}>{formData[key as keyof typeof formData]}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={formData[key as keyof typeof formData] as number}
                                        onChange={(e) => updateField(key as keyof typeof formData, parseInt(e.target.value))}
                                        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, ${color} 0%, ${color} ${formData[key as keyof typeof formData]}%, #E5E7EB ${formData[key as keyof typeof formData]}%, #E5E7EB 100%)`
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Rewards */}
                    <section>
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Rewards & Skill Gains</h3>
                        <div className="grid grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Total XP</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.xpReward}
                                    onChange={(e) => updateField('xpReward', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                />
                            </div>
                            {[
                                { key: 'vocabularyGain', label: 'Vocabulary' },
                                { key: 'grammarGain', label: 'Grammar' },
                                { key: 'readingGain', label: 'Reading' },
                                { key: 'writingGain', label: 'Writing' }
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-sm font-semibold text-brand-dark mb-2">{label}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData[key as keyof typeof formData] as number}
                                        onChange={(e) => updateField(key as keyof typeof formData, parseInt(e.target.value))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Preview */}
                    {showPreview && (
                        <section className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                            <h3 className="text-lg font-bold text-brand-dark mb-4">Preview</h3>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="text-sm text-gray-500 mb-4">
                                    {formData.sourceTitle && formData.sourceAuthor && (
                                        <span>{formData.sourceTitle} by {formData.sourceAuthor}</span>
                                    )}
                                </div>
                                <div className="text-lg leading-relaxed text-gray-700 mb-4 font-serif">
                                    {formData.context.split(formData.targetSentence).map((part, i, arr) => (
                                        <React.Fragment key={i}>
                                            {part}
                                            {i < arr.length - 1 && (
                                                <span className="bg-brand-yellow/30 px-1 py-0.5 rounded font-medium">
                                                    {formData.targetSentence}
                                                </span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                                {formData.correctTranslation && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm font-semibold text-gray-500">Expected Translation:</p>
                                        <p className="text-base text-brand-dark mt-1">{formData.correctTranslation}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-brand-dark hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-brand-yellow text-brand-dark rounded-xl font-bold shadow-lg shadow-brand-yellow/20 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save Lesson'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
