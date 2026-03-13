import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller:      { type: String, default: "Unknown" },
  title:       { type: String, required: true },
  author:      { type: String, default: "" },
  level:       { type: String, enum: ['School', 'High School (+2)', 'Bachelor', ''], default: "" },
  classYear:   { type: String, default: "" },
  category:    { type: String, default: "" },
  price:       { type: String, required: true },
  type:        { type: String, enum: ['Sell', 'Rent', 'Exchange'], required: true },
  badge:       { type: String, enum: ['Like New', 'Very Good', 'Good', 'Fair', 'Acceptable'] },
  description: { type: String, default: "" },
  images:      [{ type: String }],
  img:         { type: String, default: "" },
  likes:       { type: Number, default: 0 },
  comments:    { type: Number, default: 0 },
  views:       { type: Number, default: 0 },
  enquiries:   { type: Number, default: 0 },
  status:      { type: String, enum: ['Active', 'Sold', 'Expired', 'Disabled'], default: 'Active' },
}, { timestamps: true });

export const Book = mongoose.model('Book', bookSchema);