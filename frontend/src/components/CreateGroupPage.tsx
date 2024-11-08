import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, GroupAndCreator } from '@types';
import { createGroup } from '../api/apiService';
import AuthContext from '../context/AuthProvider';

const CreateGroupPage: React.FC = () => {
    const [groupName, setGroupName] = useState<string>('');
    const [groupType, setGroupType] = useState<string>('');
    const { auth } = useContext(AuthContext);
    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const dismissAlert = () => {
        setAlert(null);
    };

    const navigate = useNavigate(); // useNavigate hook for navigation

    const registerGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const groupData: GroupAndCreator = {
                groupname: groupName,
                creatoruserid: auth.id!, // The ! sign is telling Typescript we know for sure auth.id will not be Null here
            };
            createGroup(groupData);
            setGroupName(''); // Clear the group name from the input box when done
            setAlert({
                type: 'success',
                message: 'Group created successfully!',
            });
            console.log('Group created');
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to create group. Please try again.',
            });
            console.log(error);
        }
    };

    const alertStyle = {
        padding: '10px',
        marginTop: '15px',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff3cd', // Yellow background
        border: '1px solid #ffeeba', // Border with yellow tone
        color: '#856404', // Text color
    };

    const dismissButtonStyle = {
        background: 'none',
        border: 'none',
        fontSize: '16px',
        cursor: 'pointer',
    };

    return (
        <div className="form-container">
            {alert && (
                <div style={alertStyle} className={`alert ${alert.type}`}>
                    <span>{alert.message}</span>
                    <button
                        style={dismissButtonStyle}
                        onClick={dismissAlert}
                        className="dismiss-button"
                    >
                        ×
                    </button>
                </div>
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

                {/* <label htmlFor="groupType">Group Type</label>
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
                </select> */}

                <button className="create-button" type="submit">
                    Create Group
                </button>

                <button
                    onClick={() => navigate('/my-groups')} // Navigate to My Groups
                    className="create-button"
                    type="button"
                >
                    My Groups
                </button>

                <button
                    onClick={() => navigate('/')} // Navigate to Landing Page
                    className="create-button"
                    type="button"
                >
                    Landing Page
                </button>
            </form>
        </div>
    );
};

export default CreateGroupPage;
