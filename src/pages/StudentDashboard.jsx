import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Clock, Award, TrendingUp, PlayCircle } from 'lucide-react';
import { api } from '../utils/api';

const DEFAULT_COURSE_IMAGE = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop';

const parseJson = (value, fallback = []) => {
    if (!value) return fallback;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : fallback;
        } catch {
            return fallback;
        }
    }
    return fallback;
};

const getLessonList = (curriculum) => {
    return parseJson(curriculum).flatMap((section) => Array.isArray(section.lessons) ? section.lessons : []);
};

const normalizeProgress = (rawProgress, totalLessons) => {
    const coerceObject = (value) => {
        if (!value) return {};
        if (typeof value === 'number') return { percent: value };
        if (typeof value === 'string') {
            try {
                return coerceObject(JSON.parse(value));
            } catch {
                return {};
            }
        }
        if (typeof value === 'object') return value;
        return {};
    };

    const data = coerceObject(rawProgress);
    let percent = Number.isFinite(data.percent) ? data.percent : Number.isFinite(data.percentage) ? data.percentage : 0;
    let completedLessons = 0;
    const completedField = data.completedLessons ?? data.completed_lessons ?? data.completed;

    if (Array.isArray(completedField)) {
        completedLessons = completedField.length;
    } else if (Number.isFinite(completedField)) {
        completedLessons = completedField;
    }

    if (totalLessons > 0 && completedLessons > 0) {
        percent = Math.round((completedLessons / totalLessons) * 100);
    } else if (percent > 0 && totalLessons > 0 && completedLessons === 0) {
        completedLessons = Math.round((percent / 100) * totalLessons);
    }

    percent = Math.min(100, Math.max(0, Math.round(percent || 0)));
    completedLessons = Math.min(totalLessons || completedLessons, Math.max(0, completedLessons));
    const nextLessonIndex = Math.min(Math.max(completedLessons, 0), Math.max((totalLessons || 1) - 1, 0));

    return { percent, completedLessons, nextLessonIndex };
};

