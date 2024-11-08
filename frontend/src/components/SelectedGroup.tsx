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
}

const SelectedGroup = () => {
    const { groupid } = useParams();
    const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
    const [groupName, setGroupName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');

    const fetchGroupUsers = useCallback(async () => {
        try {
            console.log('Fetching users for group:', groupid);
            const response = await api.get(`/users-by-groupid${groupid}`);
            console.log('Group users response:', response.data);
            setGroupUsers(response.data);
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
        }
    }, [groupUsers]);

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
        <div className="landing-container">
            <header className="landing-header">
                <h1>{groupName}</h1>
            </header>

            <main className="landing-main">
                <section className="group-info">
                    <div className="group-id">
                        <b>Group ID:</b> {groupid}
                    </div>

                    <div className="members-section">
                        <h4>Group Members & Their Preferences</h4>
                        {groupUsers.map((gUser) => (
                            <div key={gUser.id} className="member-card">
                                <div className="member-info">
                                    <span className="member-name">
                                        {gUser.firstname} {gUser.lastname} (
                                        {gUser.email})
                                    </span>
                                    <div className="cuisine-preferences">
                                        <h5>Preferred Cuisines:</h5>
                                        {gUser.cuisine_preferences &&
                                        gUser.cuisine_preferences.length > 0 ? (
                                            <ul className="preferences-list">
                                                {gUser.cuisine_preferences.map(
                                                    (cuisine) => (
                                                        <li
                                                            key={`${gUser.id}-${cuisine}`}
                                                            className="preference-tag"
                                                        >
                                                            {cuisine}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="no-preferences">
                                                No cuisine preferences set
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="group-actions">
                    <form onSubmit={handleInvite} className="invite-form">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Enter email to invite"
                            className="invite-input"
                        />
                        <button type="submit" className="cta-button">
                            Send Invite
                        </button>
                        {inviteError && (
                            <p className="error-message">{inviteError}</p>
                        )}
                    </form>

                    <button className="cta-button">Create Event</button>
                    <Link to="/my-groups">
                        <button className="cta-button">
                            Back To My Groups
                        </button>
                    </Link>
                </section>
            </main>
        </div>
    );
};

export default SelectedGroup;
