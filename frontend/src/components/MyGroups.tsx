import React, { useState } from 'react';
import axios from 'axios';

const MyGroups: React.FC = () => {
    const [email, setEmail] = useState('');
    interface Group {
        id: string;
        name: string;
    }

    const [groups, setGroups] = useState<Group[]>([]);
    const [newGroupId, setNewGroupId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFetchGroups = async () => {
        try {
            setError(null);
            const response = await axios.get(
                `http://localhost:5000/users/${email}/groups`
            );
            setGroups(response.data);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError('Unable to fetch groups for this email');
            setGroups([]);
        }
    };

    const handleAddGroup = async () => {
        try {
            // Fetch user ID by email first
            const userResponse = await axios.get(
                `http://localhost:5000/users?email=${email}`
            );
            const userId = userResponse.data.id;

            // Add the group to the user
            await axios.post(
                `http://localhost:5000/users/${userId}/groups/${newGroupId}`
            );

            // Refresh group list
            handleFetchGroups();
        } catch (err) {
            console.error('Error adding group to user:', err);
            setError('Unable to add group to this user');
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1>Find and Add Groups to User by Email</h1>
            <input
                type="email"
                placeholder="Enter user's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '10px', width: '300px' }}
            />
            <button
                onClick={handleFetchGroups}
                style={{ padding: '10px 20px', marginLeft: '10px' }}
            >
                Find Groups
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ marginTop: '20px' }}>
                <h2>Groups:</h2>
                {groups.length > 0 ? (
                    <ul>
                        {groups.map((group) => (
                            <li key={group.id}>{group.name}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No groups found for this user</p>
                )}
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>Add a Group to User</h2>
                <input
                    type="text"
                    placeholder="Enter group ID"
                    value={newGroupId}
                    onChange={(e) => setNewGroupId(e.target.value)}
                    style={{ padding: '10px', width: '200px' }}
                />
                <button
                    onClick={handleAddGroup}
                    style={{ padding: '10px 20px', marginLeft: '10px' }}
                >
                    Add Group
                </button>
            </div>
        </div>
    );
};

export default MyGroups;
