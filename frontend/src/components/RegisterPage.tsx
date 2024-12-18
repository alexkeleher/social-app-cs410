import { Box, Button, Container, CssBaseline, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUser } from '../api/apiService';
import { User } from '@types';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const registerUser = async () => {
        const userData: User = {
            firstname: firstName,
            lastname: lastName,
            email: email,
            password: password,
        };

        if (password === confirmPassword) {
            createUser(userData);
            navigate('/');
        } else {
            console.log('Passwords do not match');
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
                    Register for an account
                </Typography>
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <TextField
                                name="firstName"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                autoFocus
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                name="lastName"
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                autoFocus
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                            />
                        </Grid>
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
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                label="Confirm Password"
                                name="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                type="password"
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                            />
                        </Grid>
                    </Grid>
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
                        onClick={registerUser}
                    >
                        Register
                    </Button>
                    <Grid container justifyContent="center">
                        <Grid>
                            <Link
                                to="/login"
                                style={{
                                    color: '#FF0000',
                                    fontFamily: "'Roboto', sans-serif",
                                }}
                            >
                                Already on Group-Eats? Login
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default Register;
