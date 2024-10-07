import React from 'react';

interface MyGroupsProps {
    goToCreateGroup: () => void;
    goToLanding: () => void;
}

const MyGroups: React.FC<MyGroupsProps> = ({
    goToCreateGroup,
    goToLanding,
}) => {
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
            <button onClick={goToCreateGroup} className="cta-button">
                Create a New Group
            </button>
            <button onClick={goToLanding} className="back-button">
                Back to Landing Page
            </button>
        </div>
    );
};

export default MyGroups;
