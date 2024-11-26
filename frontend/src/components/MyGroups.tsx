import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';
import { Button } from '@mui/material';
import api from '../api/axios';
import './MyGroups.css';

// TODO: When the groups are loading in, don't show the buttons and header.

interface Group {
    id: number;
    name: string;
    datecreated?: string;
    invitedat?: string;
    joincode: string;
}

const MyGroups: React.FC = () => {
    const navigate = useNavigate(); // useNavigate hook for navigation
    const { auth } = useContext(AuthContext);
    const [pendingInvites, setPendingInvites] = useState<Group[]>([]);
    const [acceptingInvite, setAcceptingInvite] = useState<string | null>(null);

    // need a variable for myGroups array
    const [myGroups, setMyGroups] = useState([]);
    useEffect(() => {
        getMyGroups();
    }, []);

    useEffect(() => {
        const fetchInvites = async () => {
            try {
                if (auth.id) console.log('auth id is set'); // Debugging
                if (auth.token) console.log('auth token is set'); // Debugging

                const response = await api.get('/invites');
                console.log('Invite data:', response.data);

                // Filter out invites for groups user is already in
                const validInvites = [];
                for (const invite of response.data) {
                    const wasDeleted = await checkAndDeleteInvite(invite);
                    if (!wasDeleted) {
                        validInvites.push(invite);
                    }
                }

                setPendingInvites(validInvites);
            } catch (err) {
                console.error('Error fetching invites:', err);
            }
        };
        fetchInvites();
    }, []);

    const getMyGroups = async () => {
        try {
            const response = await api.get(`/groups${auth.id}`);
            console.log('getting restaurants from Backend');
            setMyGroups(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Add handleAcceptInvite function
    const handleAcceptInvite = async (invite: Group) => {
        try {
            setAcceptingInvite(invite.id.toString());

            // Join the group
            await api.post(
                '/groups/join',
                {
                    joinCode: invite.joincode,
                    userId: auth.id,
                },
                {
                    headers: { Authorization: `Bearer ${auth.token}` },
                }
            );

            // Delete the invitation
            await api.delete(`/invites/${invite.id}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            // Update UI state
            setPendingInvites((prev) =>
                prev.filter((inv) => inv.id !== invite.id)
            );

            // Refresh groups list
            await getMyGroups();
        } catch (err: any) {
            console.error('Error accepting invite:', err);
            alert(err.response?.data?.error || 'Failed to accept invite');
        } finally {
            setAcceptingInvite(null);
        }
    };

    const checkAndDeleteInvite = async (invite: Group) => {
        try {
            // Check if user is already member
            const memberCheckRes = await api.post(
                '/groups/join',
                {
                    joinCode: invite.joincode,
                    userId: auth.id,
                    checkOnly: true, // Add this flag to backend
                },
                {
                    headers: { Authorization: `Bearer ${auth.token}` },
                }
            );

            // If response indicates already member, delete invite
            if (memberCheckRes.data.alreadyMember) {
                await api.delete(`/invites/${invite.id}`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                });
                return true; // Invite was deleted
            }
            return false; // Invite still valid
        } catch (error) {
            console.error('Error checking membership:', error);
            return false;
        }
    };

    // on page loading, populate the page using axious http get

    // need a component for the group cards

    var groupID = 1;

    return (
        <>
            <h1>My Groups</h1>
            {myGroups.length > 0 || pendingInvites.length > 0 ? (
                <div className="my-groups-container1">
                    {/* Existing Groups Section */}
                    <div className="group-list1">
                        {myGroups.map((group: Group) => (
                            <Link
                                key={group.id}
                                to={`/selected-group/${group.id}`}
                                className="group-link1"
                            >
                                <div className="group-card1">
                                    <h2>{group.name}</h2>
                                    {/*<p className="group-info">Group ID: {group.id}</p>*/}
                                    <p className="group-info1">
                                        Date Created:{' '}
                                        {group.datecreated
                                            ? new Date(
                                                  group.datecreated
                                              ).toLocaleString('en-US', {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : 'N/A'}
                                    </p>
                                    <p className="group-info1">
                                        Join Code: {group.joincode}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pending Invites Section */}
                    {pendingInvites.map((invite: Group) => (
                        <div key={invite.id} className="group-card1">
                            <h2>Group: {invite.name}</h2>
                            <p>Join Code: {invite.joincode}</p>
                            <p>
                                Invited:{' '}
                                {new Date(
                                    invite.invitedat || ''
                                ).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                            <button
                                onClick={() => handleAcceptInvite(invite)}
                                className="cta-button"
                                disabled={
                                    acceptingInvite === invite.id.toString()
                                }
                            >
                                {acceptingInvite === invite.id.toString()
                                    ? 'Accepting...'
                                    : 'Accept Invite'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}

            {/* Action Buttons */}
            <div className="button-container">
                <Button
                    onClick={() => navigate('/create-group')}
                    variant="contained"
                    className="cta-button"
                    type="submit"
                    sx={{
                        backgroundColor: '#FF0000',
                        '&:hover': {
                            backgroundColor: '#CC0000',
                        },
                    }}
                >
                    New Group
                </Button>

                <Button
                    onClick={() => navigate('/all-preferences')}
                    variant="contained"
                    className="cta-button"
                    type="submit"
                    sx={{
                        backgroundColor: '#FF0000',
                        '&:hover': {
                            backgroundColor: '#CC0000',
                        },
                    }}
                >
                    My Preferences
                </Button>

                <Button
                    onClick={() => navigate('/join-group')}
                    variant="contained"
                    className="cta-button"
                    type="submit"
                    sx={{
                        backgroundColor: '#FF0000',
                        '&:hover': {
                            backgroundColor: '#CC0000',
                        },
                    }}
                >
                    Join Group
                </Button>
            </div>
        </>
    );
};

export default MyGroups;
