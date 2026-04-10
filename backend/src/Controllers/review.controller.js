import { Review } from '../Models/review.model.js';

// ── GET /reviews/:bookId ──────────────────────────────────────────────────────
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── POST /reviews/:bookId ─────────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating || !text?.trim()) return res.status(400).json({ msg: 'Rating and text are required' });

    const existing = await Review.findOne({ bookId: req.params.bookId, userId: req.userId });
    if (existing) return res.status(400).json({ msg: 'You already reviewed this book' });

    const review = await Review.create({
      bookId:   req.params.bookId,
      userId:   req.userId,
      userName: req.userName,
      rating,
      text: text.trim(),
    });
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── DELETE /reviews/:reviewId ─────────────────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ msg: 'Review not found' });
    if (review.userId.toString() !== req.userId) return res.status(403).json({ msg: 'Not authorized' });
    await review.deleteOne();
    res.json({ msg: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};