import React from 'react';

interface PricePreferencesProps {
    goToBack: () => void; // Function to navigate back to My Preferences
}

const PricePreferences: React.FC<PricePreferencesProps> = ({ goToBack }) => {
    return (
        <div className="drice-preferences-container">
            <h1>Price Preferences</h1>
            <p>Here you can set your Price preferences.</p>
            {/* Add your logic for managing Price preferences here */}

            <button onClick={goToBack} className="back-button">
                Back to Preferences
            </button>
        </div>
    );
};

export default PricePreferences;
