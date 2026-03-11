import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Zap } from 'lucide-react';
import { api } from '../utils/api';

const AICourseRecommendation = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('teachhub_token'));

    const checkAuth = () => {
        const token = localStorage.getItem('teachhub_token');
        setIsAuthenticated(!!token);
        return !!token;
    };

    const loadRecommendations = async () => {
        const { data } = await api.get('/courses/recommendations');
        setRecommendations(Array.isArray(data?.recommendations) ? data.recommendations : []);
    };

    const truncate = (text, max = 90) => {
        const t = String(text ?? '').trim();
        if (!t) return '';
        if (t.length <= max) return t;
        return `${t.slice(0, max - 1)}…`;
    };


    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            const token = localStorage.getItem('teachhub_token');
            const authed = !!token;
            setIsAuthenticated(authed);

            if (!authed) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                await loadRecommendations();
            } catch (e) {
                console.error('Failed to load recommendations:', e);
                const status = e.response?.status;
                if (status === 429) {
                    setError('The AI service is currently busy (Rate Limit). Please wait a moment and try again.');
                } else {
                    setError('Failed to load personalized recommendations. Please try again later.');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, []);

    // If not authenticated, do NOT show anything
    if (!isAuthenticated && !isLoading) {
        return null;
    }

    // If authenticated but no recommendations yet (or error), do NOT show anything
    if (!isLoading && isAuthenticated && (recommendations.length === 0 || error)) {
        return null;
    }




    return (
        <div className="card-premium bg-linear-to-b from-white to-orange-50/30 border border-orange-100 shadow-sm rounded-2xl p-6 md:p-7">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-200/70">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-gray-900 text-xl font-bold flex items-center space-x-2">
                        <span>AI-Powered Recommendations</span>
                        <Sparkles className="w-5 h-5 text-orange-500" />
                    </h3>
                    <p className="text-gray-700 text-sm font-normal">Personalized picks for your learning path</p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-orange-50/70 rounded-xl p-4 animate-pulse border border-orange-100">
                            <div className="h-4 bg-orange-100 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-orange-100/70 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                        <div
                            key={rec.id}
                            className="bg-white rounded-xl p-4 border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer group animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1">
                                    <h4 className="text-gray-900 text-lg font-bold leading-snug group-hover:text-orange-500 transition-colors">
                                        {rec.title}
                                    </h4>
                                    <p className="text-gray-700 text-sm font-normal mt-1 leading-relaxed">{truncate(rec.description, 80)}</p>
                                    <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-orange-500" />
                                        {rec.reason}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-1 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-1">
                                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                                    <span className="text-xs font-semibold text-gray-900">{rec.confidence}%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-gray-600 font-medium">
                                    {rec.category}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (rec?.id) navigate(`/courses/${rec.id}`);
                                    }}
                                    className="text-orange-500 hover:text-orange-600 hover:underline text-sm font-semibold transition-colors"
                                >
                                    View Course →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(AICourseRecommendation);
