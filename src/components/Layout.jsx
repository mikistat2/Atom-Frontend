import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Layout = () => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="grow pt-24 px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
