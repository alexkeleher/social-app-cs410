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
