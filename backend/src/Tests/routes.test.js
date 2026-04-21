// backend/src/Tests/routes.test.js

import request  from 'supertest';
import app      from '../index.js';
import mongoose from 'mongoose';

let userAgent;
let adminAgent;

const user  = { name: 'Route Tester', email: `rt_${Date.now()}@test.com`, password: 'Test@1234' };
const admin = { name: 'Route Admin',  email: `ra_${Date.now()}@test.com`, password: 'Test@1234' };

beforeAll(async () => {
  // Register both users using /auth/signup (your actual route)
  await request(app).post('/auth/signup').send(user);
  await request(app).post('/auth/signup').send(admin);

  // Mark as verified and set admin role directly in DB
  const { User } = await import('../models/user.model.js');
  await User.findOneAndUpdate({ email: user.email },  { isVerfied: true });
  await User.findOneAndUpdate({ email: admin.email }, { isVerfied: true, role: 'admin' });

  // Use agents — they auto-store and send cookies on every request
  userAgent  = request.agent(app);
  adminAgent = request.agent(app);

  const r1 = await userAgent.post('/auth/login').send(user);
  const r2 = await adminAgent.post('/auth/login').send(admin);

  console.log('User login status:',  r1.statusCode);
  console.log('Admin login status:', r2.statusCode);
});

afterAll(async () => {
  const { User } = await import('../models/user.model.js');
  await User.deleteOne({ email: user.email });
  await User.deleteOne({ email: admin.email });
  await mongoose.connection.close();
});

// ── Auth Routes ───────────────────────────────────────────────────
describe('🛤️  AUTH ROUTES', () => {

  // Your route is POST /auth/signup (not /auth/register)
  test('RT-01 | POST /auth/signup exists → not 404', async () => {
    const r = await request(app).post('/auth/signup').send({});
    expect(r.statusCode).not.toBe(404);
  });

  test('RT-02 | POST /auth/login exists → not 404', async () => {
    const r = await request(app).post('/auth/login').send({});
    expect(r.statusCode).not.toBe(404);
  });

  test('RT-03 | GET /auth/check-auth – no cookie → 401', async () => {
    const r = await request(app).get('/auth/check-auth');
    expect(r.statusCode).toBe(401);
  });

  test('RT-04 | GET /auth/check-auth – with cookie → 200', async () => {
    const r = await userAgent.get('/auth/check-auth');
    expect(r.statusCode).toBe(200);
  });

  test('RT-05 | POST /auth/logout → 200', async () => {
    const r = await userAgent.post('/auth/logout');
    expect(r.statusCode).toBe(200);

    // Re-login so subsequent tests still have a valid session
    const { User } = await import('../models/user.model.js');
    await User.findOneAndUpdate({ email: user.email }, { isVerfied: true });
    await userAgent.post('/auth/login').send(user);
  });

  test('RT-06 | POST /auth/verify-email exists → not 404', async () => {
    const r = await request(app).post('/auth/verify-email').send({});
    expect(r.statusCode).not.toBe(404);
  });

  test('RT-07 | POST /auth/forgot-password exists → not 404', async () => {
    const r = await request(app).post('/auth/forgot-password').send({});
    expect(r.statusCode).not.toBe(404);
  });
});

// ── Book Routes ───────────────────────────────────────────────────
describe('🛤️  BOOK ROUTES', () => {

  // GET / has NO verifyToken in your route — it is public
  test('RT-08 | GET /books – no auth → 200 (public route)', async () => {
    const r = await request(app).get('/books');
    expect(r.statusCode).toBe(200);
  });

  test('RT-09 | GET /books – with auth → 200', async () => {
    const r = await userAgent.get('/books');
    expect(r.statusCode).toBe(200);
    expect(Array.isArray(r.body.books ?? r.body)).toBeTruthy();
  });

  // GET /:id has NO verifyToken in your route — it is public
  test('RT-10 | GET /books/invalidid – no auth → 400/404/500 (public route)', async () => {
    const r = await request(app).get('/books/invalidid');
    expect([400, 404, 500]).toContain(r.statusCode);
  });

  // GET /my DOES require verifyToken
  test('RT-11 | GET /books/my – no auth → 401', async () => {
    const r = await request(app).get('/books/my');
    expect(r.statusCode).toBe(401);
  });

  test('RT-12 | GET /books/my – with auth → 200', async () => {
    const r = await userAgent.get('/books/my');
    expect(r.statusCode).toBe(200);
  });

  // POST / requires verifyToken
  test('RT-13 | POST /books – no auth → 401', async () => {
    const r = await request(app).post('/books');
    expect(r.statusCode).toBe(401);
  });

  test('RT-14 | GET /books?type=Sell → 200 (public)', async () => {
    const r = await request(app).get('/books?type=Sell');
    expect(r.statusCode).toBe(200);
  });

  test('RT-15 | GET /books?type=Exchange → 200 (public)', async () => {
    const r = await request(app).get('/books?type=Exchange');
    expect(r.statusCode).toBe(200);
  });

  test('RT-16 | GET /books?type=Rent → 200 (public)', async () => {
    const r = await request(app).get('/books?type=Rent');
    expect(r.statusCode).toBe(200);
  });

  // PATCH and DELETE require verifyToken
  test('RT-17 | PATCH /books/:id – no auth → 401', async () => {
    const r = await request(app).patch('/books/000000000000000000000000').send({});
    expect(r.statusCode).toBe(401);
  });

  test('RT-18 | DELETE /books/:id – no auth → 401', async () => {
    const r = await request(app).delete('/books/000000000000000000000000');
    expect(r.statusCode).toBe(401);
  });
});

