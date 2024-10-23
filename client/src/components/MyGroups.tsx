import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyGroups: React.FC = () => {
    const navigate = useNavigate(); // useNavigate hook for navigation

    return (
        <div className="my-groups-container">
            <h1>My Groups</h1>
            <div className="group-list">
                <div className="group-card">
                    <h2>Group 1</h2>
                    <p>Description: This is the first group</p>
                    <p>Preferences: None</p>
                </div>
                <div className="group-card">
                    <h2>Group 2</h2>
                    <p>Description: This is the second group</p>
                    <p>Preferences: None</p>
                </div>
            </div>

            {/* Flex container for the buttons */}
            <div className="button-container">
                <button
                    onClick={() => navigate('/create-group')} // Navigate to Create Group
                    className="cta-button"
                    type="button"
                >
                    Create a New Group
                </button>

                <button
                    onClick={() => navigate('/preferences')} // Navigate to Preferences
                    className="cta-button"
                    type="button"
                >
                    Go to My Preferences
                </button>
            </div>

            <button onClick={() => navigate('/')} className="back-button">
                Back to Landing Page
            </button>
        </div>
    );
};

export default MyGroups;
