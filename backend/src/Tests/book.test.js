import request from 'supertest';
import app from '../index.js';

let cookie = '';
let bookId = '';

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

describe('UT: Book Controller', () => {

  test('UT-07: Get all books — anyone can view', async () => {
    const res = await request(app).get('/books');
    console.log('UT-07:', res.statusCode, 'Type:', Array.isArray(res.body) ? 'array' : typeof res.body);
    expect(res.statusCode).toBe(200);
  });

  test('UT-08: Add book WITHOUT login — must be blocked', async () => {
    const res = await request(app).post('/books').send({
      title: 'Hacker Book',
      author: 'No Auth',
      type: 'Sell',
      price: '100'
    });
    console.log('UT-08:', res.statusCode, res.body.message);
    expect([401, 403]).toContain(res.statusCode);
  });

  test('UT-09: Add book WITH login — should succeed', async () => {
    const res = await request(app)
      .post('/books')
      .set('Cookie', cookie)
      .send({
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        category: 'Fiction',
        type: 'Sell',          // ← capital S
        price: '350',          // ← string not number
        description: 'A story about following dreams',
        badge: 'Good',
        level: 'Bachelor'
      });
    console.log('UT-09:', res.statusCode, res.body.message || res.body.msg);
    bookId = res.body._id || res.body.book?._id || '';
    console.log('Book ID saved:', bookId || 'none');
    expect([200, 201]).toContain(res.statusCode);
  });

  test('UT-10: Get single book by ID', async () => {
    if (!bookId) { console.log('UT-10: Skipped — UT-09 must pass first'); return; }
    const res = await request(app).get(`/books/${bookId}`);
    console.log('UT-10:', res.statusCode);
    expect(res.statusCode).toBe(200);
  });

  test('UT-11: Delete book with login', async () => {
    if (!bookId) { console.log('UT-11: Skipped — UT-09 must pass first'); return; }
    const res = await request(app)
      .delete(`/books/${bookId}`)
      .set('Cookie', cookie);
    console.log('UT-11:', res.statusCode, res.body.message || res.body.msg);
    expect([200, 204]).toContain(res.statusCode);
  });

});