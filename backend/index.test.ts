import request from 'supertest';
import { app, server } from './index';

afterAll((done) => {
    server.close(() => {
        console.log('Server closed');
        done();
    });
});

describe('Express API Endpoints', () => {
    it('GET / - should return a welcome message', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('This is Express working');
    });

    it('GET /users - should return all users', async () => {
        const response = await request(app).get('/users');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /users - should create a user', async () => {
        const userData = {
            FirstName: 'John',
            LastName: 'Adams',
            UserName: 'johnAdams1776',
            Email: 'johnAdams@gmail.com',
            Password: 'password',
            Phone: '1234567890',
            Address: '123 Roanoke Island',
        };

        const response = await request(app).post('/users').send(userData);
        expect(response.status).toBe(200);
        expect(response.body.Result).toBe('Success');
        expect(response.body.InsertedEntry[0]).toHaveProperty(
            'firstname',
            'John'
        );
    });

    it('GET /groups - should return all groups', async () => {
        const response = await request(app).get('/groups');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /groups - should create a user', async () => {
        const groupData = {
            Name: "John's Fun Time",
        };

        const response = await request(app).post('/groups').send(groupData);
        expect(response.status).toBe(200);
        expect(response.body.Result).toBe('Success');
        expect(response.body.InsertedEntry[0]).toHaveProperty(
            'name',
            "John's Fun Time"
        );
    });

    it('GET /restaurant - should return all restaurants', async () => {
        const response = await request(app).get('/restaurant');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /restauranthours - should return all restaurant hours', async () => {
        const response = await request(app).get('/restauranthours');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /restauranttype - should return all restaurant types', async () => {
        const response = await request(app).get('/restauranttype');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /selection - should return all selections', async () => {
        const response = await request(app).get('/selection');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /usergroupxref - should return all usergroupxrefs', async () => {
        const response = await request(app).get('/usergroupxref');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /userhours - should return all user hours', async () => {
        const response = await request(app).get('/userhours');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /userrestauranttypexref - should return all userrestauranttypexref', async () => {
        const response = await request(app).get('/userrestauranttypexref');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
