import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';
import Logout from './Logout';
import './ProtectedRoute.css';
import { Bell } from 'lucide-react';
import api from '../api/axios';
import { UserNotification } from '@types';

const ProtectedRoute = () => {
    const { auth, loading } = useContext(AuthContext);
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [areAllNotificationsRead, setAreAllNotificationsRead] = useState(true);

    const toggleNotifications = () => {
        setAreAllNotificationsRead(true); // Now user has read all notifs so we can show bell with black color
        if (!areAllNotificationsRead) setAllReadInDB(auth.id!);
        setShowNotifications((prev) => !prev); // Show the dropdown window
    };

    // When the auth finishes loading, then get the user notifications
    useEffect(() => {
        if (!loading) getUserNotifications();
    }, [loading]);

    const getUserNotifications = async () => {
        try {
            const jsonResponse = await api.get(`/users/${auth.id}/notifications`);
            console.log('Response from /users/:id/notifications');
            console.log(jsonResponse);
            setNotifications(jsonResponse.data);
        } catch (error) {
            console.error(error);
        }
    };

    // If there are unread notifications, show the bell with red color
    useEffect(() => {
        for (const notification of notifications) {
            //console.log(notification);
            if (notification.isread === false) {
                setAreAllNotificationsRead(false);
                break;
            }
        }
    }, [notifications]);

    // Output Date Format (for notifications): 12/01/2024, 06:03 PM
    const formatDateTime = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // Ensures AM/PM format
        }).format(date);
    };

    // Mark the notifications as read in the database
    const setAllReadInDB = async (userId: number): Promise<void> => {
        try {
            const jsonResponse = await api.put(`/users/${userId}/notifications/mark-read`);
            console.log(jsonResponse);
        } catch (error) {
            console.error(error);
        }
    };

    // Show loading state or return null while checking authentication
    if (loading) {
        return <div>Loading...</div>; // Or any loading spinner
    }

    return auth?.token ? (
        <div className="app-container">
            <header className="app-header">
                <div className="left-side-content">
                    <Link to="/landingpage" className="home-button">
                        GroupEats
                    </Link>
                    <div className="user-info">User: {auth.email}</div>
                </div>
                <div className="header-nav">
                    <button onClick={toggleNotifications} className={`notification-button unread`}>
                        <Bell size={24} color={!areAllNotificationsRead ? 'red' : 'black'} />
                        {!areAllNotificationsRead && <span className="notification-dot"></span>}
                    </button>
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="dropdown-style">
                            {notifications.map((notification) => (
                                <p key={notification.id}>
                                    <b>{formatDateTime(notification.datecreated)} </b> - {notification.message}
                                </p>
                            ))}

                            {/* <p>
                                Your notifications go here! this is a little bit
                                longer of a notif
                            </p>
                            <p>
                                Example notification 1 this is a little bit
                                longer of a notif
                            </p>
                            <p>
                                Example notification 2 this is a little bit
                                longer of a notif
                            </p> */}
                        </div>
                    )}
                    <Logout />
                </div>
            </header>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    ) : (
        // If user is not authenticated, redirect to login page
        <Navigate to="/login" />
    );
};

export default ProtectedRoute;
