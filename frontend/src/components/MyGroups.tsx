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

    // need a variable for myGroups array
    const [myGroups, setMyGroups] = useState([]);
    useEffect(() => {
        getMyGroups();
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

    // on page loading, populate the page using axious http get

    // need a component for the group cards

    var groupID = 1;

    return (
        <>
            <h1>My Groups</h1>
            <div className="my-groups-container">
                <div className="group-list">
                    {myGroups.map((group: Group) => (
                        <Link key={group.id} to={`/selected-group/${group.id}`}>
                            <div className="group-card">
                                <h2>Group {group.name}</h2>
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

                {/* Flex container for the buttons */}
                <div className="button-container">
                    <button
                        onClick={() => navigate('/create-group')} // Navigate to Create Group
                        className="cta-button"
                        type="button"
                    >
                        Create a New Group
                    </button>

                    <button
                        onClick={() => navigate('/all-preferences')} // Navigate to Preferences
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

                <button
                    onClick={() => navigate('/landingpage')}
                    className="back-button"
                >
                    Back to Landing Page
                </button>
            </div>
        </>
    );
};

export default MyGroups;
