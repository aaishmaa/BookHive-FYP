import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  fromUserId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromUserName: { type: String, required: true },
  toUserId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTitle:    { type: String, required: true },
  bookImg:      { type: String, default: '' },
  type:         { type: String, enum: ['Exchange', 'Borrow', 'Buy'], required: true },
  offer:        { type: String, default: '' },   // offerTitle or returnBy string
  returnBy:     { type: Date },
  message:      { type: String, default: '' },
  status:       { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
}, { timestamps: true });

export const Request = mongoose.model('Request', requestSchema);