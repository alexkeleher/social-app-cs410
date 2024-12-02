import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export const testConfig = {
    database: {
        user: process.env.TEST_DB_USER,
        host: process.env.TEST_DB_HOST || 'localhost',
        database: process.env.TEST_DB_NAME || 'groupeats_test',
        password: process.env.TEST_DB_PASSWORD,
        port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
    },
};

// Modify the existing pool configuration to use the test config when in test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

const pool = new Pool(
    isTestEnvironment
        ? testConfig.database
        : {
              user: process.env.DB_USER,
              host: process.env.DB_HOST,
              database: process.env.DB_NAME,
              password: process.env.DB_PASSWORD,
              port: parseInt(process.env.DB_PORT || '5432', 10),
          }
);

export default pool;
