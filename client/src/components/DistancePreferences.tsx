import React from 'react';

interface DistancePreferencesProps {
    goToBack: () => void; // Function to navigate back to My Preferences
}

const DistancePreferences: React.FC<DistancePreferencesProps> = ({
    goToBack,
}) => {
    return (
        <div className="distance-preferences-container">
            <h1>Distance Preferences</h1>
            <p>Here you can set your Distance preferences.</p>
            {/* Add your logic for managing Distance preferences here */}

            <button onClick={goToBack} className="back-button">
                Back to Preferences
            </button>
        </div>
    );
};

export default DistancePreferences;
