import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

const YelpRestaurants: React.FC = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [sortOption, setSortOption] = useState<string>('best_match');
    const [dietOption, setDietOption] = useState<string | null>(null);
    const [cuisineOption, setCuisineOption] = useState<string | null>(null);
    const [restaurantLimit, setRestaurantLimit] = useState<number>(5);

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
        if (latitude && longitude && API_KEY) {
            console.log('Fetching restaurants with options:', {
                sortOption,
                dietOption,
                cuisineOption,
            });
            fetchRestaurants(latitude, longitude);
        }
    }, [
        latitude,
        longitude,
        API_KEY,
        sortOption,
        dietOption,
        cuisineOption,
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
                        categories: cuisineOption || 'restaurants',
                        sort_by: sortOption,
                        attributes: dietOption || 'restrictions',
                        limit: restaurantLimit,
                    },
                }
            );
            console.log('Received restaurants data:', response.data.businesses);
            setRestaurants(response.data.businesses);
        } catch (error) {
            console.error(
                'There was an error fetching data from Yelp API',
                error
            );
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

    const handleCuisineChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedCuisine = event.target.value || null;
        setCuisineOption(selectedCuisine);
        console.log('Cuisine option changed to:', selectedCuisine);
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
            <h2>Here are the best restaurants nearby</h2>

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

            <label htmlFor="cuisine">Cuisine Type: </label>
            <select
                id="cuisine"
                value={cuisineOption || ''}
                onChange={handleCuisineChange}
            >
                <option value="">All</option>
                <option value="chinese">Chinese</option>
                <option value="italian">Italian</option>
                <option value="japanese">Japanese</option>
                <option value="mexican">Mexican</option>
                <option value="indian">Indian</option>
                <option value="thai">Thai</option>
                <option value="french">French</option>
                <option value="korean">Korean</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="Caribbean">Caribbean</option>
                <option value="BBQ">BBQ</option>
                <option value="European">European</option>
                <option value="middle eastern">Middle Eastern</option>
                <option value="French">French</option>
            </select>

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

export default YelpRestaurants;
