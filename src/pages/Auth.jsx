import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, Lock, User, Sparkles, Eye, EyeOff, ArrowRight, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const blankAuthForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
};

const Auth = ({ initialMode = 'login' }) => {
    const { studentLogin, instructorLogin, register, verifyEmailCode } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query params for role (e.g. ?role=teacher)
    const searchParams = new URLSearchParams(location.search);
    const defaultRole = searchParams.get('role') || 'student';

    const [mode, setMode] = useState(initialMode);
    const [role, setRole] = useState(defaultRole);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');
    const [isAwaitingOtp, setIsAwaitingOtp] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [formData, setFormData] = useState(blankAuthForm);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarDataUrl, setAvatarDataUrl] = useState('');

    const hasRedirectedToTeacherFlow = useRef(false);
    const redirectToTeacherApplication = useCallback(() => {
        if (hasRedirectedToTeacherFlow.current) return;
        hasRedirectedToTeacherFlow.current = true;

        navigate('/become-teacher', {
            state: {
                fromAuth: true,
                originatingPath: `${location.pathname}${location.search}`,
                prefill: {
                    name: formData.name,
                    email: formData.email
                }
            }
        });
    }, [navigate, location.pathname, location.search, formData.name, formData.email]);

    const resetAvatarSelection = useCallback(() => {
        setAvatarDataUrl('');
        setAvatarPreview('');
    }, []);

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        fileToBase64(file)
            .then((dataUrl) => {
                setAvatarPreview(dataUrl);
                setAvatarDataUrl(dataUrl);
            })
            .catch(() => {
                setError('Unable to read the selected profile photo. Please try a different image.');
                resetAvatarSelection();
            });
    };

    const resetForm = useCallback(() => {
        setFormData({ ...blankAuthForm });
        resetAvatarSelection();
    }, [resetAvatarSelection]);

    // Update mode when prop changes (e.g. route change)
    useEffect(() => {
        setMode(initialMode);
        setError('');
        setSuccessMessage('');
        setPendingEmail('');
        setIsAwaitingOtp(false);
        setOtpCode('');
        setOtpError('');
        resetForm();
    }, [initialMode, resetForm]);

    useEffect(() => {
        if (mode === 'login') {
            resetAvatarSelection();
        }
    }, [mode, resetAvatarSelection]);

    useEffect(() => {
        setRole(defaultRole);
    }, [defaultRole]);

    useEffect(() => {
        if (mode === 'register' && role === 'teacher' && !isAwaitingOtp) {
            redirectToTeacherApplication();
        } else if (hasRedirectedToTeacherFlow.current && (role !== 'teacher' || mode !== 'register')) {
            hasRedirectedToTeacherFlow.current = false;
        }
    }, [mode, role, isAwaitingOtp, redirectToTeacherApplication]);

    useEffect(() => {
        if (!location.state?.fromTeacherVerification) return;

        const verifiedEmail = location.state?.email || '';
        setMode('login');
        setRole('teacher');
        setError('');
        setSuccessMessage('Your instructor profile is verified. Sign in to access your dashboard.');
        setIsAwaitingOtp(false);
        setPendingEmail('');
        setOtpCode('');
        setOtpError('');
        setFormData((prev) => ({ ...prev, email: verifiedEmail }));
        setShowPassword(false);

        navigate(`${location.pathname}${location.search}`, {
            replace: true,
            state: {}
        });
    }, [location.state, location.pathname, location.search, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (mode === 'register' && role === 'teacher') {
            redirectToTeacherApplication();
            return;
        }

        setIsLoading(true);

        try {
            if (mode === 'login') {
                const loginMethod = role === 'teacher' ? instructorLogin : studentLogin;
                const userData = await loginMethod(formData.email, formData.password);
                const targetRole = userData?.role || role;
                navigate(`/${targetRole}/dashboard`);
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                const avatarImage = avatarDataUrl || null;

                const emailForOtp = formData.email;
                const response = await register({
                    name: formData.name,
                    email: emailForOtp,
                    password: formData.password,
                    role,
                    avatarImage
                });
                setSuccessMessage(response?.message || 'We sent a verification code to your email. Enter it below to finish signing up.');
                setPendingEmail(emailForOtp);
                setIsAwaitingOtp(true);
                setOtpCode('');
                setOtpError('');
                resetForm();
                setShowPassword(false);
            }
        } catch (err) {
            // ... error handling ...
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
            if (status === 403) {
                setError(`Access Denied: Please ensure you've selected the correct role (Student vs Teacher).`);
            } else if (status) {
                setError(`${status}: ${serverMsg || err.message}`);
            } else {
                setError(err.message || 'Authentication failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!pendingEmail) return;
        setOtpError('');
        setError('');
        setSuccessMessage('');
        setIsVerifyingOtp(true);

        try {
            const response = await verifyEmailCode(pendingEmail, otpCode.trim());
            setSuccessMessage(response?.message || 'Email verified successfully. You can now log in.');
            setIsAwaitingOtp(false);
            const emailToUse = pendingEmail;
            setPendingEmail('');
            setOtpCode('');
            setMode('login');
            setShowPassword(false);
            setFormData({ ...blankAuthForm, email: emailToUse });
        } catch (err) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
            setOtpError(status ? `${status}: ${serverMsg || err.message}` : err.message || 'Verification failed.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    return (
        <div className="w-full flex bg-linear-to-b from-white to-orange-50/50 py-8 lg:py-0">
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center rounded-3xl mx-4 my-4 border border-orange-100 shadow-sm">
                <img
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2670&auto=format&fit=crop"
                    alt="Learning background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-white/85 via-orange-50/70 to-orange-100/60 z-0"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-300/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 max-w-lg px-12">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-8 shadow-xl shadow-orange-300/50">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Start your <span className="bg-linear-to-r from-gray-900 to-orange-500 bg-clip-text text-transparent">learning journey</span> today.
                    </h1>
                    <p className="text-xl text-gray-700 mb-8">
                        Join our community of over 50,000 students and master new skills with industry experts.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <div className="max-w-md w-full animate-slide-up bg-white border border-orange-100 rounded-3xl p-8 shadow-sm">
                    {isAwaitingOtp ? (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify your email</h2>
                                <p className="text-gray-600">
                                    Enter the 6-digit code we sent to <span className="text-gray-900 font-semibold">{pendingEmail}</span> to finish creating your account.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-orange-50/60 border border-orange-100">
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Verification Code</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                                            placeholder="123456"
                                            required
                                        />
                                    </div>
                                    {otpError && (
                                        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm text-center">
                                            {otpError}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isVerifyingOtp || otpCode.trim().length < 6}
                                        className="bg-orange-400 text-white font-semibold text-sm py-3 px-6 rounded w-full flex items-center justify-center gap-2 hover:opacity-90 transition-colors"
                                    >
                                        {isVerifyingOtp ? 'Verifying...' : 'Verify Email'}
                                        {!isVerifyingOtp && <ArrowRight className="w-4 h-4" />}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center lg:text-left mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                                </h2>
                                <p className="text-gray-600">
                                    {mode === 'login'
                                        ? 'Please sign in to continue.'
                                        : 'Sign up to get started today.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-8 p-1 bg-orange-50 rounded-xl border border-orange-100">
                                {['student', 'teacher'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all capitalize ${role === r
                                            ? 'bg-linear-to-r from-orange-400 to-amber-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {successMessage && (
                                    <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 mt-0.5" />
                                        <div>
                                            <p className="font-medium">{successMessage}</p>
                                            <p className="text-xs text-gray-600 mt-1">After verifying, sign in to access your dashboard.</p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-start gap-2">
                                        <span className="block w-1.5 h-1.5 rounded-full bg-error mt-1.5 shrink-0"></span>
                                        {error}
                                    </div>
                                )}

                                {mode === 'register' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Profile Photo <span className="text-gray-500">(Optional)</span></label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden">
                                                    {avatarPreview ? (
                                                        <img src={avatarPreview} alt="Selected avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-orange-200 text-sm font-semibold text-gray-700 cursor-pointer hover:border-orange-400">
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                                        Upload Photo
                                                    </label>
                                                    <p className="text-xs text-gray-500">PNG or JPG up to 5MB.</p>
                                                    {avatarPreview && (
                                                        <button type="button" className="text-xs text-error hover:text-error/80" onClick={resetAvatarSelection}>
                                                            Remove photo
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {mode === 'register' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Confirm Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {mode === 'login' && (
                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center space-x-2 cursor-pointer group">
                                            <input type="checkbox" className="rounded border-gray-300 bg-white checked:bg-orange-500 transition-colors cursor-pointer" />
                                            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                                        </label>
                                        <a href="#" className="text-orange-500 hover:text-orange-600 transition-colors font-medium">
                                            Forgot password?
                                        </a>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-orange-400 text-white font-semibold text-sm py-3 px-6 rounded w-full shadow-lg shadow-orange-200/70 flex items-center justify-center gap-2 group hover:opacity-90 transition-colors"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-gray-600">
                                    {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                                    <Link
                                        to={mode === 'login' ? '/register' : '/login'}
                                        className="ml-2 text-orange-500 hover:text-orange-600 transition-colors font-bold"
                                    >
                                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                                    </Link>
                                </p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-orange-100">
                                <p className="text-center text-sm text-gray-600 mb-4">Or continue with</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="bg-white border border-orange-100 text-gray-900 font-semibold text-sm py-2.5 px-4 rounded hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </button>
                                    <button className="bg-white border border-orange-100 text-gray-900 font-semibold text-sm py-2.5 px-4 rounded hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                        </svg>
                                        GitHub
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
