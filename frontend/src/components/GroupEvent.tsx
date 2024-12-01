import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import './GroupEvent.css';

interface Restaurant {
    id: string;
    name: string;
    rating: number;
    distance: number; // in kilometers
    image_url: string;
    url: string;
    location: {
        address1: string;
        city: string;
    };
    hours?: {
        is_open_now: boolean;
        open: {
            start: string;
            end: string;
            day: number;
        }[];
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

interface CommonTimeSlot {
    day: string;
    slots: number[];
}

interface LocationState {
    commonTimeSlots: CommonTimeSlot[];
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
    const [restaurantLimit, setRestaurantLimit] = useState<number>(4);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [eventDate, setEventDate] = useState<string>('');
    const [eventTime, setEventTime] = useState<string>('');
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const location = useLocation();
    const { commonTimeSlots } = (location.state as LocationState) || {
        commonTimeSlots: [],
    };

    const [selectedRestaurant, setSelectedRestaurant] =
        useState<Restaurant | null>(null);
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

    const convertSlotToTime = (slotIndex: number): string => {
        const timeMap: { [key: number]: string } = {
            0: '05:00',
            1: '06:00',
            2: '07:00',
            3: '08:00',
            4: '09:00',
            5: '10:00',
            6: '11:00',
            7: '12:00',
            8: '13:00',
            9: '14:00',
            10: '15:00',
            11: '16:00',
            12: '17:00',
            13: '18:00',
            14: '19:00',
            15: '20:00',
            16: '21:00',
            17: '22:00',
            18: '23:00',
            19: '00:00',
        };
        return timeMap[slotIndex] || '';
    };

    const timeOptions = [
        '05:00',
        '06:00',
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00',
        '00:00',
    ];

    const API_KEY = process.env.REACT_APP_YELP_API_KEY;

    /*     useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            },
            (error) => {
                console.error('Error fetching location', error);
            }
        );
    }, []); */

    useEffect(() => {
        // Try to get saved center point
        const savedCenter = localStorage.getItem(`group_${groupid}_center`);
        if (savedCenter) {
            const center = JSON.parse(savedCenter);
            setLatitude(center.lat);
            setLongitude(center.lng);
            console.log('Using group center point:', center);
        } else {
            // Fallback to user's location if no center point exists
            console.log('No center point found, using user location');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    console.error('Error fetching location:', error);
                }
            );
        }
    }, [groupid]);

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
                    const preferencesCount: { [key: string]: number } = {};
                    groupUsers.forEach((user: any) => {
                        user.cuisine_preferences?.forEach((pref: string) => {
                            const normalizedPref = pref.toLowerCase();
                            preferencesCount[normalizedPref] =
                                (preferencesCount[normalizedPref] || 0) + 1;
                        });
                    });

                    console.log('Aggregated counts:', preferencesCount);

                    // Find max count
                    const maxCount = Math.max(
                        ...Object.values(preferencesCount)
                    );

                    // Get cuisines with max count (favorites)
                    const favoriteCuisines = Object.entries(preferencesCount)
                        .filter(([_, count]) => count === maxCount)
                        .map(([cuisine]) => cuisine.toLowerCase());

                    console.log('Setting favorite cuisines:', favoriteCuisines);
                    setSelectedCuisines(favoriteCuisines);

