import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';

const ProtectedRoute = () => {
    const { auth, loading } = useContext(AuthContext);

    // Show loading state or return null while checking authentication
    if (loading) {
        return <div>Loading...</div>; // Or any loading spinner
    }

    return auth?.token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
