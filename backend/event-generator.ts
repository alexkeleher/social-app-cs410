import { start } from 'repl';
import { QueryResult } from 'pg';
import pool from './db';
import yelp from './yelp-axios';
import { User } from '@types';

interface YelpRestaurant {
    id: string;
    name: string;
    rating: number;
    distance: number; // in kilometers
    image_url: string;
    location: {
        address1: string;
        city: string;
    };
    hours?: {
        open: { start: string; end: string; day: number }[];
        is_open: boolean;
    }[];
}

interface SocialEvent {
    restaurant: YelpRestaurant;
    startTime: Date;
}

export type { YelpRestaurant, SocialEvent };

// TODO: Find optimal start time based on group users schedule and chosen restaurant's schedule

// TODO: Add more search queries to the yelp query to filter on price level schedule

export const generateEvent = async (groupid: number): Promise<SocialEvent> => {
    console.log('We are in the event-generator module.\n');

    var members: User[] = [];
    var averagePrice: Number = 0;
    var maxDistance = 0;

    //  1. Get all the group members from the database
    try {
        // First get all users and their preferences
        const allData: QueryResult = await pool.query(
            `SELECT 
                g.name as groupname,
                g.joincode,
                u.id,
                u.firstname,
                u.lastname,
                u.username,
                u.email,
                u.address,  /* Add this line */
                u.preferredpricerange,
                u.preferredmaxdistance,
                u.serializedschedulematrix,
            ARRAY_AGG(DISTINCT cp.CuisineType) FILTER (WHERE cp.CuisineType IS NOT NULL) as cuisine_preferences
            FROM Users u
                JOIN UserGroupXRef x ON u.ID = x.UserID
                JOIN Groups g ON g.ID = x.GroupID
                LEFT JOIN UserCuisinePreferences cp ON cp.UserID = u.ID
            WHERE g.ID = $1
            GROUP BY g.name, g.joincode, u.id, u.firstname, u.lastname, u.username, u.email, u.address, u.serializedschedulematrix, u.preferredpricerange, u.preferredmaxdistance`,
            [groupid]
        );
        members = allData.rows;
        // 2. Get the average price prefference
        averagePrice = calculateAndRoundAverage(
            allData.rows.map((u) => u.preferredpricerange || 0)
        );
        maxDistance = Math.max(
            ...allData.rows.map((u) => u.preferredmaxdistance || 0)
        );
    } catch (e) {
        console.error('Error in generateEvent', e);
    }

    // 3 Get top 3 restaurants
    const restaurants: YelpRestaurant[] = await fetchRestaurants(
        members[0].address ?? '' // Use an empty string if address is null or undefined
    );

    console.log('we have fetched the restaurants and they are the following:');
    console.log(restaurants);

    const aRestaurant: YelpRestaurant = restaurants[0];

    // 4 Get optimal start time
    var startTime: Date = new Date('2024-11-20T10:30:00');

    const socialEvent: SocialEvent = {
        restaurant: aRestaurant,
        startTime: startTime,
    };

    return socialEvent;
};

// helpers
const fetchRestaurants = async (
    location: string // params go here
): Promise<YelpRestaurant[]> => {
    try {
        const response = await yelp.get('', {
            params: {
                location: location,
                radius: 15000,
                categories: 'indpak',
                sort_by: 'best_match',
                limit: 3,
            },
        });
        //console.log('Received restaurants data:', response.data.businesses); // Debugging
        return response.data.businesses; // Return array of restaurants (The json gets mapped to YelpRestaurant objects automatically because of the return type)
    } catch (error) {
        console.error('There was an error fetching data from Yelp API', error);
        return [];
    }
};

function calculateAndRoundAverage(numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error('Array cannot be empty');
    }

    const total = numbers.reduce((sum, num) => sum + num, 0);
    const average = total / numbers.length;

    return Math.round(average); // Rounds to the nearest integer
}
