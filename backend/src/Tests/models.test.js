// backend/src/Tests/models.test.js
import 'dotenv/config';
import mongoose from 'mongoose';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ════════════════════════════════════════════════════════
describe(' USER MODEL', () => {
  let User;

  beforeAll(async () => {
    ({ User } = await import('../models/user.model.js'));
  });

  test('MT-01 | Valid user saves successfully', async () => {
    const u = await new User({
      name: 'Model Tester',
      email: `mt_${Date.now()}@test.com`,
      password: 'hashed123',
    }).save();
    expect(u._id).toBeDefined();
    expect(u.role).toBe('student');
    expect(u.isVerfied).toBe(false);
    await User.deleteOne({ _id: u._id });
  });

  test('MT-02 | Missing name → ValidationError', async () => {
    const u = new User({ email: 'noname@test.com', password: 'pass' });
    await expect(u.save()).rejects.toThrow();
  });

  test('MT-03 | Missing email → ValidationError', async () => {
    const u = new User({ name: 'No Email', password: 'pass' });
    await expect(u.save()).rejects.toThrow();
  });

  test('MT-04 | Missing password → ValidationError', async () => {
    const u = new User({ name: 'No Pass', email: 'nopass@test.com' });
    await expect(u.save()).rejects.toThrow();
  });

  test('MT-05 | Duplicate email → error', async () => {
    const email = `dup_${Date.now()}@test.com`;
    const u1 = await new User({ name: 'U1', email, password: 'p' }).save();
    const u2 = new User({ name: 'U2', email, password: 'p' });
    await expect(u2.save()).rejects.toThrow();
    await User.deleteOne({ _id: u1._id });
  });

  test('MT-06 | Default role = student', async () => {
    const u = await new User({
      name: 'Role Test',
      email: `role_${Date.now()}@test.com`,
      password: 'p',
    }).save();
    expect(u.role).toBe('student');
    await User.deleteOne({ _id: u._id });
  });

  test('MT-07 | Role can be set to admin', async () => {
    const u = await new User({
      name: 'Admin',
      email: `adm_${Date.now()}@test.com`,
      password: 'p',
      role: 'admin',
    }).save();
    expect(u.role).toBe('admin');
    await User.deleteOne({ _id: u._id });
  });

  test('MT-08 | createdAt timestamp exists', async () => {
    const u = await new User({
      name: 'Timestamp',
      email: `ts_${Date.now()}@test.com`,
      password: 'p',
    }).save();
    expect(u.createdAt).toBeDefined();
    await User.deleteOne({ _id: u._id });
  });
});

// ════════════════════════════════════════════════════════
describe(' BOOK MODEL', () => {
  let Book;
  const userId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    ({ Book } = await import('../models/book.model.js'));
  });

  test('MT-09 | Valid book saves successfully', async () => {
    const b = await new Book({
      userId, title: 'Test Book', type: 'Sell',
      price: 'Rs.200', category: 'Science',
      level: 'Bachelor', classYear: '1st Year',
      badge: 'Good', seller: 'Tester',
      images: ['http://img.com/1.jpg'],
    }).save();
    expect(b._id).toBeDefined();
    expect(b.status).toBe('Active');
    await Book.deleteOne({ _id: b._id });
  });

  test('MT-10 | Missing title → ValidationError', async () => {
    const b = new Book({ userId, type: 'Sell', price: 'Rs.100', seller: 'X' });
    await expect(b.save()).rejects.toThrow();
  });

  test('MT-11 | Invalid type → ValidationError', async () => {
    const b = new Book({
      userId, title: 'Bad Type', type: 'WrongType',
      price: 'Rs.100', category: 'Science', seller: 'X',
    });
    await expect(b.save()).rejects.toThrow();
  });

  test('MT-12 | Default status = Active', async () => {
    const b = await new Book({
      userId, title: 'Status Test', type: 'Exchange',
      price: 'For Exchange', category: 'IT', seller: 'X',
      level: 'Bachelor', classYear: '1st Year', badge: 'Good',
    }).save();
    expect(b.status).toBe('Active');
    await Book.deleteOne({ _id: b._id });
  });

  test('MT-13 | Status can be Sold', async () => {
    const b = await new Book({
      userId, title: 'Sold Book', type: 'Sell',
      price: 'Rs.100', category: 'IT', seller: 'X',
      status: 'Sold', level: 'Bachelor',
      classYear: '1st Year', badge: 'Good',
    }).save();
    expect(b.status).toBe('Sold');
    await Book.deleteOne({ _id: b._id });
  });
});

