import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const isTokenExpired = (token) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return true;

            const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
            const payload = JSON.parse(payloadJson);

            if (!payload?.exp) return false; // if no exp, treat as non-expiring
            const nowSeconds = Math.floor(Date.now() / 1000);
            return nowSeconds >= payload.exp;
        } catch {
            return true;
        }
    };

    useEffect(() => {
        const boot = async () => {
            const token = localStorage.getItem('teachhub_token');
            const storedUser = localStorage.getItem('teachhub_user');

            if (!token) {
                setLoading(false);
                return;
            }

            if (isTokenExpired(token)) {
                localStorage.removeItem('teachhub_token');
                localStorage.removeItem('teachhub_user');
                setUser(null);
                setLoading(false);
                return;
            }

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    localStorage.removeItem('teachhub_user');
                }
            }

            try {
                const { data } = await api.get('/auth/me');
                if (data?.user) {
                    setUser(data.user);
                    localStorage.setItem('teachhub_user', JSON.stringify(data.user));
                }
            } catch (e) {
                localStorage.removeItem('teachhub_token');
                localStorage.removeItem('teachhub_user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        boot();
    }, []);

    const studentLogin = async (email, password) => {
        const { data } = await api.post('/auth/student-login', { email, password });
        if (!data?.token || !data?.user) throw new Error('Invalid login response');

        localStorage.setItem('teachhub_token', data.token);
        localStorage.setItem('teachhub_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const instructorLogin = async (email, password) => {
        const { data } = await api.post('/auth/instructor-login', { email, password });
        if (!data?.token || !data?.user) throw new Error('Invalid login response');

        localStorage.setItem('teachhub_token', data.token);
        localStorage.setItem('teachhub_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const register = async (...args) => {
        let payload;

        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
            payload = args[0];
        } else {
            const [name, email, password, role = 'student', extra = {}] = args;
            payload = { name, email, password, role, ...(extra || {}) };
        }

        const { data } = await api.post('/auth/register', payload);
        if (!data?.user) throw new Error('Invalid register response');
        return data;
    };

    const teacherRegister = async (formData) => {
        const { data } = await api.post('/auth/teacher-register', formData);
        if (!data?.user) throw new Error('Invalid register response');
        return data;
    };

    const verifyEmailCode = async (email, code) => {
        const { data } = await api.post('/auth/verify-email', { email, token: code });
        return data;
    };

    const login = studentLogin;

    const logout = () => {
        setUser(null);
        localStorage.removeItem('teachhub_token');
        localStorage.removeItem('teachhub_user');
    };

    const value = {
        user,
        loading,
        login,
        studentLogin,
        instructorLogin,
        register,
        teacherRegister,
        verifyEmailCode,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
