import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
    Save, Plus, Upload, Trash2, ChevronRight, CheckCircle,
    Play, Clock, FileText, Image as ImageIcon, X
} from 'lucide-react';

const CourseCreator = ({ onCancel, onSave }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        price: '',
        duration: '',
        category: 'Web Development',
        level: 'Beginner',
        language: 'English',
        demoUrl: '',
        thumbnail: null,
        features: [],
        requirements: [],
        learningOutcomes: []
    });

    const [sections, setSections] = useState([]);
    const [thumbnailFile, setThumbnailFile] = useState(null);

    // UI State for Curriculum Builder
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [activeSectionIndex, setActiveSectionIndex] = useState(null);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [newLesson, setNewLesson] = useState({ title: '', duration: '', type: 'video', videoUrl: '' });

    // UI State for List Builders
    const [newItem, setNewItem] = useState({ features: '', requirements: '', learningOutcomes: '' });

    useEffect(() => {
        return () => {
            if (courseData.thumbnail) {
                URL.revokeObjectURL(courseData.thumbnail);
            }
        };
    }, [courseData.thumbnail]);

    const handleBasicInfoChange = (e) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const handleAddListItem = (type) => {
        if (!newItem[type].trim()) return;
        setCourseData({
            ...courseData,
            [type]: [...courseData[type], newItem[type].trim()]
        });
        setNewItem({ ...newItem, [type]: '' });
    };

    const handleRemoveListItem = (type, index) => {
        const newList = [...courseData[type]];
        newList.splice(index, 1);
        setCourseData({ ...courseData, [type]: newList });
    };

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setCourseData((prev) => {
            if (prev.thumbnail) {
                URL.revokeObjectURL(prev.thumbnail);
            }
            return { ...prev, thumbnail: previewUrl };
        });
        setThumbnailFile(file);
    };

    const addSection = () => {
        if (!newSectionTitle.trim()) return;
        setSections([...sections, { title: newSectionTitle, lessons: [] }]);
        setNewSectionTitle('');
    };

    const deleteSection = (index) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
    };

    const openLessonModal = (sectionIndex) => {
        setActiveSectionIndex(sectionIndex);
        setNewLesson({ title: '', duration: '', type: 'video', videoUrl: '' });
        setShowLessonModal(true);
    };



    const saveLesson = () => {
        if (!newLesson.title) return;

        const updatedSections = [...sections];
        updatedSections[activeSectionIndex].lessons.push({
            ...newLesson,
            id: Date.now()
        });

        setSections(updatedSections);
        setShowLessonModal(false);
    };

    const handlePublish = async () => {
        setLoading(true);
        try {
            let thumbnailImage = null;
            if (thumbnailFile) {
                try {
                    thumbnailImage = await fileToBase64(thumbnailFile);
                } catch (readerError) {
                    console.error('Thumbnail read error:', readerError);
                    alert('Failed to read the selected thumbnail. Please choose another image.');
                    setLoading(false);
                    return;
                }
            }

            const { thumbnail: _thumbnailPreview, duration, ...restCourseData } = courseData;
            const normalizedDuration = (duration || '').trim() || '0h';
            const payload = {
                ...restCourseData,
                duration: normalizedDuration,
                thumbnailImage,
                curriculum: sections,
                price: parseFloat(courseData.price) || 0,
                features: courseData.features,
                requirements: courseData.requirements,
                learningOutcomes: courseData.learningOutcomes,
                demoUrl: courseData.demoUrl
            };
            const { data } = await api.post('/courses', payload);
            onSave(data);
        } catch (err) {
            console.error('Publish error:', err);
            alert('Failed to publish course: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Render Steps
    const renderStep1 = () => (
        <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Course Title</label>
                    <input
                        type="text"
                        name="title"
                        value={courseData.title}
                        onChange={handleBasicInfoChange}
                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g., Complete Web Development Bootcamp"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-1">Description</label>
                    <textarea
                        name="description"
                        value={courseData.description}
                        onChange={handleBasicInfoChange}
                        rows="4"
                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        placeholder="What will students learn in this course?"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                        <select
                            name="category"
                            value={courseData.category}
                            onChange={handleBasicInfoChange}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        >
                            <option>Web Development</option>
                            <option>Data Science</option>
                            <option>Design</option>
                            <option>Marketing</option>
                            <option>Business</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Price (ETB)</label>
                        <input
                            type="number"
                            name="price"
                            value={courseData.price}
                            onChange={handleBasicInfoChange}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Total Duration</label>
                        <input
                            type="text"
                            name="duration"
                            value={courseData.duration}
                            onChange={handleBasicInfoChange}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g., 12h 30m"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Level</label>
                        <select
                            name="level"
                            value={courseData.level}
                            onChange={handleBasicInfoChange}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>All Levels</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Language</label>
                        <input
                            type="text"
                            name="language"
                            value={courseData.language}
                            onChange={handleBasicInfoChange}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g., English, Amharic"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Course Thumbnail</label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors relative cursor-pointer group">
                        <input
                            type="file"
                            onChange={handleThumbnailChange}
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {courseData.thumbnail ? (
                            <div className="relative h-48 w-full rounded-lg overflow-hidden">
                                <img src={courseData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-medium">Click to change</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center mx-auto text-primary">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                                <p className="text-white font-medium">Click to upload thumbnail</p>
                                <p className="text-sm text-text-secondary">PNG, JPG up to 10MB</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderListBuilder = (title, type, placeholder) => (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-text-secondary">{title}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItem[type]}
                    onChange={(e) => setNewItem({ ...newItem, [type]: e.target.value })}
                    className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder={placeholder}
                />
                <button
                    onClick={() => handleAddListItem(type)}
                    className="p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-custom">
                {courseData[type].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 glass rounded-lg border border-white/5">
                        <span className="text-sm text-white/80">{item}</span>
                        <button
                            onClick={() => handleRemoveListItem(type, idx)}
                            className="text-text-secondary hover:text-error"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-6">Course Advanced Details</h2>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Promo Video URL (YouTube/Vimeo)</label>
                <input
                    type="text"
                    name="demoUrl"
                    value={courseData.demoUrl}
                    onChange={handleBasicInfoChange}
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g., https://www.youtube.com/watch?v=..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderListBuilder('What students will learn', 'learningOutcomes', 'e.g., Master React Hooks')}
                {renderListBuilder('Course Features', 'features', 'e.g., 20+ Hours of Video')}
            </div>

            {renderListBuilder('Requirements', 'requirements', 'e.g., Basic JavaScript knowledge')}
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>

            {/* Add Section */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="Enter section title (e.g., Introduction)"
                    className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
                <button
                    onClick={addSection}
                    disabled={!newSectionTitle.trim()}
                    className="btn btn-secondary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Section
                </button>
            </div>

            {/* Sections List */}
            <div className="space-y-4 mt-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-custom">
                {sections.length === 0 && (
                    <div className="text-center py-12 border border-white/10 rounded-xl bg-surface/30">
                        <p className="text-text-secondary">No sections yet. Add your first section above.</p>
                    </div>
                )}

                {sections.map((section, index) => (
                    <div key={index} className="card bg-surface/50 border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                                    {index + 1}
                                </span>
                                {section.title}
                            </h3>
                            <button
                                onClick={() => deleteSection(index)}
                                className="text-text-secondary hover:text-error transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Lessons List */}
                        <div className="space-y-2 pl-8">
                            {section.lessons.map((lesson, lIndex) => (
                                <div key={lesson.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-surface text-text-secondary">
                                            {lesson.type === 'video' ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{lesson.title}</p>
                                            <p className="text-xs text-text-secondary flex items-center gap-1">
                                                {lesson.videoUrl ? (
                                                    <span className="text-success flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Ready
                                                    </span>
                                                ) : 'No content'}
                                                • {lesson.duration}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => openLessonModal(index)}
                                className="w-full py-2 border border-dashed border-white/10 rounded-lg text-sm text-text-secondary hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Lesson
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-8 animate-slide-up text-center py-8">
            <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-bold text-white">Ready to Publish!</h2>
            <p className="text-text-secondary max-w-lg mx-auto">
                Your course <strong>{courseData.title}</strong> is ready to go live.
                You have added {sections.length} sections with {sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons.
            </p>

            <div className="card max-w-md mx-auto bg-surface/50 text-left">
                <div className="flex items-start gap-4">
                    <img
                        src={courseData.thumbnail || 'https://via.placeholder.com/150'}
                        alt="Thumbnail"
                        className="w-24 h-24 rounded-lg object-cover bg-surface"
                    />
                    <div>
                        <h3 className="font-bold text-white text-lg">{courseData.title || 'Untitled Course'}</h3>
                        <p className="text-primary font-bold mt-1">{courseData.price ? `${courseData.price} ETB` : 'Free'}</p>
                        <p className="text-xs text-text-secondary mt-2">{courseData.category} • {courseData.level}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8 px-12">
                {[
                    { num: 1, label: 'Basic Info' },
                    { num: 2, label: 'Details' },
                    { num: 3, label: 'Curriculum' },
                    { num: 4, label: 'Publish' }
                ].map((s, idx) => (
                    <div key={s.num} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${step >= s.num ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface text-text-secondary border border-white/10'
                            }`}>
                            {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                        </div>
                        <span className={`text-sm mt-2 font-medium ${step >= s.num ? 'text-white' : 'text-text-secondary'}`}>
                            {s.label}
                        </span>
                        {/* Connector Line */}
                        {idx < 3 && (
                            <div className={`absolute top-5 left-1/2 w-full h-1 -z-10 ${step > s.num ? 'bg-primary' : 'bg-surface-light'
                                }`} style={{ width: 'calc(100% + 4.5rem)', left: '50%' }}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="bg-surface/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8 min-h-[500px]">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                    Cancel
                </button>

                <div className="flex items-center gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                        >
                            Back
                        </button>
                    )}

                    {step < 4 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !courseData.title}
                            className="btn btn-primary px-8 py-2 rounded-xl flex items-center gap-2"
                        >
                            Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={loading}
                            className="btn btn-primary px-8 py-2 rounded-xl flex items-center gap-2"
                        >
                            {loading ? 'Publishing...' : 'Publish Course'}
                            {!loading && <Upload className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Add Lesson Modal */}
            {showLessonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md animate-scale-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Add New Lesson</h3>
                            <button onClick={() => setShowLessonModal(false)} className="text-text-secondary hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Lesson Title</label>
                                <input
                                    type="text"
                                    value={newLesson.title}
                                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., Introduction to CSS"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Video URL</label>
                                <input
                                    type="text"
                                    value={newLesson.videoUrl || ''}
                                    onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value, duration: '10:00' })}
                                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g. https://youtube.com/watch?v=..."
                                />
                                <p className="text-xs text-text-secondary mt-2">
                                    Paste a link from YouTube, Vimeo, or your hosting provider.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowLessonModal(false)}
                                className="px-4 py-2 text-text-secondary hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveLesson}
                                disabled={!newLesson.title || !newLesson.videoUrl}
                                className="btn btn-primary px-6 py-2 rounded-lg"
                            >
                                Add Lesson
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseCreator;
