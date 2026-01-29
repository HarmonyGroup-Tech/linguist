import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'learner' | 'client' }) {
    const { currentUser, userRole, loading, isEmailVerified } = useAuth();
    const location = useLocation();

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-background text-white">Loading...</div>;

    if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;

    // --- Verification Gate ---
    // If user is logged in but not verified, they must stay on login/verification screen
    if (!isEmailVerified && location.pathname !== '/login') {
        return <Navigate to="/login" replace />;
    }

    if (role && userRole && userRole !== role) {
        return <Navigate to={userRole === 'learner' ? '/learn' : '/client'} replace />;
    }

    return <>{children}</>;
}
