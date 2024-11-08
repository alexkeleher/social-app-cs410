import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Group } from '@types';
import { group } from 'console';

interface GroupUser {
    groupname: string;
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
}

const SelectedGroup = () => {
    const { groupid } = useParams();
    // need a variable for group users array
    const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
    const [groupName, setGroupName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');

        try {
            await api.post(`/groups/${groupid}/invite`, { email: inviteEmail });
            setInviteEmail('');
            alert('Invite sent successfully');
        } catch (err: any) {
            setInviteError(
                err.response?.data?.error || 'Failed to send invite'
            );
        }
    };

    useEffect(() => {
        getMyGroups();
    }, []);

    useEffect(() => {
        if (groupUsers.length > 0) setGroupName(groupUsers[0].groupname);
    }, [groupUsers]);

    const getMyGroups = async () => {
        try {
            const response = await api.get(`/users-by-groupid${groupid}`);
            console.log('getting group users from Backend');
            setGroupUsers(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className="landing-container">
                <header className="landing-header">
                    <h1>{groupName}</h1>
                    <style>{`
                .landing-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    text-align: center;
                }
                .landing-header, .landing-main, .landing-footer {
                    width: 100%;
                }
                .cta-button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    margin-right: 10px;
                    margin-left: 5px;
                }
            `}</style>
                </header>

                <main className="landing-main">
                    <div>
                        <b>Group ID:</b> {groupid}
                    </div>
                    <div>
                        <h4>Group Members</h4>

                        {groupUsers.map((gUser) => (
                            <>
                                <span>
                                    {gUser.email}, {gUser.firstname}{' '}
                                    {gUser.lastname}
                                </span>
                                <br />
                            </>
                        ))}
                    </div>
                    <button className="cta-button">Invite Members</button>
                    <form onSubmit={handleInvite}>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Enter email to invite"
                        />
                        <button type="submit" className="cta-button">
                            Send Invite
                        </button>
                        {inviteError && <p className="error">{inviteError}</p>}
                    </form>
                    <form>
                        <button className="cta-button">Create Event</button>
                    </form>
                    <Link to="/my-groups">
                        <button className="cta-button">
                            Back To My Groups
                        </button>
                    </Link>
                </main>
            </div>
        </>
    );
};

export default SelectedGroup;