// ── Request Routes ────────────────────────────────────────────────
describe('🛤️  REQUEST ROUTES', () => {

  test('RT-19 | GET /requests – no auth → 401', async () => {
    const r = await request(app).get('/requests');
    expect(r.statusCode).toBe(401);
  });

  test('RT-20 | GET /requests – with auth → 200', async () => {
    const r = await userAgent.get('/requests');
    expect(r.statusCode).toBe(200);
  });

  test('RT-21 | GET /requests/sent – no auth → 401', async () => {
    const r = await request(app).get('/requests/sent');
    expect(r.statusCode).toBe(401);
  });

  test('RT-22 | GET /requests/sent – with auth → 200', async () => {
    const r = await userAgent.get('/requests/sent');
    expect(r.statusCode).toBe(200);
  });

  test('RT-23 | GET /requests/book/:bookId – no auth → 401', async () => {
    const r = await request(app).get('/requests/book/000000000000000000000000');
    expect(r.statusCode).toBe(401);
  });

  test('RT-24 | GET /requests/book/:bookId – with auth → 200/400/404', async () => {
    const r = await userAgent.get('/requests/book/000000000000000000000000');
    expect([200, 400, 404]).toContain(r.statusCode);
  });

  test('RT-25 | POST /requests – no auth → 401', async () => {
    const r = await request(app).post('/requests').send({});
    expect(r.statusCode).toBe(401);
  });

  test('RT-26 | PATCH /requests/:id – no auth → 401', async () => {
    const r = await request(app).patch('/requests/000000000000000000000000').send({});
    expect(r.statusCode).toBe(401);
  });

  test('RT-27 | DELETE /requests/:id – no auth → 401', async () => {
    const r = await request(app).delete('/requests/000000000000000000000000');
    expect(r.statusCode).toBe(401);
  });
});

// ── Review Routes ─────────────────────────────────────────────────
describe('🛤️  REVIEW ROUTES', () => {

  // Your route is /:bookId (not /:id)
  test('RT-28 | GET /reviews/:bookId – no auth → 401', async () => {
    const r = await request(app).get('/reviews/000000000000000000000000');
    expect(r.statusCode).toBe(401);
  });

  test('RT-29 | GET /reviews/:bookId – with auth → 200/400/404', async () => {
    const r = await userAgent.get('/reviews/000000000000000000000000');
    expect([200, 400, 404]).toContain(r.statusCode);
  });

  test('RT-30 | POST /reviews/:bookId – no auth → 401', async () => {
    const r = await request(app).post('/reviews/000000000000000000000000').send({});
    expect(r.statusCode).toBe(401);
  });

  test('RT-31 | DELETE /reviews/:reviewId – no auth → 401', async () => {
    const r = await request(app).delete('/reviews/000000000000000000000000');
    expect(r.statusCode).toBe(401);
  });
});

// ── Transaction Routes ────────────────────────────────────────────
describe('🛤️  TRANSACTION ROUTES', () => {

  test('RT-32 | GET /transactions – no auth → 401', async () => {
    const r = await request(app).get('/transactions');
    expect(r.statusCode).toBe(401);
  });

  test('RT-33 | GET /transactions – with auth → 200', async () => {
    const r = await userAgent.get('/transactions');
    expect(r.statusCode).toBe(200);
  });

  test('RT-34 | GET /transactions?type=purchase – with auth → 200', async () => {
    const r = await userAgent.get('/transactions?type=purchase');
    expect(r.statusCode).toBe(200);
  });
});

