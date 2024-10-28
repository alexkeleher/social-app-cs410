import {
    Box,
    Button,
    Container,
    CssBaseline,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
    const logo = process.env.PUBLIC_URL + '/logo.png';
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {};

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
                                name="password"
                                label="New Password"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                id="password-c"
                                label="Confirm Password"
                                name="confirm-password"
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
                        onClick={handleRegister}
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
