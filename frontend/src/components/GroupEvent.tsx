import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import './GroupEvent.css';

interface Restaurant {
    id: string;
    name: string;
    rating: number;
    distance: number; // in kilometers
    image_url: string;
    location: {
        address1: string;
        city: string;
    };
    hours?: {
        open: { start: string; end: string; day: number }[];
        is_open: boolean;
    }[];
}

interface GroupInfo {
    groupname: string;
    id: string;
}

interface AggregatedPreference {
    preference: string;
    count: number;
}

const GroupEvent: React.FC = () => {
    const { groupid } = useParams<{ groupid: string }>();
    const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [sortOption, setSortOption] = useState<string>('best_match');
    const [dietOption, setDietOption] = useState<string | null>(null);
    const [cuisineOption, setCuisineOption] = useState<string | null>(null);
    const [restaurantLimit, setRestaurantLimit] = useState<number>(5);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [aggregatedPreferences, setAggregatedPreferences] = useState<
        AggregatedPreference[]
    >([]);
    const cuisineOptions = [
        'chinese',
        'italian',
        'japanese',
        'mexican',
        'indian',
        'thai',
        'french',
        'korean',
        'mediterranean',
        'caribbean',
        'bbq',
        'european',
        'middle eastern',
    ];

    const API_KEY = process.env.REACT_APP_YELP_API_KEY;

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            },
            (error) => {
                console.error('Error fetching location', error);
            }
        );
    }, []);

    useEffect(() => {
        const fetchGroupData = async () => {
            if (!groupid) return;
            try {
                const response = await api.get(`/users/by-groupid/${groupid}`);
                const groupUsers = response.data;
                console.log('Raw group users data:', groupUsers);

                if (groupUsers.length > 0) {
                    setGroupInfo({
                        groupname: groupUsers[0].groupname,
                        id: groupid,
                    });

                    // Debug log raw preferences
                    groupUsers.forEach((user: any) => {
                        console.log(
                            `User ${user.firstname}'s preferences:`,
                            user.cuisine_preferences
                        );
                    });

                    const preferencesCount: { [key: string]: number } = {};
                    groupUsers.forEach((user: any) => {
                        user.cuisine_preferences?.forEach((pref: string) => {
                            const normalizedPref = pref.toLowerCase();
                            preferencesCount[normalizedPref] =
                                (preferencesCount[normalizedPref] || 0) + 1;
                        });
                    });

                    console.log('Aggregated counts:', preferencesCount);

                    // Store aggregated preferences
                    const aggregated = Object.entries(preferencesCount).map(
                        ([preference, count]) => ({
                            preference: preference.toLowerCase(),
                            count,
                        })
                    );
                    setAggregatedPreferences(aggregated);

                    // Set selected cuisines based on majority preferences
                    const memberCount = groupUsers.length;
                    const popularCuisines = aggregated
                        .filter(({ count }) => count >= 1)
                        .map(({ preference }) => preference);

                    console.log('Setting selected cuisines:', popularCuisines);
                    setSelectedCuisines(popularCuisines);
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
            }
        };

        fetchGroupData();
    }, [groupid]);

    useEffect(() => {
        if (latitude && longitude && API_KEY) {
            console.log('Fetching restaurants with options:', {
                sortOption,
                dietOption,
                selectedCuisines,
            });
            fetchRestaurants(latitude, longitude);
        }
    }, [
        latitude,
        longitude,
        API_KEY,
        sortOption,
        dietOption,
        selectedCuisines,
        restaurantLimit,
    ]);

    const fetchRestaurants = async (lat: number, lon: number) => {
        try {
            const response = await axios.get(
                'https://api.yelp.com/v3/businesses/search',
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                    },
                    params: {
                        latitude: lat,
                        longitude: lon,
                        categories: selectedCuisines.join(',') || 'restaurants',
                        sort_by: sortOption,
                        attributes: dietOption || 'restrictions',
                        limit: restaurantLimit,
                    },
                }
            );
            setRestaurants(response.data.businesses);
        } catch (error) {
            console.error('Error fetching from Yelp API:', error);
        }
    };

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOption(event.target.value);
    };

    const handleDietChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = event.target.value || null;
        setDietOption(selectedOption);
        console.log('Diet option changed to:', selectedOption);
    };

    const handleCuisineToggle = (cuisine: string) => {
        setSelectedCuisines((prev) =>
            prev.includes(cuisine)
                ? prev.filter((c) => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRestaurantLimit(Number(event.target.value));
    };

    const formatHours = (
        hours: { start: string; end: string; day: number }[]
    ) => {
        const daysOfWeek = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];
        return hours
            .map((hour) => {
                const start = `${hour.start.slice(0, 2)}:${hour.start.slice(2)}`;
                const end = `${hour.end.slice(0, 2)}:${hour.end.slice(2)}`;
                return `${daysOfWeek[hour.day]}: ${start} - ${end}`;
            })
            .join(', ');
    };

    return (
        <div>
            <header className="group-header">
                <h1>
                    {groupInfo ? (
                        <>Planning Event for: {groupInfo.groupname}</>
                    ) : (
                        'Loading group...'
                    )}
                </h1>
            </header>

            <div className="group-navigation">
                <Link to={`/selected-group/${groupid}`} className="back-button">
                    ← Back to {groupInfo ? groupInfo.groupname : 'Group'}
                </Link>
            </div>

            <label htmlFor="sort">Sort by: </label>
            <select id="sort" value={sortOption} onChange={handleSortChange}>
                <option value="best_match">Best Match</option>
                <option value="rating">Rating</option>
                <option value="distance">Distance</option>
            </select>

            <label htmlFor="diet">Dietary Restrictions: </label>
            <select
                id="diet"
                value={dietOption || ''}
                onChange={handleDietChange}
            >
                <option value="">All</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten_free">Gluten Free</option>
                <option value="kosher">Kosher</option>
                <option value="muslim">Muslim</option>
            </select>

            <div className="cuisine-grid">
                {cuisineOptions.map((cuisine) => (
                    <label key={cuisine} className="cuisine-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedCuisines.includes(cuisine)}
                            onChange={() => handleCuisineToggle(cuisine)}
                        />
                        {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                    </label>
                ))}
            </div>

            <label htmlFor="limit">Number of Restaurants: </label>
            <select
                id="limit"
                value={restaurantLimit}
                onChange={handleLimitChange}
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
            </select>

            <div
                className="debug-section"
                style={{
                    margin: '20px',
                    padding: '20px',
                    border: '1px solid #ccc',
                }}
            >
                {/*               <h3>Debug Info:</h3>
                <div>
                    <h4>Group Users Preferences:</h4>
                    <pre>{JSON.stringify(aggregatedPreferences, null, 2)}</pre>
                </div>
                <div>
                    <h4>Selected Cuisines:</h4>
                    <pre>{JSON.stringify(selectedCuisines, null, 2)}</pre>
                </div> */}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {restaurants.map((restaurant) => (
                    <div key={restaurant.id} style={{ width: '250px' }}>
                        <h3>{restaurant.name}</h3>
                        <img
                            src={restaurant.image_url}
                            alt={`${restaurant.name} thumbnail`}
                            style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                            }}
                        />
                        <p>Rating: {restaurant.rating}</p>
                        <p>
                            Distance: {(restaurant.distance / 1000).toFixed(2)}{' '}
                            km
                        </p>
                        <p>
                            Address: {restaurant.location.address1},{' '}
                            {restaurant.location.city}
                        </p>

                        {restaurant.hours &&
                        restaurant.hours[0]?.open &&
                        restaurant.hours[0]?.open.length > 0 ? (
                            <>
                                <p>
                                    It is:{' '}
                                    {restaurant.hours[0]?.is_open
                                        ? 'Open'
                                        : 'Closed'}
                                </p>
                                <p>
                                    Hours:{' '}
                                    {formatHours(restaurant.hours[0].open)}
                                </p>
                            </>
                        ) : (
                            <p>Status: Unknown</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupEvent;
