import request from 'supertest';
import app from './index';

describe('Express API Endpoints', () => {
    it('GET / - should return a welcome message', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('This is Express working');
    });

    it('POST /user - should create a user', async () => {
        const userData = {
            FirstName: 'John',
            LastName: 'Adams',
            UserName: 'johnAdam1776',
            Password: 'password',
            Phone: '1234567890',
            Address: '123 Roanoke Island',
        };
        
        const response = await request(app).post('/user').send(userData);
        expect(response.status).toBe(200);
        expect(response.body.Result).toBe('Success');
        expect(response.body.InsertedEntry[0]).toHaveProperty('firstname', 'John');
    });
    
    it('GET /data - should fetch all data', async () => {
        const response = await request(app).get('/data');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
