import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-linear-to-b from-white via-orange-50/40 to-white text-gray-900">
            <Navbar />
            <main className="container-custom py-24 min-h-screen">
                <div className="max-w-3xl rounded-2xl border border-orange-100 bg-white p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Admin Dashboard</h1>
                    <p className="text-gray-600">Coming soon...</p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