const parseDurationToHours = (value) => {
    if (!value && value !== 0) return 0;
    if (typeof value === 'number') return value;
    const text = String(value).toLowerCase();
    const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*h/);
    const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*m/);
    let hours = hourMatch ? parseFloat(hourMatch[1]) : 0;
    if (minuteMatch) hours += parseFloat(minuteMatch[1]) / 60;
    return Number.isFinite(hours) ? hours : 0;
};

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentError, setEnrollmentError] = useState(null);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

    const [recommendations, setRecommendations] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState(null);

    const fetchEnrollments = useCallback(async () => {
        if (!user) return;
        setEnrollmentsLoading(true);
        setEnrollmentError(null);
        try {
            const { data } = await api.get('/courses/enrolled');
            setEnrollments(Array.isArray(data) ? data : []);
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to load your courses.';
            setEnrollmentError(message);
        } finally {
            setEnrollmentsLoading(false);
        }
    }, [user]);

    const fetchRecommendations = useCallback(async () => {
        if (!user) return;
        setRecommendationsLoading(true);
        setRecommendationsError(null);
        try {
            const { data } = await api.get('/courses/recommendations');
            setRecommendations(Array.isArray(data?.recommendations) ? data.recommendations : []);
        } catch (err) {
            const message = err?.response?.data?.error || 'Unable to load recommendations right now.';
            setRecommendationsError(message);
        } finally {
            setRecommendationsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    const enrichedCourses = useMemo(() => {
        return enrollments.map((course) => {
            const lessons = getLessonList(course.curriculum);
            const totalLessons = lessons.length || Number(course.total_lessons) || Number(course.totalLessons) || 0;
            const { percent, completedLessons, nextLessonIndex } = normalizeProgress(course.progress, totalLessons);
            const nextLesson = lessons[nextLessonIndex]?.title
                || lessons[nextLessonIndex]?.name
                || 'Resume where you left off';

            const durationValue = course.duration || course.duration_text || course.total_duration;
            return {
                ...course,
                progressPercent: percent,
                completedLessons,
                totalLessons: totalLessons || 0,
                nextLesson,
                displayImage: course.image || course.image_url || course.thumbnail || DEFAULT_COURSE_IMAGE,
                durationHours: parseDurationToHours(durationValue),
            };
        });
    }, [enrollments]);

    const stats = useMemo(() => {
        const totalCourses = enrichedCourses.length;
        const completedCourses = enrichedCourses.filter((course) => {
            const status = (course.enrollment_status || '').toLowerCase();
            return status === 'completed' || course.progressPercent === 100;
        }).length;
        const totalHours = enrichedCourses.reduce((sum, course) => sum + (course.durationHours || 0), 0);
        return {
            totalCourses,
            completedCourses,
            totalHours: Math.round(totalHours),
        };
    }, [enrichedCourses]);

    return (
        <div className="min-h-screen bg-linear-to-b from-white via-orange-50/40 to-white text-gray-900">
            <Navbar />

            <main className="container-custom py-24 min-h-screen">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 p-6 rounded-2xl border border-orange-100 bg-white shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
                        </h1>
                        <p className="text-gray-600">You're making great progress. Keep it up!</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-4">
                        <div className="card p-4 flex items-center space-x-3 bg-white">
                            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Enrolled</p>
                                <p className="font-bold text-gray-900">{stats.totalCourses} {stats.totalCourses === 1 ? 'Course' : 'Courses'}</p>
                            </div>
                        </div>
                        <div className="card p-4 flex items-center space-x-3 bg-white">
                            <div className="p-2 rounded-lg bg-accent/20 text-accent">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Certificates</p>
                                <p className="font-bold text-gray-900">{stats.completedCourses} Earned</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Continue Learning */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-primary" />
                        Continue Learning
                    </h2>
                    {enrollmentsLoading ? (
                        <div className="card p-8 text-center text-gray-600 bg-linear-to-br from-white to-orange-50/70">Loading your courses...</div>
                    ) : enrollmentError ? (
                        <div className="card p-8 text-center bg-linear-to-br from-white to-orange-50/70">
                            <p className="text-gray-600 mb-4">{enrollmentError}</p>
                            <button
                                className="btn btn-primary"
                                onClick={fetchEnrollments}
                            >
                                Try again
                            </button>
                        </div>
                    ) : enrichedCourses.length === 0 ? (
                        <div className="card p-8 text-center text-gray-600 bg-linear-to-br from-white to-orange-50/70">
                            <p>You are not enrolled in any courses yet.</p>
                            <button
                                className="btn btn-secondary mt-4"
                                onClick={() => navigate('/')}
                            >
                                Browse Courses
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {enrichedCourses.map((course) => (
                                <div
                                    key={course.id}
                                    onClick={() => navigate(`/learning/${course.id}`)}
                                    className="card group bg-linear-to-br from-white to-orange-50/70 hover:border-orange-300 transition-colors cursor-pointer"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0">
                                            <img
                                                src={course.displayImage}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                                            <p className="text-sm text-gray-600 mb-3">Next: {course.nextLesson}</p>

                                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                <span>{course.progressPercent}% Complete</span>
                                                <span>{course.completedLessons}/{course.totalLessons || 0} Lessons</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-linear-to-r from-orange-300 to-orange-500 rounded-full"
                                                    style={{ width: `${course.progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                        <button className="self-center p-3 rounded-full bg-orange-100 text-gray-700 group-hover:bg-orange-400 group-hover:text-white transition-colors">
                                            <PlayCircle className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Recommended for You */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-secondary" />
                        Recommended For You
                    </h2>
                    {recommendationsLoading ? (
                        <div className="card p-8 text-center text-gray-600 bg-linear-to-br from-white to-orange-50/70">
                            <p>Analyzing your learning history...</p>
                        </div>
                    ) : recommendationsError ? (
                        <div className="card p-8 text-center bg-linear-to-br from-white to-orange-50/70">
                            <p className="text-gray-600 mb-4">{recommendationsError}</p>
                            <button className="btn btn-primary" onClick={fetchRecommendations}>Retry recommendations</button>
                        </div>
                    ) : recommendations.length === 0 ? (
                        <div className="card p-8 text-center text-gray-600 bg-linear-to-br from-white to-orange-50/70">
                            <p>Search for a few topics to unlock personalized AI recommendations.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                            {recommendations.map((course) => (
                                <div key={course.id} className="card p-6 flex flex-col bg-linear-to-br from-white to-orange-50/70 hover:border-orange-300">
                                    <div className="flex-1">
                                        <p className="text-xs uppercase tracking-wide text-gray-600 mb-2">{course.category}</p>
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                                        <p className="text-sm text-gray-700 mb-4">{course.reason}</p>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                                        <span>Confidence {course.confidence || 0}%</span>
                                        {course.level && <span>{course.level}</span>}
                                    </div>
                                    <button
                                        className="btn btn-secondary w-full"
                                        onClick={() => navigate(`/courses/${course.id}`)}
                                    >
                                        View Course
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

        </div>
    );
};

export default StudentDashboard;
