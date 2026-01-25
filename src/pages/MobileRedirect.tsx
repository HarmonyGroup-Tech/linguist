import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function MobileRedirect() {
    const { currentUser, userRole, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (currentUser) {
                // Direct to associated dashboard
                switch (userRole) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'client':
                        navigate('/client');
                        break;
                    case 'learner':
                    default:
                        navigate('/learn');
                        break;
                }
            } else {
                // Not signed in, direct to main page
                navigate('/');
            }
        }
    }, [currentUser, userRole, loading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-gray">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-brand-yellow"></div>
        </div>
    );
}
