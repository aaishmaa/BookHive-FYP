import { create }  from 'zustand';
import axios       from 'axios';
import { io }      from 'socket.io-client';

const API = import.meta.env.MODE === 'development'
  ? 'http://localhost:5000/chat'
  : '/chat';

const SOCKET_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:5000'
  : '/';

axios.defaults.withCredentials = true;

let socket = null;

export const useChatStore = create((set, get) => ({
  conversations:      [],
  activeConversation: null,
  loading:            false,
  error:              null,
  typingUser:         null,

  // ── Connect socket ──────────────────────────────────────────────────────────
  connectSocket: (userId) => {
    if (socket?.connected) return;

    socket = io(SOCKET_URL, { withCredentials: true });

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
      socket.emit('user:online', userId);
    });

    // Real-time incoming message
    socket.on('message:receive', ({ conversationId, message }) => {
      const { conversations, activeConversation } = get();

      
      if (activeConversation?._id === conversationId) {
        set({
          activeConversation: {
            ...activeConversation,
            messages: [...activeConversation.messages, message],
          }
        });
      }

      // Update last message in conversation list
      set({
        conversations: conversations.map(c =>
          c._id === conversationId
            ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
            : c
        )
      });
    });

    // Typing indicators
    socket.on('typing:start', ({ userName }) => set({ typingUser: userName }));
    socket.on('typing:stop',  ()             => set({ typingUser: null }));

    socket.on('disconnect', () => console.log('❌ Socket disconnected'));
  },

  // ── Disconnect socket ───────────────────────────────────────────────────────
  disconnectSocket: () => {
    socket?.disconnect();
    socket = null;
  },

  // ── Join conversation room ──────────────────────────────────────────────────
  joinRoom: (conversationId) => {
    socket?.emit('conversation:join', conversationId);
  },

  leaveRoom: (conversationId) => {
    socket?.emit('conversation:leave', conversationId);
  },

  // ── Fetch all conversations ─────────────────────────────────────────────────
  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(API);
      set({ conversations: res.data.conversations, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || 'Error loading chats', loading: false });
    }
  },

  // ── Set active conversation + join its room ─────────────────────────────────
  setActiveConversation: async (conv) => {
    const prev = get().activeConversation;
    if (prev) get().leaveRoom(prev._id);

    set({ activeConversation: conv });
    get().joinRoom(conv._id);

    // Fetch full messages
    try {
      const res = await axios.get(`${API}/${conv._id}`);
      set({ activeConversation: res.data.conversation });
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  },

  // ── Start new conversation ──────────────────────────────────────────────────
  startConversation: async (recipientId) => {
    try {
      const res = await axios.post(API, { recipientId });
      const conv = res.data.conversation;

      set(state => ({
        conversations: state.conversations.some(c => c._id === conv._id)
          ? state.conversations
          : [conv, ...state.conversations],
      }));

      get().setActiveConversation(conv);
      return conv;
    } catch (err) {
      set({ error: err.response?.data?.msg || 'Error starting conversation' });
      throw err;
    }
  },

  // ── Send message ────────────────────────────────────────────────────────────
  sendMessage: async (conversationId, text) => {
    try {
      // 1. Save to DB via REST
      const res = await axios.post(`${API}/${conversationId}/messages`, { text });
      const message = res.data.message;

      // 2. Update local state
      const { activeConversation, conversations } = get();
      if (activeConversation?._id === conversationId) {
        set({
          activeConversation: {
            ...activeConversation,
            messages: [...activeConversation.messages, message],
          }
        });
      }

      set({
        conversations: conversations.map(c =>
          c._id === conversationId
            ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
            : c
        )
      });

      // 3. Broadcast via socket to other participants
      socket?.emit('message:send', { conversationId, message });

      return message;
    } catch (err) {
      set({ error: err.response?.data?.msg || 'Failed to send message' });
      throw err;
    }
  },

  // ── Mark messages as read ───────────────────────────────────────────────────
  markAsRead: async (conversationId) => {
    try {
      await axios.patch(`${API}/${conversationId}/read`);
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  },

  // ── Typing ──────────────────────────────────────────────────────────────────
  emitTyping: (conversationId, userName, isTyping) => {
    if (isTyping) {
      socket?.emit('typing:start', { conversationId, userName });
    } else {
      socket?.emit('typing:stop', { conversationId });
    }
  },

  clearError: () => set({ error: null }),
}));