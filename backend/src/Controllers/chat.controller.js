import { Conversation } from '../models/chat.model.js';
import { User }         from '../models/user.model.js';

// ── GET /chat/conversations ───────────────────────────────────────────────────
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation
      .find({ participants: req.userId })
      .populate('participants', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET /chat/conversations/:id ───────────────────────────────────────────────
export const getConversation = async (req, res) => {
  try {
    const conv = await Conversation
      .findById(req.params.id)
      .populate('participants', 'name email')
      .populate('messages.senderId', 'name');

    if (!conv) return res.status(404).json({ msg: 'Conversation not found' });

    // Check user is a participant
    const isParticipant = conv.participants.some(p => p._id.toString() === req.userId);
    if (!isParticipant) return res.status(403).json({ msg: 'Not authorized' });

    res.json({ conversation: conv });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── POST /chat/conversations ──────────────────────────────────────────────────
// Start a conversation with another user
export const startConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) return res.status(400).json({ msg: 'recipientId is required' });
    if (recipientId === req.userId)
      return res.status(400).json({ msg: "Can't chat with yourself" });

    // Check if conversation already exists
    let conv = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] }
    }).populate('participants', 'name email');

    if (!conv) {
      conv = await Conversation.create({
        participants: [req.userId, recipientId],
        messages: [],
      });
      conv = await conv.populate('participants', 'name email');
    }

    res.json({ conversation: conv });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── POST /chat/conversations/:id/messages ─────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ msg: 'Message cannot be empty' });

    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ msg: 'Conversation not found' });

    const isParticipant = conv.participants.some(p => p.toString() === req.userId);
    if (!isParticipant) return res.status(403).json({ msg: 'Not authorized' });

    const message = { senderId: req.userId, text: text.trim() };
    conv.messages.push(message);
    await conv.save();

    // Return the last message 
    const saved = conv.messages[conv.messages.length - 1];
    res.status(201).json({ message: saved });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── PATCH /chat/conversations/:id/read ───────────────────────────────────────
export const markAsRead = async (req, res) => {
  try {
    await Conversation.updateOne(
      { _id: req.params.id, 'messages.senderId': { $ne: req.userId } },
      { $set: { 'messages.$[msg].read': true } },
      { arrayFilters: [{ 'msg.read': false, 'msg.senderId': { $ne: req.userId } }] }
    );
    res.json({ msg: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};