// ── Wishlist Routes ───────────────────────────────────────────────
describe('🛤️  WISHLIST ROUTES', () => {

  test('RT-35 | GET /wishlist – no auth → 401', async () => {
    const r = await request(app).get('/wishlist');
    expect(r.statusCode).toBe(401);
  });

  test('RT-36 | GET /wishlist – with auth → 200', async () => {
    const r = await userAgent.get('/wishlist');
    expect(r.statusCode).toBe(200);
  });

  test('RT-37 | POST /wishlist – no auth → 401', async () => {
    const r = await request(app).post('/wishlist').send({});
    expect(r.statusCode).toBe(401);
  });
});

// ── Payment Routes ────────────────────────────────────────────────
describe('🛤️  PAYMENT ROUTES', () => {

  test('RT-38 | POST /payment/initiate – no auth → 401', async () => {
    const r = await request(app).post('/payment/initiate').send({});
    expect(r.statusCode).toBe(401);
  });

  test('RT-39 | POST /payment/cod – no auth → 401', async () => {
    const r = await request(app).post('/payment/cod').send({});
    expect(r.statusCode).toBe(401);
  });

  test('RT-40 | POST /payment/verify – no auth → 401', async () => {
    const r = await request(app).post('/payment/verify').send({});
    expect(r.statusCode).toBe(401);
  });
});

// ── Notification Routes ───────────────────────────────────────────
describe('🛤️  NOTIFICATION ROUTES', () => {

  test('RT-41 | GET /notifications – no auth → 401', async () => {
    const r = await request(app).get('/notifications');
    expect(r.statusCode).toBe(401);
  });

  test('RT-42 | GET /notifications – with auth → 200', async () => {
    const r = await userAgent.get('/notifications');
    expect(r.statusCode).toBe(200);
  });
});

// ── Profile Routes ────────────────────────────────────────────────
describe('🛤️  PROFILE ROUTES', () => {

  test('RT-43 | GET /profile/me – no auth → 401', async () => {
    const r = await request(app).get('/profile/me');
    expect(r.statusCode).toBe(401);
  });

  test('RT-44 | GET /profile/me – with auth → 200', async () => {
    const r = await userAgent.get('/profile/me');
    expect(r.statusCode).toBe(200);
    expect(r.body.user).toBeDefined();
  });

  test('RT-45 | PATCH /profile/me – no auth → 401', async () => {
    const r = await request(app).patch('/profile/me').send({});
    expect(r.statusCode).toBe(401);
  });

  test('RT-46 | PATCH /profile/me – with auth → 200', async () => {
    const r = await userAgent.patch('/profile/me').send({ bio: 'Route test bio' });
    expect(r.statusCode).toBe(200);
  });
});

// ── Admin Routes ──────────────────────────────────────────────────
describe('🛤️  ADMIN ROUTES', () => {

  test('RT-47 | GET /admin/stats – no auth → 401', async () => {
    const r = await request(app).get('/admin/stats');
    expect(r.statusCode).toBe(401);
  });

  test('RT-48 | GET /admin/stats – student → 403', async () => {
    const r = await userAgent.get('/admin/stats');
    expect(r.statusCode).toBe(403);
  });

  test('RT-49 | GET /admin/stats – admin → 200', async () => {
    const r = await adminAgent.get('/admin/stats');
    expect(r.statusCode).toBe(200);
  });

  test('RT-50 | GET /admin/users – admin → 200', async () => {
    const r = await adminAgent.get('/admin/users');
    expect(r.statusCode).toBe(200);
    expect(Array.isArray(r.body.users)).toBe(true);
  });

  test('RT-51 | GET /admin/books – admin → 200', async () => {
    const r = await adminAgent.get('/admin/books');
    expect(r.statusCode).toBe(200);
  });

  test('RT-52 | GET /admin/students – admin → 200', async () => {
    const r = await adminAgent.get('/admin/students');
    expect(r.statusCode).toBe(200);
  });

  test('RT-53 | GET /notes – with auth → 200', async () => {
    const r = await userAgent.get('/notes');
    expect(r.statusCode).toBe(200);
  });

  test('RT-54 | GET /top-sellers – with auth → 200/404', async () => {
    const r = await userAgent.get('/top-sellers');
    expect([200, 404]).toContain(r.statusCode);
  });
});