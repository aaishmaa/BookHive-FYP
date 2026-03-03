import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller:   { type: String, required: true },
  title:    { type: String, required: true },
  author:   { type: String },
  category: { type: String },
  price:    { type: String, required: true },
  type:     { type: String, enum: ['Sell', 'Rent', 'Exchange'], required: true },
  badge:    { type: String, enum: ['Like New', 'Very Good', 'Good', 'Fair', 'Acceptable'] },
  description: { type: String },
  images:   [{ type: String }],   // array of Cloudinary URLs
  img:      { type: String },     // main image (first one)
  likes:    { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
}, { timestamps: true });

export const Book = mongoose.model('Book', bookSchema);