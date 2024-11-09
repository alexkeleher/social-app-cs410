import { User } from '@types';
import request from 'supertest';
import { app, server } from './index';

interface ApiResponse<T> {
    Result: string;
    InsertedEntry: T[];
}

afterAll((done) => {
    server.close(() => {
        console.log('Server closed');
        done();
    });
});

describe('Express API Endpoints', () => {
    let createdUserId: number | undefined | null = null;
    let createdGroupId: number | undefined | null = null;

    const userData: User = {
        firstname: 'John',
        lastname: 'Adams',
        username: 'johnAdams1776',
        email: 'johnAdams@gmail.com',
        password: 'password',
        phone: '1234567890',
        address: '123 Roanoke Island',
        PreferredPriceRange: 10,
        PreferredMaxDistance: 12,
    };
    const groupData = {
        name: "John's Fun Time",
    };

    afterEach(async () => {
        if (createdUserId) {
            try {
                await request(app)
                    .delete(`/users/${createdUserId}`)
                    .expect(200);
            } catch (err) {
                console.log(`Failed to delete test user ${createdUserId}`);
            }
            createdUserId = null;
        }
        if (createdGroupId) {
            try {
                await request(app)
                    .delete(`/groups/${createdGroupId}`)
                    .expect(200);
            } catch (err) {
                console.log(`Failed to delete test group ${createdGroupId}`);
            }
            createdGroupId = null;
        }
    });

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
        const response = await request(app).post('/users').send(userData);
        expect(response.status).toBe(200);
        expect(response.body.Result).toBe('Success');
        expect(response.body.InsertedEntry[0]).toHaveProperty(
            'firstname',
            'John'
        );

        createdUserId = response.body.InsertedEntry[0].id;
    });

    it('DELETE /users/:id - should delete a user', async () => {
        const createResponse = await request(app)
            .post('/users')
            .send(userData)
            .expect(200);

        expect(createResponse.body.InsertedEntry[0].id).toBeDefined();
        createdUserId = createResponse.body.InsertedEntry[0].id;

        const deleteResponse = await request(app)
            .delete(`/users/${createdUserId}`)
            .expect(200);

        expect(deleteResponse.body.Result).toBe('User was deleted');
        await request(app).get(`/users/${createdUserId}`).expect(404);

        createdUserId = null;
    });

    it('GET /groups - should return all groups', async () => {
        const response = await request(app).get('/groups');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /groups - should create a group', async () => {
        const response = await request(app).post('/groups').send(groupData);
        expect(response.status).toBe(200);
        expect(response.body.Result).toBe('Success');
        expect(response.body.InsertedEntry[0]).toHaveProperty(
            'name',
            "John's Fun Time"
        );

        createdGroupId = response.body.InsertedEntry[0].id;
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
