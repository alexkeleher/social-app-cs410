import React, { useState } from 'react';

const cuisineTypes = [
    'Italian',
    'Mexican',
    'Chinese',
    'Indian',
    'Japanese',
    'Mediterranean',
    'Thai',
    'American',
    // Add more cuisine types as needed
];

const CuisinePreferences: React.FC<{ goToBack: () => void }> = ({
    goToBack,
}) => {
    const [preferences, setPreferences] = useState<{ [key: string]: string }>(
        {}
    );

    const handleChange = (cuisine: string, preference: string) => {
        setPreferences((prev) => ({
            ...prev,
            [cuisine]: preference,
        }));
    };

    return (
        <div className="cuisine-preferences-container">
            <h1>Cuisine Preferences</h1>
            <h2>Select Your Preferences</h2>
            <div className="cuisine-list">
                {cuisineTypes.map((cuisine) => (
                    <div key={cuisine} className="cuisine-item">
                        <span>{cuisine}</span>
                        <div className="preference-options">
                            <label>
                                <input
                                    type="radio"
                                    name={cuisine}
                                    value="Include"
                                    checked={preferences[cuisine] === 'Include'}
                                    onChange={() =>
                                        handleChange(cuisine, 'Include')
                                    }
                                />
                                Include
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name={cuisine}
                                    value="Exclude"
                                    checked={preferences[cuisine] === 'Exclude'}
                                    onChange={() =>
                                        handleChange(cuisine, 'Exclude')
                                    }
                                />
                                Exclude
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name={cuisine}
                                    value="No Preference"
                                    checked={
                                        preferences[cuisine] === 'No Preference'
                                    }
                                    onChange={() =>
                                        handleChange(cuisine, 'No Preference')
                                    }
                                />
                                No Preference
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={goToBack} className="back-button">
                Back to Preferences
            </button>
        </div>
    );
};

export default CuisinePreferences;
