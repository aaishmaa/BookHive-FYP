import request from 'supertest';
import app from '../index.js';

let cookie = '';

beforeAll(async () => {
  const res = await request(app).post('/auth/login').send({
    email: 'aaishmamanandhar023@gmail.com',
    password: 'Aaishma@123'   // ← your real password
  });
  const cookieHeader = res.headers['set-cookie'];
  cookie = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader || '';
  console.log('Login status:', res.statusCode);
  console.log('Cookie:', cookie ? 'YES ✓' : 'NO ✗ — check password!');
});

describe('UT: Wishlist Controller', () => {

  test('UT-12: Access wishlist WITHOUT login — must be blocked', async () => {
    const res = await request(app).get('/wishlist');
    console.log('UT-12:', res.statusCode, res.body.message);
    expect([401, 403]).toContain(res.statusCode);
  });

  test('UT-13: Access wishlist WITH login — should be allowed', async () => {
    const res = await request(app)
      .get('/wishlist')
      .set('Cookie', cookie);
    console.log('UT-13:', res.statusCode, res.body.message);
    expect([200, 404]).toContain(res.statusCode);
  });

});