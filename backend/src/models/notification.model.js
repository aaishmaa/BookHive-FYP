import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:   { type: String, enum: ['message','sale','payment','review','like','comment','request','system'], default: 'system' },
  text:   { type: String, required: true },
  unread: { type: Boolean, default: true },
  link:   { type: String, default: "" },
}, { timestamps: true });

// mongoose.models check prevents OverwriteModelError on hot reload
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);