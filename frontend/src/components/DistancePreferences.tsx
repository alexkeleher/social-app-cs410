import React, { useState } from 'react';

const PriceAndDistanceSelection: React.FC = () => {
    // State to store price and distance selection
    const [priceLevel, setPriceLevel] = useState(2); // Default price level, e.g., 2 = $$.
    const [distance, setDistance] = useState(10); // Default distance in miles

    // Labels for price level
    const priceLabels = ['$', '$$', '$$$', '$$$$'];

    return (
        <div className="selection-page-container">
            <h1>Select Your Preferences</h1>

            {/* Price Selection */}
            <div className="selection-group">
                <h2>Price Level</h2>
                <input
                    type="range"
                    min="0"
                    max="3"
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
        </div>
    );
};

export default PriceAndDistanceSelection;
