import { Wishlist } from '../models/wishlist.model.js';
import { Book }     from '../models/book.model.js';

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)   return `Saved ${Math.floor(s / 60)} min ago`;
  if (s < 86400)  return `Saved ${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `Saved ${Math.floor(s / 86400)} days ago`;
  return `Saved ${Math.floor(s / 604800)} weeks ago`;
};

const fmt = (w) => {
  const b = w.bookId;
  return {
    id:        w._id,
    bookId:    b._id,
    type:      b.type === 'Sell' ? 'Buy' : b.type,
    savedTime: timeAgo(w.createdAt),
    title:     b.title,
    author:    b.author ? `by ${b.author}` : '',
    price:     b.type === 'Exchange' ? 'For Exchange' : b.price,
    priceNote: b.type === 'Rent' ? '/month' : '',
    seller:    b.seller,
    img:       b.img || b.images?.[0] || '',
  };
};

// GET /wishlist
export const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.userId })
      .populate('bookId')
      .sort({ createdAt: -1 });
    res.json({ wishlist: items.map(fmt) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    const item = await Wishlist.create({ userId: req.userId, bookId });
    await item.populate('bookId');
    res.status(201).json({ item: fmt(item) });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ msg: 'Already saved' });
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /wishlist/:id
export const removeFromWishlist = async (req, res) => {
  try {
    const item = await Wishlist.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    await item.deleteOne();
    res.json({ msg: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /wishlist/check/:bookId
export const checkWishlist = async (req, res) => {
  try {
    const item = await Wishlist.findOne({ userId: req.userId, bookId: req.params.bookId });
    res.json({ saved: !!item, id: item?._id || null });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};