import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from './Screenshot from 2024-10-07 14-11-21.png'; 

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
   
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 
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
        <img
          src={logo}
          alt="Group Eats Logo"
          style={{ width: "30%", height: "30%", marginBottom: '20px' }} // Centered Image
        />
        <Typography variant="h5" sx={{ fontFamily: "'Roboto', sans-serif", color: "#333", marginBottom: '20px' }}>
          Register for an account
        </Typography>
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                required
                fullWidth
                id="name"
                label="Name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ fontFamily: "'Roboto', sans-serif" }}
              />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
              backgroundColor: "#FF0000", 
              '&:hover': {
                backgroundColor: "#FF0000", 
              },
              color: "#fff",
              fontFamily: "'Roboto', sans-serif",
            }}
            onClick={handleRegister}
          >
            Register
          </Button>
          <Grid container justifyContent="center">
            <Grid item>
              <Link to="/login" style={{ color: "#FF0000", fontFamily: "'Roboto', sans-serif" }}>
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
