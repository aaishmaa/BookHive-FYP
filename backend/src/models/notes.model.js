import mongoose from 'mongoose';

const notesSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller:    { type: String, required: true },
  title:     { type: String, required: true },
  category:  { type: String, required: true },
  level:     { type: String, default: '' },
  classYear: { type: String, default: '' },
  fileUrl:   { type: String, required: true },
  downloads: { type: Number, default: 0 },
  likes:     { type: Number, default: 0 },
  comments:  { type: Number, default: 0 },
}, { timestamps: true });

export const Notes = mongoose.model('Notes', notesSchema);