import express from 'express';
import {
  getNotifications, markAllRead,
  markOneRead, deleteNotification,
} from '../Controllers/notification.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';

const router = express.Router();

router.get('/',           verifyToken, getNotifications);
router.patch('/read-all', verifyToken, markAllRead);    // ← MUST be before /:id
router.patch('/:id/read', verifyToken, markOneRead);
router.delete('/:id',     verifyToken, deleteNotification);

export default router;