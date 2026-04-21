// backend/src/Tests/auth.test.js
// Run: npm run test:auth

import request  from 'supertest';
import app      from '../index.js';
import mongoose from 'mongoose';

// ── Shared state ──────────────────────────────────────────────────────────────
let authCookie = '';

const testUser = {
  name:     'Test User',
  email:    `testuser_${Date.now()}@gmail.com`,
  password: 'Test@1234',
};

// ── Cleanup ───────────────────────────────────────────────────────────────────
afterAll(async () => {
  const { User } = await import('../models/user.model.js');
  await User.deleteOne({ email: testUser.email });
  await mongoose.connection.close();
});

// ═════════════════════════════════════════════════════════════════════════════
describe('AUTH MODULE', () => {

  // ── UT-01
  test('UT-01 | Signup - valid data → 201', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.msg).toBe('User created successfully');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    // Password must never be exposed
    expect(res.body.user.password).toBeUndefined();
  });

  // ── UT-02 
  test('UT-02 | Signup - duplicate email → 400', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/already exists/i);
  });

  // ── UT-03 
  test('UT-03 | Signup - missing fields → 400', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ email: 'incomplete@gmail.com' }); // missing name + password

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/fill in all fields/i);
  });

  // ── UT-04 
  test('UT-04 | Login - wrong password → 400', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'WrongPass@99' });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/invalid credentials/i);
  });

  // ── UT-05 
  test('UT-05 | Login - non-existent email → 400', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'Test@1234' });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/invalid credentials/i);
  });

  // ── UT-06 
  test('UT-06 | Login - valid credentials → 200 + cookie', async () => {
    // Mark user as verified directly in DB 
    const { User } = await import('../models/user.model.js');
    await User.findOneAndUpdate(
      { email: testUser.email },
      { isVerfied: true }
    );

    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Logged in successfully');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password).toBeUndefined();

    // Save cookie for subsequent tests
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    authCookie = cookies[0].split(';')[0]; 
  });

  // ── UT-07 
  test('UT-07 | Check Auth - valid cookie → 200', async () => {
    const res = await request(app)
      .get('/auth/check-auth')
      .set('Cookie', authCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    // Password must not be returned (controller uses .select('-password'))
    expect(res.body.user.password).toBeUndefined();
  });

  // ── UT-08 
  test('UT-08 | Check Auth - no cookie → 401', async () => {
    const res = await request(app)
      .get('/auth/check-auth');

    expect(res.statusCode).toBe(401);
  });

  // ── UT-09 
test('UT-09 | Logout → 200', async () => {
  const res = await request(app)
    .post('/auth/logout')
    .set('Cookie', authCookie);

  expect(res.statusCode).toBe(200);
  expect(res.body.msg).toBe('Logged out successfully');

  authCookie = ''; 
});

// ── UT-10 
test('UT-10 | Check Auth after logout → 401', async () => {
  // authCookie is now '' — no cookie sent, should get 401
  const res = await request(app)
    .get('/auth/check-auth');
    // ← removed .set('Cookie', authCookie)

  expect(res.statusCode).toBe(401);
});

});



