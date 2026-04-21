// backend/src/Tests/controllers.test.js

import request  from 'supertest';
import app      from '../index.js';
import mongoose from 'mongoose';
import fs       from 'fs';
import os       from 'os';
import path     from 'path';

let cookie1 = '', cookie2 = '', adminCookie = '';
let bookId  = '', reqId   = '';

const user1 = { name: 'CT User1', email: `ct1_${Date.now()}@test.com`, password: 'Test@1234' };
const user2 = { name: 'CT User2', email: `ct2_${Date.now()}@test.com`, password: 'Test@1234' };
const admin = { name: 'CT Admin', email: `cta_${Date.now()}@test.com`, password: 'Test@1234' };

const pngBuf = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// ✅ Use os.tmpdir() so it works on both Windows and Linux
const tmpFile = path.join(os.tmpdir(), 'ct_test.png');

async function setup(u, role = 'student') {
  // ✅ changed /auth/register → /auth/signup
  await request(app).post('/auth/signup').send(u);
  const { User } = await import('../models/user.model.js');
  await User.findOneAndUpdate({ email: u.email }, { isVerfied: true, role });
  const res = await request(app).post('/auth/login').send(u);
  return res.headers['set-cookie']?.[0]?.split(';')[0] || '';
}

beforeAll(async () => {
  cookie1     = await setup(user1);
  cookie2     = await setup(user2);
  adminCookie = await setup(admin, 'admin');

  // ✅ Write to OS temp dir (works on Windows)
  fs.writeFileSync(tmpFile, pngBuf);
  const br = await request(app).post('/books').set('Cookie', cookie1)
    .attach('images', tmpFile)
    .field('title',     'CT Test Book')
    .field('type',      'Sell')
    .field('price',     'Rs.300')
    .field('category',  'Science')
    .field('level',     'Bachelor')
    .field('classYear', '1st Year')
    .field('badge',     'Good')
    .field('seller',    user1.name);

  bookId = br.body.book?._id || '';

  // ✅ Clean up temp file safely
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
});

afterAll(async () => {
  const { User }    = await import('../models/user.model.js');
  const { Book }    = await import('../models/book.model.js');
  const { Request } = await import('../models/request.model.js');

  // ✅ Only delete if bookId is a valid ObjectId string
  if (bookId && mongoose.Types.ObjectId.isValid(bookId)) {
    await Request.deleteMany({ bookId });
    await Book.deleteMany({ seller: user1.name });
  }

  await User.deleteOne({ email: user1.email });
  await User.deleteOne({ email: user2.email });
  await User.deleteOne({ email: admin.email });
  await mongoose.connection.close();
});

// ════════════════════════════════════════════════════════
describe(' AUTH CONTROLLER', () => {

  test('CT-01 | Register returns user without password', async () => {
    const email = `ct_new_${Date.now()}@test.com`;
    const r = await request(app).post('/auth/signup')
      .send({ name: 'New CT', email, password: 'Test@1234' });
    expect(r.statusCode).toBe(201);
    expect(r.body.user.email).toBe(email);
    expect(r.body.user.password).toBeUndefined();
    const { User } = await import('../models/user.model.js');
    await User.deleteOne({ email });
  });

  test('CT-02 | Login response has no password field', async () => {
    const r = await request(app).post('/auth/login').send(user1);
    expect(r.statusCode).toBe(200);
    expect(r.body.user.password).toBeUndefined();
  });

  test('CT-03 | Check-auth returns correct user email', async () => {
    const r = await request(app).get('/auth/check-auth').set('Cookie', cookie1);
    expect(r.body.user.email).toBe(user1.email);
  });
});

// ════════════════════════════════════════════════════════
describe('BOOK CONTROLLER', () => {

  test('CT-04 | Uploaded book appears in /books/my', async () => {
    const r = await request(app).get('/books/my').set('Cookie', cookie1);
    expect(r.statusCode).toBe(200);
    const found = r.body.books.some(b => b.title === 'CT Test Book');
    expect(found).toBe(true);
  });

  test('CT-05 | Filter type=Sell returns only Sell books', async () => {
    const r = await request(app).get('/books?type=Sell').set('Cookie', cookie1);
    r.body.books.forEach(b => expect(b.type).toBe('Sell'));
  });

  test('CT-06 | User2 cannot delete user1 book → 403', async () => {
    if (!bookId) return;
    const r = await request(app).delete(`/books/${bookId}`).set('Cookie', cookie2);
    expect(r.statusCode).toBe(403);
  });

  test('CT-07 | Book detail has correct title and seller', async () => {
    if (!bookId) return;
    const r = await request(app).get(`/books/${bookId}`).set('Cookie', cookie1);
    expect(r.statusCode).toBe(200);
    expect(r.body.book.title).toBe('CT Test Book');
    expect(r.body.book.seller).toBe(user1.name);
  });
});

