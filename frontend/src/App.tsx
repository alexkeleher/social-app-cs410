import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CreateGroupPage from './components/CreateGroupPage';
import MyGroups from './components/MyGroups';
import Login from './components/Login';
import Register from './components/RegisterPage';
import DistancePreferences from './components/DistancePreferences';
import DietaryRestrictionsPreferences from './components/DietaryRestrictionsPreferences';
import CuisinePreferences from './components/CuisinePreferences';
import SchedulingPage from './components/SchedulingPage';
import AllPreferencesPage from './components/AllPreferencesPage';
import TestPage from './components/TestPage';

import './styles/main.css';

interface ProtectedRouteProps {
    element: JSX.Element;
    authenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({element, authenticated, ...rest}) => {
    return authenticated ? (
        <Route {...rest} element={element} />
    )   :   (
        <Navigate to="/login" replace />
    );
};

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const token = localStorage.getItem('token');

                if (token) {
                    const response = await fetch('/verify-token', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem('token');
                    }
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
            }
        };
        
        checkAuthentication();
    }, []);
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create-group" element={<CreateGroupPage />} />
                <Route path="/my-groups" element={<MyGroups />} />
                <Route
                    path="/distance-preferences"
                    element={<DistancePreferences />}
                />
                <Route
                    path="/dietary-restrictions"
                    element={<DietaryRestrictionsPreferences />}
                />
                <Route
                    path="/cuisine-preferences"
                    element={<CuisinePreferences />}
                />
                <Route path="/scheduling" element={<SchedulingPage />} />
                <Route
                    path="/all-preferences"
                    element={<AllPreferencesPage />}
                />
                <Route path="/test-page" element={<TestPage />} />
                <Route path="/login" element={ <ProtectedRoute element={<Login />} authenticated={isAuthenticated} />} />
                <Route path="/groups" element={ <ProtectedRoute element={<CreateGroupPage />} authenticated={isAuthenticated} />} 
               />
            </Routes>
        </Router>
    );
};

export default App;
