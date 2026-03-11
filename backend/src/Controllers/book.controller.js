import { Book } from '../models/book.model.js';

// ── GET /books — all books (with optional filters) ────────────────────────────
export const getBooks = async (req, res) => {
  try {
    const { type, search, category } = req.query;
    const query = {};

    if (type)     query.type     = type;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title:  { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { seller: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json({ books });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// ── GET /books/my — only the logged-in user's books ───────────────────────────
export const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ books });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// ── GET /books/:id — single book ──────────────────────────────────────────────
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    res.json({ book });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// ── POST /books — create a new listing ───────────────────────────────────────
export const createBook = async (req, res) => {
  try {
    const { title, author, category, price, type, badge, description, seller } = req.body;

    // Cloudinary URLs come from multer/cloudinary middleware as req.files
    const images = req.files?.map(f => f.path) || [];
    const img    = images[0] || '';

    const book = await Book.create({
      userId: req.userId,
      seller,
      title,
      author,
      category,
      price,
      type,
      badge,
      description,
      images,
      img,
    });

    res.status(201).json({ book });
  } catch (err) {
    res.status(500).json({ msg: 'Error creating listing' });
  }
};

// ── DELETE /books/:id — delete own listing ────────────────────────────────────
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book)                          return res.status(404).json({ msg: 'Book not found' });
    if (book.userId.toString() !== req.userId) return res.status(403).json({ msg: 'Not authorized' });

    await book.deleteOne();
    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};