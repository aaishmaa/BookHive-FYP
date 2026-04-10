import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating:   { type: Number, min: 1, max: 5, required: true },
  text:     { type: String, required: true, trim: true },
}, { timestamps: true });

// One review per user per book
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);