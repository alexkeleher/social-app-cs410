import React, { useState } from 'react';

const dietaryRestrictions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Shellfish-Free',
    'Soy-Free',
    'Egg-Free',
    'Kosher',
    'Halal',
    // Add more dietary restrictions as needed
];

const DietaryRestrictionsPreferences: React.FC<{ goToBack: () => void }> = ({
    goToBack,
}) => {
    const [preferences, setPreferences] = useState<{ [key: string]: string }>(
        {}
    );

    const handleChange = (restriction: string, preference: string) => {
        setPreferences((prev) => ({
            ...prev,
            [restriction]: preference,
        }));
    };

    return (
        <div className="dietary-restrictions-preferences-container">
            <h1>DietaryRestrictions Preferences</h1>
            <h2>Select Your Preferences</h2>
            <div className="dietary-restrictions-list">
                {dietaryRestrictions.map((restriction) => (
                    <div key={restriction} className="restriction-item">
                        <span>{restriction}</span>
                        <div className="preference-options">
                            <label>
                                <input
                                    type="radio"
                                    name={restriction}
                                    value="Include"
                                    checked={
                                        preferences[restriction] === 'Include'
                                    }
                                    onChange={() =>
                                        handleChange(restriction, 'Include')
                                    }
                                />
                                Include
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name={restriction}
                                    value="Exclude"
                                    checked={
                                        preferences[restriction] === 'Exclude'
                                    }
                                    onChange={() =>
                                        handleChange(restriction, 'Exclude')
                                    }
                                />
                                Exclude
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name={restriction}
                                    value="No Preference"
                                    checked={
                                        preferences[restriction] ===
                                        'No Preference'
                                    }
                                    onChange={() =>
                                        handleChange(
                                            restriction,
                                            'No Preference'
                                        )
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

export default DietaryRestrictionsPreferences;
