// backend/src/Tests/payment_transactions.test.js


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
let cookie = '';
let bookId = '';

const testUser = {
  name:     'Pay Tester',
  email:    `pay_${Date.now()}@test.com`,
  password: 'Test@1234',
};

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  // 1. Sign up
  await request(app).post('/auth/signup').send(testUser);

  // 2. Verify in DB
  const { User } = await import('../models/user.model.js');
  await User.findOneAndUpdate({ email: testUser.email }, { isVerfied: true });

  // 3. Login
  const res = await request(app).post('/auth/login').send({
    email:    testUser.email,
    password: testUser.password,
  });

  if (!res.headers['set-cookie']) {
    console.error('❌ Login failed:', res.statusCode, res.body);
    throw new Error('Login failed in beforeAll');
  }
  cookie = res.headers['set-cookie'][0].split(';')[0];

  // 4. Create a test book (needed for COD tests)
  const bookRes = await request(app)
    .post('/books')
    .set('Cookie', cookie)
    .field('title',    'Pay Test Book')
    .field('author',   'Pay Author')
    .field('price',    '500')
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
  const { User }        = await import('../models/user.model.js');
  const { Book }        = await import('../models/book.model.js');
  const { Transaction } = await import('../models/transaction.model.js');

  if (bookId) {
    await Transaction.deleteMany({ bookId });
    await Book.deleteOne({ _id: bookId });
  }
  await User.deleteOne({ email: testUser.email });
  await mongoose.connection.close();
});

// ═════════════════════════════════════════════════════════════════════════════
describe(' PAYMENT MODULE', () => {

  // ── UT-52 
  test('UT-52 | Initiate Khalti - no auth → 401', async () => {
    const res = await request(app)
      .post('/payment/initiate')
      .send({ bookId, amount: 500, bookTitle: 'Test' });

    expect(res.statusCode).toBe(401);
  });

  // ── UT-53
  test('UT-53 | Initiate Khalti - missing fields → 400', async () => {
    const res = await request(app)
      .post('/payment/initiate')
      .set('Cookie', cookie)
      .send({ amount: 500 }); 

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/required/i);
  });

  // ── UT-54 
  
  test('UT-54 | Initiate Khalti - with auth + fields → not 401', async () => {
    const res = await request(app)
      .post('/payment/initiate')
      .set('Cookie', cookie)
      .send({
        bookId,
        amount:     500,
        bookTitle:  'Pay Test Book',
        buyerName:  testUser.name,
        sellerName: 'Seller',
      });

    // Will be 500 (Khalti API unreachable in test) but NOT 401 or 400
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(400);
  });

  // ── UT-55 
  test('UT-55 | COD - no auth → 401', async () => {
    const res = await request(app)
      .post('/payment/cod')
      .send({ bookId, amount: 500 });

    expect(res.statusCode).toBe(401);
  });

  // ── UT-56 
  test('UT-56 | COD - non-existent book → 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/payment/cod')
      .set('Cookie', cookie)
      .send({
        bookId:    fakeId,
        bookTitle: 'Ghost Book',
        amount:    100,
        delivery:  {
          name: 'X', address: 'Y',
          city: 'Z', pin: '000', phone: '9800000000',
        },
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.msg).toMatch(/not found/i);
  });

  // ── UT-57 
  test('UT-57 | COD - valid → 200 + transaction created', async () => {
    const res = await request(app)
      .post('/payment/cod')
      .set('Cookie', cookie)
      .send({
        bookId,
        bookTitle:  'Pay Test Book',
        amount:     500,
        sellerId:   '',
        sellerName: 'Seller',
        buyerName:  testUser.name,
        delivery: {
          name:    testUser.name,
          address: 'Kathmandu',
          city:    'Kathmandu',
          pin:     '44600',
          phone:   '9800000000',
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toMatch(/cod|order placed/i);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
describe(' TRANSACTIONS MODULE', () => {

  // ── UT-58 
  test('UT-52 | Get transactions - no auth → 401', async () => {
    const res = await request(app).get('/transactions');
    expect(res.statusCode).toBe(401);
  });

  // ── UT-59
  test('UT-53 | Get transactions - with auth → 200', async () => {
    const res = await request(app)
      .get('/transactions')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalSpent).toBeDefined();
    expect(res.body.stats.totalEarned).toBeDefined();
    expect(res.body.stats.totalTransactions).toBeDefined();
  });

  // ── UT-60
  test('UT-54 | Filter by type=purchase → only purchases', async () => {
    const res = await request(app)
      .get('/transactions?type=purchase')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
    res.body.transactions.forEach(t => expect(t.type).toBe('purchase'));
  });

  // ── UT-61 
  test('UT-55 | COD purchase created a transaction', async () => {
    const res = await request(app)
      .get('/transactions?type=purchase')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    // UT-49 COD created a purchase transaction — should be at least 1
    expect(res.body.transactions.length).toBeGreaterThan(0);
    expect(res.body.transactions[0].type).toBe('purchase');
    expect(res.body.transactions[0].amount).toBeLessThan(0); // spent = negative
  });

  // ── UT-62
  test('UT-56 | Filter by type=sale → only sales', async () => {
    const res = await request(app)
      .get('/transactions?type=sale')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    res.body.transactions.forEach(t => expect(t.type).toBe('sale'));
  });

  // ── UT-63
  test('UT-57 | Stats: totalSpent reflects COD purchase', async () => {
    const res = await request(app)
      .get('/transactions')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.stats.totalSpent).toBeGreaterThan(0);
  });

});