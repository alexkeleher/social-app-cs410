import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [eventTime, setEventTime] = useState<string>('');
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const location = useLocation();
    const { commonTimeSlots } = (location.state as LocationState) || {
        commonTimeSlots: [],
    };

    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [aggregatedPreferences, setAggregatedPreferences] = useState<AggregatedPreference[]>([]);
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

    useEffect(() => {
        const savedCenter = localStorage.getItem(`group_${groupid}_center`);
        if (savedCenter) {
            const center = JSON.parse(savedCenter);
            setLatitude(center.lat);
            setLongitude(center.lng);
            console.log('Using group center point:', center);
        } else {
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
                            preferencesCount[normalizedPref] = (preferencesCount[normalizedPref] || 0) + 1;
                        });
                    });

                    console.log('Aggregated counts:', preferencesCount);

                    const maxCount = Math.max(...Object.values(preferencesCount));

                    const favoriteCuisines = Object.entries(preferencesCount)
                        .filter(([_, count]) => count === maxCount)
                        .map(([cuisine]) => cuisine.toLowerCase());

                    console.log('Setting favorite cuisines:', favoriteCuisines);
                    setSelectedCuisines(favoriteCuisines);

                    const aggregated = Object.entries(preferencesCount).map(([preference, count]) => ({
                        preference: preference.toLowerCase(),
                        count,
                    }));
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
            console.log('Fetching restaurants with options:', {
                sortOption,
                dietOption,
                selectedCuisines,
            });
            fetchRestaurants(latitude, longitude);
        }
    }, [latitude, longitude, sortOption, dietOption, selectedCuisines, restaurantLimit]);

    const handleCreateEvent = async () => {
        if (!selectedRestaurant || !eventDate || !eventTime) {
            alert('Please select a restaurant, date, and time');
            return;
        }

        try {
            setIsCreating(true);

            await api.delete(`/socialevents/${groupid}`);

            const dayOfWeek = eventDate.toLocaleString('en-US', {
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
            prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
        );
    };

    const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRestaurantLimit(Number(event.target.value));
    };

    const isDateAvailable = (date: Date): boolean => {
        const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
        const daySlots = commonTimeSlots.find((slot) => slot.day === dayOfWeek);

        return (daySlots && Array.isArray(daySlots.slots) && daySlots.slots.length > 0) || false;
    };

    const getAvailableTimesForDate = (selectedDate: Date | null): string[] => {
        if (!selectedDate) return [];

        const dayOfWeek = selectedDate.toLocaleString('en-US', {
            weekday: 'long',
        });
        const daySlots = commonTimeSlots.find((slot) => slot.day === dayOfWeek);

        if (!daySlots) return [];

        return daySlots.slots.map((slotIndex) => convertSlotToTime(slotIndex)).filter((time) => time !== '');
    };

    const formatHours = (hours: { start: string; end: string; day: number }[]) => {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return hours
            .map((hour) => {
                const start = `${hour.start.slice(0, 2)}:${hour.start.slice(2)}`;
                const end = `${hour.end.slice(0, 2)}:${hour.end.slice(2)}`;
                return `${daysOfWeek[hour.day]}: ${start} - ${end}`;
            })
            .join(', ');
    };

    const isRestaurantOpenAtDateTime = (restaurant: Restaurant, date: Date, time: string): boolean => {
        if (!restaurant.hours?.[0]?.open) return false;

        const selectedDay = date.getDay(); // 0-6, Sunday-Saturday
        const [hours, minutes] = time.split(':').map(Number);
        const timeNumber = hours * 100 + minutes;

        const dayHours = restaurant.hours[0].open.filter((h) => h.day === selectedDay);

        return dayHours.some((hour) => {
            const start = parseInt(hour.start);
            const end = parseInt(hour.end);
            return timeNumber >= start && timeNumber <= end;
        });
    };

    const highlightWithRanges = (date: Date) => {
        return isDateAvailable(date) ? 'available' : 'unavailable';
    };

    return (
        <div>
            <header className="options-header">
                <h1>{groupInfo ? <>Planning Event for: {groupInfo.groupname}</> : 'Loading group...'}</h1>
            </header>

            <div className="form-group">
                <label htmlFor="sort">Sort by: </label>
                <select id="sort" value={sortOption} onChange={handleSortChange}>
                    <option value="best_match">Best Match</option>
                    <option value="rating">Rating</option>
                    <option value="distance">Distance</option>
                </select>

                <label htmlFor="diet">Dietary Restrictions: </label>
                <select id="diet" value={dietOption || ''} onChange={handleDietChange}>
                    <option value="">All</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten_free">Gluten Free</option>
                    <option value="kosher">Kosher</option>
                    <option value="muslim">Muslim</option>
                </select>
            </div>

            <div className="cuisine-options">
                {cuisineOptions.map((cuisine) => (
                    <div
                        key={cuisine}
                        className={`cuisine-button ${selectedCuisines.includes(cuisine) ? 'selected' : ''}`}
                        onClick={() => handleCuisineToggle(cuisine)}
                    >
                        {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                    </div>
                ))}
            </div>

            <div className="form-group">
                <label htmlFor="limit">Number of Restaurants: </label>
                <select id="limit" value={restaurantLimit} onChange={handleLimitChange}>
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={16}>16</option>
                    <option value={20}>20</option>
                </select>
            </div>

            {/*}   <div className="availability-summary">
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
            </div> */}

            <div className="event-creation-form">
                <h3>Create Group Event</h3>
                <div className="datetime-container">
                    <div className="input-group">
                        <label htmlFor="event-date">Date</label>
                        <DatePicker
                            id="event-date"
                            selected={eventDate}
                            onChange={(date: Date | null) => setEventDate(date)}
                            minDate={new Date()}
                            filterDate={isDateAvailable}
                            dayClassName={highlightWithRanges}
                            className="date-input"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="event-time">Time</label>
                        <select id="event-time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}>
                            <option value="">Select Time</option>
                            {getAvailableTimesForDate(eventDate).map((time) => (
                                <option key={time} value={time}>
                                    {new Date(`2024-01-01T${time}`).toLocaleTimeString('en-US', {
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
                        className={`restaurant-card ${selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
                    >
                        <h3>{restaurant.name}</h3>
                        <img
                            src={restaurant.image_url}
                            alt={`${restaurant.name} thumbnail`}
                            className="restaurant-image"
                        />
                        <p>Rating: {restaurant.rating}</p>
                        <p>Distance: {(restaurant.distance / 1000).toFixed(2)} km</p>
                        <p>
                            Address: {restaurant.location.address1}, {restaurant.location.city}
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
                                    {eventDate && eventTime
                                        ? isRestaurantOpenAtDateTime(restaurant, eventDate, eventTime)
                                            ? 'Open at selected time'
                                            : 'Closed at selected time'
                                        : restaurant.hours[0]?.is_open_now
                                          ? 'Open now'
                                          : 'Closed now'}
                                </p>
                            </>
                        ) : (
                            <p>Status: Hours not available</p>
                        )}
                    </div>
                ))}
            </div>
            <Link to={`/selected-group/${groupid}`} className="back-link">
                ← Back to {groupInfo ? groupInfo.groupname : 'Group'}
            </Link>

            <button
                className="cta-button"
                onClick={handleCreateEvent}
                disabled={!selectedRestaurant || !eventDate || !eventTime || isCreating}
            >
                {isCreating ? 'Creating Event...' : 'Create Event'}
            </button>
        </div>
    );
};

export default GroupEvent;
