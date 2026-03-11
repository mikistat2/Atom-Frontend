import React, { useState, useEffect } from 'react';
import {
    User, Mail, Lock, BookOpen, Briefcase, Award,
    ArrowRight, Star, GraduationCap, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const initialTeacherForm = {
    name: '',
    email: '',
    accountNumber: '',
    password: '',
    confirmPassword: '',
    expertise: '',
    experience: '',
    bio: '',
    pronouns: '',
    title: ''
};

const BecomeTeacher = () => {
    const { teacherRegister } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState(initialTeacherForm);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarDataUrl, setAvatarDataUrl] = useState('');
    const prefill = location?.state?.prefill;

    useEffect(() => {
        if (!prefill) return;

        setFormData((prev) => ({
            ...prev,
            ...Object.entries(prefill).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {})
        }));
    }, [prefill]);

    const clearAvatarSelection = () => {
        setAvatarPreview('');
        setAvatarDataUrl('');
    };

    const resetForm = () => {
        setFormData({ ...initialTeacherForm });
        clearAvatarSelection();
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setAvatarPreview(typeof dataUrl === 'string' ? dataUrl : '');
            setAvatarDataUrl(typeof dataUrl === 'string' ? dataUrl : '');
        };
        reader.onerror = () => {
            setError('Unable to read the selected profile photo. Please try a different image.');
            clearAvatarSelection();
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error("Passwords do not match");
            }

            const avatarImage = avatarDataUrl || null;

            const emailForLogin = formData.email;
            await teacherRegister({ ...formData, avatarImage });
            resetForm();
            setStep(1);

            navigate('/login?role=teacher', {
                replace: true,
                state: {
                    fromTeacherRegistration: true,
                    email: emailForLogin
                }
            });
        } catch (err) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
            setError(status ? `${status}: ${serverMsg || err.message}` : err.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col lg:flex-row text-white relative overflow-hidden rounded-3xl my-4 mx-auto max-w-[1400px]">
            {/* Unique Background for Teacher Page */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2670&auto=format&fit=crop"
                    alt="Teaching Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80"></div>
            </div>

            {/* Left Side - Content */}
            <div className="w-full lg:w-1/2 relative z-10 flex flex-col justify-center p-8 lg:p-16 order-2 lg:order-1">
                <Link to="/" className="inline-flex items-center space-x-2 mb-12 w-fit group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">TeachHub for Instructors</span>
                </Link>

                <div className="max-w-xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                        Inspire the Next <br />
                        <span className="gradient-text">Generation</span>
                    </h1>
                    <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                        Join our community of expert instructors. Share your knowledge,
                        earnings, and make a global impact from the comfort of your home.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-6 mb-12">
                        {[
                            { icon: User, title: "Millions of Students", desc: "Reach a global audience" },
                            { icon: Briefcase, title: "Teach Your Way", desc: "Publish course your way" },
                            { icon: Award, title: "Rewarding", desc: "Earn competitive income" },
                            { icon: Star, title: "Expert Community", desc: "Support from peers" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <div className="p-2 rounded-lg bg-white/5 text-primary">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{item.title}</h3>
                                    <p className="text-sm text-text-secondary">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <img
                                    key={i}
                                    src={`https://i.pravatar.cc/100?img=${i + 20}`}
                                    alt="Instructor"
                                    className="w-8 h-8 rounded-full border-2 border-background"
                                />
                            ))}
                        </div>
                        <p>Join 2,000+ instructors today</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-8 bg-background/50 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none order-1 lg:order-2">
                <div className="max-w-md w-full glass-strong p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in-up">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Apply as Instructor</h2>
                        <p className="text-text-secondary">Step {step} of 2: {step === 1 ? 'Personal Details' : 'Professional Profile'}</p>
                        <div className="w-full h-1 bg-white/10 mt-4 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                style={{ width: step === 1 ? '50%' : '100%' }}
                            ></div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-error/10 text-error text-sm mb-4">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="text"
                                            required
                                            className="input pl-12 w-full"
                                            placeholder="Dr. Sarah Johnson"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="email"
                                            required
                                            className="input pl-12 w-full"
                                            placeholder="sarah@university.edu"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Profile Photo <span className="text-text-secondary">(Optional)</span></label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Selected avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-text-secondary" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/20 text-sm font-semibold text-white/80 cursor-pointer hover:border-primary/60">
                                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                                Upload Photo
                                            </label>
                                            <p className="text-xs text-text-secondary">PNG or JPG up to 5MB.</p>
                                            {avatarPreview && (
                                                <button type="button" className="text-xs text-error hover:text-error/80" onClick={clearAvatarSelection}>
                                                    Remove photo
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">CBE Account Number</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="password"
                                            required
                                            className="input pl-12 w-full"
                                            placeholder="1000535350942"
                                            value={formData.accountNumber}
                                            onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="password"
                                            required
                                            className="input pl-12 w-full"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="password"
                                            required
                                            className="input pl-12 w-full"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="btn btn-primary w-full mt-4"
                                >
                                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Area of Expertise</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="text"
                                            required
                                            className="input pl-12 w-full"
                                            placeholder="e.g. Web Development, Data Science"
                                            value={formData.expertise}
                                            onChange={e => setFormData({ ...formData, expertise: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Years of Experience</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-3 w-5 h-5 text-text-secondary" />
                                        <select
                                            className="input pl-12 w-full appearance-none bg-surface"
                                            value={formData.experience}
                                            onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                        >
                                            <option value="">Select experience</option>
                                            <option value="0-2">0-2 years</option>
                                            <option value="3-5">3-5 years</option>
                                            <option value="5-10">5-10 years</option>
                                            <option value="10+">10+ years</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Brief Bio</label>
                                    <textarea
                                        className="input w-full min-h-[100px] py-3"
                                        placeholder="Tell us a bit about yourself and what you plan to teach..."
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Preferred Pronouns <span className="text-text-secondary">(Optional)</span></label>
                                    <input
                                        className="input w-full"
                                        placeholder="She/Her, He/Him, They/Them, etc."
                                        value={formData.pronouns}
                                        onChange={e => setFormData({ ...formData, pronouns: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1">Professional Title <span className="text-text-secondary">(Optional)</span></label>
                                    <input
                                        className="input w-full"
                                        placeholder="Senior Engineer, Professor, etc."
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="flex space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn btn-primary flex-1"
                                    >
                                        {isLoading ? 'Processing...' : 'Submit Application'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <p className="text-center text-sm text-text-secondary mt-6">
                        Already an instructor? <Link to="/login?role=teacher" className="text-primary hover:text-white transition-colors">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BecomeTeacher;
