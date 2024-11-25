import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import axios from 'axios';
//import { format } from 'date-fns';
import { SocialEvent } from '@types';
import { YelpCache } from '../utils/cache';

interface GroupUser {
    groupname: string;
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    address: string;
    email: string;
    cuisine_preferences?: string[] | null;
    joincode?: string;
    serializedschedulematrix?: string;
}

interface AvailabilityMatrix {
    [key: string]: boolean[];
}

interface Coordinates {
    lat: number;
    lng: number;
}

interface TimeRange {
    start: string;
    end: string;
    day: number;
}

interface BusinessHours {
    open: TimeRange[];
    is_open_now: boolean;
}

interface YelpRestaurant {
    id: string;
    name: string;
    rating: number;
    review_count: number;
    price: string;
    image_url: string;
    url: string;
    distance: number;
    categories: { alias: string; title: string }[];
    location: {
        display_address: string[];
    };
    business_hours?: BusinessHours[];
}

interface AutoSuggestedEvent {
    restaurant: YelpRestaurant | null;
    availability: {
        day: string;
        time: string;
    } | null;
    preferences: {
        cuisines: string[];
        distance: number;
        location: Coordinates | null;
    };
}

interface DebugPanelProps {
    cache: YelpRestaurant[];
}

const DEBUGGING_MODE = process.env.NODE_ENV === 'development';
const API_KEY = process.env.REACT_APP_YELP_API_KEY;
const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;
const SEARCH_RADIUS = 5000;

