import React, { useState } from 'react';
import AuthContext from '../context/AuthProvider';
import api from '../api/axios';

// Define possible states
enum PreferenceState {
    OFF = 'Off',
    YES = 'Yes',
}

// Store image URLs
const images = {
    italian:
        'https://www.pvristorante.com/wp-content/uploads/2019/09/blog-1.jpg',
    chinese:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7w188O_VO1oNC3eKmmcppxEphlC0OpASCog&s',
    mexican:
        'https://elpueblomex.com/wp-content/uploads/2023/09/fresh-mexican-food-1080x628.jpg',
    japanese:
        'https://cdn.media.amplience.net/i/japancentre/Blog-page-156-sushi/Blog-page-156-sushi?$poi$&w=556&h=391&sm=c&fmt=auto',
    indian: 'https://www.curryexpresssomerville.com/blog-admin/images/order-your-food-from-authentic-indian-food-somerville-outlets031251.jpeg',
    thai: 'https://res.cloudinary.com/rainforest-cruises/images/c_fill,g_auto/f_auto,q_auto/v1621044973/Southeast-Asian-Food-Pad-Thai/Southeast-Asian-Food-Pad-Thai.jpg',
    bbq: 'https://www.foodandwine.com/thmb/_XZXjOYMgdDbay-eU8FqpNI-d6U=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/Burnt-Ends-FT-RECIPE0622-b556a78d2a13462c844270f481dc96e4.jpg',
    french: 'https://cdn.shopify.com/s/files/1/0267/8118/8171/files/blog-post-image_ff_4b4926df-fa2a-47db-a257-8a9c196c94a1.png?v=1707179237',
    korean: 'https://foodinstitute.com/wp-content/uploads/2022/03/Korean-cuisine-popularity.jpg.webp',
    vietnamese:
        'https://vietnamtravel.com/images/2020/10/Intro-Vietnam-cuisine1.jpg',
    mediterranean:
        'https://minimalistbaker.com/wp-content/uploads/2016/07/The-ULTIMATE-Mediterranean-Bowl-with-hummus-falafel-tahini-sauce-olives-and-pita-vegan-glutenfree-falafel-recipe-healthy-easy.jpg',
    american:
        'https://www.hotelmogel.com/wp-content/uploads/2015/11/iStock_000024270558_Small.jpg',
    spanish:
        'https://tekce.net/files/upload/images/spanish-best-cousines-1.jpg',
    middleEastern:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs6jem_KVJ273knzUt641zrCzXqA4kEAu7EQ&s',
    caribbean:
        'https://mccormick.widen.net/content/3s0v7v8372/original/caribbean_2000x1125.jpg',
    african:
        'https://www.greenway.co.za/wp-content/uploads/2020/09/sa-foods.jpg',
    latinAmerican:
        'https://mylatinstore.com/wp-content/uploads/elementor/thumbs/latinamerican-cuisine-MylatinStore-pzlrwcxiu3f0knjwm63pxaywsjbzliym5a6e44h1lk.jpeg',
    european:
        'https://fooddrinklife.com/wp-content/uploads/2024/05/european-food.jpg',
};

const cuisineOptions = [
    { name: 'Italian', img: images.italian },
    { name: 'Chinese', img: images.chinese },
    { name: 'Mexican', img: images.mexican },
    { name: 'Japanese', img: images.japanese },
    { name: 'Indian', img: images.indian },
    { name: 'Thai', img: images.thai },
    { name: 'BBQ', img: images.bbq },
    { name: 'French', img: images.french },
    { name: 'Korean', img: images.korean },
    { name: 'Vietnamese', img: images.vietnamese },
    { name: 'Mediterranean', img: images.mediterranean },
    { name: 'American', img: images.american },
    { name: 'Spanish', img: images.spanish },
    { name: 'Middle Eastern', img: images.middleEastern },
    { name: 'Caribbean', img: images.caribbean },
    { name: 'African', img: images.african },
    { name: 'Latin American', img: images.latinAmerican },
    { name: 'European', img: images.european },
];

const CuisinePreferences: React.FC = () => {
    const { auth } = React.useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<{
        [key: string]: PreferenceState;
    }>({});

    React.useEffect(() => {
        const fetchPreferences = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await api.get(`/users/${auth.id}/cuisines`, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });

                const savedPreferences = cuisineOptions.reduce(
                    (acc, cuisine) => {
                        acc[cuisine.name] =
                            response.data.cuisinePreferences.includes(
                                cuisine.name
                            )
                                ? PreferenceState.YES
                                : PreferenceState.OFF;
                        return acc;
                    },
                    {} as { [key: string]: PreferenceState }
                );

                setPreferences(savedPreferences);
            } catch (error) {
                console.error('Failed to fetch preferences:', error);
                setFetchError('Failed to load preferences');
            } finally {
                setIsLoading(false);
            }
        };

        if (auth.id) {
            fetchPreferences();
        }
    }, [auth.id, auth.token]);

    const handleCuisineClick = (cuisineName: string) => {
        setPreferences((prevState) => {
            const currentPreference = prevState[cuisineName];
            let nextPreference = PreferenceState.OFF;

            if (currentPreference === PreferenceState.OFF) {
                nextPreference = PreferenceState.YES;
            } else if (currentPreference === PreferenceState.YES) {
                nextPreference = PreferenceState.OFF;
            }

            return {
                ...prevState,
                [cuisineName]: nextPreference,
            };
        });
    };

    const handleSavePreferences = async () => {
        setIsSaving(true);
        setSaveMessage('');

        try {
            const selectedCuisines = Object.entries(preferences)
                .filter(([_, state]) => state === PreferenceState.YES)
                .map(([cuisine]) => cuisine);

            await api.put(
                `/users/${auth.id}/cuisines`,
                { cuisineTypes: selectedCuisines },
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            setSaveMessage('Preferences saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save preferences:', error);
            setSaveMessage('Failed to save preferences. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="loading-message">Loading preferences...</div>;
    }

    if (fetchError) {
        return <div className="error-message">{fetchError}</div>;
    }

    return (
        <div className="cuisine-preferences-container">
            <div className="cuisine-grid">
                {cuisineOptions.map((cuisine) => (
                    <div key={cuisine.name}>
                        <div
                            className={`cuisine-item ${preferences[cuisine.name]?.toLowerCase()}`}
                            onClick={() => handleCuisineClick(cuisine.name)}
                        >
                            <img
                                src={cuisine.img}
                                alt={cuisine.name}
                                className="cuisine-img"
                            />
                            <p>{cuisine.name}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="save-preferences">
                <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="save-button"
                >
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
                {saveMessage && (
                    <p
                        className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}
                    >
                        {saveMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CuisinePreferences;
