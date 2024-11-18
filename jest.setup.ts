import setupTestDatabase from './backend/config/setup-test-db';

beforeAll(async () => {
	process.env.NODE_ENV = 'test';
	await setupTestDatabase();
});
