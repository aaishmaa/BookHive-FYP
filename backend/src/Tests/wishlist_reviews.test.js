// backend/src/Tests/wishlist_reviews.test.js
// Run: npm run test:wishlist

import { jest } from '@jest/globals';
import request  from 'supertest';
import app      from '../index.js';
import mongoose from 'mongoose';

// ── Mock email ────────────────────────────────────────────────────────────────
jest.mock('../mail/email.js', () => ({
  sendVerificationEmail:         jest.fn().mockResolvedValue(true),
  sendWelcomeEmail:              jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail:        jest.fn().mockResolvedValue(true),
  sendPasswordResetSuccessEmail: jest.fn().mockResolvedValue(true),
}));

// ── Shared state ──────────────────────────────────────────────────────────────
let cookie     = '';
let bookId     = '';
let wishlistId = '';
let reviewId   = '';

const testUser = {
  name:     'WR Tester',
  email:    `wr_${Date.now()}@test.com`,
  password: 'Test@1234',
};

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  // 1. Sign up
  await request(app).post('/auth/signup').send(testUser);

  // 2. Verify in DB
  const { User } = await import('../models/user.model.js');
  await User.findOneAndUpdate({ email: testUser.email }, { isVerfied: true });

  // 3. Login and grab cookie
  const loginRes = await request(app).post('/auth/login').send({
    email:    testUser.email,
    password: testUser.password,
  });

  if (!loginRes.headers['set-cookie']) {
    console.error('❌ Login failed:', loginRes.statusCode, loginRes.body);
    throw new Error('Login failed in beforeAll');
  }
  cookie = loginRes.headers['set-cookie'][0].split(';')[0];

  
  const bookRes = await request(app)
    .post('/books')
    .set('Cookie', cookie)
    .field('title',    'WR Test Book')
    .field('author',   'WR Author')
    .field('price',    '150')
    .field('type',     'Sell')
    .field('badge',    'Good')
    .field('seller',   testUser.name)
    .field('level',    'Bachelor')
    .field('category', 'Science');

  if (bookRes.statusCode !== 201) {
    console.error('❌ Book creation failed:', bookRes.statusCode, bookRes.body);
    throw new Error('Book creation failed in beforeAll');
  }

  bookId = bookRes.body.book._id;
});

// ── Cleanup ───────────────────────────────────────────────────────────────────
afterAll(async () => {
  const { User }     = await import('../models/user.model.js');
  const { Book }     = await import('../models/book.model.js');
  const { Wishlist } = await import('../models/wishlist.model.js');
  const { Review }   = await import('../models/review.model.js');

  if (bookId) {
    await Wishlist.deleteMany({ bookId });
    await Review.deleteMany({ bookId });
    await Book.deleteOne({ _id: bookId });
  }
  await User.deleteOne({ email: testUser.email });
  await mongoose.connection.close();
});

// ═════════════════════════════════════════════════════════════════════════════
describe('WISHLIST MODULE', () => {

  // ── UT-29 
  test('UT-29 | Get wishlist - no auth → 401', async () => {
    const res = await request(app).get('/wishlist');
    expect(res.statusCode).toBe(401);
  });

  // ── UT-30
  test('UT-30 | Get wishlist - with auth → 200', async () => {
    const res = await request(app)
      .get('/wishlist')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.wishlist)).toBe(true);
  });

  // ── UT-31 
  test('UT-31 | Add to wishlist → 201', async () => {
    const res = await request(app)
      .post('/wishlist')
      .set('Cookie', cookie)
      .send({ bookId });

    expect(res.statusCode).toBe(201);
    expect(res.body.item).toBeDefined();
    expect(res.body.item.bookId.toString()).toBe(bookId);

    wishlistId = res.body.item.id; 
  });

  // ── UT-32
  test('UT-32 | Wishlist contains the book', async () => {
    const res = await request(app)
      .get('/wishlist')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    const ids = res.body.wishlist.map(w => w.bookId?.toString());
    expect(ids).toContain(bookId);
  });

  // ── UT-33 
  test('UT-33 | Duplicate add → 400', async () => {
    const res = await request(app)
      .post('/wishlist')
      .set('Cookie', cookie)
      .send({ bookId });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/already saved/i);
  });

  // ── UT-34 
  test('UT-34 | Check wishlist status → 200', async () => {
    const res = await request(app)
      .get(`/wishlist/check/${bookId}`)
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.saved).toBe(true);
    expect(res.body.id).toBeDefined();
  });

  // ── UT-35 
  test('UT-35 | Remove from wishlist → 200', async () => {
    const res = await request(app)
      .delete(`/wishlist/${wishlistId}`)
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toMatch(/removed/i);
  });

  // ── UT-36 
  test('UT-36 | Check wishlist after remove → saved: false', async () => {
    const res = await request(app)
      .get(`/wishlist/check/${bookId}`)
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.saved).toBe(false);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
describe('REVIEWS MODULE', () => {

  // ── UT-37 
  test('UT-37 | Get reviews → 200', async () => {
    const res = await request(app)
      .get(`/reviews/${bookId}`)
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.reviews)).toBe(true);
  });

  // ── UT-38 
  test('UT-38 | Submit review - missing rating → 400', async () => {
    const res = await request(app)
      .post(`/reviews/${bookId}`)
      .set('Cookie', cookie)
      .send({ text: 'No rating here' });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/rating/i);
  });

  // ── UT-39 
  test('UT-39 | Submit review - missing text → 400', async () => {
    const res = await request(app)
      .post(`/reviews/${bookId}`)
      .set('Cookie', cookie)
      .send({ rating: 4 });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/rating and text/i);
  });

  // ── UT-40 
  test('UT-40 | Submit review - valid → 201', async () => {
    const res = await request(app)
      .post(`/reviews/${bookId}`)
      .set('Cookie', cookie)
      .send({ rating: 4, text: 'Great book, highly recommend!' });

    expect(res.statusCode).toBe(201);
    expect(res.body.review).toBeDefined();
    expect(res.body.review.rating).toBe(4);

    reviewId = res.body.review._id; 
  });

  // ── UT-41 
  test('UT-41 | Duplicate review → 400', async () => {
    const res = await request(app)
      .post(`/reviews/${bookId}`)
      .set('Cookie', cookie)
      .send({ rating: 5, text: 'Trying to review again' });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/already reviewed/i);
  });

  // ── UT-42 
  test('UT-42 | Delete review → 200', async () => {
    const res = await request(app)
      .delete(`/reviews/${reviewId}`)
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toMatch(/deleted/i);
  });

});