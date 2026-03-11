import React, { useState } from 'react';

const UserAvatar = ({ name, avatar, size = 'md', border = true, className = '' }) => {
    const [imgError, setImgError] = useState(false);

    // Size configurations
    const sizes = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-[12px]',
        md: 'w-10 h-10 text-[14px]',
        lg: 'w-12 h-12 text-[16px]',
        xl: 'w-16 h-16 text-[20px]',
        '2xl': 'w-24 h-24 text-[32px]'
    };

    // Gradient selection based on name
    const getGradient = (name) => {
        const gradients = [
            'from-primary to-accent',
            'from-blue-500 to-indigo-600',
            'from-purple-500 to-pink-600',
            'from-emerald-500 to-teal-600',
            'from-orange-500 to-rose-600',
            'from-cyan-500 to-blue-600'
        ];

        if (!name) return gradients[0];

        // Simple hash to consistently pick a gradient
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return gradients[index % gradients.length];
    };

    // Get initial
    const getInitial = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    const currentSize = sizes[size] || sizes.md;
    const gradient = getGradient(name);
    const initial = getInitial(name);

    return (
        <div
            className={`
        ${currentSize} 
        rounded-full 
        flex-shrink-0 
        relative 
        flex items-center justify-center 
        overflow-hidden 
        ${border ? 'border border-white/10' : ''} 
        ${className}
      `}
        >
            {avatar && !imgError ? (
                <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <span className="font-bold text-white leading-none">
                        {initial}
                    </span>
                </div>
            )}

            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-white/5 pointer-events-none" />
        </div>
    );
};

export default UserAvatar;
