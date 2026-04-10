import request from 'supertest';
import app from '../index.js';

let cookie = '';
let bookId = '';

describe('ST: System Tests — Full BookHive Flows', () => {

  test('ST-01: API health check', async () => {
    const res = await request(app).get('/');
    console.log('ST-01:', res.statusCode, res.text);
    expect(res.statusCode).toBe(200);
  });

  test('ST-02: Admin user logs in successfully', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'aaishmamanandhar023@gmail.com',
      password: 'Aaishma@123'   // ← your real password
    });
    const cookieHeader = res.headers['set-cookie'];
    cookie = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader || '';
    console.log('ST-02:', res.statusCode, 'Cookie:', cookie ? 'SET ✓' : 'NOT SET ✗');
    expect([200, 201]).toContain(res.statusCode);
  });

  test('ST-03: Anyone can browse books without login', async () => {
    const res = await request(app).get('/books');
    console.log('ST-03:', res.statusCode);
    expect(res.statusCode).toBe(200);
  });

  test('ST-04: Logged-in user can add a book', async () => {
    const res = await request(app)
      .post('/books')
      .set('Cookie', cookie)
      .send({
        title: 'System Test Book',
        author: 'Auto Tester',
        category: 'Fiction',
        type: 'Sell',          // ← capital S, matches enum exactly
        price: '100',          // ← string, matches model
        description: 'Created during system test',
        badge: 'Good',
        level: 'Bachelor'
      });
    bookId = res.body._id || res.body.book?._id || '';
    console.log('ST-04:', res.statusCode, res.body.message || res.body.msg);
    console.log('BookId:', bookId || 'not captured');
    expect([200, 201]).toContain(res.statusCode);
  });

  test('ST-05: Wishlist blocked for unauthenticated user', async () => {
    const res = await request(app).get('/wishlist');
    console.log('ST-05:', res.statusCode);
    expect([401, 403]).toContain(res.statusCode);
  });

  test('ST-06: Wishlist accessible for logged-in user', async () => {
    const res = await request(app)
      .get('/wishlist')
      .set('Cookie', cookie);
    console.log('ST-06:', res.statusCode);
    expect([200, 404]).toContain(res.statusCode);
  });

  test('ST-07: Admin route blocked for student user', async () => {
    const loginRes = await request(app).post('/auth/login').send({
      email: 'ujjwalpatel1246@gmail.com',
      password: 'Ujjwal@123'   // ← Ujjwal's real password
    });
    const studentCookie = loginRes.headers['set-cookie']?.join('; ') || '';
    const res = await request(app)
      .get('/admin/users')
      .set('Cookie', studentCookie);
    console.log('ST-07:', res.statusCode, res.body.message);
    expect([401, 403]).toContain(res.statusCode);
  });

  test('ST-08: Book deleted and confirmed removed', async () => {
    if (!bookId) { console.log('ST-08: Skipped — ST-04 must pass first'); return; }
    await request(app)
      .delete(`/books/${bookId}`)
      .set('Cookie', cookie);
    const confirmRes = await request(app).get(`/books/${bookId}`);
    console.log('ST-08:', confirmRes.statusCode);
    expect([404, 400]).toContain(confirmRes.statusCode);
  });

});