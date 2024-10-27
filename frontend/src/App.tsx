import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CreateGroupPage from './components/CreateGroupPage';
import MyGroups from './components/MyGroups';
import Login from './components/login';
import Register from './components/registerpage';
import DistancePreferences from './components/DistancePreferences';
import DietaryRestrictionsPreferences from './components/DietaryRestrictionsPreferences';
import CuisinePreferences from './components/CuisinePreferences';
import SchedulingPage from './components/SchedulingPage';
import AllPreferencesPage from './components/AllPreferencesPage';
import TestPage from './components/TestPage';

import './styles/main.css';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
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
            </Routes>
        </Router>
    );
};

export default App;
