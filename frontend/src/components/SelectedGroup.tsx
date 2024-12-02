import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';
import api from '../api/axios';
import axios from 'axios';
import { SocialEvent, Coordinates } from '@types';
//import { format } from 'date-fns';
import { YelpCache } from '../utils/cache';
import './SelectedGroup.css';

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
    isAdmin: boolean;
}

interface AvailabilityMatrix {
    [key: string]: boolean[];
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SelectedGroup = () => {
    const { auth } = useContext(AuthContext);
    const { groupid } = useParams();
    const navigate = useNavigate();
    const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
    const [groupName, setGroupName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [saveMessage, setSaveMessage] = useState(''); // For displaying error or success when creating event with automatic option
    const [joinCode, setJoinCode] = useState('');
    const [groupAvailability, setGroupAvailability] = useState<AvailabilityMatrix>({});
    const [commonTimeSlots, setCommonTimeSlots] = useState<{ day: string; slots: number[] }[]>([]);
    const [memberCoordinates, setMemberCoordinates] = useState<Coordinates[]>([]);
    const [centerPoint, setCenterPoint] = useState<Coordinates | null>(null);

    const [aggregatedPreferences, setAggregatedPreferences] = useState<{ preference: string; count: number }[]>([]);
    const [nextAvailableTime, setNextAvailableTime] = useState<{
        day: string;
        time: string;
        daysUntil: number;
    } | null>(null);
    const isSelectedTimeSlot = (day: string, slotIndex: number) => {
        return nextAvailableTime?.day === day && nextAvailableTime?.time === timeSlots[slotIndex];
    };

    const [groupEvent, setGroupEvent] = useState<SocialEvent | null>(null);
    useEffect(() => {
        getSocialEventsForThisGroup(groupid!);
    }, [groupid]);

    // Update handleTimeSlotClick function

    const getTopPreferences = useCallback(() => {
        if (aggregatedPreferences.length === 0) return [];

        // Find the highest count
        const maxCount = Math.max(...aggregatedPreferences.map((p) => p.count));

        // Filter to only include preferences with the highest count
        return aggregatedPreferences.filter((p) => p.count === maxCount).map((p) => p.preference.toLowerCase());
    }, [aggregatedPreferences]);

    const getSocialEventsForThisGroup = async (groupid: string) => {
        try {
            const response = await api.get(`/socialevents/bygroupid/${groupid}`);
            console.log('getting social events from the backend');
            if (Object.keys(response.data).length === 0) {
                // If response had no data, ensure the events section shows empty
                setGroupEvent(null);
                console.log('retrieved 0 social events for this group');
                return;
            }
            setGroupEvent(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onClickCreateEventAutomatic = async () => {
        if (groupEvent) {
            setSaveMessage('Error: This group already has an event.');
            setTimeout(() => setSaveMessage(''), 4000);
            return;
        }
        try {
            await api.get(`socialevents/generate-new/${groupid}`);
            console.log('success calling ' + `socialevents/generate-new/${groupid}`);
            setSaveMessage('Success creating social event');
            setTimeout(() => setSaveMessage(''), 4000);
        } catch (error: any) {
            // Type as 'any' to access axios error properties
            console.error('Error creating event automatically onClickCreateEventAutomatic', error);
            // Get the error message from the response of it exists
            console.log(error);
            const errorMessage = error.response?.data?.error || 'Unknown error occurred';
            setSaveMessage('Error creating social event: ' + errorMessage);
            setTimeout(() => setSaveMessage(''), 4000);
        }
        getSocialEventsForThisGroup(groupid!);
    };

    const deleteSocialEvent = async () => {
        try {
            await api.delete(`socialevents/delete-by-groupid/${groupid}`);
            await getSocialEventsForThisGroup(groupid!);
            console.log('success calling delete event');
            setSaveMessage('Success deleting social event');
            setTimeout(() => setSaveMessage(''), 4000);
        } catch (error: any) {
            console.error('Error deleting social event', error);
            const errorMessage = error.response?.data?.error || 'Unknown error occurred';
            setSaveMessage('Error deleting social event: ' + errorMessage);
            setTimeout(() => setSaveMessage(''), 4000);
        }
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
                (key) => dayIndices[key as keyof typeof dayIndices] === checkingDay
            )!;

            const daySlots = commonTimeSlots.find((slot) => slot.day === dayName);

            if (daySlots?.slots.length) {
                // On current day, filter out past times
                const availableSlots =
                    daysAhead === 0
                        ? daySlots.slots.filter((slotIndex) => {
                              const [startHour] = timeSlots[slotIndex].split('-')[0].split(':').map(Number);
                              return startHour > currentHour || (startHour === currentHour && currentMinute < 30);
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
            console.log('Full response data:', JSON.stringify(response.data, null, 2));
            console.log('First user data:', response.data[0]);

            // Check if address is lowercase in response
            console.log('First user address:', response.data[0]?.address || response.data[0]?.Address);

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

            const validCoords = coords.filter((coord): coord is Coordinates => coord !== null);

            setMemberCoordinates(validCoords);

            if (validCoords.length > 0) {
                const center = calculateCenterPoint(validCoords);
                setCenterPoint(center);

                // Save center point to localStorage for GroupEvent
                localStorage.setItem(`group_${groupid}_center`, JSON.stringify(center));
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
        console.log('Group Users Data:', groupUsers);
    }, [groupUsers]);

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
        const aggregated = Object.entries(preferencesCount).map(([preference, count]) => ({ preference, count }));
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
                const matrix = processScheduleMatrix(user.serializedschedulematrix);
                const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
            slots: slots.reduce((acc, available, index) => (available ? [...acc, index] : acc), [] as number[]),
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

    const convertTo12Hour = (time24: string): string => {
        const [hours24, minutes] = time24.split(':').map(Number);
        const period = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = hours24 % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const getCoordinates = async (address: string): Promise<Coordinates | null> => {
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
            setInviteError(err.response?.data?.error || 'Failed to send invite');
        }
    };

    const handleDeleteClick = async () => {
        // Use auth from above instead of getting it inside the function
        const currentUser = groupUsers.find(
            (user) => user.isAdmin && user.id === auth?.id
        );
        if (!currentUser) {
            alert('Only group admins can delete groups');
            return;
        }

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

    const handleTransferAdmin = async (newAdminId: number) => {
        const confirmTransfer = window.confirm(
            'Are you sure you want to transfer admin status to this user? You will no longer be the admin.'
        );
        if (confirmTransfer) {
            try {
                await api.put(`/groups/${groupid}/transfer-admin`, {
                    currentAdminId: auth?.id,
                    newAdminId: newAdminId,
                });
                
                await fetchGroupUsers();
            } catch (error) {
                console.error('Error transferring admin status:', error);
                alert('Failed to transfer admin status. Please try again.');
            }
        }
    };
    

    // Input: 1330
    // Output: 1:30 PM
    const convertHoursNumberToString = (yelpTime: string): string => {
        let hourInt: number = parseInt(yelpTime.slice(0, 2));
        const minuteStr: string = yelpTime.slice(2);
        const amPm: string = hourInt >= 12 ? 'PM' : 'AM';
        if (hourInt > 12) hourInt -= 12;

        return '' + hourInt + ':' + minuteStr + ' ' + amPm;
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
            <section className="aggregated-preferences">
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
                                Latitude: <span className="code-text">{centerPoint.lat.toFixed(4)}°</span>
                            </p>
                            <p className="coordinate-text">
                                Longitude: <span className="code-text">{centerPoint.lng.toFixed(4)}°</span>
                            </p>
                            <p className="member-count">
                                Based on {memberCoordinates.length} member location
                                {memberCoordinates.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    ) : (
                        <p className="no-preferences">No member locations available</p>
                    )}
                </div>
            </section>

            <section className="invite-members">
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
            <section className="group-members">
    {groupUsers.map((gUser) => (
        <div key={gUser.id} className="member-card">
            <div className="member-avatar">
                {gUser.firstname[0]}
                {gUser.lastname[0]}
            </div>
            <div className="member-info">
                <div className="member-name-container">
                    <h3>
                        {gUser.firstname} {gUser.lastname}
                    </h3>
                    {gUser.isAdmin && (
                        <span className="admin-badge">Admin</span>
                    )}
                    {auth?.id !== gUser.id && 
                     groupUsers.find(u => u.isAdmin && u.id === auth?.id) && (
                        <button
                            className="transfer-admin-button"
                            onClick={() => handleTransferAdmin(gUser.id)}
                        >
                            Make Admin
                        </button>
                    )}
                </div>
                <p>{gUser.email}</p>
                {gUser.address ? (
                    <p className="member-address">Address: {gUser.address}</p>
                ) : (
                    <p className="no-preferences">No address set</p>
                )}
                <div className="cuisine-preferences">
                    {gUser.cuisine_preferences && gUser.cuisine_preferences.length > 0 ? (
                        gUser.cuisine_preferences.map((cuisine) => (
                            <span key={cuisine} className="preference-tag">
                                {cuisine}
                            </span>
                        ))
                    ) : (
                        <p className="no-preferences">No cuisine preferences set</p>
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
                                    <span className="day">{nextAvailableTime.day}</span>
                                    <span className="time">{nextAvailableTime.time}</span>
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
                            <p>No upcoming times available</p>
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
                                                slots: slots.filter((i) => i < 6),
                                            },
                                            {
                                                label: 'Afternoon',
                                                slots: slots.filter((i) => i >= 6 && i < 12),
                                            },
                                            {
                                                label: 'Evening',
                                                slots: slots.filter((i) => i >= 12),
                                            },
                                        ].map(
                                            ({ label, slots }) =>
                                                slots.length > 0 && (
                                                    <div key={label} className="time-group">
                                                        <span className="time-label">{label}</span>
                                                        <div className="time-list">
                                                            {slots.map((slotIndex) => (
                                                                <span
                                                                    key={slotIndex}
                                                                    className={`time-slot clickable ${
                                                                        isSelectedTimeSlot(day, slotIndex)
                                                                            ? 'selected'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {timeSlots[slotIndex]}
                                                                </span>
                                                            ))}
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
            {/* Group Event Section
             * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             */}
            <h2 style={{ paddingTop: '30px' }}>Group Event</h2>
            <section className="group-event">
                {groupEvent && (
                    <>
                        <div key={groupEvent.restaurant.id}>
                            <p>
                                <b>When: </b>
                                {/* Only convert to 12 hours when using military time (We seem to store the time as military when saving events in the manual event feature) */}
                                {groupEvent.startTime.day}{' '}
                                {!groupEvent.startTime.time.includes('M')
                                    ? convertTo12Hour(groupEvent.startTime.time)
                                    : groupEvent.startTime.time}
                            </p>
                            <p>
                                <b>Restaurant:</b> {groupEvent.restaurant.name}
                            </p>
                            <p>
                                <b>Rating</b>: {groupEvent.restaurant.rating}
                            </p>

                            <p>
                                <a href={groupEvent.restaurant.url}>Website</a>
                            </p>
                            <p>
                                <b>Price</b>: {groupEvent.restaurant.price}
                            </p>
                            <p>
                                <b>Address: </b>
                                {groupEvent.restaurant.location.display_address}
                            </p>
                            <p>
                                <b>Categories:</b>{' '}
                                {groupEvent.restaurant.categories.map((category) => category.title).join(', ')}
                            </p>
                            <button className="cta-button" onClick={deleteSocialEvent}>
                                Delete
                            </button>
                        </div>

                        <img
                            src={groupEvent.restaurant.image_url}
                            alt={`${groupEvent.restaurant.name} thumbnail`}
                            style={{
                                width: '250px',
                                height: '250px',
                                objectFit: 'cover',
                                marginLeft: '3rem',
                                marginRight: '3rem',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                            }}
                        />

                        <div key="hours-key">
                            <h3>
                                <u>Hours</u>
                            </h3>
                            {groupEvent.restaurant.hours &&
                                groupEvent.restaurant.hours[0].open.map(({ day, start, end }) => (
                                    <p
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <span
                                            style={{
                                                marginRight: '3rem',
                                            }}
                                        >
                                            {daysOfWeek[day]}
                                        </span>
                                        <span>
                                            {convertHoursNumberToString(start)}
                                            {'-'}
                                            {convertHoursNumberToString(end)}
                                        </span>
                                    </p>
                                ))}
                        </div>
                    </>
                )}
            </section>

            {/* Error/Success Message box (hides itself after 4 seconds)
             * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             */}

            {saveMessage && (
                <p className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>{saveMessage}</p>
            )}

            {/* Buttons Section
             * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             */}
            <div className="group-actions">
                <div>
                    <button className="cta-button" onClick={onClickCreateEventAutomatic}>
                        Create Event - Automatic
                    </button>

                    <Link to={`/group-event/${groupid}`} state={{ commonTimeSlots }}>
                        <button className="cta-button">Create Event - Manual</button>
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
            </div>
        </div>
    );
};

export default SelectedGroup;
