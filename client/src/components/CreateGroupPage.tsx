import React from 'react';
//import 'styles/main.css'; // Ensure the CSS is imported

// Define the props interface
interface CreateGroupPageProps {
    goToLandingPage: () => void; // Function prop for navigation
    goToMyGroups: () => void; // Function prop for navigation
}

const CreateGroupPage: React.FC<CreateGroupPageProps> = ({
    goToLandingPage,
    goToMyGroups,
}) => {
    const [groupName, setGroupName] = React.useState('');
    const [groupType, setGroupType] = React.useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ groupName, groupType });
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
                    <option value="schoold">School</option>
                </select>

                <button className="create-button" type="submit">
                    Create Group submit not working
                </button>

                <button
                    onClick={goToMyGroups} // Use goToMyGroups prop here
                    className="create-button"
                    type="button"
                >
                    Go to My Groups
                </button>

                <button
                    onClick={goToLandingPage} // Use goToLandingPage prop here
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
