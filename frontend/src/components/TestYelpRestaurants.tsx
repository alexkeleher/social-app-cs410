import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  distance: number; // in kilometers
  image_url: string;
  location: {
    address1: string;
    city: string;
  };
}

const YelpRestaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>('best_match');
  const [dietOption, setDietOption] = useState<string | null>('vegan'); 

  const API_KEY = process.env.REACT_APP_YELP_API_KEY;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (error) => {
        console.error("Error fetching location", error);
      }
    );
  }, []);

  useEffect(() => {
    if (latitude && longitude && API_KEY) {
      fetchRestaurants(latitude, longitude);
    }
  }, [latitude, longitude, API_KEY, sortOption, dietOption]);

  const fetchRestaurants = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        'https://api.yelp.com/v3/businesses/search',
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
          params: {
            latitude: lat,
            longitude: lon,
            categories: 'restaurants',
            sort_by: sortOption,
            attributes: dietOption || undefined, 
            limit: 5,
          },
        }
      );
      setRestaurants(response.data.businesses);
    } catch (error) {
      console.error("There was an error fetching data from Yelp API", error);
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
  };

  const handleDietChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDietOption(event.target.value);
  };

  return (
    <div>
      <h2>Here are the best restaurants nearby</h2>

      <label htmlFor="sort">Sort by: </label>
      <select id="sort" value={sortOption} onChange={handleSortChange}>
        <option value="best_match">Best Match</option>
        <option value="rating">Rating</option>
        <option value="distance">Distance</option>
      </select>

      <label htmlFor="diet">  Dietary Options: </label>
      <select id="diet" value={dietOption || ''} onChange={handleDietChange}>
        <option value="">All</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="vegan">Vegan</option>
        <option value="gluten_free">Gluten Free</option>
       
      </select>

      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id} style={{ marginBottom: '20px' }}>
            <h3>{restaurant.name}</h3>
            <img
              src={restaurant.image_url}
              alt={`${restaurant.name} thumbnail`}
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <p>Rating: {restaurant.rating}</p>
            <p>Distance: {(restaurant.distance / 1000).toFixed(2)} km</p>
            <p>
              Address: {restaurant.location.address1}, {restaurant.location.city}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default YelpRestaurants;
