import { useContext } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';
import Logout from './Logout';
import './ProtectedRoute.css';

const ProtectedRoute = () => {
    const { auth, loading } = useContext(AuthContext);

    // Show loading state or return null while checking authentication
    if (loading) {
        return <div>Loading...</div>; // Or any loading spinner
    }

    return auth?.token ? (
        <div className="app-container">
            <header className="app-header">
                <div className="left-side-content">
                    <Link to="/landingpage" className="home-button">
                        GroupEats
                    </Link>
                    <div className="user-info">User: {auth.email}</div>
                </div>
                <div>
                    <nav className="header-nav">
                        <Logout />
                    </nav>
                </div>
            </header>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    ) : (
        // If user is not authenticated, redirect to login page
        <Navigate to="/login" />
    );
};

export default ProtectedRoute;
