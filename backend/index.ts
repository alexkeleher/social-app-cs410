import express from 'express';
import cors from 'cors';
import pool from './db';
import { QueryResult } from 'pg';
import { Request, Response } from 'express';
//import { User, Group } from '../frontend/src/interfaces/index';
import usersRouter from './routes/users';

const app = express();
const PORT = process.env.PORT || 5000;

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
}

interface Restaurant {
    Name?: string;
    Address?: string;
    PriceLevel?: string;
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('This is Express working');
});

/*-- CRUD Operations --*/

/* USERS */

app.use('/users', usersRouter);
/* 
app.get('/users', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query('SELECT * FROM users');
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});




app.post(
    '/users',
    async (req: Request<unknown, unknown, User>, res: Response) => {
        try {
            const {
                firstname,
                lastname,
                username,
                email,
                password,
                phone,
                address,
            } = req.body;
            const newData: QueryResult = await pool.query(
                `INSERT INTO Users (firstname, lastname, username, email, password, phone, address) 
             VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [firstname, lastname, username, email, password, phone, address]
            );
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

// UPDATE a user
app.put(
    '/users/:id',
    async (req: Request<Parameters, unknown, UpdateBody>, res: Response) => {
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
            } = req.body;

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
            if (Password) {
                updates.push(`password = $${count}`);
                values.push(Password);
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
            }

            // Construct SQL query to dynamically update user fields based on request body
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${count} RETURNING *`;
            values.push(id);

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
    }
);

// DELETE a user
app.delete('/users/:id', async (req: Request<Parameters>, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json('User was deleted');
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});




interface UserParams {
    email: string;
}

app.get('/users/:email/groups', async (req: Request<UserParams>, res: Response) => {
    const { email } = req.params;

    try {
        // Query to find groups associated with the user's email
        const query = `
            SELECT groups.* FROM groups
            JOIN user_groups ON groups.id = user_groups.group_id
            JOIN users ON users.id = user_groups.user_id
            WHERE users.email = $1
        `;
        const result = await pool.query(query, [email]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching groups for user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Endpoint to add a user to a group

interface UserGroupParams {
    email: string;
    groupId: string;
}


app.post(
    '/users/:email/groups/:groupId', 
    async (req: Request<UserGroupParams, any, any, any>, res: Response) => {
        const { email, groupId } = req.params;

        try {
            // Fetch the user ID based on the provided email
            const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

            if (userResult.rowCount === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userId = userResult.rows[0].id;

            // Check if the group exists
            const groupResult = await pool.query('SELECT id FROM groups WHERE id = $1', [groupId]);

            if (groupResult.rowCount === 0) {
                return res.status(404).json({ error: 'Group not found' });
            }

            // Insert a new row in the user_groups table to link user and group
            const query = `
                INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            `;
            await pool.query(query, [userId, groupId]);

            res.status(200).json({ message: 'User added to group successfully' });
        } catch (error) {
            console.error('Error adding user to group:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);
 */

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

app.post(
    // first argument is the path
    '/groups',

    // second argument is an anonymous function
    async (req: Request<unknown, unknown, Group>, res: Response) => {
        try {
            // Take the group name from the request
            const { name } = req.body;

            // Store the groupname
            const newData: QueryResult = await pool.query(
                `INSERT INTO Groups (Name, DateCreated) 
             VALUES($1, $2) RETURNING *`,
                [name, new Date()]
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

// UPDATE a group
app.put(
    '/groups/:id',
    async (
        req: Request<Parameters, unknown, { Name: string }>,
        res: Response
    ) => {
        try {
            // Extract the group ID from the URL parameters
            const { id } = req.params;
            // Extract the updated group name from the request body
            const { Name } = req.body;

            // Update the group name in the database where the ID matches
            const updateData: QueryResult = await pool.query(
                'UPDATE groups SET name = $1 WHERE id = $2 RETURNING *',
                [Name, id]
            );
            res.json({
                Result: 'Success',
                UpdatedEntry: updateData.rows[0],
            });
        } catch (e) {
            console.error((e as Error).message);
            res.status(500).json({ error: (e as Error).message });
        }
    }
);

// DELETE a group
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

app.get('/restaurant', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query(
            'SELECT * FROM restaurant'
        );
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
        const allData: QueryResult = await pool.query(
            'SELECT * FROM restauranthours'
        );
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/restauranttype', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query(
            'SELECT * FROM restauranttype'
        );
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/selection', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query(
            'SELECT * FROM selection'
        );
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/usergroupxref', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query(
            'SELECT * FROM usergroupxref'
        );
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/userhours', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query(
            'SELECT * FROM userhours'
        );
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

app.get('/userrestauranttypexref', async (req: Request, res: Response) => {
    try {
        const allData: QueryResult = await pool.query(
            'SELECT * FROM userrestauranttypexref'
        );
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

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { app, server };