// ════════════════════════════════════════════════════════
describe(' REQUEST MODEL', () => {
  let Request;
  const bookId   = new mongoose.Types.ObjectId();
  const fromUserId = new mongoose.Types.ObjectId();
  const toUserId  = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    ({ Request } = await import('../models/request.model.js'));
  });

  test('MT-14 | Valid request saves', async () => {
    const r = await new Request({
      bookId,
      bookTitle:    'Test Book',
      fromUserId,
      fromUserName: 'User A',
      toUserId,
      type:         'Exchange',
    }).save();
    expect(r._id).toBeDefined();
    expect(r.status).toBe('Pending');
    await Request.deleteOne({ _id: r._id });
  });

  test('MT-15 | Default status = Pending', async () => {
    const r = await new Request({
      bookId,
      bookTitle:    'Test Book',
      fromUserId,
      fromUserName: 'User B',
      toUserId,
      type:         'Exchange',
    }).save();
    expect(r.status).toBe('Pending');
    await Request.deleteOne({ _id: r._id });
  });

  test('MT-16 | Invalid status → ValidationError', async () => {
    const r = new Request({
      bookId,
      bookTitle:    'Test Book',
      fromUserId,
      fromUserName: 'X',
      toUserId,
      type:         'Exchange',
      status:       'BadStatus',
    });
    await expect(r.save()).rejects.toThrow();
  });

  test('MT-17 | Missing bookId → ValidationError', async () => {
    const r = new Request({
      bookTitle:    'Test Book',
      fromUserId,
      fromUserName: 'X',
      toUserId,
      type:         'Exchange',
    });
    await expect(r.save()).rejects.toThrow();
  });
});
// ════════════════════════════════════════════════════════
describe(' REVIEW MODEL', () => {
  let Review;
  const bookId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    ({ Review } = await import('../models/review.model.js'));
  });

  test('MT-18 | Valid review saves', async () => {
    const r = await new Review({
      bookId, userId, userName: 'Reviewer',
      rating: 4, text: 'Great book!',
    }).save();
    expect(r._id).toBeDefined();
    expect(r.rating).toBe(4);
    await Review.deleteOne({ _id: r._id });
  });

  test('MT-19 | Rating above 5 → ValidationError', async () => {
    const r = new Review({
      bookId, userId, userName: 'X', rating: 6, text: 'Bad',
    });
    await expect(r.save()).rejects.toThrow();
  });

  test('MT-20 | Missing rating → ValidationError', async () => {
    const r = new Review({
      bookId, userId, userName: 'X', text: 'No rating',
    });
    await expect(r.save()).rejects.toThrow();
  });

  test('MT-21 | Duplicate review same user+book → error', async () => {
    const data = {
      bookId, userId, userName: 'U',
      rating: 3, text: 'OK',
    };
    const r1 = await new Review(data).save();
    const r2 = new Review(data);
    await expect(r2.save()).rejects.toThrow();
    await Review.deleteOne({ _id: r1._id });
  });
});

// ════════════════════════════════════════════════════════
describe(' TRANSACTION MODEL', () => {
  let Transaction;
  const userId = new mongoose.Types.ObjectId();
  const bookId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    ({ Transaction } = await import('../models/transaction.model.js'));
  });

  test('MT-22 | Valid transaction saves', async () => {
    const t = await new Transaction({
      userId, bookId, bookTitle: 'Buy Test',
      type: 'purchase', amount: -500, status: 'Completed',
    }).save();
    expect(t._id).toBeDefined();
    expect(t.status).toBe('Completed');
    await Transaction.deleteOne({ _id: t._id });
  });

  test('MT-23 | Invalid type → ValidationError', async () => {
    const t = new Transaction({
      userId, bookTitle: 'X', type: 'invalid', amount: 100,
    });
    await expect(t.save()).rejects.toThrow();
  });

  test('MT-24 | Default status = Pending', async () => {
    const t = await new Transaction({
      userId, bookTitle: 'Pending Test',
      type: 'sale', amount: 300,
    }).save();
    expect(t.status).toBe('Pending');
    await Transaction.deleteOne({ _id: t._id });
  });

  test('MT-25 | Missing bookTitle → ValidationError', async () => {
    const t = new Transaction({ userId, type: 'purchase', amount: 100 });
    await expect(t.save()).rejects.toThrow();
  });
});

// ════════════════════════════════════════════════════════
describe(' WISHLIST MODEL', () => {
  let Wishlist;
  const userId = new mongoose.Types.ObjectId();
  const bookId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    try {
      ({ Wishlist } = await import('../models/wishlist.model.js'));
    } catch {
      ({ Wishlist } = await import('../models/wishlist.model.js'));
    }
  });

  test('MT-26 | Valid wishlist entry saves', async () => {
    if (!Wishlist) return;
    const w = await new Wishlist({ userId, bookId }).save();
    expect(w._id).toBeDefined();
    await Wishlist.deleteOne({ _id: w._id });
  });

  test('MT-27 | Missing userId → ValidationError', async () => {
    if (!Wishlist) return;
    const w = new Wishlist({ bookId });
    await expect(w.save()).rejects.toThrow();
  });

  test('MT-28 | Missing bookId → ValidationError', async () => {
    if (!Wishlist) return;
    const w = new Wishlist({ userId });
    await expect(w.save()).rejects.toThrow();
  });
});