import React from 'react';

interface DietaryRestrictionsPreferencesProps {
    goToBack: () => void; // Function to navigate back to My Preferences
}

const DietaryRestrictionsPreferences: React.FC<
    DietaryRestrictionsPreferencesProps
> = ({ goToBack }) => {
    return (
        <div className="dietary-restrictions-preferences-container">
            <h1>DietaryRestrictions Preferences</h1>
            <p>Here you can set your DietaryRestrictions preferences.</p>
            {/* Add your logic for managing DietaryRestrictions preferences here */}

            <button onClick={goToBack} className="back-button">
                Back to Preferences
            </button>
        </div>
    );
};

export default DietaryRestrictionsPreferences;
