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
  import logo from './Screenshot from 2024-10-05 22-29-38.png'; // adjust the path accordingly
  
  const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    const handleRegister = async () => {
      // Implement registration functionality
    };


    
    return (
      <Container maxWidth="md"> {/* Adjusted width */}
        <CssBaseline />
        <Box
          sx={{
            position: "absolute", // Positions the logo at the top-right
            top: 0,
            left: 0,
            padding: 0,
            size:3
          }}
        >
          {/* <img
            src={logo}
            alt="Group Eats Logo"
            style={{ width: "2080", height: "2080" }} // Adjust size as needed
          /> */}
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}> {/* Left side (empty space if needed) */}
            {/* This space can be filled or left as empty */}
          </Grid>
          <Grid item xs={12} md={6}> {/* Right side for the form */}
            <Box
              sx={{
                mt: 1,
                top: 0,
                left: 0,
                padding: 0,
                
              }}
            >
            {  <img
            src={logo}
            alt="Group Eats Logo"
            style={{ right: 3 , width: "30%", height: "30%" }} // Adjust size as needed
          />
           }
              <Typography variant="h5">Register for an account</Typography>
              <Box sx={{ mt: 3 }}>
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
                    />
                  </Grid>
  
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Addresss"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="password-c"
                      label="Confirm Password"
                      name="confim-password"
                      type="password"
                    />
                  </Grid>
                </Grid>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={handleRegister}
                >
                  Register
                </Button>
                <Grid container justifyContent="flex-left">
                  <Grid item>
                    <Link to="/login">Already on Group-Eats? Login</Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  };
  
  export default Register;
  
