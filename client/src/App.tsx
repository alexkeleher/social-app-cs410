import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import CreateGroupPage from './components/CreateGroupPage';
import MyGroups from './components/MyGroups';
import './styles/main.css';

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
                        goToLandingPage={() => setCurrentPage('landing')} // Pass prop correctly
                        goToMyGroups={() => setCurrentPage('my-groups')}
                    />
                );
            case 'my-groups':
                return (
                    <MyGroups
                        goToLanding={() => setCurrentPage('landing')}
                        goToCreateGroup={() => setCurrentPage('create-group')}
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
