import { Pool } from 'pg';
import { testConfig } from './test-db';
import fs from 'fs';
import path from 'path';

const setupTestDatabase = async () => {
    // Create a temporary connection to the postgres database to create a test database
    const pgPool = new Pool({
        ...testConfig.database,
        database: 'postgres'
    });

    try {
        await pgPool.query(`
            DROP DATABASE IF EXISTS ${testConfig.database.database}; 
            CREATE DATABASE ${testConfig.database.database};
        `);
        await pgPool.end();

        const testPool = new Pool(testConfig.database);

        const schemaFile = path.join(__dirname, '../database.sql');
        const schema = fs.readFileSync(schemaFile, 'utf8');
        await testPool.query(schema);

        console.log('Test database setup complete');
        await testPool.end();
    } catch (error) {
        console.error('Error setting up test database:', error);
        throw error;
    }
};

export default setupTestDatabase;
