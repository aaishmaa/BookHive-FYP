import bcrypt from 'bcryptjs';
import { User } from '../Models/user.model.js';

// ── PATCH /auth/change-password ───────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ msg: 'Both fields are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ msg: 'New password must be at least 6 characters' });

    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Current password is incorrect' });

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── PATCH /auth/privacy ───────────────────────────────────────────────────────
export const updatePrivacy = async (req, res) => {
  try {
    const { showEmail, showPhone, showListings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { privacy: { showEmail, showPhone, showListings } } },
      { new: true }
    );

    res.json({ msg: 'Privacy settings updated', privacy: user.privacy });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET /auth/me ──────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};