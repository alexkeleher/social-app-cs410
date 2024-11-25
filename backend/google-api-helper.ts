import axios from 'axios';
import { Coordinates } from '@types';

export const getLatLonFromAddress = async (
    address: string
): Promise<Coordinates | null> => {
    try {
        const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                address
            )}&key=${MAPS_API_KEY}`
        );

        if (response.data.results[0]) {
            const { lat, lng } = response.data.results[0].geometry.location;
            return { lat, lng };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

export const calculateCenterPointFromMultipleLatLon = (
    coordinates: Coordinates[]
): Coordinates => {
    const total = coordinates.length;
    return coordinates.reduce(
        (acc, curr) => ({
            lat: acc.lat + curr.lat / total,
            lng: acc.lng + curr.lng / total,
        }),
        { lat: 0, lng: 0 }
    );
};
