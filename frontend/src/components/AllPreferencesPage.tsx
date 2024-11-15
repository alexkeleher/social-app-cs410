import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CuisinePreferences from './CuisinePreferences';
import LocationPreferences from './LocationPreferences';
import PriceAndDistanceSelection from './DistancePreferences';
import SchedulingPage from './SchedulingPage';

const AllPreferencesPage: React.FC = () => {
    // Single state to track which section is open (if any)
    const [openSection, setOpenSection] = useState<string | null>(null);

    // Single toggle function that closes others
    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="preferences-page-container">
            <h1>Select Your Preferences</h1>

            <div className="preference-section">
                <button
                    onClick={() => toggleSection('cuisine')}
                    className="dropdown-toggle"
                >
                    {openSection === 'cuisine' ? 'Hide' : 'Show'} Cuisine
                    Preferences
                </button>
                {openSection === 'cuisine' && (
                    <div className="preference-content">
                        <CuisinePreferences />
                    </div>
                )}
            </div>

            <div className="preference-section">
                <button
                    onClick={() => toggleSection('location')}
                    className="dropdown-toggle"
                >
                    {openSection === 'location' ? 'Hide' : 'Show'} Location
                    Preferences
                </button>
                {openSection === 'location' && (
                    <div className="preference-content">
                        <LocationPreferences />
                    </div>
                )}
            </div>

            <div className="preference-section">
                <button
                    onClick={() => toggleSection('priceDistance')}
                    className="dropdown-toggle"
                >
                    {openSection === 'priceDistance' ? 'Hide' : 'Show'} Price
                    and Distance Preferences
                </button>
                {openSection === 'priceDistance' && (
                    <div className="preference-content">
                        <PriceAndDistanceSelection />
                    </div>
                )}
            </div>

            <div className="preference-section">
                <button
                    onClick={() => toggleSection('schedule')}
                    className="dropdown-toggle"
                >
                    {openSection === 'schedule' ? 'Hide' : 'Show'} Schedule
                    Preferences
                </button>
                {openSection === 'schedule' && (
                    <div className="preference-content">
                        <SchedulingPage />
                    </div>
                )}

                <div className="button-group">
                    <Link to="/my-groups" className="cta-button">
                        <button className="cta-button">Go to My Groups</button>
                    </Link>

                    <Link to="/create-group" className="cta-button">
                        <button className="cta-button">
                            Create a New Group
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AllPreferencesPage;
