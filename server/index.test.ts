import request from 'supertest';
import pool from './db';
import app from './index';

describe('User API Endpoints', () => {
    beforeAll(async () => {
        await pool.query(
            'CREATE TABLE IF NOT EXISTS TestUsers (id SERIAL PRIMARY KEY, firstname VARCHAR, lastname VARCHAR, username VARCHAR, password VARCHAR, phone VARCHAR, address VARCHAR, email VARCHAR)'
        );
    });

    afterAll(async () => {
        await pool.query('DROP TABLE TestUsers');
        pool.end();
    });

    it('should create a new user', async () => {
        const response = await request(app).post('/user').send({
            FirstName: 'Jermaine',
            LastName: 'Cole',
            UserName: 'jermainecole',
            Password: 'coleworld123',
            Phone: '1234567890',
            Address: '123 NYC St',
        });

        expect(response.status).toBe(200);
        expect(response.body.InsertedEntry).toBeDefined();
        expect(response.body.Result).toBe('Success');
    });

    it('should create a new account with email and password', async () => {
        const response = await request(app).post('/createAccount').send({
            Email: 'jermainecole@example.com',
            Password: 'coleworld123',
        });

        expect(response.status).toBe(200);
        expect(response.body.InsertedEntry).toBeDefined();
        expect(response.body.Result).toBe('Success');
    });

    it('should retrieve all data', async () => {
        const response = await request(app).get('/data');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update data by id', async () => {
        const newInfo = 'Update Info';
        const response = await request(app)
            .put('/data/1')
            .send({ info: newInfo });

        expect(response.status).toBe(200);
        expect(response.body).toBe('Data was updated, nice.');
    });

    it('should delete data by id', async () => {
        const response = await request(app).delete('/data/1');
        expect(response.status).toBe(200);
        expect(response.body).toBe('Data was deleted, nice.');
    });
});
