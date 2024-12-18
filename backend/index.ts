import express from 'express';
import cors from 'cors';
import pool from './db';
import { QueryResult } from 'pg';
import { Application, Request, Response } from 'express';
import { User, GroupAndCreator, YelpRestaurant, SocialEvent, DayOfWeekAndTime, Coordinates } from '@types';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import yelp from './yelp-axios';
import { generateEvent } from './event-generator';
import { getLatLonFromAddress } from './google-api-helper';
import { dummyRestaurants } from './dummyData';
//import { YelpResponse } from '@types';

const app: Application = express();
const PORT = process.env.PORT || 5000;
const FRONT_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';
const DEBUGGING_MODE = process.env.DEBUGGING_MODE === 'YES';

interface Parameters {
    id: string;
}

interface UpdateBody {
    FirstName?: string;
    LastName?: string;
    UserName?: string;
    Email?: string;
    Password?: string;
    Phone?: string;
    Address?: string;
    PreferredPriceRange?: number; // price range
    PreferredMaxDistance?: number; // max distance
    SerializedScheduleMatrix?: string; // user available hours schedule serialized as a single string
}

interface Restaurant {
    Name?: string;
    Address?: string;
    PriceLevel?: string;
}

// Middleware
app.use(
    cors({
        origin: FRONT_URL, // Fix CORS error when deploying to Live server
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    })
);
app.use(express.json());

// Generate a strong secret for the session middleware
const secret = crypto.randomBytes(32).toString('hex');

const pgSession = connectPgSimple(session);

// app.use(
//     session({
//         store: new pgSession({
//             pool: pool,
//             tableName: 'user_sessions',
//         }),
//         secret: secret, // Use the generated secret
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             maxAge: 30 * 24 * 60 * 60 * 1000,
//         },
//     })
// );

// // function to protect routes that require authentication
// // Update requireAuth middleware to handle token refresh
// const requireAuth = async (
//     req: Request,
//     res: Response,
//     next: express.NextFunction
// ): Promise<void> => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         res.status(401).json({ error: 'No token provided' });
//         return;
//     }

//     try {
//         const token = authHeader.split(' ')[1];
//         const decoded = jwt.verify(token, 'your-secret-key') as {
//             id: number;
//             email: string;
//         };
//         req.session.user = decoded;
//         next();
//     } catch (error) {
//         if (error.name === 'TokenExpiredError') {
//             // Try to refresh token
//             try {
//                 const decoded = jwt.verify(token, 'your-secret-key', {
//                     ignoreExpiration: true,
//                 }) as { id: number; email: string };
//                 const newToken = jwt.sign(
//                     { id: decoded.id, email: decoded.email },
//                     'your-secret-key',
//                     { expiresIn: '24h' }
//                 );

//                 // Send new token in response headers
//                 res.setHeader('New-Token', newToken);
//                 req.session.user = decoded;
//                 next();
//             } catch (refreshError) {
//                 console.error('Token refresh failed:', refreshError);
//                 res.status(401).json({
//                     error: 'Token expired and refresh failed',
//                 });
//             }
//         } else {
//             console.error('Auth error:', error);
//             res.status(401).json({ error: 'Invalid token' });
//         }
//     }
// };

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('This is Express working');
});

// /* LOGIN */
app.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Request body:', req.body);
        const { email, password }: User = req.body;

        // Query database to find the user
        const userResult: QueryResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log('User result:', userResult.rows);

        if (userResult.rows.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const user = userResult.rows[0];

        // Compare the provided password with the stored password
        const match = await bcrypt.compare(password, user.password);
        console.log('Password match:', match);

        if (!match) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            'your-secret-key',
            { expiresIn: '24h' } // 24 hours
        );

        console.log('Generated token:', token); // Log the generated token

        // Remove the session-related line
        //req.session.user = { id: user.id, email: user.email };
        //console.log('Session:', req.session);

        res.json({ message: 'Login successful', token }); // Send the token in the response
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

