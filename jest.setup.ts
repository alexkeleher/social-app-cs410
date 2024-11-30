import setupTestDatabase from './backend/config/setup-test-db';

Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });

beforeAll(async () => {
    try {
        await setupTestDatabase();
    } catch (error) {
        console.error('Failed to setup test database:', error);
        process.exit(1);
    }
}, 30000);
