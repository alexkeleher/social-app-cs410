import express from 'express';
import cors from 'cors';
import pool from './db';
import { QueryResult } from 'pg';
import { Request, Response, RequestHandler } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

interface UserBody {
    FirstName: string;
    LastName: string;
    UserName: string;
    Email: string;
    Password: string;
    Phone: string;
    Address: string;
}

interface GroupBody {
    Name: string;
}

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
    async (req: Request<unknown, unknown, UserBody>, res: Response) => {
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
app.put('/users/:id', async (req: Request<Parameters, unknown, UpdateBody>, res: Response) => {
    try {
        const { id } = req.params;
        const { FirstName, LastName, UserName, Email, Password, Phone, Address } = req.body;

        // Dynamically build the SET clause based on provided fields (since we don't have to provide every field)
        // An array to store the individual SET clauses (e.g., firstname = $1, lastname = $2)
        const updates = [];
        // An array to store the coresponding values for the SET clauses.
        const values = [];
        // Counter to track parameter index ($1, $2, etc.)
        let count = 1;

        if (FirstName) { updates.push(`firstname = $${count}`); values.push(FirstName); count++; }
        if (LastName) { updates.push(`lastname = $${count}`); values.push(LastName); count++; }
        if (UserName) { updates.push(`username = $${count}`); values.push(UserName); count++; }
        if (Email) { updates.push(`email = $${count}`); values.push(Email); count++; }
        if (Password) { updates.push(`password = $${count}`); values.push(Password); count++; }
        if (Phone) { updates.push(`phone = $${count}`); values.push(Phone); count++; }
        if (Address) { updates.push(`address = $${count}`); values.push(Address); count++; }

        // === (strict equality) no type coercion. If different types returns false.
        if (updates.length === 0) {
            return res.status(400).json({ error: "No update fields provided" });
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
