import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, BookOpen, Users, DollarSign, BarChart2, Edit2, PlayCircle } from 'lucide-react';
import CourseCreator from '../components/CourseCreator';
import { api } from '../utils/api';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [view, setView] = useState('list'); // 'list' | 'create'
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalRevenue: 0,
        activeCourses: 0,
        avgRating: 0
    });
    const [myCourses, setMyCourses] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                const [statsRes, coursesRes] = await Promise.all([
                    api.get('/courses/teacher/stats'),
                    api.get('/courses/teacher/my-courses')
                ]);
                setStats(statsRes.data);
                setMyCourses(coursesRes.data);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const handleCreateCourse = (newCourse) => {
        setMyCourses([newCourse, ...myCourses]);
        setStats(prev => ({ ...prev, activeCourses: prev.activeCourses + 1 }));
        setView('list');
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-white via-orange-50/40 to-white text-gray-900">


            <main className="container-custom py-24 min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 p-6 rounded-2xl border border-orange-100 bg-white shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Teacher Dashboard
                        </h1>
                        <p className="text-gray-600">Manage your courses and track performance</p>
                    </div>

                    {view === 'list' && (
                        <button
                            onClick={() => setView('create')}
                            className="mt-4 md:mt-0 btn btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Course
                        </button>
                    )}
                </div>

                {view === 'create' ? (
                    <section className="rounded-3xl border border-orange-400/30 
bg-gradient-to-br from-gray-200 via-gray-800 to-gray-300 
p-4 md:p-6 shadow-xl ">
                        <div className="mb-4 md:mb-6 text-white">
                            <h2 className="text-2xl font-bold text-white">Create New Course</h2>
                            <p className="text-sm text-white">Fill out the details below to publish your course.</p>
                        </div>
                        <CourseCreator
                            onCancel={() => setView('list')}
                            onSave={handleCreateCourse}
                        />
                    </section>
                ) : (
                    <>
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: 'Total Students', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-primary', bg: 'bg-primary/20' },
                                { label: 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} ETB`, icon: DollarSign, color: 'text-success', bg: 'bg-success/20' },
                                { label: 'Active Courses', value: stats.activeCourses.toString(), icon: BookOpen, color: 'text-secondary', bg: 'bg-secondary/20' },
                                { label: 'Avg. Rating', value: stats.avgRating.toString(), icon: BarChart2, color: 'text-accent', bg: 'bg-accent/20' }
                            ].map((stat, index) => (
                                <div key={index} className="card p-6 flex items-center space-x-4 bg-white hover:border-orange-300">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Courses List */}
                        <h2 className="text-xl font-bold text-gray-900 mb-6">My Courses</h2>
                        <div className="space-y-4">
                            {myCourses.map((course) => (
                                <div key={course.id} className="card group bg-white hover:border-orange-300 transition-colors">
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 relative">
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${course.status === 'Published' ? 'bg-success text-white' : 'bg-warning text-black'
                                                }`}>
                                                {course.status}
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full text-center md:text-left">
                                            <h3 className="font-bold text-gray-900 text-lg mb-2">{course.title}</h3>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" /> {course.students} Students
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" /> {course.revenue}
                                                </span>
                                                {course.rating > 0 && (
                                                    <span className="flex items-center gap-1 text-warning">
                                                        ★ {course.rating}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button className="flex-1 md:flex-none btn btn-secondary flex items-center justify-center gap-2">
                                                <Edit2 className="w-4 h-4" /> Edit
                                            </button>
                                            <button className="flex-1 md:flex-none btn btn-primary flex items-center justify-center gap-2">
                                                <BarChart2 className="w-4 h-4" /> Stats
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

        </div>
    );
};

export default TeacherDashboard;
