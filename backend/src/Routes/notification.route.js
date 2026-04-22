import express from 'express';
import {
  getNotifications, markAllRead,
  markOneRead, deleteNotification, createNotif,
} from '../Controllers/notification.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';
import { Notification } from '../models/notification.model.js';

const router = express.Router();

router.get('/',           verifyToken, getNotifications);
router.patch('/read-all', verifyToken, markAllRead);       
router.patch('/:id/read', verifyToken, markOneRead);
router.delete('/:id',     verifyToken, deleteNotification);

// ── Test route — creates a sample notification instantly ──────────────────────
router.post('/test', verifyToken, async (req, res) => {
  try {
    await createNotif(req.userId, 'system',
      '🔔 This is a test notification from BookHive!', '/home');
    res.json({ msg: 'Test notification created — refresh the page!' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;