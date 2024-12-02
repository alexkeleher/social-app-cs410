import { Box, Button, Container, CssBaseline, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
//import axios from 'axios';
import AuthContext from '../context/AuthProvider';
import api from '../api/axios';

interface JWTPayload {
    id: number;
    email: string;
    exp: number;
    iat: number;
}

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { auth, setAuth, loading } = useContext(AuthContext);

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && auth?.token) {
            navigate('/landingpage');
        }
    }, [loading, auth, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const handleLogin = async () => {
        setError(null);

        try {
            const response = await api.post('/login', {
                email: email,
                password: password,
            });
            console.log('Response data:', response.data); // Log the response data

            const token = response.data.token;
            const decodedPayload = jwtDecode<JWTPayload>(token);

            // Store in localStorage
            localStorage.setItem('token', token);

            setAuth({
                token,
                id: decodedPayload.id,
                email: decodedPayload.email,
            });

            if (token) {
                console.log('Token:', token); // Log the token
                localStorage.setItem('token', token);
                // redirect to the dashboard
                navigate('/landingpage');
            } else {
                console.error('Login failed: Token not received.');
                setError('Login failed. Please try again');
            }
        } catch (error: any) {
            if (error.response) {
                setError(error.response.data.error);
            } else {
                setError('An error occured during login.');
            }
        }
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
                component="form"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    width: '100%',
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: "'Roboto', sans-serif",
                        color: '#333',
                        marginBottom: '20px',
                    }}
                >
                    Login to your account
                </Typography>
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
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
                        onClick={handleLogin}
                    >
                        Login
                    </Button>
                    <Grid container justifyContent="center">
                        <Grid>
                            <Link
                                to="/register"
                                style={{
                                    color: '#FF0000',
                                    fontFamily: "'Roboto', sans-serif",
                                }}
                            >
                                Don't have a Group Eats account? Register
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
