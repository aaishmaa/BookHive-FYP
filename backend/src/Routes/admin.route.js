import express from 'express';
import {
  getStats, getStudents, updateStudentStatus,
  getAllBooks, deleteBookAdmin, getAllUsers,
} from '../Controllers/admin.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';

// ── Admin middleware ───────────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin')
    return res.status(403).json({ msg: 'Admin access required' });
  next();
};

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get('/stats',          getStats);
router.get('/students',       getStudents);
router.patch('/students/:id', updateStudentStatus);
router.get('/books',          getAllBooks);
router.delete('/books/:id',   deleteBookAdmin);
router.get('/users',          getAllUsers);

export default router;