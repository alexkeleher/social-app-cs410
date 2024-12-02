import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthProvider';
import { Box, Button, Typography } from '@mui/material';

// Define the response type for better type safety
interface JoinGroupResponse {
    message: string;
    groupId?: number;
}

const JoinGroup: React.FC = () => {
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!joinCode) {
            setError('Please enter a join code');
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post<JoinGroupResponse>(
                '/groups/join',
                { joinCode: joinCode, userId: auth.id },
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            console.log('Join response:', response.data);
            navigate('/my-groups');
        } catch (err: any) {
            console.error('Join error:', err);
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError(err.response?.data?.error || 'Failed to join group');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            className="form-container"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 3,
            }}
        >
            <h1>Join a Group</h1>
            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
                <Box sx={{ mb: 2 }}>
                    <input
                        type="text"
                        id="joinCode"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '8px',
                            fontSize: '16px',
                        }}
                        disabled={isLoading}
                    />
                </Box>
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    className="create-button"
                    disabled={isLoading}
                    fullWidth
                    sx={{
                        backgroundColor: '#FF0000',
                        '&:hover': {
                            backgroundColor: '#CC0000',
                        },
                    }}
                >
                    {isLoading ? 'Joining...' : 'Join Group'}
                    {/* Add delete invite logic here if needed */}
                </Button>
                <Button
                    onClick={() => navigate('/my-groups')}
                    variant="outlined"
                    fullWidth
                    sx={{
                        mt: 2,
                        color: '#FF0000',
                        borderColor: '#FF0000',
                        '&:hover': {
                            borderColor: '#CC0000',
                            color: '#CC0000',
                        },
                    }}
                >
                    Back to My Groups
                </Button>
            </form>
        </Box>
    );
};

export default JoinGroup;
