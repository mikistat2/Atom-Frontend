import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, Award, Clock, Users, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

import UserAvatar from './UserAvatar';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate('/');
    };

    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <nav className={`absolute top-0 left-0 right-0 z-50 py-2 transition-all duration-300 ${isScrolled
                ? 'bg-linear-to-r from-orange-500/95 via-amber-300/95 to-orange-400/95 backdrop-blur-md border-b-2 border-orange-500 shadow-md'
                : 'bg-linear-to-r from-orange-400/90 via-amber-200/90 to-orange-300/90 backdrop-blur-sm border-b border-orange-400'
                }`} style={{ borderRadius: '0 0 2rem 2rem' }}>
                <div className="container-custom">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-300/60">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-3xl font-bold  text-gray-900 font-sans font-extrabold  tracking-wider uppercase">Atom</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/courses" className="text-gray-900 font-semibold hover:text-orange-700 transition-colors duration-300">
                                Browse Courses
                            </Link>
                            <Link to="/become-teacher" className="text-gray-900 font-semibold hover:text-orange-700 transition-colors duration-300">
                                Become a Teacher
                            </Link>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-3 glass px-3 py-2 rounded-xl hover:bg-orange-50 transition-all cursor-pointer"
                                    >
                                        <UserAvatar
                                            name={user?.name}
                                            avatar={user?.avatar}
                                            size="sm"
                                        />
                                        <span className="font-semibold text-sm hidden sm:block text-gray-900">{user?.name}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-700 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-orange-100 rounded-xl shadow-lg p-2 animate-slide-up flex flex-col gap-1">
                                            <div className="px-3 py-2 border-b border-orange-100 mb-1">
                                                <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                                                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                                            </div>
                                            <Link
                                                to={`/${user?.role}/dashboard`}
                                                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-50 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <TrendingUp className="w-4 h-4" />
                                                <span>Dashboard</span>
                                            </Link>
                                            <button
                                                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-50 text-sm text-gray-700 hover:text-gray-900 transition-colors w-full text-left"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>My Profile</span>
                                            </button>
                                            <button
                                                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-50 text-sm text-gray-700 hover:text-gray-900 transition-colors w-full text-left"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>Settings</span>
                                            </button>
                                            <button onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate('/courses');
                                            }}
                                                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-50 text-sm text-gray-700 hover:text-gray-900 transition-colors w-full text-left"
                                            >
                                                <Search className="w-4 h-4" />
                                                <span>
                                                Browse Courses
                                                </span>
                                            </button>
                                            <div className="h-px bg-orange-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-error/10 text-sm text-error hover:text-red-400 transition-colors w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-secondary text-gray-900 border-gray-200 bg-white hover:bg-orange-50">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="btn btn-primary">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
