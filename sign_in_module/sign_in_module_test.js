const request = require('supertest');
const app = require('../app'); // 假设应用程序在 app.js 中
const mysql = require('mysql');
const bcrypt = require('bcrypt');

// 模拟 MySQL 连接池
jest.mock('mysql');
mysql.createPool.mockReturnValue({
    query: jest.fn((sql, params, callback) => {
        if (sql.includes('SELECT')) {
            callback(null, [{ username: 'testuser', password: 'hashedpassword', type: 'customer', things: {} }]);
        } else if (sql.includes('INSERT')) {
            callback(null, { insertId: 1 });
        }
    })
});

// 模拟 bcrypt
jest.mock('bcrypt');
bcrypt.hashSync.mockReturnValue('hashedpassword');
bcrypt.compareSync.mockReturnValue(true);

describe('POST /log_in_or_signup', () => {
    it('should return 400 for missing input fields', async () => {
        const response = await request(app)
            .post('/log_in_or_signup')
            .send({ name: 'testuser', password: 'password' });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid input');
    });

    it('should log in an existing user with correct credentials', async () => {
        const response = await request(app)
            .post('/log_in_or_signup')
            .send({ name: 'testuser', password: 'password', type: 'customer' });

        expect(response.status).toBe(200);
        expect(response.text).toContain('Login successfully');
        expect(response.headers['set-cookie']).toContain('type=customer');
    });

    it('should not log in an existing user with incorrect password', async () => {
        bcrypt.compareSync.mockReturnValue(false);

        const response = await request(app)
            .post('/log_in_or_signup')
            .send({ name: 'testuser', password: 'wrongpassword', type: 'customer' });

        expect(response.status).toBe(200);
        expect(response.text).toContain('error');
    });

    it('should register a new user', async () => {
        mysql.createPool.mockReturnValue({
            query: jest.fn((sql, params, callback) => {
                if (sql.includes('SELECT')) {
                    callback(null, []);
                } else if (sql.includes('INSERT')) {
                    callback(null, { insertId: 1 });
                }
            })
        });

        const response = await request(app)
            .post('/log_in_or_signup')
            .send({ name: 'newuser', password: 'newpassword', type: 'customer' });

        expect(response.status).toBe(200);
        expect(response.text).toContain('Sign up successfully');
        expect(response.headers['set-cookie']).toContain('type=customer');
    });

    it('should handle database query errors', async () => {
        mysql.createPool.mockReturnValue({
            query: jest.fn((sql, params, callback) => {
                callback(new Error('Database error'), null);
            })
        });

        const response = await request(app)
            .post('/log_in_or_signup')
            .send({ name: 'testuser', password: 'password', type: 'customer' });

        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });
});