import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Who is involved
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // the viewer
  counterpart: { type: String, default: '' },  // other person's name

  // Book info
  bookId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  bookTitle: { type: String, required: true },

  // Transaction details
  type:   { type: String, enum: ['purchase', 'sale', 'rental', 'exchange'], required: true },
  amount: { type: Number, required: true },  // positive = earned, negative = spent
  status: { type: String, enum: ['Completed', 'Pending', 'Cancelled'], default: 'Pending' },

  // Reference to request if any
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
}, { timestamps: true });

export const Transaction = mongoose.models.Transaction ||
  mongoose.model('Transaction', transactionSchema);