import React, { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import CourseCard from '../components/CourseCard';
import { Filter, Brain, ArrowRight, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const AICourseRecommendation = lazy(() => import('../components/AICourseRecommendation'));
const PaymentModal = lazy(() => import('../components/PaymentModal'));


const Home = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [coursesError, setCoursesError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayLimit, setDisplayLimit] = useState(12);
    const trendingRef = useRef(null);


    useEffect(() => {
        let cancelled = false;

        const loadCourses = async () => {
            setCoursesLoading(true);
            setCoursesError(null);
            try {
                const res = await fetch('/courses');
                if (!res.ok) throw new Error(`Failed to load courses (${res.status})`);
                const data = await res.json();
                if (!cancelled) setCourses(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!cancelled) {
                    setCoursesError(e.message || 'Failed to load courses');
                    setCourses(fallbackCourses);
                }
            } finally {
                if (!cancelled) setCoursesLoading(false);
            }
        };

        loadCourses();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigate = useNavigate();

    const deferredSearchTerm = useDeferredValue(searchTerm);

    const handleCourseClick = useCallback((courseId) => {
        navigate(`/courses/${courseId}`);
    }, [navigate]);

    const handleBecomeTeacher = useCallback(() => {
        navigate('/become-teacher');
    }, [navigate]);

    const storeSearchTerm = useCallback(async (term) => {
        const t = String(term ?? '').trim();
        if (!t) return;
        try {
            await api.post('/auth/store-search-term', { term: t });
        } catch (error) {
            console.error('Error storing search term:', error);
        }
    }, []);

    const handleSearchChange = useCallback((value) => {
        // Only update UI filtering while typing.
        // We store the term ONLY when the user submits the search.
        setSearchTerm(value);
    }, []);


    const filteredCourses = useMemo(() => {
        const q = deferredSearchTerm.trim().toLowerCase();
        if (!q) return courses;
        return courses.filter((course) => {
            const haystacks = [
                course?.title,
                course?.description,
                course?.category,
                course?.instructor?.name,
            ]
                .filter(Boolean)
                .map((v) => String(v).toLowerCase());
            return haystacks.some((text) => text.includes(q));
        });
    }, [courses, deferredSearchTerm]);

    const visibleCourses = useMemo(() => {
        return filteredCourses.slice(0, displayLimit);
    }, [filteredCourses, displayLimit]);

    const hasMore = filteredCourses.length > displayLimit;

    const handleLoadMore = useCallback(() => {
        setDisplayLimit(prev => prev + 5);
    }, []);

    const handleSearchSubmit = useCallback((submittedTerm) => {
        trendingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const termToStore = typeof submittedTerm === 'string' ? submittedTerm : searchTerm;
        storeSearchTerm(termToStore);
    }, [searchTerm, storeSearchTerm]);

    const courseCards = useMemo(() => (
        visibleCourses.map((course) => (
            <div key={course.id} onClick={() => handleCourseClick(course.id)} className="cursor-pointer group">
                <CourseCard course={course} />
            </div>
        ))
    ), [visibleCourses, handleCourseClick]);

    return (
        <div className="bg-white text-gray-900 ">
            <Hero
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
            />

            {/* Main Content Section */}
            <section ref={trendingRef} className="py-20 relative left-1/2 w-screen -translate-x-1/2 bg-orange-50 border-y border-orange-100">
                <div className="w-full relative z-10 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col space-y-16">
                        {/* AI Section - Now Full Width / Top */}
                        <div className="w-full">
                            <Suspense fallback={null}>
                                <AICourseRecommendation />
                            </Suspense>
                        </div>

                        {/* Courses Section - Under AI */}
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Courses</h2>
                                    <p className="text-gray-600 text-sm font-normal">Most popular courses this week</p>
                                </div>
                                <button className="bg-white text-gray-900 border border-orange-200 font-semibold text-sm py-2 px-6 rounded hover:bg-orange-50 transition-colors flex items-center space-x-2 self-start md:self-auto">
                                    <Filter className="w-4 h-4" />
                                    <span>Filter</span>
                                </button>
                            </div>

                            {/* Responsive Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {coursesLoading ? (
                                    <div className="col-span-full py-10 text-center text-gray-600">
                                        <div className="animate-pulse flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-400 animate-spin mb-4"></div>
                                            <p>Loading premium courses…</p>
                                        </div>
                                    </div>
                                ) : coursesError ? (
                                    <div className="col-span-full py-10 text-center text-red-400">
                                        {coursesError}
                                    </div>
                                ) : null}

                                {!coursesLoading && !coursesError && searchTerm.trim() && filteredCourses.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-gray-600">
                                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-xl">No courses match “{searchTerm.trim()}”.</p>
                                        <button onClick={() => setSearchTerm('')} className="text-orange-500 hover:underline mt-4">
                                            View all courses
                                        </button>
                                    </div>
                                ) : null}

                                {courseCards}
                            </div>

                            {/* Load More Button */}
                            {hasMore && !coursesLoading && (
                                <div className="flex justify-center pt-10">
                                    <button
                                        onClick={handleLoadMore}
                                        className="bg-white text-gray-900 border border-orange-200 font-semibold text-sm py-2 px-6 rounded hover:bg-orange-50 transition-colors flex items-center space-x-3 group"
                                    >
                                        <span className="font-semibold">Load More Courses</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section className="py-10 relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-slate-100">
                {/* Animated background gradients */}
                <div className="absolute inset-0 bg-linear-to-b from-slate-200/70 via-slate-100 to-slate-200/50" />

                {/* Animated orbs */}
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-slate-300/40 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-400/20 rounded-full blur-3xl animate-pulse-slower" />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-pattern" />

                <div className="w-full relative px-4 sm:px-6 lg:px-8">
                    <div className="card-premium relative max-w-5xl mx-auto border border-orange-200 bg-amber-50 overflow-hidden shadow-sm transition-all duration-200">

                        <div className="relative p-12 md:p-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Ready to Start <span className="text-orange-400">Teaching?</span>
                            </h2>

                            <p className="text-gray-700 text-sm md:text-base font-normal mb-8 max-w-2xl mx-auto leading-relaxed">
                                Join <span className="text-gray-900 font-semibold">thousands of educators</span> earning money by sharing their expertise.
                                Create your first course today and reach <span className="text-gray-900 font-semibold">millions of students</span> worldwide.
                            </p>

                            {/* Stats preview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                                <div className="text-center p-4 rounded-xl bg-orange-50 border border-orange-100">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">200+</div>
                                    <div className="text-xs text-gray-600 uppercase tracking-wider">Active Teachers</div>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-orange-50 border border-orange-100">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">$5000+</div>
                                    <div className="text-xs text-gray-600 uppercase tracking-wider">Earned by Teachers</div>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-orange-50 border border-orange-100">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">7+</div>
                                    <div className="text-xs text-gray-600 uppercase tracking-wider">Countries</div>
                                </div>
                            </div>

                            {/* CTA Buttons with enhanced design */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={handleBecomeTeacher}
                                    className="group/btn relative px-8 py-4 text-sm font-semibold rounded-full bg-orange-400 text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg overflow-hidden"
                                >
                                    <span className="relative flex items-center gap-2">
                                        Become a Teacher
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                </button>

                                <button className="group/btn relative px-8 py-4 text-sm font-semibold rounded-full bg-white hover:bg-orange-50 text-gray-900 border border-orange-100 hover:border-orange-200 transition-all duration-300 overflow-hidden">
                                    <span className="relative flex items-center gap-2">
                                        Learn More
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            </div>

                            
                        </div>
                    </div>
                </div>
            </section>


            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <Suspense fallback={null}>
                    <PaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => setIsPaymentModalOpen(false)}
                        course={selectedCourse}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default Home;
