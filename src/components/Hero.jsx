import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles, Play, BookOpen, Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = ({ searchValue, onSearchChange, onSearchSubmit }) => {
    const [localSearchValue, setLocalSearchValue] = useState('');
    const value = searchValue ?? localSearchValue;
    const setValue = onSearchChange ?? setLocalSearchValue;
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearchSubmit?.(String(value ?? '').trim());
    };
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
         <section className="relative -mt-24 left-1/2 w-screen -translate-x-1/2 min-h-screen flex flex-col justify-center overflow-hidden pt-24 bg-white">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2400&auto=format&fit=crop"
                    alt="Background"
                    className="w-full h-full object-cover object-center saturate-110 contrast-110"
                />
                <div className="absolute inset-0 bg-linear-to-b from-white/58 via-white/45 to-orange-50/52"></div>
                <div className="absolute inset-0 bg-white/18"></div>
            </div>

            {/* Floating Dynamic Elements (Behind content) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-200/40 blur-[100px]"
                />
                <motion.div
                    animate={{
                        y: [0, 40, 0],
                        x: [0, -30, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-orange-100/60 blur-[120px]"
                />
            </div>

            <div className="container-custom relative z-10 w-full">
                <motion.div
                    className="max-w-4xl mx-auto text-center space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Badge */}
                    <motion.div variants={itemVariants} className="flex justify-center">
                        <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-orange-100 shadow-sm hover:shadow-md transition-colors cursor-default">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium text-gray-900">AI-Powered Learning Platform</span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900">
                            Unlock Your <br className="md:hidden" />
                            <span className="bg-linear-to-r from-gray-900 to-orange-400 bg-clip-text text-transparent">Potential</span>
                        </h1>
                        <p className="text-base md:text-lg text-gray-700 font-normal max-w-2xl mx-auto leading-relaxed">
                            Master new skills with AI-driven recommendations and expert-led courses.
                            Start your journey to success today.
                        </p>

                        <div className="flex items-center justify-center space-x-4 mt-10 mb-10">

                            <button onClick={() => navigate('/register')} className="bg-orange-400 text-white font-semibold text-sm py-2 px-6 rounded hover:opacity-90 transition-colors">
                            Get Started
                        </button>

                        <button onClick={() => navigate('/login')} className="border border-orange-100 text-gray-900 font-semibold text-sm py-2 px-6 rounded hover:bg-orange-50 transition-colors">
                            Login
                        </button>

                        </div>

                        
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div variants={itemVariants} className="max-w-3xl mx-auto w-full">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-2xl p-1.5 sm:p-2 flex items-center space-x-2 sm:space-x-3 transform transition-all hover:scale-[1.01] hover:shadow-lg border border-orange-100"
                        >
                            <Search className="w-5 h-5 text-gray-600 ml-2 sm:w-6 sm:h-6 sm:ml-3" />
                            <input
                                id="hero-search"
                                type="text"
                                placeholder="What do you want to learn today?"
                                className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded px-3 py-2 sm:px-4 sm:py-2.5 text-gray-900 placeholder:text-gray-600 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                                value={value}
                                onChange={(e) => setValue(e.target.value)} // the onchange function is called in the input fild and the on click is handled in the button.
                            />
                            <button type="submit" className="bg-orange-400 text-white font-semibold text-xs sm:text-sm py-2 px-3 sm:px-5 rounded hover:opacity-90 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0">
                                <span>Search</span>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </form>
                    </motion.div>

                    {/* Stats Ribbon */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-orange-100 mt-12"
                    >
                        {[
                            { count: "10K+", label: "Active Students" },
                            { count: "500+", label: "Expert Teachers" },
                            { count: "1.2K+", label: "Premium Courses" },
                            { count: "4.9", label: "Average Rating" }
                        ].map((stat, index) => (
                            <div key={index} className="text-center group cursor-default">
                                <div className="text-3xl font-bold text-gray-900 group-hover:text-orange-400 transition-colors duration-300">{stat.count}</div>
                                <div className="text-gray-600 text-sm font-normal uppercase tracking-wider mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Feature Cards as Bottom Strip */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 mb-10"
                >
                    {[
                        { icon: Play, title: "Video Lessons", desc: "High-quality content from experts", color: "from-primary to-secondary" },
                        { icon: BookOpen, title: "Rich Resources", desc: "Interactive quizzes & materials", color: "from-accent to-primary" },
                        { icon: Award, title: "Certificates", desc: "Earn recognized credentials", color: "from-secondary to-accent" },
                        { icon: Users, title: "Community", desc: "Learn with peers worldwide", color: "from-primary to-accent" }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="bg-white border border-orange-100 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-200"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-gray-900 text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-700 text-sm font-normal">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
