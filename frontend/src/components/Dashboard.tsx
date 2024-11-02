import {
    Box,
    Button,
    Container,
    CssBaseline,
    Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async () => { 
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const response = await fetch('/verify-token', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (response.ok) {
                setIsLoggedIn(true); 
              } else {
                localStorage.removeItem('token');
                setIsLoggedIn(false); 
              }
            } else {
              setIsLoggedIn(false); 
            }
          } catch (error) {
            console.error('Error checking authentication:', error);
            setIsLoggedIn(false); 
          }
        };
    
        checkAuthentication(); 
      }, []); 
    
      const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token on logout
        setIsLoggedIn(false); // Update the state
        navigate('/login');
      };

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
            {isLoggedIn ? (
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
            </Typography>
            <Button
                fullWidth
                variant="contained"
                sx={{
                    mt: 3,
                    mb: 2,
                    backgroundColor: '#FF0000',
                    '&:hover': {
                        backgroundColor: '#FF0000',
                    },
                    color: '#fff',
                    fontFamily: "'Roboto', sans-serif",
                }}
                onClick={handleLogout}
        >
            Logout
            </Button>
            </div>
            ) : (
                <Typography
                variant="h5"
                sx={{
                    fontFamily: "'Roboto', sans-serif",
                    color: '#333',
                    marginBottom: '20px',
                }}
        >
            You need to log in to view this page.
            </Typography>
            )}
        </Box>
    </Container>
    );
};

export default Dashboard;