// ════════════════════════════════════════════════════════
describe('REQUEST CONTROLLER', () => {

  test('CT-08 | User2 sends request to user1 book', async () => {
    if (!bookId) return;
    const r = await request(app).post('/requests').set('Cookie', cookie2)
      .send({ bookId, type: 'Exchange',
              offerBookTitle: 'My Book', senderName: user2.name });
    expect([200, 201]).toContain(r.statusCode);
    reqId = r.body.request?._id || '';
  });

  test('CT-09 | Owner sees request in /requests', async () => {
    const r = await request(app).get('/requests').set('Cookie', cookie1);
    expect(r.statusCode).toBe(200);
    expect(Array.isArray(r.body.requests)).toBe(true);
  });

  test('CT-10 | User1 cannot request own book → 400', async () => {
    if (!bookId) return;
    const r = await request(app).post('/requests').set('Cookie', cookie1)
      .send({ bookId, type: 'Exchange', senderName: user1.name });
    expect(r.statusCode).toBe(400);
  });

  test('CT-11 | User1 accepts request → Accepted', async () => {
    if (!reqId) return;
    const r = await request(app).patch(`/requests/${reqId}`)
      .set('Cookie', cookie1).send({ status: 'Accepted' });
    expect(r.statusCode).toBe(200);
    expect(r.body.request.status).toBe('Accepted');
  });
});

// ════════════════════════════════════════════════════════
describe('PROFILE CONTROLLER', () => {

  test('CT-12 | GET /profile/me returns logged user', async () => {
    const r = await request(app).get('/profile/me').set('Cookie', cookie1);
    expect(r.statusCode).toBe(200);
    expect(r.body.user.email).toBe(user1.email);
    expect(r.body.user.password).toBeUndefined();
  });

  test('CT-13 | PATCH /profile/me updates bio', async () => {
    const r = await request(app).patch('/profile/me').set('Cookie', cookie1)
      .send({ bio: 'Controller test bio' });
    expect(r.statusCode).toBe(200);
    expect(r.body.user.bio).toBe('Controller test bio');
  });

  test('CT-14 | PATCH /profile/me cannot change email', async () => {
    await request(app).patch('/profile/me').set('Cookie', cookie1)
      .send({ email: 'hacked@test.com' });
    const check = await request(app).get('/profile/me').set('Cookie', cookie1);
    expect(check.body.user.email).toBe(user1.email);
  });
});

// ════════════════════════════════════════════════════════
describe(' ADMIN CONTROLLER', () => {

  test('CT-15 | Admin stats has totalUsers > 0', async () => {
    const r = await request(app).get('/admin/stats').set('Cookie', adminCookie);
    expect(r.statusCode).toBe(200);
    expect(r.body.totalUsers).toBeGreaterThan(0);
  });

  test('CT-16 | Admin users list contains test user', async () => {
    const r = await request(app).get('/admin/users').set('Cookie', adminCookie);
    const found = r.body.users.some(u => u.email === user1.email);
    expect(found).toBe(true);
  });

  test('CT-17 | Admin stats has totalBooks field', async () => {
    const r = await request(app).get('/admin/stats').set('Cookie', adminCookie);
    expect(typeof r.body.totalBooks).toBe('number');
  });
});

// ════════════════════════════════════════════════════════
describe('TRANSACTION CONTROLLER', () => {

  test('CT-18 | Transactions response has stats', async () => {
    const r = await request(app).get('/transactions').set('Cookie', cookie1);
    expect(r.statusCode).toBe(200);
    expect(r.body.stats).toBeDefined();
    expect(r.body.stats.totalSpent).toBeDefined();
    expect(r.body.stats.totalEarned).toBeDefined();
  });

  test('CT-19 | Filter type=sale returns only sales', async () => {
    const r = await request(app).get('/transactions?type=sale').set('Cookie', cookie1);
    expect(r.statusCode).toBe(200);
    r.body.transactions.forEach(t => expect(t.type).toBe('sale'));
  });
});

// ════════════════════════════════════════════════════════
describe(' NOTIFICATION CONTROLLER', () => {

  test('CT-20 | GET /notifications returns array', async () => {
    const r = await request(app).get('/notifications').set('Cookie', cookie1);
    expect(r.statusCode).toBe(200);
    expect(Array.isArray(r.body.notifications)).toBe(true);
  });
});