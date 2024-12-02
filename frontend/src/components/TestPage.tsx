import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;

// display restaurant data in a grid
// have a form that inserts into restaurant
// have a button to edit a restaurant from the grid

// Define the structure of a restaurant object
interface Restaurant {
    id: number;
    name: string;
    address: string;
    pricelevel: number;
}

function TestPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [restaurantName, setRestaurantName] = useState<string>();
    const [restaurantAddress, setRestaurantAddress] = useState<string>();
    const [restaurantPriceLevel, setRestaurantPriceLevel] = useState<string>();
    const onSubmitForm = async (e: { preventDefault: () => void }) => {
        try {
            const body = {
                Name: restaurantName,
                Address: restaurantAddress,
                PriceLevel: restaurantPriceLevel,
            };
            const response = await fetch(`${API_URL}/restaurant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            console.log(response);
            window.location.href = '/test-page'; // refresh to show the changes
        } catch (err) {
            console.log(err);
        }
    };

    const getRestaurants = async () => {
        try {
            const response = await fetch(`${API_URL}/restaurant`);
            const jsonData = await response.json();
            console.log('getting restaurants from Backend');
            setRestaurants(jsonData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getRestaurants();
    }, []);

    return (
        <>
            <h1>Test Page To Practice/Reference Front-End Back-End communication</h1>
            <h2>Viewing Restaurants</h2>
            <table className="table mt-5 text-center">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>PriceLevel</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {restaurants.map((restaurant) => (
                        <tr key={restaurant.id}>
                            <td>{restaurant.name}</td>
                            <td>{restaurant.address}</td>
                            <td>{restaurant.pricelevel}</td>
                            <td>Edit</td>
                            <td>Delete</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr />
            <h2>Adding Restaurants</h2>
            <form className="d-flex mt-5" onSubmit={onSubmitForm}>
                <label>Add New Restaurant</label>
                <input
                    type="text"
                    placeholder="Restaurant Name"
                    className="form-control"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Address"
                    className="form-control"
                    value={restaurantAddress}
                    onChange={(e) => setRestaurantAddress(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Price Level"
                    className="form-control"
                    value={restaurantPriceLevel}
                    onChange={(e) => setRestaurantPriceLevel(e.target.value)}
                />
                <button className="btn btn-success">Add</button>
            </form>
        </>
    );
}

export default TestPage;
