import React, { useState } from 'react';

// Define the possible states (reuse the same enum as in CuisinePreferences)
enum PreferenceState {
    OFF = 'Off',
    YES = 'Yes',
    //NO = 'No',
}

const images = {
    glutenFree:
        'https://t3.ftcdn.net/jpg/05/89/81/70/360_F_589817083_iq2jX8gYocWYhe0gtdL1mPNJzN3C3KkM.jpg',
    vegan: 'https://www.barry-callebaut.com/sites/default/files/styles/paragraph_text_and_image_left_right/public/2020-01/CAL%20icon%20VEGAN%20rgb.jpg?itok=8LEg47RA',
    vegetarian:
        'https://t3.ftcdn.net/jpg/05/57/22/82/360_F_557228264_6zTpe9TNaRi3z1Qw3wt9mfYkBygX1F7u.jpg',
    nutFree:
        'https://supermarketlabels.com//img/product/100500-B.jpg?fv=87607B3F249F18FE8F6F641278054913',
    dairyFree:
        'https://www.shutterstock.com/image-vector/dairy-free-label-stamp-vector-600nw-2307872085.jpg',
    kosher: 'https://media.istockphoto.com/id/1456905781/zh/%E5%90%91%E9%87%8F/international-symbol-for-kosher-food.jpg?s=612x612&w=0&k=20&c=uIcyUM-go-pLmUPaYS2bvf1wPXo8z4MpLQ7svZ_j3lg=',
    // Add more images as needed
};

// Array of dietary restrictions (replace with actual restrictions or images)
const dietaryRestrictionsOptions = [
    { name: 'Gluten-Free', img: images.glutenFree },
    { name: 'Vegan', img: images.vegan },
    { name: 'Vegetarian', img: images.vegetarian },
    { name: 'Nut-Free', img: images.nutFree },
    { name: 'Dairy-Free', img: images.dairyFree },
    { name: 'Kosher', img: images.kosher },
    // Add more dietary restrictions as needed
];

const DietaryRestrictions: React.FC = () => {
    // State to hold preferences for each dietary restriction type
    const [preferences, setPreferences] = useState(
        dietaryRestrictionsOptions.reduce(
            (acc, restriction) => {
                acc[restriction.name] = PreferenceState.OFF;
                return acc;
            },
            {} as { [key: string]: PreferenceState }
        )
    );

    // Function to cycle through states on click (reuse from cuisine)
    const handleRestrictionClick = (restrictionName: string) => {
        setPreferences((prevState) => {
            const currentPreference = prevState[restrictionName];
            let nextPreference = PreferenceState.OFF;

            // Cycle through OFF -> YES -> OFF
            if (currentPreference === PreferenceState.OFF) {
                nextPreference = PreferenceState.YES;
            } else if (currentPreference === PreferenceState.YES) {
                nextPreference = PreferenceState.OFF;
            }

            return {
                ...prevState,
                [restrictionName]: nextPreference,
            };
        });
    };

    return (
        <div className="cuisine-preferences-container">
            <h1>Select Your Dietary Restrictions</h1>
            <div className="cuisine-grid">
                {dietaryRestrictionsOptions.map((restriction) => (
                    <div
                        key={restriction.name}
                        className={`cuisine-item ${preferences[restriction.name].toLowerCase()}`} // Reuse the same classes
                        onClick={() => handleRestrictionClick(restriction.name)}
                    >
                        <img
                            src={restriction.img}
                            alt={restriction.name}
                            className="cuisine-img"
                        />
                        <p>{restriction.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DietaryRestrictions;
