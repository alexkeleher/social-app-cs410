import React from 'react';

interface CuisinePreferencesProps {
    goToBack: () => void; // Function to navigate back to My Preferences
}

const CuisinePreferences: React.FC<CuisinePreferencesProps> = ({
    goToBack,
}) => {
    return (
        <div className="cuisine-preferences-container">
            <h1>Cuisine Preferences</h1>
            <p>Here you can set your cuisine preferences.</p>
            {/* Add your logic for managing cuisine preferences here */}

            <button onClick={goToBack} className="back-button">
                Back to Preferences
            </button>
        </div>
    );
};

export default CuisinePreferences;
