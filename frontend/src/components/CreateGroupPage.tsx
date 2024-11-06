import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '@types';
import { getGroups, createGroup } from '../api/apiService';

const CreateGroupPage: React.FC = () => {
    const [groupName, setGroupName] = useState<string>('');
    const [groupType, setGroupType] = useState<string>('');
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            console.log('fetchGroups() called');
            const usersData = await getGroups();
            console.log('Fetched groups: ', usersData);
            setGroups(usersData);
        };

        fetchGroups();
    }, []);

    const navigate = useNavigate(); // useNavigate hook for navigation

    const registerGroup = async () => {
        const groupData: Group = {
            name: groupName,
        };

        createGroup(groupData);
        console.log('Group created');
    };

    return (
        <div className="form-container">
            <h1>Groups List</h1>
            {groups.length > 0 ? (
                <ul>
                    {groups.map((group, index) => (
                        <li key={index}>{group.name}</li>
                    ))}
                </ul>
            ) : (
                <p>No users found</p>
            )}

            <h2>Create Your Group</h2>
            <form onSubmit={registerGroup}>
                <label htmlFor="groupName">Group Name</label>
                <input
                    type="text"
                    id="groupName"
                    value={groupName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setGroupName(e.target.value)
                    }
                    placeholder="Enter your group name"
                />

                <label htmlFor="groupType">Group Type</label>
                <select
                    id="groupType"
                    value={groupType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setGroupType(e.target.value)
                    }
                >
                    <option value="">Select group type</option>
                    <option value="family">Family</option>
                    <option value="friends">Friends</option>
                    <option value="work">Work</option>
                    <option value="school">School</option>
                </select>

                <button className="create-button" type="submit">
                    Create Group
                </button>

                <button
                    onClick={() => navigate('/my-groups')} // Navigate to My Groups
                    className="create-button"
                    type="button"
                >
                    Go to My Groups
                </button>

                <button
                    onClick={() => navigate('/')} // Navigate to Landing Page
                    className="back-button"
                    type="button"
                >
                    Go to Landing Page
                </button>
            </form>
        </div>
    );
};

export default CreateGroupPage;
