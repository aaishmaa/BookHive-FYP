import { User } from '../models/user.model.js';
import cloudinary from '../Config/cloudinary.config.js';

// ── GET /profile/me ───────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── PATCH /profile/me — update name, bio, college, phone, profileImage ────────
export const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'college', 'phone'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    // Handle avatar upload
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'bookhive/avatars', transformation: [{ width: 300, height: 300, crop: 'fill' }] },
          (err, res) => err ? reject(err) : resolve(res)
        );
        stream.end(req.file.buffer);
      });
      updates.profileImage = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.userId, { $set: updates }, { new: true }
    ).select('-password');

    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET /profile/user/:userId — public profile ────────────────────────────────
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
 