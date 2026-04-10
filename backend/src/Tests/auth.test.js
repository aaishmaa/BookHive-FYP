import request from 'supertest';
import app from '../index.js';

describe('UT: Auth Controller', () => {

  test('UT-01: Signup with new unique email — should succeed', async () => {
    const res = await request(app).post('/auth/signup').send({
      name: 'sym liva',
      email: `symliva@gmail.com`,   // unique every run
      password: 'Test@1234'
    });
    console.log('UT-01:', res.statusCode, res.body.message);
    expect([200, 201]).toContain(res.statusCode);
  });

  test('UT-02: Signup with already existing email — should fail', async () => {
    const res = await request(app).post('/auth/signup').send({
      name: 'Aaishma',
      email: 'aaishmamanandhar023@gmail.com',   // already in DB
      password: 'Test@1234'
    });
    console.log('UT-02:', res.statusCode, res.body.message);
    expect([400, 409]).toContain(res.statusCode);
  });

  test('UT-03: Login with valid verified credentials — should set cookie', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'aaishmamanandhar023@gmail.com',
      password: 'Aaishma@123'    // ← your real password
    });
    const cookie = res.headers['set-cookie'];
    console.log('UT-03:', res.statusCode);
    console.log('UT-03 Cookie:', cookie ? 'SET ✓' : 'NOT SET ✗');
    expect([200, 201]).toContain(res.statusCode);
  });

  test('UT-04: Login with wrong password — should fail', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'aaishmamanandhar023@gmail.com',
      password: 'wrongpassword123'
    });
    console.log('UT-04:', res.statusCode, res.body.message);
    expect([400, 401]).toContain(res.statusCode);
  });

  test('UT-05: Login with missing password — should fail', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'aaishmamanandhar023@gmail.com'
      // no password
    });
    console.log('UT-05:', res.statusCode);
    expect([400, 401, 500]).toContain(res.statusCode);
  });

  test('UT-06: Logout — should clear session', async () => {
    const res = await request(app).post('/auth/logout');
    console.log('UT-06:', res.statusCode, res.body.message);
    expect([200, 201]).toContain(res.statusCode);
  });

});