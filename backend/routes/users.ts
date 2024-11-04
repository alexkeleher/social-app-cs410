import express, { Request, Response } from 'express';
import pool from '../db/pool';
import { QueryResult } from 'pg';
interface User {
    id?: number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    groups?: string[];
}

const router = express.Router();

/*-- ROUTE HANDLERS --*/

// Get all users
router.get('/', async (req: Request, res: Response) => {
    try {
        const allUsers: QueryResult = await pool.query('SELECT * FROM users');
        res.json(allUsers.rows);
    } catch (e) {
        console.error('Error fetching users:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new user
router.post('/', async (req: Request<unknown, unknown, User>, res: Response) => {
    try {
        const { firstname, lastname, username, email, password, phone, address, groups } = req.body;
        const newUser: QueryResult = await pool.query(
            `INSERT INTO users (firstname, lastname, username, email, password, phone, address, groups) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [firstname, lastname, username, email, password, phone, address, groups]
        );
        res.json({ message: 'User created successfully', user: newUser.rows[0] });
    } catch (e) {
        console.error('Error creating user:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a user by ID
router.put('/:id', async (req: Request<{ id: string }, unknown, Partial<User>>, res: Response) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, username, email, password, phone, address, groups } = req.body;
        const updates = [];
        const values: (string | number | string[])[] = [];
        let count = 1;

        if (firstname) { updates.push(`firstname = $${count++}`); values.push(firstname); }
        if (lastname)  { updates.push(`lastname = $${count++}`); values.push(lastname); }
        if (username) { updates.push(`username = $${count++}`); values.push(username); }
        if (email) { updates.push(`email = $${count++}`); values.push(email); }
        if (password) { updates.push(`password = $${count++}`); values.push(password); }
        if (phone) { updates.push(`phone = $${count++}`); values.push(phone); }
        if (address) { updates.push(`address = $${count++}`); values.push(address); }
        if (groups) { updates.push(`groups = $${count++}`); values.push(groups); }

        values.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${count} RETURNING *`;
        const updatedUser: QueryResult = await pool.query(query, values);

        res.json({ message: 'User updated successfully', user: updatedUser.rows[0] });
    } catch (e) {
        console.error('Error updating user:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a user by ID
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (e) {
        console.error('Error deleting user:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get groups by user email
router.get('/:email/groups', async (req: Request<{ email: string }>, res: Response) => {
    const { email } = req.params;
    try {
        const query = `
            SELECT groups.* FROM groups
            JOIN user_groups ON groups.id = user_groups.group_id
            JOIN users ON users.id = user_groups.user_id
            WHERE users.email = $1
        `;
        const result = await pool.query(query, [email]);
        res.json(result.rows);
    } catch (e) {
        console.error('Error fetching groups for user:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add user to group by email and groupId





router.post(
    '/:email/groups/:groupId', 
    async (req: Request<{ email: string, groupId: string }, any, any, any>, res: Response) => {
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


export default router;
