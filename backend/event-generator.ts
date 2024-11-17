import { start } from 'repl';
import { QueryResult } from 'pg';
import pool from './db';
import yelp from './yelp-axios';
import { User, SocialEvent, YelpRestaurant, DayOfWeekAndTime } from '@types';
const DEBUGGING_MODE = process.env.DEBUGGING_MODE === 'YES';
const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];
const timeSlots = [
    '5:00-6:00 AM',
    '6:00-7:00 AM',
    '7:00-8:00 AM',
    '8:00-9:00 AM',
    '9:00-10:00 AM',
    '10:00-11:00 AM',
    '11:00-12:00 AM',
    '12:00-1:00 PM',
    '1:00-2:00 PM',
    '2:00-3:00 PM',
    '3:00-4:00 PM',
    '4:00-5:00 PM',
    '5:00-6:00 PM',
    '6:00-7:00 PM',
    '7:00-8:00 PM',
    '8:00-9:00 PM',
    '9:00-10:00 PM',
    '10:00-11:00 PM',
    '11:00-12:00 PM',
];
const timeStarts = [
    '5:00 AM',
    '6:00 AM',
    '7:00 AM',
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
    '9:00 PM',
    '10:00 PM',
    '11:00 PM',
];

// TODO: Find optimal start time based on group users schedule and chosen restaurant's schedule
// TODO: Add more search queries to the yelp query to filter on price level schedule
// TODO: Use max distance preference in the algorithm

export const generateEvent = async (groupid: number): Promise<SocialEvent> => {
    if (DEBUGGING_MODE) console.log('We are in the event-generator module.\n');
    // Variable declarations
    {
        var members: User[] = [];
        var averagePrice: Number = 0;
        var preferenceArr: string[] = [];
        var mostCommonCategory: string = '';
        var maxDistance = 0;
    }
    try {
        const membersQueryResult: QueryResult = await pool.query(
            `SELECT 
                u.id,
                u.firstname,
                u.lastname,
                u.username,
                u.email,
                u.address,  /* Add this line */
                u.preferredpricerange,
                u.preferredmaxdistance,
                u.serializedschedulematrix  
            FROM Users u
                JOIN UserGroupXRef x ON u.ID = x.UserID                
            WHERE x.GroupID = $1`,
            [groupid]
        );
        //  1. Get all the group members from the database
        // - - - - - - - - - - - - - - - - - - - - - - - - -
        members = membersQueryResult.rows;
        if (DEBUGGING_MODE)
            console.log('Fetched the following group members:.\n');
        if (DEBUGGING_MODE) console.log(members);

        // 2. Get all the preferences for this group from the database
        // - - - - - - - - - - - - - - - - - - - - - - - - -
        const allPreferences: QueryResult = await pool.query(
            `SELECT
                CuisineType
            FROM
                UserCuisinePreferences
            WHERE
                UserID IN (SELECT UserID FROM UserGroupXRef WHERE GroupID = $1)`,
            [groupid]
        );
        preferenceArr = allPreferences.rows.map((itme) => itme.cuisinetype);
        if (DEBUGGING_MODE) console.log('PREFERENCE ARR XXXXXXXXXXX');
        if (DEBUGGING_MODE) console.log(preferenceArr);
        mostCommonCategory = getMostFrequentString(preferenceArr) || '';
        if (DEBUGGING_MODE)
            console.log('Most common category: ' + mostCommonCategory + '\n');

        // 3. Get the average price preference and max distance
        // - - - - - - - - - - - - - - - - - - - - - - - - -
        averagePrice = calculateAndRoundAverage(
            membersQueryResult.rows.map((u) => u.preferredpricerange || 0)
        );
        if (DEBUGGING_MODE)
            console.log('Average Price Level: ' + averagePrice + '\n');
    } catch (e) {
        console.error('Error in generateEvent', e);
    }

    // 4 Get top 3 restaurants
    // - - - - - - - - - - - - - - - - - - - - - - - - -
    const restaurants: YelpRestaurant[] = await fetchRestaurants(
        members[0].address ?? '' // Use an empty string if address is null or undefined
    );
    if (DEBUGGING_MODE)
        console.log('Most common category: ' + mostCommonCategory + '\n');

    if (DEBUGGING_MODE) {
        console.log(
            'we have fetched the restaurants and they are the following:'
        );
        console.log(restaurants);
    }

    // 5 Get the top 1 restaurant out of the list of top 3
    // - - - - - - - - - - - - - - - - - - - - - - - - -
    const aRestaurant: YelpRestaurant = restaurants[0];

    // 6 Get optimal start time
    // - - - - - - - - - - - - - - - - - - - - - - - - -
    var startTime: DayOfWeekAndTime = getOptimalStartTimeForGroupAndRestaurant(
        members,
        aRestaurant
    );
    if (DEBUGGING_MODE) console.log('Start Time:');
    if (DEBUGGING_MODE) console.log(startTime);

    // 7 Build the social event object
    // - - - - - - - - - - - - - - - - - - - - - - - - -
    const socialEvent: SocialEvent = {
        restaurant: aRestaurant,
        startTime: startTime,
    };
    if (DEBUGGING_MODE) console.log('Returning Social Event:');
    if (DEBUGGING_MODE) console.log(socialEvent);

    // 8 Return the social event object
    // - - - - - - - - - - - - - - - - - - - - - - - - -
    return socialEvent;
};

