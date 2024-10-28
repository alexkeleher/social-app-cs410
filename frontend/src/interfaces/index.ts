export interface User {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    phone?: string | null;
    address: string;
}

export interface Group {
    name: string;
}
