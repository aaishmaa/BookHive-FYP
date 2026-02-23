import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: { type: String, required: true },
  email:    { type: String, required: true },
  phone:    { type: String, required: true },
  age:      { type: Number, required: true },
  gender:   { type: String, required: true },
  address:  { type: String, required: true },
  location: { type: String, required: true },
  collegeName: { type: String, required: true },
  citizenshipFront: { type: String, required: true }, // Cloudinary URL
  citizenshipBack:  { type: String, required: true }, // Cloudinary URL
  isProfileComplete: { type: Boolean, default: true },
}, { timestamps: true });

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);