/* ****************************************************************************** */
/* Helpers */
/* ****************************************************************************** */
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

function getMostFrequentString(arr: string[]): string | null {
    const countMap: { [key: string]: number } = {};

    // Count the occurrences of each string in the array
    arr.forEach((str) => {
        countMap[str] = (countMap[str] || 0) + 1;
    });

    // Find the string with the highest count
    let mostFrequentString = null;
    let maxCount = 0;

    for (const str in countMap) {
        if (countMap[str] > maxCount) {
            mostFrequentString = str;
            maxCount = countMap[str];
        }
    }

    return mostFrequentString;
}

// Check for a free 2 hour block of all users. Return day of week and start time.
function getOptimalStartTimeForGroupAndRestaurant(
    // Pass in members
    // Pass in Yelp Restaurant
    members: User[],
    restaurant: YelpRestaurant
): DayOfWeekAndTime {
    // Build a matrix of schedules
    //const sharedUserSchedules2 = Array(7).fill(Array(19).fill(0));
    // Correct way to initialize a 7x19 matrix with zeros
    const sharedUserSchedules = Array.from({ length: 7 }, () =>
        Array(19).fill(0)
    );

    // DEBUGGING
    // console.log('before frequencies added');
    // for (const member of members) {
    //     const userSerializedSchedule = member.serializedschedulematrix || '';
    //     for (let i = 0; i < 7; i++) {
    //         if (DEBUGGING_MODE) console.log('i: ' + i);
    //         for (let j = 0; j < 19; j++) {
    //             if (DEBUGGING_MODE) console.log(sharedUserSchedules[i][j]);
    //         }
    //         if (DEBUGGING_MODE) console.log('next day\n');
    //     }
    // }

    // do a frequency map by looping through all the users schedules
    for (const member of members) {
        const userSerializedSchedule = member.serializedschedulematrix || '';
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 19; j++) {
                if (userSerializedSchedule[19 * i + j] == '1')
                    sharedUserSchedules[i][j]++; // increment frequency map value count at each cell
            }
        }
    }

    // DEBUGGING
    // console.log('after  frequencies added');
    // for (const member of members) {
    //     const userSerializedSchedule = member.serializedschedulematrix || '';
    //     for (let i = 0; i < 7; i++) {
    //         if (DEBUGGING_MODE) console.log('i: ' + i);
    //         for (let j = 0; j < 19; j++) {
    //             if (DEBUGGING_MODE) console.log(sharedUserSchedules[i][j]);
    //         }
    //         if (DEBUGGING_MODE) console.log('next day\n');
    //     }
    // }

    // What's the max value of frequency at any cell?
    const maxPossible = members.length;
    if (DEBUGGING_MODE) console.log('maxPossible: ' + maxPossible + '\n');

    // Find a block of free 2 hours where the frequency = max
    let starti = -1;
    let startj = -1;
    let spanBlocks = 0; // Goal is for this to reach 4 blocks (2 hours)
    outerLoop: for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 19; j++) {
            if (sharedUserSchedules[i][j] == maxPossible) {
                if (starti == -1) {
                    starti = i;
                    startj = j;
                }
                spanBlocks++;
                if (spanBlocks == 4) break outerLoop; // This break both loops. We found our 4 blocks, we end here.
            } else {
                starti = -1;
                startj = -1;
                spanBlocks = 0;
            }
        }
    }

    // If not found throw error about no shared availability
    if (spanBlocks == 0) throw new Error('Could not find a 2 hour block');

    // Convert restaurant times to matrix form
    // Verify chosen 2 hour block is within range of restaurant hours
    //      If not throw error about restaurant hours not matching found block

    // convert the starti and startj to a [day of week]+[time]
    // DayOfWeekAndTime
    const dayOfWeek: string = daysOfWeek[starti];
    const timeStart: string = timeStarts[startj];

    // Return a day of week, and a start time
    return {
        day: dayOfWeek,
        time: timeStart,
    };
}
