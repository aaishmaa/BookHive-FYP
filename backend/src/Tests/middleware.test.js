// backend/src/Tests/middleware.test.js
// Run: npm run test:middleware

import { jest } from '@jest/globals';
import request  from 'supertest';
import app      from '../index.js';
import mongoose from 'mongoose';
import jwt      from 'jsonwebtoken';

// ── Mock email ────────────────────────────────────────────────────────────────
jest.mock('../mail/email.js', () => ({
  sendVerificationEmail:         jest.fn().mockResolvedValue(true),
  sendWelcomeEmail:              jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail:        jest.fn().mockResolvedValue(true),
  sendPasswordResetSuccessEmail: jest.fn().mockResolvedValue(true),
}));

// ── Shared state ──────────────────────────────────────────────────────────────
let cookie      = '';
let adminCookie = '';
let userId      = '';

const testUser = {
  name:     'MW Tester',
  email:    `mw_${Date.now()}@test.com`,
  password: 'Test@1234',
};

const adminUser = {
  name:     'MW Admin',
  email:    `mwa_${Date.now()}@test.com`,
  password: 'Test@1234',
};

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  const { User } = await import('../models/user.model.js');
  const bcrypt   = await import('bcryptjs');

  // 1. Create student user via signup
  await request(app).post('/auth/signup').send(testUser);
  const u = await User.findOneAndUpdate(
    { email: testUser.email },
    { isVerfied: true },
    { new: true }
  );
  if (!u) throw new Error(`Student user not found after signup: ${testUser.email}`);
  userId = u._id.toString();

  // 2. Create admin user directly in DB (signup always sets role: 'student')
  const hashed = await bcrypt.default.hash(adminUser.password, 10);
  await User.create({
    name:      adminUser.name,
    email:     adminUser.email,
    password:  hashed,
    role:      'admin',
    isVerfied: true,
  });

  // 3. Login both users
  const r1 = await request(app).post('/auth/login').send({
    email:    testUser.email,
    password: testUser.password,
  });
  if (!r1.headers['set-cookie']) {
    console.error('❌ Student login failed:', r1.statusCode, r1.body);
    throw new Error('Student login failed');
  }
  cookie = r1.headers['set-cookie'][0].split(';')[0];

  const r2 = await request(app).post('/auth/login').send({
    email:    adminUser.email,
    password: adminUser.password,
  });
  if (!r2.headers['set-cookie']) {
    console.error('❌ Admin login failed:', r2.statusCode, r2.body);
    throw new Error('Admin login failed');
  }
  adminCookie = r2.headers['set-cookie'][0].split(';')[0];
});

// ── Cleanup ───────────────────────────────────────────────────────────────────
afterAll(async () => {
  const { User } = await import('../models/user.model.js');
  await User.deleteOne({ email: testUser.email });
  await User.deleteOne({ email: adminUser.email });
  await mongoose.connection.close();
});

// ═════════════════════════════════════════════════════════════════════════════
describe(' VERIFYTOKEN MIDDLEWARE', () => {

  // ── MW-01 ──────────────────────────────────────────────────────────────────
  test('MW-01 | No cookie → 401', async () => {
    const res = await request(app).get('/auth/check-auth');
    expect(res.statusCode).toBe(401);
  });

  // ── MW-02 ──────────────────────────────────────────────────────────────────
  test('MW-02 | Invalid token string → 401', async () => {
    const res = await request(app)
      .get('/auth/check-auth')
      .set('Cookie', 'token=thisisaninvalidtoken');
    expect(res.statusCode).toBe(401);
  });

  // ── MW-03 ──────────────────────────────────────────────────────────────────
  test('MW-03 | Expired token → 401', async () => {
    const expired = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: -1 }  // already expired
    );
    const res = await request(app)
      .get('/auth/check-auth')
      .set('Cookie', `token=${expired}`);
    expect(res.statusCode).toBe(401);
  });

  // ── MW-04 ──────────────────────────────────────────────────────────────────
  test('MW-04 | Token with wrong secret → 401', async () => {
    const bad = jwt.sign({ userId }, 'totally_wrong_secret');
    const res = await request(app)
      .get('/auth/check-auth')
      .set('Cookie', `token=${bad}`);
    expect(res.statusCode).toBe(401);
  });

  // ── MW-05 ──────────────────────────────────────────────────────────────────
  test('MW-05 | Valid token → 200', async () => {
    const res = await request(app)
      .get('/auth/check-auth')
      .set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
  });

  // ── MW-06 ──────────────────────────────────────────────────────────────────
  test('MW-06 | Valid token on /books → 200', async () => {
    const res = await request(app).get('/books').set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
  });

  // ── MW-07 ──────────────────────────────────────────────────────────────────
  test('MW-07 | Valid token on /wishlist → 200', async () => {
    const res = await request(app).get('/wishlist').set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
  });

  // ── MW-08 ──────────────────────────────────────────────────────────────────
  test('MW-08 | Valid token on /transactions → 200', async () => {
    const res = await request(app).get('/transactions').set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
  });

  // ── MW-09 ──────────────────────────────────────────────────────────────────
  test('MW-09 | Valid token on /notifications → 200', async () => {
    const res = await request(app).get('/notifications').set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
describe(' ISADMIN MIDDLEWARE', () => {

  // ── MW-10 ──────────────────────────────────────────────────────────────────
  test('MW-10 | Student → /admin/stats → 403', async () => {
    const res = await request(app).get('/admin/stats').set('Cookie', cookie);
    expect(res.statusCode).toBe(403);
  });

  // ── MW-11 ──────────────────────────────────────────────────────────────────
  test('MW-11 | Admin → /admin/stats → 200', async () => {
    const res = await request(app).get('/admin/stats').set('Cookie', adminCookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.totalUsers).toBeDefined();
  });

  // ── MW-12 ──────────────────────────────────────────────────────────────────
  test('MW-12 | Student → /admin/users → 403', async () => {
    const res = await request(app).get('/admin/users').set('Cookie', cookie);
    expect(res.statusCode).toBe(403);
  });

  // ── MW-13 ──────────────────────────────────────────────────────────────────
  test('MW-13 | Admin → /admin/users → 200', async () => {
    const res = await request(app).get('/admin/users').set('Cookie', adminCookie);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  // ── MW-14 ──────────────────────────────────────────────────────────────────
  test('MW-14 | No cookie → /admin/stats → 401', async () => {
    const res = await request(app).get('/admin/stats');
    expect(res.statusCode).toBe(401);
  });

});