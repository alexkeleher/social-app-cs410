import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateGroupPage: React.FC = () => {
    const [groupName, setGroupName] = React.useState('');
    const [groupType, setGroupType] = React.useState('');

    const navigate = useNavigate(); // useNavigate hook for navigation

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ groupName, groupType });
        // You can add form validation or submit logic here
    };

    return (
        <div className="form-container">
            <h2>Create Your Group</h2>
            <form onSubmit={handleSubmit}>
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
