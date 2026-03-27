import { Conversation } from '../models/chat.model.js';
import { User } from '../models/user.model.js';

// Get or create conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id || req.userId;

    if (!currentUserId || !userId) {
      return res.status(400).json({ success: false, message: 'Missing user IDs' });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId] }
    }).populate('participants', 'name email image').populate('messages.senderId', 'name image');

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, userId],
        messages: []
      });
      await conversation.save();
      await conversation.populate('participants', 'name email image');
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({ success: false, message: 'Failed to get conversation' });
  }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.userId;

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .populate('participants', 'name email image')
      .populate('messages.senderId', 'name image')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user?.id || req.userId;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(currentUserId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const newMessage = {
      senderId: currentUserId,
      text: text.trim(),
      timestamp: new Date(),
      read: false
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();
    await conversation.save();
    await conversation.populate('messages.senderId', 'name image');

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user?.id || req.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Mark all unread messages from other user as read
    conversation.messages.forEach(msg => {
      if (msg.senderId.toString() !== currentUserId && !msg.read) {
        msg.read = true;
      }
    });

    await conversation.save();
    
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ success: false, message: 'Failed to mark messages as read' });
  }
};

// Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user?.id || req.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(currentUserId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};
