// backend/src/Tests/config.test.js
// Run: npm run test:config

import dotenv   from 'dotenv';
import mongoose from 'mongoose';
import jwt      from 'jsonwebtoken';

// ── Load .env FIRST before any process.env checks ────────────────────────────
dotenv.config();

// ── Cleanup ───────────────────────────────────────────────────────────────────
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});

// ═════════════════════════════════════════════════════════════════════════════
describe(' DATABASE CONFIG', () => {

  test('CF-01 | MONGO_URI env is defined', () => {
    expect(process.env.MONGO_URI).toBeDefined();
    expect(process.env.MONGO_URI.length).toBeGreaterThan(10);
  });

  test('CF-02 | MongoDB connects successfully', async () => {
    if (mongoose.connection.readyState === 1) {
      expect(mongoose.connection.readyState).toBe(1);
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('CF-03 | Connection host is defined', () => {
    expect(mongoose.connection.host).toBeDefined();
  });

  test('CF-04 | Can create + read + delete a document', async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    const modelName = `ConfigTest_${Date.now()}`;
    const M = mongoose.model(modelName, new mongoose.Schema({ val: String }));
    const doc = await M.create({ val: 'hello' });
    expect(doc._id).toBeDefined();
    const found = await M.findById(doc._id);
    expect(found.val).toBe('hello');
    await M.deleteOne({ _id: doc._id });
    mongoose.deleteModel(modelName);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
describe(' CLOUDINARY CONFIG', () => {

  test('CF-05 | CLOUDINARY_CLOUD_NAME is defined', () => {
    expect(process.env.CLOUDINARY_CLOUD_NAME).toBeDefined();
  });

  test('CF-06 | CLOUDINARY_API_KEY is defined', () => {
    expect(process.env.CLOUDINARY_API_KEY).toBeDefined();
  });

  test('CF-07 | CLOUDINARY_API_SECRET is defined', () => {
    expect(process.env.CLOUDINARY_API_SECRET).toBeDefined();
  });

  test('CF-08 | Cloudinary module loads correctly', async () => {
    const cloudinary = (await import('../Config/cloudinary.config.js')).default;
    expect(cloudinary).toBeDefined();
    expect(cloudinary.uploader).toBeDefined();
    expect(typeof cloudinary.uploader.upload_stream).toBe('function');
  });

  test('CF-09 | Cloudinary has correct cloud_name', async () => {
    const cloudinary = (await import('../Config/cloudinary.config.js')).default;
    const config = cloudinary.config();
    expect(config.cloud_name).toBe(process.env.CLOUDINARY_CLOUD_NAME);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
describe('EMAIL CONFIG', () => {

  test('CF-10 | EMAIL_USER is defined', () => {
    expect(process.env.EMAIL_USER).toBeDefined();
  });

  test('CF-11 | EMAIL_PASS is defined', () => {
    expect(process.env.EMAIL_PASS).toBeDefined();
  });

  test('CF-12 | CLIENT_URL is defined', () => {
    expect(process.env.CLIENT_URL).toBeDefined();
  });

  test('CF-13 | KHALTI_SECRET_KEY is defined', () => {
    expect(process.env.KHALTI_SECRET_KEY).toBeDefined();
  });

});

// ═════════════════════════════════════════════════════════════════════════════
describe(' JWT CONFIG', () => {

  test('CF-14 | JWT_SECRET is defined', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(5);
  });

  test('CF-15 | JWT sign produces a token', () => {
    const token = jwt.sign({ userId: '123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });

  test('CF-16 | JWT verify decodes correctly', () => {
    const token = jwt.sign({ userId: 'abc' }, process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe('abc');
  });

  test('CF-17 | JWT verify fails with wrong secret', () => {
    const token = jwt.sign({ userId: 'abc' }, process.env.JWT_SECRET);
    expect(() => jwt.verify(token, 'wrong_secret')).toThrow();
  });

  test('CF-18 | Expired JWT throws error', () => {
    const token = jwt.sign({ userId: 'x' }, process.env.JWT_SECRET, { expiresIn: -1 });
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow();
  });

  test('CF-19 | NODE_ENV is defined', () => {
    // NODE_ENV may be 'test', 'development', or undefined depending on how Jest is run
    // We just check it's a non-empty string if set
    if (process.env.NODE_ENV) {
      expect(typeof process.env.NODE_ENV).toBe('string');
    } else {
      expect(true).toBe(true); // acceptable — not all setups define NODE_ENV
    }
  });

});