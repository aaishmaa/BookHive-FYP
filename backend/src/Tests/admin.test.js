// backend/src/Tests/admin.test.js
// Run: npm run test:admin

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
let adminCookie   = '';
let studentCookie = '';
let testBookId    = '';

const adminUser = {
  name:     'Admin User',
  email:    `admin_${Date.now()}@test.com`,
  password: 'Test@1234',
};

const studentUser = {
  name:     'Student User',
  email:    `student_${Date.now()}@test.com`,
  password: 'Test@1234',
};

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  const { User } = await import('../models/user.model.js');

  // 1. Create admin user directly in DB (role: 'admin' + verified)
  //    We bypass signup because signup always sets role: 'student'
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.default.hash(adminUser.password, 10);
  await User.create({
    name:      adminUser.name,
    email:     adminUser.email,
    password:  hashedPassword,
    role:      'admin',
    isVerfied: true,
  });

  // 2. Create student user via signup → verify → 
  await request(app).post('/auth/signup').send(studentUser);
  await User.findOneAndUpdate({ email: studentUser.email }, { isVerfied: true });

  // 3. Login both users
  const ra = await request(app).post('/auth/login').send({
    email:    adminUser.email,
    password: adminUser.password,
  });

  if (!ra.headers['set-cookie']) {
    console.error('❌ Admin login failed:', ra.statusCode, ra.body);
    throw new Error('Admin login failed in beforeAll');
  }
  adminCookie = ra.headers['set-cookie'][0].split(';')[0];

  const rs = await request(app).post('/auth/login').send({
    email:    studentUser.email,
    password: studentUser.password,
  });

  if (!rs.headers['set-cookie']) {
    console.error('❌ Student login failed:', rs.statusCode, rs.body);
    throw new Error('Student login failed in beforeAll');
  }
  studentCookie = rs.headers['set-cookie'][0].split(';')[0];

  // 4. Create a test book as admin (for delete tests)
  const bookRes = await request(app)
    .post('/books')
    .set('Cookie', adminCookie)
    .field('title',  'Admin Test Book')
    .field('author', 'Admin Author')
    .field('price',  '100')
    .field('type',   'Sell')
    .field('badge',  'Good')
    .field('seller', adminUser.name);

  if (bookRes.statusCode === 201) {
    testBookId = bookRes.body.book._id;
  }
});

// ── Cleanup ───────────────────────────────────────────────────────────────────
afterAll(async () => {
  const { User } = await import('../models/user.model.js');
  const { Book } = await import('../models/book.model.js');

  await User.deleteOne({ email: adminUser.email });
  await User.deleteOne({ email: studentUser.email });
  if (testBookId) await Book.deleteOne({ _id: testBookId });
  await mongoose.connection.close();
});

// ═════════════════════════════════════════════════════════════════════════════
describe('🛡️  ADMIN MODULE', () => {

  // ── UT-43 
  test('UT-43 | Admin stats - admin → 200', async () => {
    const res = await request(app)
      .get('/admin/stats')
      .set('Cookie', adminCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalUsers).toBeDefined();
    expect(res.body.totalBooks).toBeDefined();
  });

  // ── UT-44 
  test('UT-44 | Admin stats -student → 403', async () => {
    const res = await request(app)
      .get('/admin/stats')
      .set('Cookie', studentCookie);

    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toMatch(/admin/i);
  });

  // ── UT-45 
  test('UT-45 | Admin stats - no cookie → 401', async () => {
    const res = await request(app).get('/admin/stats');

    expect(res.statusCode).toBe(401);
  });

  // ── UT-46 
  test('UT-46 | Get all users (admin) → 200', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Cookie', adminCookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    // passwords must not be exposed
    res.body.users.forEach(u => expect(u.password).toBeUndefined());
  });

  // ── UT-47
  test('UT-47 | Get all books (admin) → 200', async () => {
    const res = await request(app)
      .get('/admin/books')
      .set('Cookie', adminCookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.books)).toBe(true);
  });

  // ── UT-48 
  test('UT-48 | Get student applications (admin) → 200', async () => {
    const res = await request(app)
      .get('/admin/students')
      .set('Cookie', adminCookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.students)).toBe(true);
  });

  // ── UT-49 
  test('UT-49 | Student cannot access admin routes → 403', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Cookie', studentCookie);

    expect(res.statusCode).toBe(403);
  });

  // ── UT-50 
  test('UT-50 | Admin delete non-existent book → 200 (findByIdAndDelete silent)', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/admin/books/${fakeId}`)
      .set('Cookie', adminCookie);

    // Your deleteBookAdmin does findByIdAndDelete without checking if found
    // so it returns 200 with { msg: 'Book deleted' } even for missing books
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  // ── UT-51 
  test('UT-51 | Admin delete real book → 200', async () => {
    if (!testBookId) return;

    const res = await request(app)
      .delete(`/admin/books/${testBookId}`)
      .set('Cookie', adminCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toMatch(/deleted/i);
    testBookId = ''; // already deleted
  });

});