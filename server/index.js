const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('This is Express working');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

/*-- CRUD Operations --*/
const pool = require('./db');

// Create
app.post('/user', async (req, res) => {
    try {
        const { FirstName, LastName, UserName, Password, Phone, Address } = req.body;
        const newData = await pool.query(
            `INSERT INTO Users (firstname, lastname, username, password, phone, address) 
             VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
            [FirstName, LastName, UserName, Password, Phone, Address]
        );
        res.json({
            Result : 'Success',
            InsertedEntry : newData.rows
        });
    } catch (err) {
        console.error(err.message);
        res.json(err.message);
    }
});

// Read
app.get('/data', async (res) => {
    try {
        const allData = await pool.query('SELECT * FROM data_table');
        res.json(allData.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Update
app.put('/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { info } = req.body;
        await pool.query('UPDATE data_table SET info = $1 WHERE id = $2', [
            info,
            id,
        ]);
        res.json('Data was updated, nice.');
    } catch (err) {
        console.error(err.message);
    }
});

// Delete
app.delete('/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM data_table WHERE id = $1', [id]);
        res.json('Data was deleted, nice.');
    } catch (err) {
        console.error(err.message);
    }
});
