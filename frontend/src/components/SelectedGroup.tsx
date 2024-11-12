import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

interface GroupUser {
    groupname: string;
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    cuisine_preferences?: string[] | null;
    joincode?: string;
}

const SelectedGroup = () => {
    const { groupid } = useParams();
    const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
    const [groupName, setGroupName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [aggregatedPreferences, setAggregatedPreferences] = useState<
        { preference: string; count: number }[]
    >([]);

    const fetchGroupUsers = useCallback(async () => {
        try {
            const response = await api.get(`/users/by-groupid/${groupid}`);
            console.log('Group users response:', response.data);
            setGroupUsers(response.data);

            // Set join code if available in first user's data
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
