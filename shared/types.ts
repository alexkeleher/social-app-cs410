export interface User {
    id?: number | null;
    firstname: string;
    lastname: string;
    username?: string | null;
    email: string;
    password: string;
    phone?: string | null;
    address?: string | null;
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
    rating: number;
    distance: number; // in kilometers
    image_url: string;
    location: {
        address1: string;
        city: string;
    };
    business_hours?: BusinessHours[];
}

interface BusinessHours {
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
