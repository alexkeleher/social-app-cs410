import React from 'react';

interface MyPreferencesProps {
    goToLanding: () => void;
    goToCuisine: () => void;
    goToDietaryRestrictions: () => void;
    goToDistance: () => void;
    goToPrice: () => void;
    goToSchedule: () => void;
}

const MyPreferences: React.FC<MyPreferencesProps> = ({
    goToLanding,
    goToCuisine,
    goToDietaryRestrictions,
    goToDistance,
    goToPrice,
    goToSchedule,
}) => {
    return (
        <div className="my-groups-container">
            <h1>My Preferences</h1>
            <div className="group-list">
                <h2>Select Your Preference Type</h2>
            </div>

            <div className="button-container">
                <button onClick={goToCuisine} className="cta-button">
                    Cuisine
                </button>
                <button
                    onClick={goToDietaryRestrictions}
                    className="cta-button"
                >
                    Dietary Restrictions
                </button>
                <button onClick={goToDistance} className="cta-button">
                    Distance
                </button>
                <button onClick={goToPrice} className="cta-button">
                    Price
                </button>
                <button onClick={goToSchedule} className="cta-button">
                    Schedule
                </button>
            </div>
            <button onClick={goToLanding} className="back-button">
                Back to Landing Page
            </button>
        </div>
    );
};

export default MyPreferences;
