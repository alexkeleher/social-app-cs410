import 'express-session';

interface SessionUser {
    id: number;
    email: string;
}

declare module 'express-session' {
    interface SessionData {
        user?: SessionUser;
    }
}
