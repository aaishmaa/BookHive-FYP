import { Book } from '../models/book.model.js';

export const getBooks = async (req, res) => {
  try {
    const { type, search, category, level, classYear } = req.query;
    const query = { status: 'Active' };
    if (type)      query.type      = type;
    if (category)  query.category  = category;
    if (level)     query.level     = level;
    if (classYear) query.classYear = classYear;
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
    res.status(500).json({ msg: err.message });
  }
};

export const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ books });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    await Book.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ book });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const { title, author, level, classYear, category, price, type, badge, description, seller } = req.body;
    const images = req.files?.map(f => f.path) || [];
    const img    = images[0] || '';
    const book = await Book.create({
      userId: req.userId,
      seller: seller || 'Unknown',
      title, author,
      level:     level     || '',
      classYear: classYear || '',
      category:  category  || '',
      price, type, badge, description,
      images, img,
      status: 'Active',
    });
    res.status(201).json({ book });
  } catch (err) {
    console.error("❌ CREATE BOOK ERROR:", err.message);
    res.status(500).json({ msg: err.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book)                                 return res.status(404).json({ msg: 'Book not found' });
    if (book.userId.toString() !== req.userId) return res.status(403).json({ msg: 'Not authorized' });
    const allowed = ['status','price','title','author','description','category','badge','level','classYear'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const updated = await Book.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    res.json({ book: updated });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book)                                 return res.status(404).json({ msg: 'Book not found' });
    if (book.userId.toString() !== req.userId) return res.status(403).json({ msg: 'Not authorized' });
    await book.deleteOne();
    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};