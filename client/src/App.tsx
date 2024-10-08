import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import CreateGroupPage from './components/CreateGroupPage';
import MyGroups from './components/MyGroups';
import MyPreferences from './components/MyPreferences';
import './styles/main.css';
import PricePreferences from './components/PricePreferences';
import DistancePreferences from './components/DistancePreferences';
import DietaryRestrictionsPreferences from './components/DietaryRestrictionsPreferences';
import CuisinePreferences from './components/CuisinePreferences';
import SchedulingPage from './components/SchedulingPage';

const App = () => {
    const [currentPage, setCurrentPage] = useState('landing');

    const renderPage = () => {
        switch (currentPage) {
            case 'landing':
                return (
                    <LandingPage
                        goToCreateGroup={() => setCurrentPage('create-group')}
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
                        goToMyPreferences={() =>
                            setCurrentPage('my-preferences')
                        }
                    />
                );
            case 'my-preferences':
                return (
                    <MyPreferences
                        goToLanding={() => setCurrentPage('landing')}
                        goToCuisine={() =>
                            setCurrentPage('cuisine-preferences')
                        }
                        goToDietaryRestrictions={() =>
                            setCurrentPage('dietary-restrictions-preferences')
                        }
                        goToDistance={() =>
                            setCurrentPage('distance-preferences')
                        }
                        goToPrice={() => setCurrentPage('price-preferences')}
                        goToSchedule={() => setCurrentPage('scheduling-page')}
                    />
                );

            case 'cuisine-preferences':
                return (
                    <CuisinePreferences
                        goToBack={() => setCurrentPage('my-preferences')}
                    />
                );
            case 'dietary-restrictions-preferences':
                return (
                    <DietaryRestrictionsPreferences
                        goToBack={() => setCurrentPage('my-preferences')}
                    />
                );
            case 'distance-preferences':
                return (
                    <DistancePreferences
                        goToBack={() => setCurrentPage('my-preferences')}
                    />
                );
            case 'price-preferences':
                return (
                    <PricePreferences
                        goToBack={() => setCurrentPage('my-preferences')}
                    />
                );
            case 'scheduling-page':
                return (
                    <SchedulingPage
                        goToBack={() => setCurrentPage('my-preferences')}
                    />
                );
            default:
                return (
                    <LandingPage
                        goToCreateGroup={() => setCurrentPage('create-group')}
                    />
                );
        }
    };

    return <div>{renderPage()}</div>;
};

export default App;
