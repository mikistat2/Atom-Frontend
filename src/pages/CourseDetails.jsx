import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Play, Clock, Users, Star, Award, BookOpen, Download,
    CheckCircle, ChevronDown, MessageCircle, Share2
} from 'lucide-react';

import PaymentModal from '../components/PaymentModal';
import VideoModal from '../components/VideoModal';
import { api } from '../utils/api';
import UserAvatar from '../components/UserAvatar';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [accessError, setAccessError] = useState(null);

    // Mock course data as fallback if API fails
    const fallbackCourse = {
        id: 1,
        title: 'Complete Web Development Bootcamp 2024',
        demoUrl: 'https://www.youtube.com/watch?v=Hu4Yzv-g7X0',
        description: 'Master modern web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, MongoDB, and deploy real-world projects.',
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop',
        instructor: {
            name: 'Dr. Sarah Johnson',
            avatar: 'https://i.pravatar.cc/150?img=1',
            title: 'Senior Full-Stack Developer',
            students: '45,000+',
            courses: 12,
            rating: 4.9
        },
        rating: 4.8,
        reviews: 2847,
        students: '12.5K',
        duration: '42h',
        lectures: 256,
        price: 1200,
        originalPrice: 2500,
        discount: true,
        lastUpdated: 'December 2024',
        language: 'English',
        level: 'All Levels',
        curriculum: [],
        features: [],
        requirements: [],
        learningOutcomes: []
    };

    const [course, setCourse] = useState(fallbackCourse);

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {
                const [courseRes, statusRes] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get(`/courses/${courseId}/status`).catch(() => ({ data: { enrolled: false } }))
                ]);

                setCourse(courseRes.data);
                setIsEnrolled(statusRes.data.enrolled);
            } catch (err) {
                console.error('Failed to load course details:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) loadPageData();
    }, [courseId]);

    return (
        <div className="min-h-screen scrollbar-custom">
            {loading && (
                <div className="pt-28 container-custom text-text-secondary">Loading course…</div>
            )}
            {error && (
                <div className="pt-28 container-custom text-text-secondary">{error}</div>
            )}
            {/* Hero Section */}
            <div className="relative pt-24 pb-12 bg-gradient-to-br from-surface to-background">
                <div className="container-custom">
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                        {/* Left Content */}
                        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full">
                                <span className="text-sm text-primary font-semibold">{course.category}</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white">
                                {course.title}
                            </h1>

                            <p className="text-xl text-text-secondary">
                                {course.description}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1 text-warning">
                                        <Star className="w-5 h-5 fill-current" />
                                        <span className="font-bold text-white">{course.rating}</span>
                                    </div>
                                    <span className="text-text-secondary">({course.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center space-x-2 text-text-secondary">
                                    <Users className="w-5 h-5" />
                                    <span>{course.students} students</span>
                                </div>
                                <div className="flex items-center space-x-2 text-text-secondary">
                                    <Clock className="w-5 h-5" />
                                    <span>{course.duration} total</span>
                                </div>
                                <div className="flex items-center space-x-2 text-text-secondary">
                                    <BookOpen className="w-5 h-5" />
                                    <span>{course.lectures} lectures</span>
                                </div>
                            </div>

                            {/* Instructor */}
                            <div className="flex items-center space-x-4 glass rounded-xl p-4">
                                <UserAvatar
                                    name={course.instructor.name}
                                    avatar={course.instructor.avatar}
                                    size="lg"
                                />
                                <div>
                                    <p className="text-sm text-text-secondary">Created by</p>
                                    <h3 className="font-semibold text-white">{course.instructor.name}</h3>
                                    <p className="text-sm text-text-secondary">{course.instructor.title}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Course Card */}
                        <div className="lg:col-span-1 order-1 lg:order-2">
                            <div className="lg:sticky lg:top-24 card-premium">
                                <div
                                    className="relative overflow-hidden rounded-xl mb-4 group cursor-pointer"
                                    onClick={() => setIsPreviewOpen(true)}
                                >
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <Play className="w-8 h-8 text-white ml-1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {course.discount ? (
                                        <div>
                                            <div className="flex items-baseline space-x-2">
                                                <span className="text-3xl font-bold gradient-text">{course.price} ETB</span>
                                                <span className="text-lg text-text-secondary line-through">{course.originalPrice} ETB</span>
                                            </div>
                                            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-error/20 text-error text-sm font-semibold">
                                                {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-3xl font-bold gradient-text">{course.price} ETB</span>
                                    )}

                                    {isEnrolled ? (
                                        <button
                                            onClick={() => navigate(`/learning/${courseId}`)}
                                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-5 h-5" />
                                            Go to Course
                                        </button>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                if (!courseId) return;
                                                setEnrollLoading(true);
                                                setAccessError(null);
                                                try {
                                                    const { data } = await api.post('/payments/access', { courseId });
                                                    if (data?.hasAccess) {
                                                        setIsEnrolled(true);
                                                        navigate(`/learning/${courseId}`);
                                                        return;
                                                    }
                                                } catch (err) {
                                                    if (err?.response?.status === 401) {
                                                        navigate('/auth');
                                                        return;
                                                    }
                                                    setAccessError(err?.response?.data?.error || 'Unable to verify payment access.');
                                                } finally {
                                                    setEnrollLoading(false);
                                                }
                                                navigate(`/checkout/${courseId}`);
                                            }}
                                            className="btn btn-primary w-full"
                                            disabled={enrollLoading}
                                     >
                                            {enrollLoading ? 'Checking access…' : 'Enroll Now'}
                                        </button>
                                    )}

                                    {accessError && !isEnrolled && (
                                        <p className="text-sm text-error text-center">{accessError}</p>
                                    )}

                                    {!isEnrolled && (
                                        <button className="btn btn-secondary w-full">
                                            Add to Wishlist
                                        </button>
                                    )}

                                    <div className="pt-4 border-t border-white/10 space-y-3 text-sm">
                                        <h4 className="font-semibold text-white">This course includes:</h4>
                                        {course.features.map((feature, index) => (
                                            <div key={index} className="flex items-start space-x-2">
                                                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                                <span className="text-text-secondary">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                        <button className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors">
                                            <Share2 className="w-5 h-5" />
                                            <span>Share</span>
                                        </button>
                                        <button className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors">
                                            <MessageCircle className="w-5 h-5" />
                                            <span>Ask Question</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className="py-12">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* What You'll Learn */}
                            <div className="card-premium">
                                <h2 className="text-2xl font-bold text-white mb-6">What you'll learn</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {course.learningOutcomes.map((outcome, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                            <span className="text-text-secondary">{outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Course Curriculum */}
                            <div className="card-premium">
                                <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>
                                <div className="space-y-3">
                                    {course.curriculum.map((section, index) => (
                                        <div key={index} className="glass rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <ChevronDown
                                                        className={`w-5 h-5 text-text-secondary transition-transform ${expandedSection === index ? 'rotate-180' : ''
                                                            }`}
                                                    />
                                                    <div className="text-left">
                                                        <h3 className="font-semibold text-white">{section.title}</h3>
                                                        <p className="text-sm text-text-secondary">
                                                            {section.lectures} lectures • {section.duration}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>

                                            {expandedSection === index && (
                                                <div className="border-t border-white/10">
                                                    {section.lessons.map((lesson, lessonIndex) => (
                                                        <div
                                                            key={lessonIndex}
                                                            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <Play className="w-4 h-4 text-text-secondary" />
                                                                <span className="text-text-secondary">{lesson.title}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                {lesson.preview && (
                                                                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                                                                        Preview
                                                                    </span>
                                                                )}
                                                                <span className="text-sm text-text-secondary">{lesson.duration}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="card-premium">
                                <h2 className="text-2xl font-bold text-white mb-6">Requirements</h2>
                                <ul className="space-y-3">
                                    {course.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start space-x-3">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                            <span className="text-text-secondary">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Instructor Info */}
                            <div className="card-premium sticky top-24">
                                <h3 className="text-xl font-bold text-white mb-4">About the Instructor</h3>
                                <div className="flex items-center space-x-4 mb-4">
                                    <UserAvatar
                                        name={course.instructor.name}
                                        avatar={course.instructor.avatar}
                                        size="xl"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-white">{course.instructor.name}</h4>
                                        <p className="text-sm text-text-secondary">{course.instructor.title}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold gradient-text">{course.instructor.rating}</div>
                                        <div className="text-xs text-text-secondary mt-1">Rating</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold gradient-text">{course.instructor.students}</div>
                                        <div className="text-xs text-text-secondary mt-1">Students</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold gradient-text">{course.instructor.courses}</div>
                                        <div className="text-xs text-text-secondary mt-1">Courses</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                course={course}
            />

            <VideoModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                videoUrl={course.demoUrl}
                title={course.title}
            />
        </div>
    );
};

export default CourseDetails;
