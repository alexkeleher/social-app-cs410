import { start } from 'repl';
import yelp from './yelp-axios';

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
// TODO: Read the group members from the database to read their schedules, addresses, and price levels
// TODO: Add more search queries to the yelp query to filter on price level schedule
// TODO: Don't hard code location in the yelp api query. instead of use the address of any of the group members (in the future we'll improve even more (e.g. to use central location))
export const generateEvent = async (): Promise<SocialEvent> => {
    console.log(
        'We are in the event-generator module.\n' +
            "We are attempting to call yelp's api now"
    ); // Debugging

    const restaurants: YelpRestaurant[] = await fetchRestaurants();

    console.log('we have fetched the restaurants and they are the following:');
    console.log(restaurants);

    const aRestaurant: YelpRestaurant = restaurants[0];
    var startTime: Date = new Date('2024-11-20T10:30:00');

    const socialEvent: SocialEvent = {
        restaurant: aRestaurant,
        startTime: startTime,
    };

    return socialEvent;
};

// helpers
const fetchRestaurants = async () // params go here
: Promise<YelpRestaurant[]> => {
    try {
        const response = await yelp.get('', {
            params: {
                location: '7914 Underhill Road Rosedale MD 21237',
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
