import { Box, Button, Container, CssBaseline, Typography } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';
import Logout from './Logout';

const Dashboard: React.FC = () => {
    const { auth } = useContext(AuthContext);

    return (
        <Container
            maxWidth="md"
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',

                    textAlign: 'center',
                    width: '100%',
                }}
            >
                {
                    <div>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'Roboto', sans-serif",
                                color: '#333',
                                marginBottom: '20px',
                            }}
                        >
                            Welcome to your Dashboard!
                            <br />
                            Your email is {auth.email}
                            <br />
                            Your id is {auth.id}
                        </Typography>
                        <Logout></Logout>
                    </div>
                }
            </Box>
        </Container>
    );
};

export default Dashboard;
