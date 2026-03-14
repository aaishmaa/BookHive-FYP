import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
}, { timestamps: true });

// Prevent duplicate saves
wishlistSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);