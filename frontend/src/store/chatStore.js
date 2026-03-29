import { create } from 'zustand';
import chatService from '../services/chatService';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  loading: false,
  error: null,

  // Fetch all conversations
  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await chatService.getConversations();
      set({ conversations: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Get or create conversation with a user
  getOrCreateConversation: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await chatService.getOrCreateConversation(userId);
      set({ activeConversation: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Set active conversation
  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
  },

  // Send message
  sendMessage: async (conversationId, text) => {
    set({ error: null });
    try {
      const response = await chatService.sendMessage(conversationId, text);
      
      // Update active conversation with new message
      set(state => ({
        activeConversation: state.activeConversation ? {
          ...state.activeConversation,
          messages: [...state.activeConversation.messages, response.data]
        } : null
      }));

      // Update conversations list
      set(state => ({
        conversations: state.conversations.map(conv => 
          conv._id === conversationId 
            ? { ...conv, messages: [...conv.messages, response.data], updatedAt: new Date() }
            : conv
        )
      }));

      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    try {
      const response = await chatService.markAsRead(conversationId);
      set({ activeConversation: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    set({ error: null });
    try {
      await chatService.deleteConversation(conversationId);
      set(state => ({
        conversations: state.conversations.filter(conv => conv._id !== conversationId),
        activeConversation: state.activeConversation?._id === conversationId ? null : state.activeConversation
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  }
}));
