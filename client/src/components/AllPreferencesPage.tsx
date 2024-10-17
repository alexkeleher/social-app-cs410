import React, { useState } from 'react';
import CuisinePreferences from './CuisinePreferences';
import DietaryRestrictionsPreferences from './DietaryRestrictionsPreferences';
import PriceAndDistanceSelection from './DistancePreferences';
import SchedulingPage from './SchedulingPage';

interface AllPreferencesPageProps {
    // goToBack: () => void; // Add goToBack prop
    goToLanding: () => void; // Add goToLanding prop
    goToMyGroups: () => void;
    goToCreateGroup: () => void;
}

const AllPreferencesPage: React.FC<AllPreferencesPageProps> = ({
    //goToBack,
    goToLanding,
    goToMyGroups,
    goToCreateGroup,
}) => {
    // State to toggle sections
    const [isCuisineOpen, setCuisineOpen] = useState(false);
    const [isDietaryOpen, setDietaryOpen] = useState(false);
    const [isPriceDistanceOpen, setPriceDistanceOpen] = useState(false);
    const [isScheduleOpen, setScheduleOpen] = useState(false);

    // Toggles for sections
    const toggleCuisine = () => setCuisineOpen(!isCuisineOpen);
    const toggleDietary = () => setDietaryOpen(!isDietaryOpen);
    const togglePriceDistance = () =>
        setPriceDistanceOpen(!isPriceDistanceOpen);
    const toggleSchedule = () => setScheduleOpen(!isScheduleOpen);

    return (
        <div className="preferences-page-container">
            <h1>Select Your Preferences</h1>

            {/* Cuisine Preferences Section */}
            <div className="preference-section">
                <button onClick={toggleCuisine} className="dropdown-toggle">
                    {isCuisineOpen ? 'Hide' : 'Show'} Cuisine Preferences
                </button>
                {isCuisineOpen && (
                    <div className="preference-content">
                        <CuisinePreferences />
                    </div>
                )}
            </div>

            {/* Dietary Restrictions Section */}
            <div className="preference-section">
                <button onClick={toggleDietary} className="dropdown-toggle">
                    {isDietaryOpen ? 'Hide' : 'Show'} Dietary Restrictions
                </button>
                {isDietaryOpen && (
                    <div className="preference-content">
                        <DietaryRestrictionsPreferences />
                    </div>
                )}
            </div>

            {/* Price and Distance Section */}
            <div className="preference-section">
                <button
                    onClick={togglePriceDistance}
                    className="dropdown-toggle"
                >
                    {isPriceDistanceOpen ? 'Hide' : 'Show'} Price and Distance
                    Preferences
                </button>
                {isPriceDistanceOpen && (
                    <div className="preference-content">
                        <PriceAndDistanceSelection />
                    </div>
                )}
            </div>

            {/* Schedule Preferences Section */}

            <div className="preference-section">
                <button onClick={toggleSchedule} className="dropdown-toggle">
                    {isScheduleOpen ? 'Hide' : 'Show'} Schedule Preferences
                </button>
                {isScheduleOpen && (
                    <div className="preference-content">
                        <SchedulingPage />
                    </div>
                )}

                <div className="button-group">
                    <button onClick={goToLanding} className="back-button">
                        Back to Landing Page
                    </button>

                    <button onClick={goToMyGroups} className="back-button">
                        Go to My Groups
                    </button>

                    <button onClick={goToCreateGroup} className="back-button">
                        Create a New Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllPreferencesPage;
