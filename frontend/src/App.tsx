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
import Dashboard from './components/Dashboard';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import YelpRestaurants from './components/TestYelpRestaurants';
import SelectedGroup from './components/SelectedGroup';
import JoinGroup from './components/JoinGroup';
import GroupEvent from './components/GroupEvent';
import './styles/main.css';

interface ProtectedRouteProps {
    element: JSX.Element;
    authenticated: boolean;
}

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
//     element,
//     authenticated,
//     ...rest
// }) => {
//     return authenticated ? (
//         <Route {...rest} element={element} />
//     ) : (
//         <Navigate to="/login" replace />
//     );
// };

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // useEffect(() => {
    //     const checkAuthentication = async () => {
    //         try {
    //             const token = localStorage.getItem('token');

    //             if (token) {
    //                 const response = await fetch('/verify-token', {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 });

    //                 console.log(
    //                     'Token verification response status:',
    //                     response.status
    //                 ); // Log the response status

    //                 if (response.ok) {
    //                     setIsAuthenticated(true);
    //                 } else {
    //                     localStorage.removeItem('token');
    //                 }
    //             }
    //         } catch (error) {
    //             console.error('Error checking authentication:', error);
    //         }
    //         console.log('isAuthenticated:', isAuthenticated); // Log the authentication state
    //     };

    //     checkAuthentication();
    // }, []);
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* PUBLIC PAGES BEGIN ******************************** */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/test-page" element={<TestPage />} />
                    <Route path="/TestYelpRestaurants" element={<YelpRestaurants />} />
                    {/* PUBLIC PAGES END ******************************** */}

                    {/* PRIVATE PAGES BEGIN ******************************** */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/landingpage" element={<LandingPage />} />
                        <Route path="/create-group" element={<CreateGroupPage />} />
                        <Route path="/my-groups" element={<MyGroups />} />
                        <Route path="/selected-group/:groupid" element={<SelectedGroup />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/distance-preferences" element={<DistancePreferences />} />
                        <Route path="/dietary-restrictions" element={<DietaryRestrictionsPreferences />} />
                        <Route path="/cuisine-preferences" element={<CuisinePreferences />} />
                        <Route path="/scheduling" element={<SchedulingPage />} />
                        <Route path="/join-group" element={<JoinGroup />} />
                        <Route path="/all-preferences" element={<AllPreferencesPage />} />
                        <Route path="/group-event" element={<GroupEvent />} />
                        <Route path="group-event/:groupid" element={<GroupEvent />} />
                        <Route path="/groups" element={<CreateGroupPage />} />
                    </Route>
                    {/* PRIVATE PAGES END ******************************** */}
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
