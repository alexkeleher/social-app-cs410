import { User, GroupAndCreator } from '@types';
import request from 'supertest';
import { app, server } from './index';
import pool from './db';
import bcrypt from 'bcrypt';

describe('CRUD Operations Tests', () => {
    const testUser: User = {
        firstname: 'Test',
        lastname: 'User',
        username: 'testuser123',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 Test St',
        PreferredPriceRange: 2,
        PreferredMaxDistance: 10,
    };

    const testGroup: GroupAndCreator = {
        groupname: 'Test Group',
        creatoruserid: 1,
    };

    let userId: number;
    let groupId: number;
    let authToken: string;

    beforeAll(async () => {
        Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });

        // Verify we're using the test database
        const result = await pool.query('SELECT current_database()');
        const currentDatabase = result.rows[0].current_database;
        if (currentDatabase !== 'groupeats_test') {
            throw new Error(
                `Wrong database in use! Expected 'groupeats_test but got' '${currentDatabase}'`
            );
        }

        // Clear test data before starting
        await pool.query('DELETE FROM Users WHERE email = $1', [
            testUser.email,
        ]);
        await pool.query('DELETE FROM Groups WHERE name = $1', [
            testGroup.groupname,
        ]);
    });

    afterAll(async () => {
        // Cleanup
        await pool.query('DELETE FROM Users WHERE email = $1', [
            testUser.email,
        ]);
        await pool.query('DELETE FROM Groups WHERE name = $1', [
            testGroup.groupname,
        ]);
        await pool.end();
        server.close();
    });

    describe('User Operations', () => {
        it('should create a new user', async () => {
            const response = await request(app).post('/users').send(testUser);

            expect(response.status).toBe(200);
            expect(response.body.Result).toBe('Success');
            expect(response.body.InsertedEntry[0].email).toBe(testUser.email);

            userId = response.body.InsertedEntry[0].id;
        });

        it('should log in the user', async () => {
            const response = await request(app).post('/login').send({
                email: testUser.email,
                password: testUser.password,
            });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.token).toBeDefined();

            authToken = response.body.token;
        });

        it('should get user by id', async () => {
            const response = await request(app)
                .get(`/users${userId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe(testUser.email);
        });

        it('should update user', async () => {
            const updateData = {
                FirstName: 'Updated',
                LastName: 'Name',
            };

            const response = await request(app)
                .put(`/users/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.Result).toBe('Success');
            expect(response.body.UpdateEntry.firstname).toBe('Updated');
        });

        it('should get user cuisine preferences', async () => {
            const response = await request(app)
                .get(`/users/${userId}/cuisines`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('cuisinePreferences');
        });
    });

    describe('Group Operations', () => {
        it('should create a new group', async () => {
            const response = await request(app)
                .post('/groups')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testGroup);

            expect(response.status).toBe(200);
            expect(response.body.Result).toBe('Success');
            expect(response.body.InsertedEntry[0].name).toBe(
                testGroup.groupname
            );

            groupId = response.body.InsertedEntry[0].id;
        });

        it('should get groups by user id', async () => {
            const response = await request(app)
                .get(`/groups${userId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should update group name', async () => {
            const updateData = {
                Name: 'Updated Test Group',
            };

            const response = await request(app)
                .put(`/groups/${groupId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.Result).toBe('Success');
            expect(response.body.UpdatedEntry.name).toBe('Updated Test Group');
        });

        it('should get users by group id', async () => {
            const response = await request(app)
                .get(`/users/by-groupid/${groupId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Delete Operations', () => {
        it('should delete group', async () => {
            const response = await request(app)
                .delete(`/groups/${groupId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });

        it('should delete user', async () => {
            const response = await request(app)
                .delete(`/users/${userId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });
});
