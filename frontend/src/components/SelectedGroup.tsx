import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import axios from 'axios';
import { format } from 'date-fns';

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

const SelectedGroup = () => {
    const { groupid } = useParams();
    const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
    const [groupName, setGroupName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [groupAvailability, setGroupAvailability] =
        useState<AvailabilityMatrix>({});
    const [commonTimeSlots, setCommonTimeSlots] = useState<
        { day: string; slots: number[] }[]
    >([]);
    const [memberCoordinates, setMemberCoordinates] = useState<Coordinates[]>(
        []
    );
    const [centerPoint, setCenterPoint] = useState<Coordinates | null>(null);

    const [aggregatedPreferences, setAggregatedPreferences] = useState<
        { preference: string; count: number }[]
    >([]);
    const [nextAvailableTime, setNextAvailableTime] = useState<{
        day: string;
        time: string;
        daysUntil: number;
    } | null>(null);

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
            await api.post(`/groups/${groupid}/invite`, { email: inviteEmail });
            setInviteEmail('');
            alert('Invite sent successfully');
            fetchGroupUsers();
        } catch (err: any) {
            setInviteError(
                err.response?.data?.error || 'Failed to send invite'
            );
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

            <section className="group-section">
                <h2>Aggregated Preferences</h2>
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

            <section className="group-section">
                <h2>Group Members</h2>
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

            <section className="group-section">
                <h2>Group Availability</h2>

                <div className="next-available">
                    <h3>Next Available Time</h3>
                    {nextAvailableTime ? (
                        <div className="next-time-slot">
                            <p className="available-slot">
                                {nextAvailableTime.day} at{' '}
                                {nextAvailableTime.time}
                                {nextAvailableTime.daysUntil === 0
                                    ? ' (Today)'
                                    : nextAvailableTime.daysUntil === 1
                                      ? ' (Tomorrow)'
                                      : ` (in ${nextAvailableTime.daysUntil} days)`}
                            </p>
                        </div>
                    ) : (
                        <p className="no-preferences">
                            No upcoming available times found
                        </p>
                    )}
                </div>
                <div className="availability-grid">
                    {commonTimeSlots.map(
                        ({ day, slots }) =>
                            slots.length > 0 && (
                                <div key={day} className="day-availability">
                                    <h3>{day}</h3>
                                    <div className="time-slots">
                                        {slots.map((slotIndex) => (
                                            <div
                                                key={`${day}-${slotIndex}`}
                                                className="available-slot"
                                            >
                                                {timeSlots[slotIndex]}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                    )}
                </div>
            </section>

            <div className="group-actions">
                <Link to={`/group-event/${groupid}`}>
                    <button className="cta-button">Create Event</button>
                </Link>

                <Link to="/my-groups">
                    <button className="back-button">Back to My Groups</button>
                </Link>
            </div>
        </div>
    );
};

export default SelectedGroup;
