import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthProvider';
import api from '../api/axios';

const PriceAndDistanceSelection: React.FC = () => {
    // State to store price and distance selection
    const [priceLevel, setPriceLevel] = useState<number>(2); // Default price level, e.g., 2 = $$.
    const [distance, setDistance] = useState<number>(10); // Default distance in miles
    const [saveMessage, setSaveMessage] = useState('');
    const { auth } = useContext(AuthContext);

    const getCurrentDistanceAndPriceLevel = async () => {
        try {
            const response = await api.get(`/users${auth.id}`);
            console.log('getting user from Backend');
            setPriceLevel(response.data.preferredpricerange);
            setDistance(response.data.preferredmaxdistance);
            console.log('setting address to be ' + response.data.address);
        } catch (err) {
            console.error(err);
        }
    };
    const savePreferences = async () => {
        setSaveMessage('');
        try {
            console.log(
                'Attempting to store new preference for price level and distance on the database for this user'
            );
            const response = await api.put(`/users/${auth.id}`, {
                PreferredPriceRange: priceLevel,
                PreferredMaxDistance: distance,
            });
            setSaveMessage('Preferences saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setSaveMessage('Preferences DID NOT SAVE! ERROR!');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };
    useEffect(() => {
        getCurrentDistanceAndPriceLevel();
    }, []);

    // Labels for price level
    const priceLabels = ['', '$', '$$', '$$$', '$$$$'];

    return (
        <div className="selection-page-container">
            <h1>Select Your Preferences</h1>

            {/* Price Selection */}
            <div className="selection-group">
                <h2>Price Level</h2>
                <input
                    type="range"
                    min="1"
                    max="4"
                    value={priceLevel}
                    onChange={(e) => setPriceLevel(Number(e.target.value))}
                    className="slider"
                />
                <p>Selected Price: {priceLabels[priceLevel]}</p>
            </div>

            {/* Distance Selection */}
            <div className="selection-group">
                <h2>Distance (in miles)</h2>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="slider"
                />
                <p>Selected Distance: {distance} miles</p>
            </div>
            <div className="save-preferences">
                <button
                    onClick={savePreferences}
                    // disabled={isSaving}
                    className="save-button"
                >
                    Save Preferences
                </button>
                {saveMessage && (
                    <p className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                        {saveMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PriceAndDistanceSelection;
