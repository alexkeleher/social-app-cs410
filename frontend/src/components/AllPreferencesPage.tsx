import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CuisinePreferences from './CuisinePreferences';
import LocationPreferences from './LocationPreferences';
import PriceAndDistanceSelection from './DistancePreferences';
import SchedulingPage from './SchedulingPage';
import { Box, Button } from '@mui/material';
import './AllPreferencesPage.css';

const AllPreferencesPage: React.FC = () => {
    // Single state to track which section is open (if any)
    const [openSection, setOpenSection] = useState<string | null>(null);

    const navigate = useNavigate();

    // Single toggle function that closes others
    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <Box
            className="preferences-page-container"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
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

                <Button
                    onClick={() => navigate('/my-groups')}
                    variant="outlined"
                    fullWidth
                    sx={{
                        mt: 2,
                        color: '#FF0000',
                        borderColor: '#FF0000',
                        '&:hover': {
                            borderColor: '#CC0000',
                            color: '#CC0000',
                        },
                    }}
                >
                    Back to My Groups
                </Button>
            </div>
        </Box>
    );
};

export default AllPreferencesPage;
