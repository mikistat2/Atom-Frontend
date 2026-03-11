import VerifyEmail from './pages/VerifyEmail';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import CourseDetails from './pages/CourseDetails';
import Auth from './pages/Auth';
import Learning from './pages/Learning';
import BecomeTeacher from './pages/BecomeTeacher';

import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/login" element={<Auth initialMode="login" />} />
            <Route path="/register" element={<Auth initialMode="register" />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/become-teacher" element={<BecomeTeacher />} />
            <Route path="/learning/:courseId" element={<Learning />} />

            {/* Protected Routes (we can add wrappers later) */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/checkout/:courseId" 
            element={
              <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

            <Route path="/contact" element={<Contact />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
