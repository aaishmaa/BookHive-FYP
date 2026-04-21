import { User } from '../models/user.model.js';
import { Book } from '../models/book.model.js';
import { createNotif } from './notification.controller.js';

// Try to import StudentProfile — may be in different locations
let StudentProfile;
try {
  const mod = await import('../models/studentProfile.model.js');
  StudentProfile = mod.StudentProfile || mod.default;
} catch {
  try {
    const mod = await import('../models/studentProfile.model.js');
    StudentProfile = mod.StudentProfile || mod.default;
  } catch {
    StudentProfile = null;
  }
}

// ── GET /admin/stats ──────────────────────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalBooks, totalActive] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Book.countDocuments({ status: 'Active' }),
    ]);
    const pendingProfiles = StudentProfile
      ? await StudentProfile.countDocuments({ status: 'pending' })
      : 0;
    res.json({ totalUsers, totalBooks, pendingProfiles, totalActive });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET /admin/students ───────────────────────────────────────────────────────
export const getStudents = async (req, res) => {
  try {
    if (!StudentProfile) return res.json({ students: [] });
    const { status, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { fullName:    { $regex: search, $options: 'i' } },
        { email:       { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } },
      ];
    }
    const students = await StudentProfile.find(query).sort({ createdAt: -1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── PATCH /admin/students/:id ─────────────────────────────────────────────────
export const updateStudentStatus = async (req, res) => {
  try {
    if (!StudentProfile) return res.status(404).json({ msg: 'StudentProfile model not found' });
    const { status } = req.body;
    if (!['approved', 'declined'].includes(status))
      return res.status(400).json({ msg: 'Invalid status' });

    const profile = await StudentProfile.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });

    await createNotif(
      profile.userId, 'system',
      status === 'approved'
        ? '✅ Your student profile has been approved!'
        : '❌ Your student profile was declined.',
      '/profile'
    );
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET /admin/books ──────────────────────────────────────────────────────────
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).limit(100);
    res.json({ books });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── DELETE /admin/books/:id ───────────────────────────────────────────────────
export const deleteBookAdmin = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET /admin/users ──────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};