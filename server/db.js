// What is a Pool?
// In PostgreSQL, a pool is a cache of database connections that can be reused for
// future requests. Connection pooling allows for more client connections to be
// served while using fewer server resources. This is because each connection in
// the pool is shared, instead of each connection taking up a separate process on the server.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

module.exports = pool;
