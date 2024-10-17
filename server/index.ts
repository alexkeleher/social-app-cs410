import express from 'express';
import cors from 'cors';
import pool from './db';
import { QueryResult } from 'pg';
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

interface UserBody {
    FirstName: string;
    LastName: string;
    UserName: string;
    Password: string;
    Phone: string;
    Address: string;
    Email: string;
}

interface GroupBody {
    Name: string;
}

interface Parameters {
    id: string;
}

interface UpdateBody {
    info: string;
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('This is Express working');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

/*-- CRUD Operations --*/
// Create
app.post(
    '/user',
    async (req: Request<unknown, unknown, UserBody>, res: Response) => {
        try {
            const { FirstName, LastName, UserName, Password, Phone, Address } =
                req.body;
            const newData: QueryResult = await pool.query(
                `INSERT INTO Users (firstname, lastname, username, password, phone, address) 
             VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
                [FirstName, LastName, UserName, Password, Phone, Address]
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

// app.post(
//     // first argument is the path '/path',
//     // 2nd argument is a function that takes a request, and a response
// );
app.post(
    // first argument is the path
    '/createAccount',

    // second argument is an anonymous function
    async (req: Request<unknown, unknown, UserBody>, res: Response) => {
        // our logic goes here

        // What do we need to do to create an account
        try {
            // Take the email from the request
            // Take the password from the request
            const { Email, Password } = req.body;

            // Store the email & password
            // How do we store a new user in the user table?
            const newData: QueryResult = await pool.query(
                `INSERT INTO Users (email, password) 
             VALUES($1, $2) RETURNING *`,
                [Email, Password]
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

// create a group
app.post(
    // first argument is the path
    '/createGroup',

    // second argument is an anonymous function
    async (req: Request<unknown, unknown, GroupBody>, res: Response) => {
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

// Read
app.get('/data', async (res: Response) => {
    try {
        const allData: QueryResult = await pool.query(
            'SELECT * FROM data_table'
        );
        res.json(allData.rows);
    } catch (e) {
        console.error((e as Error).message);
        res.status(500).json({ error: (e as Error).message });
    }
});

// Update
app.put(
    '/data/:id',
    async (req: Request<Parameters, unknown, UpdateBody>, res: Response) => {
        try {
            const { id } = req.params;
            const { info } = req.body;
            await pool.query('UPDATE data_table SET info = $1 WHERE id = $2', [
                info,
                id,
            ]);
            res.json('Data was updated, nice.');
        } catch (e) {
            console.error((e as Error).message);
            res.status(500).json({ error: (e as Error).message });
        }
    }
);

// Delete
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

export default app;
