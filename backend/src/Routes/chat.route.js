import express from 'express';
import {
  getConversations, getConversation,
  startConversation, sendMessage, markAsRead,
} from '../Controllers/chat.controller.js';
import { verifyToken } from '../Middlewares/verifyToken.js';

const router = express.Router();

router.get('/',                        verifyToken, getConversations);
router.get('/:id',                     verifyToken, getConversation);
router.post('/',                       verifyToken, startConversation);
router.post('/:id/messages',           verifyToken, sendMessage);
router.patch('/:id/read',              verifyToken, markAsRead);

export default router;