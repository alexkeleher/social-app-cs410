export interface User {
    id?: number | null;
    firstname: string;
    lastname: string;
    username?: string | null;
    email: string;
    password: string;
    phone?: string | null;
    address?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    preferredpricerange?: number | null;
    preferredmaxdistance?: number | null;
    cuisine_preferences?: string | null;
    serializedschedulematrix?: string | null;
}

// e.g. Monday 6:00 AM
export interface DayOfWeekAndTime {
    day: string;
    time: string;
}

export interface Group {
    name: string;
}

// GroupAndCreator ***************************************************
// Object to use when creating a group because we need to also pass the
// creating user to add him to the group as the first member
export interface GroupAndCreator {
    groupname: string;
    creatoruserid: number;
}

export interface YelpRestaurant {
    id: string;
    name: string;
    alias: string;
    rating: number;
    review_count: number;
    distance: number; // in kilometers
    image_url: string;
    url: string;
    categories: {
        alias: string;
        title: string;
    }[];
    coordinates: {
        latitude: number;
        longitude: number;
    };
    price?: string;
    location: {
        address1: string;
        city: string;
        zip_code: string;
        country: string;
        state: string;
        display_address: string;
    };
    phone: string;
    business_hours?: BusinessHours[]; // The search endpoint returns business_hours
    hours?: BusinessHours[]; // The details endpoint returns hours
}

export interface BusinessHours {
    open: {
        is_overnight: boolean;
        start: string; // format: "1200"
        end: string; // format: "0200"
        day: number; // 0-6, starting with Monday
    }[];
    hours_type: string;
    is_open_now: boolean;
}

export interface SocialEvent {
    restaurant: YelpRestaurant;
    startTime: DayOfWeekAndTime;
}

export interface Coordinates {
    lat: number;
    lng: number;
}
