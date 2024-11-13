import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthProvider';

interface Group {
    id: number;
    name: string;
    datecreated: Date;
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
                const response = await api.get('/invites');
                setPendingInvites(response.data);
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

    // on page loading, populate the page using axious http get

    // need a component for the group cards

    var groupID = 1;

    return (
        <>
            <h1>My Groups</h1>
            <div className="my-groups-container">
                {/* Existing Groups Section */}
                <div className="group-list">
                    {myGroups.map((group: Group) => (
                        <Link key={group.id} to={`/selected-group/${group.id}`}>
                            <div className="group-card">
                                <h2>{group.name}</h2>
                                <p>Group ID: {group.id}</p>
                                <p>
                                    Date Created: {group.datecreated.toString()}
                                </p>
                                <p className="join-code">
                                    Join Code: {group.joincode}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pending Invites Section */}
                {pendingInvites.map((invite: Group) => (
                    <div key={invite.id} className="group-card">
                        <h2>Group: {invite.name}</h2>
                        <p>Join Code: {invite.joincode}</p>
                        <p>
                            Invited:{' '}
                            {new Date(invite.datecreated).toLocaleDateString()}
                        </p>
                        <button
                            onClick={() => handleAcceptInvite(invite)}
                            className="cta-button"
                            disabled={acceptingInvite === invite.id.toString()}
                        >
                            {acceptingInvite === invite.id.toString()
                                ? 'Accepting...'
                                : 'Accept Invite'}
                        </button>
                    </div>
                ))}

                {/* Action Buttons */}
                <div className="button-container">
                    <button
                        onClick={() => navigate('/create-group')}
                        className="cta-button"
                        type="button"
                    >
                        Create a New Group
                    </button>

                    <button
                        onClick={() => navigate('/all-preferences')}
                        className="cta-button"
                        type="button"
                    >
                        Go to My Preferences
                    </button>

                    <button
                        onClick={() => navigate('/join-group')}
                        className="cta-button"
                        type="button"
                    >
                        Join a Group
                    </button>
                </div>
            </div>
        </>
    );
};

export default MyGroups;
