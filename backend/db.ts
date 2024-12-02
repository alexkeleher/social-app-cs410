import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
} else {
    dotenv.config();
}

const pool = new Pool({
    user: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_USER : process.env.DB_USER,
    host: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_HOST : process.env.DB_HOST,
    database: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_NAME : process.env.DB_NAME,
    password: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_PASSWORD : process.env.DB_PASSWORD,
    port: parseInt(
        process.env.NODE_ENV === 'test' ? process.env.TEST_DB_PORT || '5432' : process.env.DB_PORT || '5432',
        10
    ),
});

console.log(`Connected to database: ${pool.options.database}`);

export default pool;
