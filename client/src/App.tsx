import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import CreateGroupPage from './components/CreateGroupPage';
import MyGroups from './components/MyGroups';

import './styles/main.css';
import DistancePreferences from './components/DistancePreferences';
import DietaryRestrictionsPreferences from './components/DietaryRestrictionsPreferences';
import CuisinePreferences from './components/CuisinePreferences';
import SchedulingPage from './components/SchedulingPage';
import AllPreferencesPage from './components/AllPreferencesPage';

import Login from './components/login';
import Register from './components/registerpage';

const App = () => {
    const [currentPage, setCurrentPage] = useState('landing');

    const renderPage = () => {
        switch (currentPage) {
            case 'landing':
                return (
                    <LandingPage
                        goToCreateGroup={() => setCurrentPage('create-group')}
                        goToMyGroups={() => setCurrentPage('my-groups')}
                        goToAllPreferences={() =>
                            setCurrentPage('all-preferences')
                        }
                        goToLogin={() => setCurrentPage('login')}
                    />
                );
            case 'create-group':
                return (
                    <CreateGroupPage
                        goToLandingPage={() => setCurrentPage('landing')}
                        goToMyGroups={() => setCurrentPage('my-groups')}
                    />
                );
            case 'my-groups':
                return (
                    <MyGroups
                        goToCreateGroup={() => setCurrentPage('create-group')}
                        goToLanding={() => setCurrentPage('landing')}
                        goToAllPreferences={() =>
                            setCurrentPage('all-preferences')
                        }
                    />
                );

            case 'cuisine-preferences':
                return <CuisinePreferences />;
            case 'dietary-restrictions-preferences':
                return <DietaryRestrictionsPreferences />;
            case 'distance-preferences':
                return <DistancePreferences />;

            case 'scheduling-page':
                return (
                    <SchedulingPage
                    // goToBack={() => setCurrentPage('my-preferences')}
                    />
                );
            case 'all-preferences':
                return (
                    <AllPreferencesPage
                        goToLanding={() => setCurrentPage('landing')}
                        goToMyGroups={() => setCurrentPage('my-groups')}
                        goToCreateGroup={() => setCurrentPage('create-group')}
                    />
                );
            case 'login':
                return <Login />;
            case 'register':
                return <Register />;
            default:
                return (
                    <LandingPage
                        goToCreateGroup={() => setCurrentPage('create-group')}
                        goToAllPreferences={() =>
                            setCurrentPage('all-preferences')
                        }
                        goToMyGroups={() => setCurrentPage('my-groups')}
                        goToLogin={() => setCurrentPage('login')}
                    />
                );
        }
    };

    return <div>{renderPage()}</div>;
};

export default App;
