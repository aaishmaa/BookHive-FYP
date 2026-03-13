import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  // Who sent the request
  fromUserId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromUserName: { type: String, required: true },

  // Who owns the book (receiver)
  toUserId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Which book is being requested
  bookId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTitle:    { type: String, required: true },

  // Request details
  type:         { type: String, enum: ['Exchange', 'Rent', 'Buy'], required: true },
  offer:        { type: String, required: true },   // "₹150/month" or "Organic Chemistry"
  status:       { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
}, { timestamps: true });

export const Request = mongoose.model('Request', requestSchema);