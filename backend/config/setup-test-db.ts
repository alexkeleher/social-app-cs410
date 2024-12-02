import { Pool } from 'pg';
import { testConfig } from './test-db';
import fs from 'fs';
import path from 'path';

const TEST_DB_NAME = 'groupeats_test';

const setupTestDatabase = async () => {
    let pgPool;
    let testPool;

    try {
        // Create a temporary connection to the postgres database to create a test database
        pgPool = new Pool({
            ...testConfig.database,
            database: 'postgres',
        });

        const databaseExistsResult = await pgPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB_NAME]);

        if (databaseExistsResult.rows.length > 0) {
            await pgPool.query(
                `
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = $1
                AND pid <> pg_backend_pid();
            `,
                [TEST_DB_NAME]
            );

            await pgPool.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME}`);
        }
        await pgPool.query(`CREATE DATABASE ${TEST_DB_NAME}`);

        await pgPool.end();

        testPool = new Pool(testConfig.database);

        const schemaFile = path.join(__dirname, '../database.sql');
        const schema = fs.readFileSync(schemaFile, 'utf8');
        await testPool.query(schema);

        console.log('Test database setup complete');
        await testPool.end();
    } catch (error) {
        console.error('Error setting up test database:', error);

        if (pgPool) await pgPool.end();
        if (testPool) await testPool.end();
        throw error;
    }
};

export default setupTestDatabase;
