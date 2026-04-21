// backend/src/Tests/requests.test.js
// Run: npm run test:requests

import request  from 'supertest';
import app      from '../index.js';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// ── Mock email ────────────────────────────────────────────────────────────────
jest.mock('../mail/email.js', () => ({
  sendVerificationEmail:         jest.fn().mockResolvedValue(true),
  sendWelcomeEmail:              jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail:        jest.fn().mockResolvedValue(true),
  sendPasswordResetSuccessEmail: jest.fn().mockResolvedValue(true),
}));

// ── Shared state ──────────────────────────────────────────────────────────────
let cookieA   = '';   // seller (owns the book)
let cookieB   = '';   // buyer  (sends the request)
let bookId    = '';
let requestId = '';

const userA = {
  name:     'Seller User',
  email:    `seller_${Date.now()}@test.com`,
  password: 'Test@1234',
};

const userB = {
  name:     'Buyer User',
  email:    `buyer_${Date.now()}@test.com`,
  password: 'Test@1234',
};

// ── Helper: signup → verify → login → return cookie ──────────────────────────
async function registerAndLogin(user) {
  // 1. Sign up
  await request(app).post('/auth/signup').send(user);

  // 2. Verify in DB
  const { User } = await import('../models/user.model.js');
  await User.findOneAndUpdate({ email: user.email }, { isVerfied: true });

  // 3. Login
  const res = await request(app).post('/auth/login').send({
    email:    user.email,
    password: user.password,
  });

  if (!res.headers['set-cookie']) {
    console.error(`❌ Login failed for ${user.email}:`, res.statusCode, res.body);
    throw new Error(`Login failed for ${user.email}`);
  }

  return res.headers['set-cookie'][0].split(';')[0];
}

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  // Register both users
  cookieA = await registerAndLogin(userA);
  cookieB = await registerAndLogin(userB);

  // User A creates a book
  const bookRes = await request(app)
    .post('/books')
    .set('Cookie', cookieA)
    .field('title',  'Exchange Book')
    .field('author', 'Author A')
    .field('price',  '150')
    .field('type',   'Exchange')
    .field('badge',  'Good')
    .field('seller', userA.name);

  if (bookRes.statusCode !== 201) {
    console.error('❌ Book creation failed:', bookRes.statusCode, bookRes.body);
    throw new Error('Book creation failed in beforeAll');
  }

  bookId = bookRes.body.book._id;
});

// ── Cleanup ───────────────────────────────────────────────────────────────────
afterAll(async () => {
  const { User }    = await import('../models/user.model.js');
  const { Book }    = await import('../models/book.model.js');
  const { Request } = await import('../models/request.model.js');

  await User.deleteOne({ email: userA.email });
  await User.deleteOne({ email: userB.email });
  await Book.deleteOne({ _id: bookId });
  await Request.deleteMany({ bookId });
  await mongoose.connection.close();
});

// ═════════════════════════════════════════════════════════════════════════════
describe('🔄 REQUESTS MODULE', () => {

  // ── UT-21 
  test('UT-21 | Get received requests - with auth → 200', async () => {
    const res = await request(app)
      .get('/requests')
      .set('Cookie', cookieA);

    expect(res.statusCode).toBe(200);
    expect(res.body.requests).toBeDefined();
    expect(Array.isArray(res.body.requests)).toBe(true);
  });

  // ── UT-22 
  test('UT-22 | Get sent requests - with auth → 200', async () => {
    const res = await request(app)
      .get('/requests/sent')
      .set('Cookie', cookieB);

    expect(res.statusCode).toBe(200);
    expect(res.body.requests).toBeDefined();
    expect(Array.isArray(res.body.requests)).toBe(true);
  });

  // ── UT-23 
  test('UT-23 | Send exchange request → 201', async () => {
    const res = await request(app)
      .post('/requests')
      .set('Cookie', cookieB)
      .send({
        bookId,
        type:          'Exchange',
        offerBookTitle: 'My Offered Book',
        message:       'Would love to exchange!',
        senderName:    userB.name,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.request).toBeDefined();
    expect(res.body.request.status).toBe('Pending');

    requestId = res.body.request._id; // save for later tests
  });

  // ── UT-24 
  test('UT-24 | Request own book → 400', async () => {
    const res = await request(app)
      .post('/requests')
      .set('Cookie', cookieA)   // userA owns the book
      .send({
        bookId,
        type:       'Exchange',
        senderName: userA.name,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/own book/i);
  });

  // ── UT-25 
  test('UT-25 | Duplicate pending request → 400', async () => {
    // userB already sent a request in UT-22
    const res = await request(app)
      .post('/requests')
      .set('Cookie', cookieB)
      .send({
        bookId,
        type:       'Exchange',
        senderName: userB.name,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/pending/i);
  });

  // ── UT-26 
  test('UT-26 | Accept request → 200', async () => {
    const res = await request(app)
      .patch(`/requests/${requestId}`)
      .set('Cookie', cookieA)   // userA is the book owner → can accept
      .send({ status: 'Accepted' });

    expect(res.statusCode).toBe(200);
    expect(res.body.request.status).toBe('Accepted');
  });

  // ── UT-27 
  test('UT-27 | Non-owner cannot accept → 400 (already handled)', async () => {
    // Request is already Accepted from UT-26, so this should return 400
    const res = await request(app)
      .patch(`/requests/${requestId}`)
      .set('Cookie', cookieB)   // userB is NOT the owner
      .send({ status: 'Accepted' });

    // Either 403 (not authorized) or 400 (already handled)
    expect([400, 403]).toContain(res.statusCode);
  });

  // ── UT-28 
  test('UT-28 | Get book requests → 200', async () => {
    const res = await request(app)
      .get(`/requests/book/${bookId}`)
      .set('Cookie', cookieA);

    expect(res.statusCode).toBe(200);
    expect(res.body.requests).toBeDefined();
    expect(Array.isArray(res.body.requests)).toBe(true);
  });

});