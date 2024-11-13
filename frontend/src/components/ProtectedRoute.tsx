import { useContext } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';
import Logout from './Logout';

const ProtectedRoute = () => {
    const { auth, loading } = useContext(AuthContext);
    const location = useLocation();

    // Show loading state or return null while checking authentication
    if (loading) {
        return <div>Loading...</div>; // Or any loading spinner
    }

    return auth?.token ? (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <div className="user-info">
                        {/* Render Logged in user info,*/}
                        User: {auth.email}
                        {/* then Render <Outlet>. <Outlet> renders the child route's element */}
                    </div>
                    <nav className="header-nav">
                        {location.pathname !== '/landingpage' && (
                            <Link to="/landingpage" className="nav-link">
                                Home
                            </Link>
                        )}
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