// Add refresh token endpoint
app.post('/refresh-token', async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return; // Explicitly return after sending a response
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key', {
            ignoreExpiration: true,
        }) as { id: number; email: string };

        // Generate new token
        const newToken = jwt.sign({ id: decoded.id, email: decoded.email }, 'your-secret-key', { expiresIn: '24h' });

        res.json({ token: newToken });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// /* LOGOUT */
app.post('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ error: 'Logout failed' });
        } else {
            res.json({
                message: 'Logout successful',
            });
        }
    });
});

/*-- CRUD Operations --*/

/* USERS */
app.get('/users', async (req: Request, res: Response) => {
    console.log('Processing request for route GET /users');
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM users');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/*    GET /users:id    */
/* ************************************************************************** 
Input: The id of a single user. To be passed in as URL part of the route
Operation: Retrieve user with specified ID from the database
Output: Json object with user information
*/
app.get('/users:id', async (req: Request, res: Response) => {
    console.log('Processing request for route GET /users:id');
    const { id } = req.params;
    try {
        const allData: QueryResult = await pool.query(
            `SELECT * FROM users
             WHERE ID = $1`,
            [id]
        );
        res.json(allData.rows[0]);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/* Get users by GroupID */
/*
Input: ID of a group. Passed as a URL parameter
Output: List of users that belong to that group
*/
app.get('/users/by-groupid/:id', async (req: Request, res: Response) => {
    console.log('starting to process request in route /users-by-groupid:id');
    const { id } = req.params;
    console.log('id: ' + id);
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
    x.isadmin as "isAdmin",
    ARRAY_AGG(DISTINCT cp.CuisineType) FILTER (WHERE cp.CuisineType IS NOT NULL) as cuisine_preferences
FROM Users u
JOIN UserGroupXRef x ON u.ID = x.UserID
JOIN Groups g ON g.ID = x.GroupID
LEFT JOIN UserCuisinePreferences cp ON cp.UserID = u.ID
WHERE g.ID = $1
GROUP BY g.name, g.joincode, u.id, u.firstname, u.lastname, u.username, u.email, u.address, u.serializedschedulematrix, u.preferredpricerange, u.preferredmaxdistance,x.isAdmin`,
            [id]
        );

        // Calculate group preferences
        const groupPreferences = {
            groupname: allData.rows[0]?.groupname || '',
            joincode: allData.rows[0]?.joincode || '',
            members: allData.rows,
            maxPrice: Math.max(...allData.rows.map((u) => u.preferredpricerange || 0)),
            maxDistance: Math.max(...allData.rows.map((u) => u.preferredmaxdistance || 0)),
        };

        res.json(allData.rows);
    } catch (e) {
        console.error('Error in /users/by-groupid/:id:', e);
        res.status(500).json({ error: (e as Error).message });
    }
});

// CREATE a user
app.post('/users', async (req: Request<unknown, unknown, User>, res: Response) => {
    try {
        const {
            firstname,
            lastname,
            username,
            email,
            password,
            phone,
            address,
            preferredpricerange,
            preferredmaxdistance,
        } = req.body;

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Store the hashed password in the database
        const newData: QueryResult = await pool.query(
            `INSERT INTO Users (firstname, lastname, username, email, password, phone, address, preferredpricerange, preferredmaxdistance)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                firstname,
                lastname,
                username,
                email,
                hashedPassword,
                phone,
                address,
                preferredpricerange,
                preferredmaxdistance,
            ]
        );
        res.json({
            Result: 'Success',
            InsertedEntry: newData.rows,
        });
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

// UPDATE a user
app.put('/users/:id', async (req: Request<Parameters, unknown, UpdateBody>, res: Response) => {
    try {
        const { id } = req.params;
        const {
            FirstName,
            LastName,
            UserName,
            Email,
            Password,
            Phone,
            Address,
            PreferredPriceRange,
            PreferredMaxDistance,
            SerializedScheduleMatrix,
        } = req.body;

        let Latitude: number | null = null;
        let Longitude: number | null = null;

        // Dynamically build the SET clause based on provided fields (since we don't have to provide every field)
        // An array to store the individual SET clauses (e.g., firstname = $1, lastname = $2)

        const updates: string[] = [];

        // An array to store the corresponding values for the SET clauses.
        const values: string[] = [];

        // Counter to track parameter index ($1, $2, etc.)
        let count = 1;

        if (FirstName) {
            updates.push(`firstname = $${count}`);
            values.push(FirstName);
            count++;
        }
        if (LastName) {
            updates.push(`lastname = $${count}`);
            values.push(LastName);
            count++;
        }
        if (UserName) {
            updates.push(`username = $${count}`);
            values.push(UserName);
            count++;
        }
        if (Email) {
            updates.push(`email = $${count}`);
            values.push(Email);
            count++;
        }
        // TODO: For security updating the password should not be part of this route
        if (Password) {
            // Hash the new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(Password, saltRounds);

            updates.push(`password = $${count}`);
            values.push(hashedPassword); // Store the hashed password
            count++;
        }
        if (Phone) {
            updates.push(`phone = $${count}`);
            values.push(Phone);
            count++;
        }
        if (Address) {
            updates.push(`address = $${count}`);
            values.push(Address);
            count++;

            // If updating the address, get lat lon from google api and store those as well
            const { lat: Latitude, lng: Longitude } = (await getLatLonFromAddress(Address)) || {};

            updates.push(`latitude = $${count}`);
            values.push('' + Latitude);
            count++;
            updates.push(`longitude = $${count}`);
            values.push('' + Longitude);
            count++;
        }
        if (PreferredPriceRange) {
            updates.push(`PreferredPriceRange = $${count}`);
            values.push(String(PreferredPriceRange));
            count++;
        }
        if (PreferredMaxDistance) {
            updates.push(`PreferredMaxDistance = $${count}`);
            values.push(String(PreferredMaxDistance));
            count++;
        }
        if (SerializedScheduleMatrix) {
            updates.push(`SerializedScheduleMatrix = $${count}`);
            values.push(String(SerializedScheduleMatrix));
            count++;
        }
        // Construct SQL query to dynamically update user fields based on request body
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${count} RETURNING *`;
        values.push(id);

        if (DEBUGGING_MODE) console.log('updates');
        if (DEBUGGING_MODE) console.log(updates);
        if (DEBUGGING_MODE) console.log('values');
        if (DEBUGGING_MODE) console.log(values);
        if (DEBUGGING_MODE) console.log(query);

        // Executes the SQL query and sends response back to client
        const updatedData: QueryResult = await pool.query(query, values);
        res.json({
            Result: 'Success',
            UpdateEntry: updatedData.rows[0],
        });
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

// DELETE a user (protected)
app.delete('/users/:id', async (req: Request<Parameters>, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ Result: 'User was deleted' });
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/* GROUPS */
app.get('/groups', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM groups');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/* Get Groups By Provided User ID */
app.get('/groups:id', async (req: Request, res: Response) => {
    // Extract the User ID from the URL parameters
    const { id } = req.params;
    // console.log('ID is: ' + id); // DEBUG
    try {
        const allData: QueryResult = await pool.query(
            `SELECT g.*
            FROM
                Groups as g             JOIN
                UserGroupXRef as x      ON x.GroupID = g.ID JOIN
                Users as u              ON u.ID = x.UserID
            WHERE u.ID = $1`,
            [id]
        );
        // console.log('/groups:id was called'); // DEBUG
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/*    POST /groups    */
/* **************************************************************************
Input: A GroupAndCreator object that consists on the name of the group to create and ID of the creator user
Operation: Inserts the group to the database. Adds the user to the group in the database.
Output: Json object with result of the operation
*/

function generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.post(
    // first argument is the path
    '/groups',
    // requireAuth, (Temporarily taken out to make sure creating groups in frontend works)
    // second argument is an anonymous function
    async (req: Request<unknown, unknown, GroupAndCreator>, res: Response) => {
        try {
            // Take the group name from the request
            const { groupname, creatoruserid } = req.body;
            let joinCode: string;
            let attempts = 0;

            while (attempts < 3) {
                try {
                    joinCode = generateJoinCode();
                    // Store the groupname
                    const insertedGroupData: QueryResult = await pool.query(
                        'INSERT INTO Groups (Name, JoinCode) VALUES($1, $2) RETURNING *;',
                        [groupname, joinCode]
                    );
                    const newlyCreatedGroupID = insertedGroupData.rows[0].id;
                    // Add the creating user to the group
                    await pool.query('INSERT INTO UserGroupXRef (UserID, GroupID, isAdmin) VALUES($1, $2, $3);', [
                        creatoruserid,
                        newlyCreatedGroupID,
                        true,
                    ]);
                    // Send response back to the client
                    res.json({
                        Result: 'Success',
                        InsertedEntry: insertedGroupData.rows,
                    });
                    return;
                } catch (e) {
                    attempts++;
                    if (attempts === 3) throw e;
                }
            }
        } catch (e) {
            console.error((e as Error).message);
            res.status(500).json({ error: (e as Error).message });
        }
    }
);

// Add join group endpoint

app.post('/groups/join', async (req: Request, res: Response): Promise<void> => {
    try {
        const { joinCode, userId, checkOnly } = req.body;

        if (!joinCode || !userId) {
            res.status(400).json({ error: 'Missing joinCode or userId' });
            return;
        }

        // Find the group
        const groupResult = await pool.query('SELECT id FROM Groups WHERE JoinCode = $1', [joinCode]);

        if (groupResult.rows.length === 0) {
            res.status(404).json({ error: 'Invalid join code' });
            return;
        }

        const groupId = groupResult.rows[0].id;

        // Check if already member
        const memberCheck = await pool.query('SELECT 1 FROM UserGroupXRef WHERE UserID = $1 AND GroupID = $2', [
            userId,
            groupId,
        ]);

        const isMember = memberCheck.rows.length > 0;

        // Handle membership check
        if (checkOnly) {
            res.json({ alreadyMember: isMember });
            return;
        }

        // Handle join attempt
        if (isMember) {
            res.status(400).json({ error: 'Already a member' });
            return;
        }

        // Add user to group
        await pool.query('INSERT INTO UserGroupXRef (UserID, GroupID) VALUES ($1, $2)', [userId, groupId]);

        res.json({ message: 'Successfully joined group', groupId });
    } catch (e) {
        console.error('Join group error:', e);
        res.status(500).json({ error: (e as Error).message });
    }
});
// Send invite
app.post('/groups/:id/invite', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        // Verify user exists first
        const userExists = await pool.query('SELECT id FROM Users WHERE email = $1', [email]);

        if (userExists.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const userId = userExists.rows[0].id;

        // Check if already member
        const isMember = await pool.query('SELECT 1 FROM UserGroupXRef WHERE UserID = $1 AND GroupID = $2', [
            userId,
            id,
        ]);

        if (isMember.rows.length > 0) {
            res.status(400).json({ error: 'User is already in group' });
            return;
        }

        // Check for existing invite
        const existingInvite = await pool.query('SELECT 1 FROM GroupInvites WHERE GroupID = $1 AND Email = $2', [
            id,
            email,
        ]);

        if (existingInvite.rows.length > 0) {
            res.status(400).json({ error: 'Invite already sent' });
            return;
        }

        // Create invite
        await pool.query('INSERT INTO GroupInvites (GroupID, Email) VALUES ($1, $2)', [id, email]);

        res.json({ message: 'Invite sent successfully' });
    } catch (e) {
        console.error('Error sending invite:', e);
        res.status(500).json({ error: (e as Error).message });
    }
});

// Get pending invites for user
app.get('/invites', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'your-secret-key') as {
            id: number;
            email: string;
        };
        const userId = decoded.id;

        const result = await pool.query(
            `SELECT 
                g.id, 
                g.name, 
                g.joincode, 
                TO_CHAR(gi.invitedat, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') as datecreated
             FROM GroupInvites gi
             JOIN Groups g ON g.id = gi.groupid
             JOIN Users u ON u.email = gi.email
             WHERE u.id = $1`,
            [userId]
        );

        console.log('Found invites for user:', userId, result.rows);
        res.json(result.rows);
    } catch (e) {
        console.error('Error fetching invites:', e);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.delete('/invites/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get user ID from JWT token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'your-secret-key') as {
            id: number;
            email: string;
        };
        const userId = decoded.id;

        // Delete the invitation
        await pool.query(
            'DELETE FROM GroupInvites WHERE GroupID = $1 AND Email = (SELECT email FROM Users WHERE id = $2)',
            [id, userId]
        );

        res.json({ message: 'Invitation deleted successfully' });
    } catch (e) {
        console.error('Error deleting invite:', e);
        res.status(500).json({ error: (e as Error).message });
    }
});

// UPDATE a group (protected)
app.put('/groups/:id', async (req: Request<Parameters, unknown, { Name: string }>, res: Response) => {
    try {
        // Extract the group ID from the URL parameters
        const { id } = req.params;
        // Extract the updated group name from the request body
        const { Name } = req.body;

        // Update the group name in the database where the ID matches
        const updateData: QueryResult = await pool.query('UPDATE groups SET name = $1 WHERE id = $2 RETURNING *', [
            Name,
            id,
        ]);
        res.json({
            Result: 'Success',
            UpdatedEntry: updateData.rows[0],
        });
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

// DELETE a group (protected)
app.delete('/groups/:id', async (req: Request<Parameters>, res: Response) => {
    try {
        // Extract the group ID from the URL parameters
        const { id } = req.params;

        // Delete the group from the database where the ID matches
        await pool.query('DELETE FROM groups WHERE id = $1', [id]);

        res.json('Group was deleted');
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

// CUISINE TYPES
app.get('/cuisine-types', async (req: Request, res: Response) => {
    try {
        const allCuisineTypes: QueryResult = await pool.query('SELECT * FROM CuisineTypes');
        res.json(allCuisineTypes.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

// CUISINE PREFERENCES of Users
app.get('/users/:id/cuisines', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        const result: QueryResult = await pool.query(
            `SELECT CuisineType FROM UserCuisinePreferences WHERE UserID = $1`,
            [id]
        );

        //console.log("Raw database result:", result); // Log the entire result object
        //console.log("Rows from the database:", result.rows); // Log the rows array

        // Extract cuisine types from the query result
        const cuisineTypes = result.rows.map((row) => row.cuisinetype);

        //console.log("Extracted cuisine types:", cuisineTypes); // Log the extracted array

        res.json({
            userId: id,
            cuisinePreferences: cuisineTypes,
        });
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.post('/selections', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { groupId, yelpRestaurantId, dayOfWeek, time } = req.body;

        await client.query('BEGIN');

        // Delete any existing event first
        await client.query('DELETE FROM Selection WHERE groupid = $1', [groupId]);

        // Insert restaurant if needed
        await client.query(
            `INSERT INTO YelpRestaurant (YelpID)
             SELECT $1::text
             WHERE NOT EXISTS (
                 SELECT 1 FROM YelpRestaurant WHERE yelpid = $1::text
             );`,
            [yelpRestaurantId]
        );

        // Create new event
        await client.query(
            `INSERT INTO Selection (GroupID, YelpRestaurantID, TimeStart, DayOfWeek, Time)
             VALUES ($1, $2, NULL, $3, $4)`,
            [groupId, yelpRestaurantId, dayOfWeek, time]
        );

        await client.query('COMMIT');
        res.json({ message: 'Event created successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    } finally {
        client.release();
    }
});

app.get('/search', async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, categories, sort_by, limit } = req.query;

        // First get list of businesses
        const searchResponse = await yelp.get('/search', {
            params: {
                term: 'restaurants',
                latitude: Number(latitude),
                longitude: Number(longitude),
                categories: categories || 'restaurants',
                sort_by: sort_by || 'best_match',
                limit: Number(limit) || 5,
                radius: 40000,
            },
        });

        // Get detailed info (including hours) for each business
        const detailedBusinesses = await Promise.all(
            searchResponse.data.businesses.map(async (business: any) => {
                try {
                    const detailResponse = await yelp.get(`/${business.id}`);
                    return {
                        ...business,
                        hours: detailResponse.data.hours,
                    };
                } catch (error) {
                    console.error(`Error fetching details for ${business.id}:`, error);
                    return business;
                }
            })
        );

        return res.json({
            ...searchResponse.data,
            businesses: detailedBusinesses,
        });
    } catch (error: any) {
        console.error('Yelp API Error:', error);
        return res.status(500).json({
            error: 'Failed to fetch restaurants',
            details: error.message,
        });
    }
});

// ADD a cuisine preference to a user
// Expects "cuisineType": "some cuisine"
app.post(
    '/users/:id/cuisines',
    async (req: Request<{ id: string }, unknown, { cuisineType: string }>, res: Response) => {
        try {
            const { id } = req.params;
            const { cuisineType } = req.body;

            const newData: QueryResult = await pool.query(
                `INSERT INTO UserCuisinePreferences (UserID, CuisineType)
            Values($1, $2) RETURNING *`,
                [id, cuisineType]
            );
            res.json({
                Result: 'Success',
                InsertedEntry: newData.rows,
            });
        } catch (e) {
            console.error((e as Error).message);
            console.log('Using Yelp API key:', process.env.YELP_API_KEY?.slice(0, 10) + '...');
            res.status(500).json({ error: (e as Error).message });
        }
    }
);

// UPDATE a cuisine preference for a user
// Expects array format "cuisineTypes": ["Chinese", "Japanese"]
app.put(
    '/users/:id/cuisines',
    async (req: Request<{ id: string }, unknown, { cuisineTypes: string[] }>, res: Response) => {
        try {
            const { id } = req.params;
            const { cuisineTypes } = req.body;

            // Delete existing preferences
            await pool.query(`DELETE FROM UserCuisinePreferences WHERE UserID = $1`, [id]);

            // Insert new preferences
            const insertPromises = cuisineTypes.map((CuisineType) => {
                return pool.query(
                    `INSERT INTO UserCuisinePreferences (UserID, CuisineType)
                    VALUES($1, $2) RETURNING *`,
                    [id, CuisineType]
                );
            });
            const newData = await Promise.all(insertPromises);
            res.json({
                Result: 'Success',
                InsertedEntries: newData.map((result) => result.rows),
            });
        } catch (e) {
            console.error((e as Error).message);
            res.status(500).json({ error: (e as Error).message });
        }
    }
);

// DELETE a cuisine preference for a user
app.delete(
    '/users/:id/cuisines/:cuisineType',
    async (req: Request<{ id: string; cuisineType: string }>, res: Response) => {
        try {
            const { id, cuisineType } = req.params;

            //console.log("Deleting cuisine type:", cuisineType, "for userId:", id); // Log before deletion

            const deleteResult = await pool.query(
                'DELETE FROM UserCuisinePreferences WHERE UserID = $1 AND CuisineType = $2',
                [id, cuisineType]
            );

            //console.log("Deletion result:", deleteResult); // Log the result object

            res.json('Cuisine preference was deleted');
        } catch (e) {
            console.error((e as Error).message);
            res.status(500).json({ error: (e as Error).message });
        }
    }
);

// Get all notifications for a user
app.get('/users/:id/notifications', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        const queryResults = await pool.query('SELECT * FROM UserNotification WHERE UserID = $1 ORDER BY ID DESC', [
            id,
        ]);

        res.json(queryResults.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

// Mark all the notifications for specified userID as read in the database
app.put('/users/:id/notifications/mark-read', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        const queryResults = await pool.query(`UPDATE UserNotification SET IsRead = 'True' WHERE UserID = $1`, [id]);
        res.json({ Result: 'Success' });
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.put('/groups/:groupId/transfer-admin', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { groupId } = req.params;
        const { currentAdminId, newAdminId } = req.body;
        await client.query('BEGIN');
        // Remove admin status from current admin
        await client.query('UPDATE UserGroupXRef SET isadmin = false WHERE GroupID = $1 AND UserID = $2', [
            groupId,
            currentAdminId,
        ]);
        // Set new admin
        await client.query('UPDATE UserGroupXRef SET isadmin = true WHERE GroupID = $1 AND UserID = $2', [
            groupId,
            newAdminId,
        ]);
        await client.query('COMMIT');
        res.json({ message: 'Admin status transferred successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error transferring admin status:', error);
        res.status(500).json({ error: 'Failed to transfer admin status' });
    } finally {
        client.release();
    }
});

app.get('/restaurant', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM restaurant');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.post(
    // first argument is the path
    '/restaurant',

    // second argument is an anonymous function
    async (req: Request<unknown, unknown, Restaurant>, res: Response) => {
        try {
            // Take the group name from the request
            const { Name, Address, PriceLevel } = req.body;

            // Store the restaurant
            const newData: QueryResult = await pool.query(
                `INSERT INTO Restaurant (Name, Address, PriceLevel)
             VALUES($1, $2, $3) RETURNING *`,
                [Name, Address, PriceLevel]
            );

            // Send response back to the client
            res.json({
                Result: 'Success',
                InsertedEntry: newData.rows,
            });
        } catch (e) {
            console.error((e as Error).message);
            res.status(500).json({ error: (e as Error).message });
        }
    }
);

app.get('/restauranthours', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM restauranthours');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/restauranttype', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM restauranttype');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/selection', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM selection');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/usergroupxref', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM usergroupxref');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/userhours', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM userhours');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/userrestauranttypexref', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM userrestauranttypexref');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.delete('/data/:id', async (req: Request<Parameters>, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM data_table WHERE id = $1', [id]);
        res.json('Data was deleted, nice.');
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/* socialevents service */

/*    GET /events/generate-new/:groupid    */
/* ************************************************************************** 
Input: (URL Param) Group ID
Operation: Apply algorithm to find optimal social event for group. 
Insert the social event into the database (Selection table)
Output: (JSON Object) Json object with generated social event information {Restaurant, StartTime} 
*/
app.get('/socialevents/generate-new/:groupid', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { groupid } = req.params;

        await client.query('BEGIN');

        // Delete existing events before creating a new one

        await pool.query(`DELETE FROM Selection WHERE groupid = $1`, [groupid]);

        console.log('attempting to generate a social event'); // Debugging
        // Generate an event using the special algorithm in the event-generator module
        const generatedSocialEvent: SocialEvent = await generateEvent(Number(groupid));
        // Insert into database here

        // first check if the Yelp restaurant exists in YelpRestaurant, if it doesn't, insert it into YelpRestaurant
        await client.query(
            `
                INSERT INTO YelpRestaurant (YelpID)
                SELECT $1::text
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM YelpRestaurant 
                    WHERE yelpid = $1::text
                );
                `,
            [generatedSocialEvent.restaurant.id]
        );

        await client.query(
            `
                INSERT INTO Selection (GroupID, YelpRestaurantID, TimeStart, DayOfWeek, Time) VALUES
                ($1, $2, NULL, $3, $4);
                `,
            [
                groupid,
                generatedSocialEvent.restaurant.id,
                generatedSocialEvent.startTime.day,
                generatedSocialEvent.startTime.time,
            ]
        );
        await client.query('COMMIT');
        res.json(generatedSocialEvent);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error in generate event:', e);
        res.status(500).json({
            error: (e as Error).message,
            detail: 'Failed to generate/save event',
        });
    } finally {
        client.release();
    }
});

app.delete('/socialevents/:groupid', async (req: Request, res: Response) => {
    try {
        const { groupid } = req.params;
        await pool.query('DELETE FROM Selection WHERE groupid = $1', [groupid]);
        res.json({ result: 'success' });
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/*    GET /socialevents/debug/generate-new/:groupid    */
/* ************************************************************************** 
Input: (URL Param) Group ID
Operation: Apply algorithm to find optimal social event for group. Insert the social event into the database (Selection table)
Output: (JSON Object) Json object with generated social event information {Restaurant, StartTime} 
THIS IS A DEBUGGING VERSION THAT DOESN'T INSERT INTO THE DB
*/
app.get('/socialevents/debug/generate-new/:groupid', async (req: Request, res: Response) => {
    try {
        const { groupid } = req.params;
        console.log('attempting to generate a social event'); // Debugging
        const generatedSocialEvent: SocialEvent = await generateEvent(Number(groupid));
        res.json(generatedSocialEvent);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/*    GET /socialevents/bygroupid/:groupid    */
/* ************************************************************************** 
Input: (URL Param) Group ID
Operation: Search in the database for the event with the supplied groupid
Output: (JSON Object) Json object with the found event
*/
app.get('/socialevents/bygroupid/:groupid', async (req: Request, res: Response) => {
    try {
        const { groupid } = req.params;
        const allData: QueryResult = await pool.query(
            'SELECT groupid, yelprestaurantid, timestart, dayofweek, time FROM Selection WHERE groupid = $1',
            [groupid]
        );
        const fetchYelpRestaurantByID = async (yelprestaurantid: number): Promise<YelpRestaurant> => {
            try {
                const response = await yelp.get(`/${yelprestaurantid}`);
                return response.data;
            } catch (error) {
                console.error(
                    'There was an error fetching a restaurant from Yelp API (fetchYelpRestaurantByID)',
                    error
                );
                throw error;
            }
        };
        // Return empty object response if there are no social events for this group in the database
        if (allData.rows.length == 0) {
            res.json({});
            return;
        }
        const row = allData.rows[0];
        //  Create a restaurant object
        const restaurant: YelpRestaurant = await fetchYelpRestaurantByID(row.yelprestaurantid);
        // Create a DayOfWeekAndTime object using data from the selection db row
        const dayOfWeekAndTime: DayOfWeekAndTime = {
            day: row.dayofweek,
            time: row.time,
        };
        //  Create a SocialEvent object with data from Selection (Restaurant goes inside SocialEvent)
        const socialEvent: SocialEvent = {
            restaurant: restaurant,
            startTime: dayOfWeekAndTime,
        };
        // Return the socialEvent
        res.json(socialEvent);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/*    DELETE /socialevents/delete-by-groupid/:groupid    */
/* ************************************************************************** 
Input: (URL Param) Group ID
Operation: Delete all selection entries for the specified groupid
Output: (JSON Object) Json that indicates success or failure
*/
app.delete('/socialevents/delete-by-groupid/:groupid', async (req: Request, res: Response) => {
    try {
        const { groupid } = req.params;
        const allData: QueryResult = await pool.query('DELETE FROM Selection WHERE groupid = $1', [groupid]);
        res.json({ result: 'success' });
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

/* END OF ROUTES */
/* ********************************************************************** */

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { app, server };
