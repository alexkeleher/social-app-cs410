export interface User {
    id?: number | null;
    firstname: string;
    lastname: string;
    username?: string | null;
    email: string;
    password: string;
    phone?: string | null;
    address?: string | null;
    PreferredPriceRange?: number | null;
    PreferredMaxDistance?: number | null;
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
