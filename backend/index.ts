import express from 'express';
import cors from 'cors';
import pool from './db';
import { QueryResult } from 'pg';
import { Request, Response } from 'express';
import { User, Group } from '../frontend/src/interfaces/index';

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
                FirstName,
                LastName,
                UserName,
                Email,
                Password,
                Phone,
                Address,
            } = req.body;
            const newData: QueryResult = await pool.query(
                `INSERT INTO Users (firstname, lastname, username, email, password, phone, address) 
             VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [FirstName, LastName, UserName, Email, Password, Phone, Address]
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
            const { Name } = req.body;

            // Store the groupname
            const newData: QueryResult = await pool.query(
                `INSERT INTO Groups (Name, DateCreated) 
             VALUES($1, $2) RETURNING *`,
                [Name, new Date()]
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
        // Extractt the group ID from the URL parameters
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
