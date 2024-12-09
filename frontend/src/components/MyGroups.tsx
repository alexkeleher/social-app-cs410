import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';
import { Button } from '@mui/material';
import { Search } from 'lucide-react';
import api from '../api/axios';
import './MyGroups.css';

interface Group {
    id: number;
    name: string;
    datecreated?: string;
    invitedat?: string;
    joincode: string;
}

const MyGroups: React.FC = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [pendingInvites, setPendingInvites] = useState<Group[]>([]);
    const [acceptingInvite, setAcceptingInvite] = useState<string | null>(null);
    const [rejectingInvite, setRejectingInvite] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [myGroups, setMyGroups] = useState<Group[]>([]);
   
    useEffect(() => {
        getMyGroups();
    }, []);

    useEffect(() => {
        const fetchInvites = async () => {
            try {
                if (auth.id) console.log('auth id is set');
                if (auth.token) console.log('auth token is set');

                const response = await api.get('/invites');
                console.log('Invite data:', response.data);

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
            setMyGroups(response.data as Group[]);
        } catch (err) {
            console.error(err);
        }
    };


    const handleAcceptInvite = async (invite: Group) => {
        try {
            setAcceptingInvite(invite.id.toString());

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

            await api.delete(`/invites/${invite.id}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            setPendingInvites((prev) => prev.filter((inv) => inv.id !== invite.id));

            await getMyGroups();
        } catch (err: any) {
            console.error('Error accepting invite:', err);
            alert(err.response?.data?.error || 'Failed to accept invite');
        } finally {
            setAcceptingInvite(null);
        }
    };

    const handleRejectInvite = async (invite: Group) => {
        try {
            setRejectingInvite(invite.id.toString());

            await api.delete(`/invites/${invite.id}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            setPendingInvites((prev) => prev.filter((inv) => inv.id !== invite.id));
        } catch (err: any) {
            console.error('Error rejecting invite:', err);
            alert(err.response?.data?.error || 'Failed to reject invite');
        } finally {
            setRejectingInvite(null);
        }
    };

    const checkAndDeleteInvite = async (invite: Group) => {
        try {
            const memberCheckRes = await api.post(
                '/groups/join',
                {
                    joinCode: invite.joincode,
                    userId: auth.id,
                    checkOnly: true,
                },
                {
                    headers: { Authorization: `Bearer ${auth.token}` },
                }
            );

            if (memberCheckRes.data.alreadyMember) {
                await api.delete(`/invites/${invite.id}`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking membership:', error);
            return false;
        }
    };

    const filteredGroups = myGroups.filter((group: Group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>{/* Search Bar */}
        <div className="search-container">
    <div className="search-icon-wrapper">
        <Search className="h-5 w-5 text-gray-400" />
    </div>
    <input
        type="text"
        className="search-input"
        placeholder="Search groups"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
    />
</div>
            <h1>My Groups</h1>
            {(filteredGroups.length > 0 || pendingInvites.length > 0) ? (
    <div className="my-groups-container1">
        <div className="group-list1">
            {filteredGroups.map((group: Group) => (
                <Link key={group.id} to={`/selected-group/${group.id}`} className="group-link1">
                    <div className="group-card1">
                        <h2>{group.name}</h2>
                        <p className="group-info1">
                            Date Created:{' '}
                            {group.datecreated
                                ? new Date(group.datecreated).toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      timeZone: 'America/New_York',
                                  })
                                : 'N/A'}
                        </p>
                        <p className="group-info1">Join Code: {group.joincode}</p>
                    </div>
                </Link>
            ))}
        </div>

                    {pendingInvites.map((invite: Group) => (
                        <div key={invite.id} className="group-card1">
                            <h2>Group: {invite.name}</h2>
                            <p>Join Code: {invite.joincode}</p>
                            <p>
                                Invited:{' '}
                                {invite.datecreated
                                    ? new Date(invite.datecreated).toLocaleString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          timeZone: 'America/New_York',
                                      })
                                    : 'Date not available'}
                            </p>
                            <button
                                onClick={() => handleAcceptInvite(invite)}
                                className="cta-button"
                                disabled={acceptingInvite === invite.id.toString()}
                            >
                                {acceptingInvite === invite.id.toString() ? 'Accepting...' : 'Accept Invite'}
                            </button>
                            <button
                                onClick={() => handleRejectInvite(invite)}
                                className="cta-button"
                                disabled={rejectingInvite === invite.id.toString()}
                            >
                                {rejectingInvite === invite.id.toString() ? 'Rejecting...' : 'Reject Invite'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}

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