const DebugPanel: React.FC<DebugPanelProps> = ({ cache }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="debug-panel">
            <button className="debug-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Hide' : 'Show'} Cache ({cache.length} restaurants)
            </button>
            {isOpen && (
                <div className="debug-content">
                    {cache.map((restaurant) => (
                        <div key={restaurant.id} className="debug-item">
                            <p>
                                <b>{restaurant.name}</b>
                            </p>
                            <p>
                                Categories:{' '}
                                {restaurant.categories
                                    .map((c) => c.alias)
                                    .join(', ')}
                            </p>
                            <p>
                                Hours:{' '}
                                {restaurant.business_hours?.[0]?.open
                                    ? 'Available'
                                    : 'Not available'}
                            </p>
                            {restaurant.business_hours && (
                                <pre>
                                    {JSON.stringify(
                                        restaurant.business_hours[0].open,
                                        null,
                                        2
                                    )}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper Functions
const convertTo24Hour = (time: string): number => {
    const [hour, period] = time.split(/[:\s]/);
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    return hour24;
};

const isRestaurantOpenAtTime = (
    restaurant: YelpRestaurant,
    dayIndex: number,
    selectedHour: number
): boolean => {
    if (!restaurant.business_hours?.[0]?.open) return false;

    return restaurant.business_hours[0].open.some((timeRange: TimeRange) => {
        const startHour = parseInt(timeRange.start.substring(0, 2));
        const endHour = parseInt(timeRange.end.substring(0, 2));

        if (endHour < startHour) {
            return (
                (timeRange.day === dayIndex && selectedHour >= startHour) ||
                ((timeRange.day + 1) % 7 === dayIndex && selectedHour < endHour)
            );
        }

        return (
            timeRange.day === dayIndex &&
            selectedHour >= startHour &&
            selectedHour < endHour
        );
    });
};

const isSelectedTimeSlot = (
    day: string,
    slotIndex: number,
    nextAvailableTime: { day: string; time: string } | null
): boolean => {
    if (!nextAvailableTime) return false;
    return (
        nextAvailableTime.day === day &&
        nextAvailableTime.time === timeSlots[slotIndex]
    );
};

const SelectedGroup = () => {
    const { groupid } = useParams();
    const navigate = useNavigate();

    // Consolidated State
    const [state, setState] = useState({
        groupUsers: [] as GroupUser[],
        groupName: '',
        inviteEmail: '',
        inviteError: '',
        saveMessage: '',
        joinCode: '',
        isLoading: false,
        memberCoordinates: [] as Coordinates[],
        centerPoint: null as Coordinates | null,
        groupAvailability: {} as AvailabilityMatrix,
        commonTimeSlots: [] as { day: string; slots: number[] }[],
        nextAvailableTime: null as {
            day: string;
            time: string;
            daysUntil: number;
        } | null,
        restaurantCache: [] as YelpRestaurant[],
        selectedCuisine: null as string | null,
        unavailableCuisines: [] as string[],
        autoSuggestedEvent: {
            restaurant: null,
            availability: null,
            preferences: {
                cuisines: [],
                distance: SEARCH_RADIUS,
                location: null,
            },
        } as AutoSuggestedEvent,
    });

    const updateState = (updates: Partial<typeof state>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const handleError = (error: any, context: string) => {
        console.error(`Error in ${context}:`, error);
        const message =
            error.response?.data?.error ||
            error.message ||
            'Unknown error occurred';
        updateState({
            saveMessage: `Error: ${message}`,
            isLoading: false,
        });
        setTimeout(() => updateState({ saveMessage: '' }), 4000);
    };

    const getTopPreferences = useCallback(() => {
        if (!state.groupUsers.length) return [];
        const preferencesCount: { [key: string]: number } = {};
        state.groupUsers.forEach((user) => {
            user.cuisine_preferences?.forEach((pref) => {
                preferencesCount[pref] = (preferencesCount[pref] || 0) + 1;
            });
        });
        const maxCount = Math.max(...Object.values(preferencesCount));
        return Object.entries(preferencesCount)
            .filter(([_, count]) => count === maxCount)
            .map(([pref]) => pref.toLowerCase());
    }, [state.groupUsers]);

    const processYelpResponse = useCallback(
        (data: any) => {
            if (!data.businesses?.length) return;

            const allRestaurants = data.businesses;
            const nearbyRestaurants = allRestaurants.filter(
                (r) => r.distance <= SEARCH_RADIUS
            );

            updateState((prev) => ({
                restaurantCache: [
                    ...prev.restaurantCache,
                    ...allRestaurants.filter(
                        (newRest) =>
                            !prev.restaurantCache.some(
                                (cached) => cached.id === newRest.id
                            )
                    ),
                ],
            }));

            if (nearbyRestaurants.length > 0) {
                const topPrefs = getTopPreferences();
                const bestRestaurant = nearbyRestaurants[0];

                if (!state.selectedCuisine) {
                    const matchingCuisine = topPrefs.find((cuisine) =>
                        bestRestaurant.categories.some(
                            (cat) =>
                                cat.alias.toLowerCase() ===
                                cuisine.toLowerCase()
                        )
                    );
                    if (matchingCuisine) {
                        updateState({ selectedCuisine: matchingCuisine });
                    }
                }

                updateState({
                    autoSuggestedEvent: {
                        restaurant: bestRestaurant,
                        availability: state.nextAvailableTime,
                        preferences: {
                            cuisines: topPrefs,
                            distance: SEARCH_RADIUS,
                            location: state.centerPoint,
                        },
                    },
                });
            }
        },
        [
            state.centerPoint,
            state.nextAvailableTime,
            state.selectedCuisine,
            getTopPreferences,
        ]
    );

    const fetchAutoSuggestedEvent = useCallback(async () => {
        if (!state.centerPoint || !state.nextAvailableTime) return;

        try {
            updateState({ isLoading: true });
            const topPrefs = getTopPreferences();

            const response = await api.get('/yelp/search', {
                params: {
                    latitude: state.centerPoint.lat,
                    longitude: state.centerPoint.lng,
                    categories: topPrefs.join(','),
                    open_at: getTimestampForNextAvailable(
                        state.nextAvailableTime
                    ),
                    limit: 50,
                },
            });

            processYelpResponse(response.data);
        } catch (error) {
            handleError(error, 'fetchAutoSuggestedEvent');
        } finally {
            updateState({ isLoading: false });
        }
    }, [
        state.centerPoint,
        state.nextAvailableTime,
        getTopPreferences,
        processYelpResponse,
    ]);

    const handleTimeSlotClick = useCallback(
        (day: string, slotIndex: number) => {
            const daysOfWeek = [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ];
            const today = new Date().getDay();
            const adjustedToday = today === 0 ? 6 : today - 1;
            const selectedDayIndex = daysOfWeek.indexOf(day);
            let daysUntil = selectedDayIndex - adjustedToday;
            if (daysUntil < 0) daysUntil += 7;

            const newTime = {
                day,
                time: timeSlots[slotIndex],
                daysUntil,
            };

            const selectedHour = convertTo24Hour(timeSlots[slotIndex]);
            const availableRestaurants = state.restaurantCache.filter((r) =>
                isRestaurantOpenAtTime(r, selectedDayIndex, selectedHour)
            );

            updateState({
                nextAvailableTime: newTime,
                autoSuggestedEvent: {
                    ...state.autoSuggestedEvent,
                    restaurant:
                        availableRestaurants.length > 0
                            ? availableRestaurants[0]
                            : null,
                    availability: newTime,
                },
            });
        },
        [state.restaurantCache, state.autoSuggestedEvent]
    );

    const getTopPreferences = useCallback(() => {
        if (aggregatedPreferences.length === 0) return [];

        // Find the highest count
        const maxCount = Math.max(...aggregatedPreferences.map((p) => p.count));

        // Filter to only include preferences with the highest count
        return aggregatedPreferences
            .filter((p) => p.count === maxCount)
            .map((p) => p.preference.toLowerCase());
    }, [aggregatedPreferences]);

    const [autoSuggestedEvent, setAutoSuggestedEvent] =
        useState<AutoSuggestedEvent>({
            restaurant: null,
            availability: null,
            preferences: {
                cuisines: [],
                distance: 5000,
                location: null,
            },
        });
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
    const [restaurantCache, setRestaurantCache] = useState<YelpRestaurant[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(false);

    // Update fetchAutoSuggestedEvent

    // Helper to process response data

    const handleCuisineSelect = useCallback(
        (cuisine: string) => {
            setSelectedCuisine(cuisine);

            // Filter cached restaurants by selected cuisine
            const filteredRestaurants = allFetchedRestaurants
                .filter((r) =>
                    r.categories.some(
                        (cat: any) =>
                            cat.alias.toLowerCase() === cuisine.toLowerCase()
                    )
                )
                .sort((a, b) => {
                    if (b.rating !== a.rating) return b.rating - a.rating;
                    return b.review_count - a.review_count;
                });

            if (filteredRestaurants.length > 0) {
                setAutoSuggestedEvent((prev) => ({
                    restaurant: filteredRestaurants[0],
                    availability: nextAvailableTime,
                    preferences: {
                        cuisines: prev.preferences.cuisines,
                        distance: 5000,
                        location: centerPoint,
                    },
                }));
            }
        },
        [centerPoint, nextAvailableTime, allFetchedRestaurants]
    );

    // Add helper function
    const getTimestampForNextAvailable = (nextTime: {
        day: string;
        time: string;
        daysUntil: number;
    }) => {
        const now = new Date();
        const date = new Date(now.setDate(now.getDate() + nextTime.daysUntil));
        const [hour] = nextTime.time.split('-')[0].split(':').map(Number);
        date.setHours(hour, 0, 0, 0);
        return Math.floor(date.getTime() / 1000);
    };

    // Add useEffect to trigger fetch
    useEffect(() => {
        fetchAutoSuggestedEvent();
    }, [fetchAutoSuggestedEvent]);

    const getSocialEventsForThisGroup = async (groupid: string) => {
        try {
            const response = await api.get(
                `/socialevents/bygroupid/${groupid}`
            );
            console.log('getting social events from the backend');
            setGroupEvents(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onClickCreateEventAutomatic = async () => {
        try {
            await api.get(`socialevents/generate-new/${groupid}`);
            console.log(
                'success calling ' + `socialevents/generate-new/${groupid}`
            );
            setSaveMessage('Success creating social event');
            setTimeout(() => setSaveMessage(''), 4000);
        } catch (error: any) {
            // Type as 'any' to access axios error properties
            console.error(
                'Error creating event automatically onClickCreateEventAutomatic',
                error
            );
            // Get the error message from the response of it exists
            console.log('xx');
            console.log(error);
            console.log('xx');
            const errorMessage =
                error.response?.data?.error || 'Unknown error occurred';
            setSaveMessage('Error creating social event: ' + errorMessage);
            setTimeout(() => setSaveMessage(''), 4000);
        }
        getSocialEventsForThisGroup(groupid!);
    };

    const findNextAvailableTime = () => {
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1;

        const dayIndices = {
            Monday: 0,
            Tuesday: 1,
            Wednesday: 2,
            Thursday: 3,
            Friday: 4,
            Saturday: 5,
            Sunday: 6,
        };

        for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
            const checkingDay = (adjustedCurrentDay + daysAhead) % 7;
            const dayName = Object.keys(dayIndices).find(
                (key) =>
                    dayIndices[key as keyof typeof dayIndices] === checkingDay
            )!;

            const daySlots = commonTimeSlots.find(
                (slot) => slot.day === dayName
            );

            if (daySlots?.slots.length) {
                // On current day, filter out past times
                const availableSlots =
                    daysAhead === 0
                        ? daySlots.slots.filter((slotIndex) => {
                              const [startHour] = timeSlots[slotIndex]
                                  .split('-')[0]
                                  .split(':')
                                  .map(Number);
                              return (
                                  startHour > currentHour ||
                                  (startHour === currentHour &&
                                      currentMinute < 30)
                              );
                          })
                        : daySlots.slots;

                if (availableSlots.length > 0) {
                    setNextAvailableTime({
                        day: dayName,
                        time: timeSlots[availableSlots[0]],
                        daysUntil: daysAhead,
                    });
                    return;
                }
            }
        }
        setNextAvailableTime(null);
    };

    // Add useEffect to trigger calculation when commonTimeSlots changes
    useEffect(() => {
        if (commonTimeSlots.length > 0) {
            findNextAvailableTime();
        }
    }, [commonTimeSlots]);

    const fetchGroupUsers = useCallback(async () => {
        try {
            const response = await api.get(`/users/by-groupid/${groupid}`);

            // Add detailed logging
            console.log(
                'Full response data:',
                JSON.stringify(response.data, null, 2)
            );
            console.log('First user data:', response.data[0]);

            // Check if address is lowercase in response
            console.log(
                'First user address:',
                response.data[0]?.address || response.data[0]?.Address
            );

            // Updated mapping with case check
            const addresses = response.data.map((user: GroupUser) => {
                console.log('User object:', user);
                return user.address;
            });
            console.log('Mapped addresses:', addresses);

            setGroupUsers(response.data);

            // Get coordinates for users with addresses
            const coords = await Promise.all(
                response.data
                    .filter((user: GroupUser) => user.address)
                    .map((user: GroupUser) => getCoordinates(user.address))
            );

            const validCoords = coords.filter(
                (coord): coord is Coordinates => coord !== null
            );

            setMemberCoordinates(validCoords);

            if (validCoords.length > 0) {
                const center = calculateCenterPoint(validCoords);
                setCenterPoint(center);

                // Save center point to localStorage for GroupEvent
                localStorage.setItem(
                    `group_${groupid}_center`,
                    JSON.stringify(center)
                );
            }

            if (response.data.length > 0 && response.data[0].joincode) {
                setJoinCode(response.data[0].joincode);
            }
        } catch (err) {
            console.error('Error fetching group users:', err);
        }
    }, [groupid]);

    useEffect(() => {
        fetchGroupUsers();
    }, [fetchGroupUsers]);

    useEffect(() => {
        if (groupUsers.length > 0) {
            setGroupName(groupUsers[0].groupname);
            aggregatePreferences();
        }
    }, [groupUsers]);

    const aggregatePreferences = () => {
        const preferencesCount: { [key: string]: number } = {};
        groupUsers.forEach((user) => {
            user.cuisine_preferences?.forEach((pref) => {
                if (preferencesCount[pref]) {
                    preferencesCount[pref]++;
                } else {
                    preferencesCount[pref] = 1;
                }
            });
        });
        const aggregated = Object.entries(preferencesCount).map(
            ([preference, count]) => ({ preference, count })
        );
        console.log('Aggregated preferences:', aggregated);
        setAggregatedPreferences(aggregated);
    };

    const processScheduleMatrix = (serializedMatrix: string): boolean[][] => {
        const matrix: boolean[][] = [];
        for (let i = 0; i < 7; i++) {
            const daySlots: boolean[] = [];
            for (let j = 0; j < 19; j++) {
                daySlots.push(serializedMatrix[i * 19 + j] === '1');
            }
            matrix.push(daySlots);
        }
        return matrix;
    };

    const findCommonTimeSlots = (users: GroupUser[]) => {
        const availability: AvailabilityMatrix = {
            Monday: new Array(19).fill(true),
            Tuesday: new Array(19).fill(true),
            Wednesday: new Array(19).fill(true),
            Thursday: new Array(19).fill(true),
            Friday: new Array(19).fill(true),
            Saturday: new Array(19).fill(true),
            Sunday: new Array(19).fill(true),
        };

        users.forEach((user) => {
            if (user.serializedschedulematrix) {
                const matrix = processScheduleMatrix(
                    user.serializedschedulematrix
                );
                const days = [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                ];

                days.forEach((day, dayIndex) => {
                    matrix[dayIndex].forEach((slot, slotIndex) => {
                        if (!slot) {
                            availability[day][slotIndex] = false;
                        }
                    });
                });
            }
        });

        setGroupAvailability(availability);

        const common = Object.entries(availability).map(([day, slots]) => ({
            day,
            slots: slots.reduce(
                (acc, available, index) => (available ? [...acc, index] : acc),
                [] as number[]
            ),
        }));

        setCommonTimeSlots(common);
    };

    useEffect(() => {
        if (groupUsers.length > 0) {
            findCommonTimeSlots(groupUsers);
        }
    }, [groupUsers]);

    // Add new section to render common availability
    const timeSlots = [
        '5:00-6:00 AM',
        '6:00-7:00 AM',
        '7:00-8:00 AM',
        '8:00-9:00 AM',
        '9:00-10:00 AM',
        '10:00-11:00 AM',
        '11:00-12:00 PM',
        '12:00-1:00 PM',
        '1:00-2:00 PM',
        '2:00-3:00 PM',
        '3:00-4:00 PM',
        '4:00-5:00 PM',
        '5:00-6:00 PM',
        '6:00-7:00 PM',
        '7:00-8:00 PM',
        '8:00-9:00 PM',
        '9:00-10:00 PM',
        '10:00-11:00 PM',
        '11:00-12:00 AM',
    ];

    const getCoordinates = async (
        address: string
    ): Promise<Coordinates | null> => {
        try {
            const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                    address
                )}&key=${MAPS_API_KEY}`
            );

            if (response.data.results[0]) {
                const { lat, lng } = response.data.results[0].geometry.location;
                return { lat, lng };
            }
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    };

    const calculateCenterPoint = (coordinates: Coordinates[]): Coordinates => {
        const total = coordinates.length;
        return coordinates.reduce(
            (acc, curr) => ({
                lat: acc.lat + curr.lat / total,
                lng: acc.lng + curr.lng / total,
            }),
            { lat: 0, lng: 0 }
        );
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');

        try {
            const inviteData = {
                email: inviteEmail,
                invitedAt: new Date().toISOString(), // Add current date in ISO format
            };

            await api.post(`/groups/${groupid}/invite`, inviteData);
            setInviteEmail('');
            alert('Invite sent successfully');
            fetchGroupUsers();
        } catch (err: any) {
            setInviteError(
                err.response?.data?.error || 'Failed to send invite'
            );
        }
    };

    const handleDeleteClick = async () => {
        // Show confirmation dialog
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this group?'
        );

        if (confirmDelete) {
            try {
                const response = await api.delete(`/groups/${groupid}`);

                if (!response) {
                    throw new Error('Failed to delete group');
                }

                // Redirect to my-groups page after successful deletion
                navigate('/my-groups');
            } catch (error) {
                console.error('Error deleting group:', error);
                alert('Failed to delete group. Please try again.');
            }
        }
    };

    return (
        <div className="selected-group-container">
            <header className="group-header">
                <h1>{groupName}</h1>
                <div className="group-info">
                    Group ID: <span className="code-text">{groupid}</span>
                </div>
                {joinCode && (
                    <div className="group-info">
                        Join Code: <span className="code-text">{joinCode}</span>
                    </div>
                )}
            </header>
            <h2>Aggregated Preferences</h2>
            <section className="group-section">
                <div className="cuisine-preferences">
                    {aggregatedPreferences.length > 0 ? (
                        aggregatedPreferences.map(({ preference, count }) => (
                            <span key={preference} className="preference-tag">
                                {preference} x {count}
                            </span>
                        ))
                    ) : (
                        <p className="no-preferences">No preferences set</p>
                    )}
                </div>

                <div className="location-info">
                    <h3>Group Central Location</h3>
                    {centerPoint ? (
                        <div className="coordinate-container">
                            <p className="coordinate-text">
                                Latitude:{' '}
                                <span className="code-text">
                                    {centerPoint.lat.toFixed(4)}°
                                </span>
                            </p>
                            <p className="coordinate-text">
                                Longitude:{' '}
                                <span className="code-text">
                                    {centerPoint.lng.toFixed(4)}°
                                </span>
                            </p>
                            <p className="member-count">
                                Based on {memberCoordinates.length} member
                                location
                                {memberCoordinates.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    ) : (
                        <p className="no-preferences">
                            No member locations available
                        </p>
                    )}
                </div>
            </section>

            <section className="group-section">
                <h2>Invite Members</h2>
                <form onSubmit={handleInvite} className="invite-form">
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="invite-input"
                    />
                    <button type="submit" className="cta-button">
                        Send Invite
                    </button>
                </form>
                {inviteError && <p className="error-message">{inviteError}</p>}
            </section>
            <h2>Group Members</h2>
            <section className="group-section">
                {groupUsers.map((gUser) => (
                    <div key={gUser.id} className="member-card">
                        <div className="member-avatar">
                            {gUser.firstname[0]}
                            {gUser.lastname[0]}
                        </div>
                        <div className="member-info">
                            <h3>
                                {gUser.firstname} {gUser.lastname}
                            </h3>
                            <p className="member-email">{gUser.email}</p>
                            {gUser.address ? (
                                <p className="member-address">
                                    Address: {gUser.address}
                                </p>
                            ) : (
                                <p className="no-preferences">No address set</p>
                            )}
                            <div className="cuisine-preferences">
                                {gUser.cuisine_preferences &&
                                gUser.cuisine_preferences.length > 0 ? (
                                    gUser.cuisine_preferences.map((cuisine) => (
                                        <span
                                            key={cuisine}
                                            className="preference-tag"
                                        >
                                            {cuisine}
                                        </span>
                                    ))
                                ) : (
                                    <p className="no-preferences">
                                        No cuisine preferences set
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </section>
            <h2>Group Availability</h2>
            <section className="availability-section">
                {/* Next Available Time Card */}
                <div className="next-available-card">
                    <div className="card-header">
                        <h3>Next Group Availability</h3>
                    </div>
                    <div className="card-content">
                        {nextAvailableTime ? (
                            <div className="next-time">
                                <div className="time-badge">
                                    <span className="day">
                                        {nextAvailableTime.day}
                                    </span>
                                    <span className="time">
                                        {nextAvailableTime.time}
                                    </span>
                                </div>
                                <span className="relative-time">
                                    {nextAvailableTime.daysUntil === 0
                                        ? 'Today'
                                        : nextAvailableTime.daysUntil === 1
                                          ? 'Tomorrow'
                                          : `In ${nextAvailableTime.daysUntil} days`}
                                </span>
                            </div>
                        ) : (
                            <p className="no-time">
                                No upcoming times available
                            </p>
                        )}
                    </div>
                </div>

                {/* Weekly Availability */}
                <div className="weekly-availability">
                    <h3>Weekly Schedule</h3>
                    {commonTimeSlots.map(
                        ({ day, slots }) =>
                            slots.length > 0 && (
                                <div key={day} className="day-schedule">
                                    <div className="day-header">{day}</div>
                                    <div className="time-blocks">
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
                                                            {label}
                                                        </span>
                                                        <div className="time-list">
                                                            {slots.map(
                                                                (slotIndex) => (
                                                                    <span
                                                                        key={
                                                                            slotIndex
                                                                        }
                                                                        className={`time-slot clickable ${
                                                                            isSelectedTimeSlot(
                                                                                day,
                                                                                slotIndex
                                                                            )
                                                                                ? 'selected'
                                                                                : ''
                                                                        }`}
                                                                        onClick={() =>
                                                                            handleTimeSlotClick(
                                                                                day,
                                                                                slotIndex
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            timeSlots[
                                                                                slotIndex
                                                                            ]
                                                                        }
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                        )}
                                    </div>
                                </div>
                            )
                    )}
                </div>
            </section>
            <h2>Group Events</h2>
            <section className="group-section">
                {groupEvents.map((socialEvent, index) => (
                    <div key={socialEvent.restaurant.id}>
                        <h3>
                            <u>Event {index + 1}</u>
                        </h3>
                        <p>
                            <b>When: </b>
                            {socialEvent.startTime.day}{' '}
                            {socialEvent.startTime.time}
                        </p>
                        <p>
                            <b>Restaurant:</b> {socialEvent.restaurant.name}
                        </p>
                        <p>
                            <b>Rating</b>: {socialEvent.restaurant.rating}
                        </p>

                        <img
                            src={socialEvent.restaurant.image_url}
                            alt={`${socialEvent.restaurant.name} thumbnail`}
                            style={{
                                width: '150px',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                            }}
                        />

                        <p>
                            <a href={socialEvent.restaurant.url}>Website</a>
                        </p>
                        <p>
                            <b>Price</b>: {socialEvent.restaurant.price}
                        </p>
                        <p>
                            <b>Address: </b>
                            {socialEvent.restaurant.location.display_address}
                        </p>
                    </div>
                ))}
            </section>

            <h2>Auto-Suggested Event</h2>
            <section className="group-section">
                {autoSuggestedEvent.restaurant ? (
                    <div className="auto-event-card">
                        <div className="search-preferences">
                            <h3>Search Criteria</h3>
                            <div className="preferences-list">
                                {autoSuggestedEvent.preferences.cuisines.map(
                                    (cuisine) => (
                                        <button
                                            key={cuisine}
                                            onClick={() =>
                                                !unavailableCuisines.includes(
                                                    cuisine
                                                ) &&
                                                handleCuisineSelect(cuisine)
                                            }
                                            className={`preference-button ${
                                                selectedCuisine === cuisine
                                                    ? 'selected'
                                                    : ''
                                            } ${unavailableCuisines.includes(cuisine) ? 'disabled' : ''}`}
                                            disabled={unavailableCuisines.includes(
                                                cuisine
                                            )}
                                        >
                                            {cuisine}
                                            {unavailableCuisines.includes(
                                                cuisine
                                            ) && ' (no options)'}
                                        </button>
                                    )
                                )}
                            </div>
                            <p className="search-details">
                                <span>
                                    Search radius:{' '}
                                    {(
                                        autoSuggestedEvent.preferences
                                            .distance / 1000
                                    ).toFixed(1)}
                                    km
                                </span>
                                {autoSuggestedEvent.preferences.location && (
                                    <span>
                                        {' '}
                                        | Center: (
                                        {autoSuggestedEvent.preferences.location.lat.toFixed(
                                            2
                                        )}
                                        ,
                                        {autoSuggestedEvent.preferences.location.lng.toFixed(
                                            2
                                        )}
                                        )
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="event-timing">
                            <h3>Suggested Time</h3>
                            <p>
                                {autoSuggestedEvent.availability?.day} at{' '}
                                {autoSuggestedEvent.availability?.time}
                            </p>
                        </div>
                        <div className="restaurant-details">
                            <h3>{autoSuggestedEvent.restaurant.name}</h3>
                            <img
                                src={autoSuggestedEvent.restaurant.image_url}
                                alt={autoSuggestedEvent.restaurant.name}
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                }}
                            />
                            <p>
                                <b>Rating:</b>{' '}
                                {autoSuggestedEvent.restaurant.rating}
                            </p>
                            <p>
                                <b>Price:</b>{' '}
                                {autoSuggestedEvent.restaurant.price}
                            </p>
                            <p>
                                <b>Distance:</b>{' '}
                                {(
                                    autoSuggestedEvent.restaurant.distance /
                                    1000
                                ).toFixed(2)}
                                km
                            </p>
                            <p>
                                <b>Address:</b>{' '}
                                {autoSuggestedEvent.restaurant.location.display_address.join(
                                    ', '
                                )}
                            </p>
                            <a
                                href={autoSuggestedEvent.restaurant.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on Yelp
                            </a>
                            {autoSuggestedEvent.availability &&
                                !autoSuggestedEvent.restaurant && (
                                    <p className="no-restaurants-message">
                                        No restaurants available for{' '}
                                        {autoSuggestedEvent.availability.day} at{' '}
                                        {autoSuggestedEvent.availability.time}
                                    </p>
                                )}
                        </div>
                    </div>
                ) : (
                    <p>
                        No suggestions available for the next available time
                        slot
                    </p>
                )}
            </section>
            {saveMessage && (
                <p
                    className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}
                >
                    {saveMessage}
                </p>
            )}
            <div className="group-actions">
                <div>
                    <button
                        className="cta-button"
                        onClick={onClickCreateEventAutomatic}
                    >
                        Create Event - Automatic
                    </button>
                </div>
                <Link to={`/group-event/${groupid}`}>
                    <button className="cta-button">
                        Create Event - Manual
                    </button>
                </Link>

                <Link to="/my-groups">
                    <button className="back-button">Back to My Groups</button>
                </Link>

                <Link
                    to="#"
                    onClick={(e) => {
                        e.preventDefault(); // Prevents navigation
                        handleDeleteClick(); // Too lazy to figure out the styling... So I just put it in a link wrapper.
                    }}
                >
                    <button className="cta-button delete">Delete Group</button>
                </Link>
            </div>
            <DebugPanel cache={cachedRestaurants} />
        </div>
    );
};

export default SelectedGroup;