                    // Store all preferences for display
                    const aggregated = Object.entries(preferencesCount).map(
                        ([preference, count]) => ({
                            preference: preference.toLowerCase(),
                            count,
                        })
                    );
                    setAggregatedPreferences(aggregated);
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
            }
        };

        fetchGroupData();
    }, [groupid]);

    useEffect(() => {
        if (latitude && longitude) {
            // Remove API_KEY check
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
        sortOption,
        dietOption,
        selectedCuisines,
        restaurantLimit,
    ]);

    const handleCreateEvent = async () => {
        if (!selectedRestaurant || !eventDate || !eventTime) {
            alert('Please select a restaurant, date, and time');
            return;
        }

        try {
            setIsCreating(true);

            // Delete any existing event first
            await api.delete(`/socialevents/${groupid}`);

            // Create new event
            const dayOfWeek = new Date(eventDate).toLocaleString('en-US', {
                weekday: 'long',
            });

            await api.post('/selections', {
                groupId: groupid,
                yelpRestaurantId: selectedRestaurant.id,
                dayOfWeek: dayOfWeek,
                time: eventTime,
            });

            alert('Event created successfully!');
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event');
        } finally {
            setIsCreating(false);
        }
    };

    const fetchRestaurants = async (lat: number, lon: number) => {
        try {
            const response = await api.get('/search', {
                params: {
                    latitude: lat,
                    longitude: lon,
                    categories: selectedCuisines.join(',') || 'restaurants',
                    sort_by: sortOption,
                    attributes: dietOption || 'restrictions',
                    limit: restaurantLimit,
                    fields: 'hours,rating,price,distance,location,phone',
                    open_now: true,
                    hours: true,
                },
            });
            setRestaurants(response.data.businesses);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
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

    const isDateAvailable = (dateString: string): boolean => {
        const date = new Date(dateString);
        const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
        const daySlots = commonTimeSlots.find((slot) => slot.day === dayOfWeek);

        // Check if daySlots exists and has slots array with length > 0
        return (
            (daySlots &&
                Array.isArray(daySlots.slots) &&
                daySlots.slots.length > 0) ||
            false
        );
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
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={20}>20</option>
            </select>

            {/*        <div
                className="debug-section"
                style={{
                    margin: '20px',
                    padding: '20px',
                    border: '1px solid #ccc',
                }}
            >
                              <h3>Debug Info:</h3>
                <div>
                    <h4>Group Users Preferences:</h4>
                    <pre>{JSON.stringify(aggregatedPreferences, null, 2)}</pre>
                </div>
                <div>
                    <h4>Selected Cuisines:</h4>
                    <pre>{JSON.stringify(selectedCuisines, null, 2)}</pre>
                </div> 
            </div>*/}

            <div className="availability-summary">
                <h3>Group Availability</h3>
                <div className="availability-grid">
                    {commonTimeSlots.map(
                        ({ day, slots }) =>
                            slots.length > 0 && (
                                <div key={day} className="day-availability">
                                    <h4>{day}</h4>
                                    <div className="time-slots">
                                        {[
                                            {
                                                label: 'Morning',
                                                slots: slots.filter(
                                                    (i) => i < 6
                                                ),
                                            },
                                            {
                                                label: 'Afternoon',
                                                slots: slots.filter(
                                                    (i) => i >= 6 && i < 12
                                                ),
                                            },
                                            {
                                                label: 'Evening',
                                                slots: slots.filter(
                                                    (i) => i >= 12
                                                ),
                                            },
                                        ].map(
                                            ({ label, slots }) =>
                                                slots.length > 0 && (
                                                    <div
                                                        key={label}
                                                        className="time-group"
                                                    >
                                                        <span className="time-label">
                                                            {label}:
                                                        </span>
                                                        <span className="time-values">
                                                            {slots.map(
                                                                (slot) => (
                                                                    <span
                                                                        key={
                                                                            slot
                                                                        }
                                                                        className="time-chip"
                                                                    >
                                                                        {new Date(
                                                                            `2024-01-01T${convertSlotToTime(slot)}`
                                                                        ).toLocaleTimeString(
                                                                            'en-US',
                                                                            {
                                                                                hour: 'numeric',
                                                                                minute: '2-digit',
                                                                                hour12: true,
                                                                            }
                                                                        )}
                                                                    </span>
                                                                )
                                                            )}
                                                        </span>
                                                    </div>
                                                )
                                        )}
                                    </div>
                                </div>
                            )
                    )}
                </div>
            </div>

            <div className="event-creation-form">
                <h3>Create Group Event</h3>
                <div className="datetime-container">
                    <div className="input-group">
                        <label htmlFor="event-date">Date</label>
                        <input
                            id="event-date"
                            type="date"
                            value={eventDate}
                            onChange={(e) => {
                                const selectedDate = e.target.value;
                                if (isDateAvailable(selectedDate)) {
                                    setEventDate(selectedDate);
                                }
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            className={`date-input ${eventDate && !isDateAvailable(eventDate) ? 'unavailable' : ''}`}
                            onKeyDown={(e) => e.preventDefault()} // Prevent typing
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="event-time">Time</label>
                        <select
                            id="event-time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                        >
                            <option value="">Select Time</option>
                            {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                    {new Date(
                                        `2024-01-01T${time}`
                                    ).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="restaurants-grid">
                {restaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        onClick={() => setSelectedRestaurant(restaurant)}
                        className={`restaurant-card ${
                            selectedRestaurant?.id === restaurant.id
                                ? 'selected'
                                : ''
                        }`}
                    >
                        <h3>{restaurant.name}</h3>
                        <img
                            src={restaurant.image_url}
                            alt={`${restaurant.name} thumbnail`}
                            className="restaurant-image"
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
                        <p>
                            <a
                                href={restaurant.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()} // Prevent card selection when clicking link
                            >
                                View on Yelp
                            </a>
                        </p>

                        {restaurant.hours && restaurant.hours[0]?.open ? (
                            <>
                                <p>
                                    Status:{' '}
                                    {restaurant.hours[0]?.is_open_now
                                        ? 'Open'
                                        : 'Closed'}
                                </p>
                                {/*}  <p>
                                    Hours:{' '}
                                    {formatHours(restaurant.hours[0].open)}
                                </p> */}
                            </>
                        ) : (
                            <p>Status: Hours not available</p>
                        )}
                    </div>
                ))}
            </div>
            <button
                className="cta-button"
                onClick={handleCreateEvent}
                disabled={
                    !selectedRestaurant ||
                    !eventDate ||
                    !eventTime ||
                    isCreating
                }
            >
                {isCreating ? 'Creating Event...' : 'Create Event'}
            </button>
        </div>
    );
};

export default GroupEvent;
