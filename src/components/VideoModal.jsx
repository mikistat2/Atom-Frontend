import React from 'react';
import { X } from 'lucide-react';

const VideoModal = ({ isOpen, onClose, videoUrl, title }) => {
    if (!isOpen) return null;

    const renderVideo = () => {
        if (!videoUrl) return <div className="text-white text-center">No video URL provided</div>;

        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop();
            return (
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title={title || "Video Player"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-xl"
                ></iframe>
            );
        }

        return (
            <video controls autoPlay className="absolute inset-0 w-full h-full rounded-xl">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl shadow-2xl border border-white/10 animate-scale-up">
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:-right-12 text-white hover:text-primary transition-colors p-2"
                >
                    <X className="w-8 h-8" />
                </button>
                {renderVideo()}
            </div>
        </div>
    );
};

export default VideoModal;
