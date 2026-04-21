// backend/src/Tests/books.test.js
// Run: npm run test:books

import request  from 'supertest';
import app      from '../index.js';
import mongoose from 'mongoose';
import { jest } from '@jest/globals'; 

// ── Mock email – must be after imports, before beforeAll ──────────────────────
jest.mock('../mail/email.js', () => ({
  sendVerificationEmail:         jest.fn().mockResolvedValue(true),
  sendWelcomeEmail:              jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail:        jest.fn().mockResolvedValue(true),
  sendPasswordResetSuccessEmail: jest.fn().mockResolvedValue(true),
}));

// ── Shared state ──────────────────────────────────────────────────────────────
let authCookie    = '';
let createdBookId = '';

const testUser = {
  name:     'Books Tester',
  email:    `bookstester_${Date.now()}@test.com`,   // @test.com — no bounce-back
  password: 'Test@1234',
};

const testBook = {
  title:       'Test Book',
  author:      'Test Author',
  price:       '200',
  type:        'Sell',
  badge:       'Good',
  description: 'A test book listing',
  seller:      'Books Tester',
  level:       'Bachelor',
  category:    'Science',
};

// ── Setup: create user, verify, login ────────────────────────────────────────
beforeAll(async () => {
  // 1. Sign up
  await request(app).post('/auth/signup').send(testUser);

  // 2. Mark as verified directly in DB
  const { User } = await import('../models/user.model.js');
  await User.findOneAndUpdate({ email: testUser.email }, { isVerfied: true });

  // 3. Login and grab cookie
  const res = await request(app).post('/auth/login').send({
    email:    testUser.email,
    password: testUser.password,
  });

  if (!res.headers['set-cookie']) {
    console.error('❌ Login failed in beforeAll:', res.statusCode, res.body);
    throw new Error('beforeAll login failed — cannot run books tests');
  }

  authCookie = res.headers['set-cookie'][0].split(';')[0];
});

// ── Cleanup ───────────────────────────────────────────────────────────────────
afterAll(async () => {
  const { User } = await import('../models/user.model.js');
  const { Book } = await import('../models/book.model.js');
  await User.deleteOne({ email: testUser.email });
  await Book.deleteMany({ title: testBook.title, author: testBook.author });
  await mongoose.connection.close();
});

// ═════════════════════════════════════════════════════════════════════════════
describe('📚 BOOKS MODULE', () => {

  // ── UT-11 
  test('UT-11 | Get all books - no auth → 200 (public route)', async () => {
    const res = await request(app).get('/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.books).toBeDefined();
  });

  // ── UT-12 
  test('UT-12 | Get all books - with auth → 200', async () => {
    const res = await request(app)
      .get('/books')
      .set('Cookie', authCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.books).toBeDefined();
    expect(Array.isArray(res.body.books)).toBe(true);
  });

  // ── UT-13 
  test('UT-13 | Filter by type=Sell → only Sell books', async () => {
    const res = await request(app).get('/books?type=Sell');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.books)).toBe(true);
    res.body.books.forEach(book => expect(book.type).toBe('Sell'));
  });

  // ── UT-14 
  test('UT-14 | Filter by type=Exchange → only Exchange books', async () => {
    const res = await request(app).get('/books?type=Exchange');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.books)).toBe(true);
    res.body.books.forEach(book => expect(book.type).toBe('Exchange'));
  });

  // ── UT-15 
  test('UT-15 | Upload book - missing required fields → 400/500', async () => {
    const res = await request(app)
      .post('/books')
      .set('Cookie', authCookie)
      .field('title', 'Incomplete Book');
    // missing price + type — Mongoose validation error

    expect([400, 500]).toContain(res.statusCode);
  });

  // ── UT-16 
  test('UT-16 | Upload book - valid data → 201', async () => {
    const res = await request(app)
      .post('/books')
      .set('Cookie', authCookie)
      .field('title',       testBook.title)
      .field('author',      testBook.author)
      .field('price',       testBook.price)
      .field('type',        testBook.type)
      .field('badge',       testBook.badge)
      .field('description', testBook.description)
      .field('seller',      testBook.seller)
      .field('level',       testBook.level)
      .field('category',    testBook.category);

    expect(res.statusCode).toBe(201);
    expect(res.body.book).toBeDefined();
    expect(res.body.book.title).toBe(testBook.title);

    createdBookId = res.body.book._id;
  });

  // ── UT-17 
  test('UT-17 | Get my books → 200', async () => {
    const res = await request(app)
      .get('/books/my')
      .set('Cookie', authCookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.books)).toBe(true);
  });

  // ── UT-18 
  test('UT-18 | Get book by valid ID → 200', async () => {
    const res = await request(app).get(`/books/${createdBookId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.book).toBeDefined();
    expect(res.body.book._id).toBe(createdBookId);
  });

  // ── UT-19 
  test('UT-19 | Get book by invalid ID → 404/500', async () => {
    const res = await request(app).get('/books/invalidid123');

    expect([400, 404, 500]).toContain(res.statusCode);
  });

  // ── UT-20 
  test('UT-20 | Delete own book → 200', async () => {
    const res = await request(app)
      .delete(`/books/${createdBookId}`)
      .set('Cookie', authCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toMatch(/deleted/i);
  });

});