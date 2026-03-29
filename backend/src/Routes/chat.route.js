import express from 'express';
import { 
  getConversations, 
  getOrCreateConversation, 
  sendMessage, 
  markAsRead,
  deleteConversation
} from '../Controllers/chat.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';

const router = express.Router();

// Get all conversations for the current user
router.get('/conversations', verifyToken, getConversations);

// Get or create a conversation with a specific user
router.get('/conversations/:userId', verifyToken, getOrCreateConversation);

// Send a message in a conversation
router.post('/conversations/:conversationId/messages', verifyToken, sendMessage);

// Mark messages in a conversation as read
router.patch('/conversations/:conversationId/read', verifyToken, markAsRead);

// Delete a conversation
router.delete('/conversations/:conversationId', verifyToken, deleteConversation);

export default router;
