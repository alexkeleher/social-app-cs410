import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    CssBaseline,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import api from '../api/axios';
import AuthContext from '../context/AuthProvider';

// interface ChildProps {
//     myPrettyField: string;
//     setMyPrettyField: (value: string) => void;
// }

// TODO 4: Create an input field here for the address. Something similar to the login input fields
function LocationPreferences() {
    const { auth } = useContext(AuthContext);
    const [address, setAddress] = useState<string>('');
    const getCurrentAddress = async () => {
        try {
            //const response = await api.get(`/users${auth.id}`);
            console.log('getting user from Backend');
            //setAddress(response.data.address);
        } catch (err) {
            console.error(err);
        }
    };
    const saveNewAddress = async () => {
        try {
            const response = await api.post(`/save-user-address`, {
                userid: auth.id,
                address: address,
            });
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        getCurrentAddress();
    }, []);

    return (
        <Container
            //maxWidth={false} // Disable default width restriction
            maxWidth="lg"
            sx={{
                height: '35vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '600px',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    width: '100%',
                }}
            >
                <h1>Select Your Location</h1>
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={2}>
                        <Grid size={19}>
                            <TextField
                                required
                                fullWidth
                                id="address"
                                label="Address"
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
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
                        onClick={saveNewAddress}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Container>

        // <div className="selection-page-container">
        //     <h1>Select Your Preferences</h1>

        //     {/* Price Selection */}
        //     <div className="selection-group">
        //         <h2>Price Level</h2>
        //         <input
        //             type="range"
        //             min="0"
        //             max="3"
        //             value={'priceLevel'}
        //             className="slider"
        //         />
        //         <p>Selected Price: {''}</p>
        //     </div>

        //     {/* Distance Selection */}
        //     <div className="selection-group">
        //         <h2>Distance (in miles)</h2>
        //         <input
        //             type="range"
        //             min="1"
        //             max="20"
        //             value={''}
        //             className="slider"
        //         />
        //         <p>Selected Distance: {'distance'} miles</p>
        //     </div>
        // </div>
    );
}

export default LocationPreferences;
