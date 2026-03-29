import axios from 'axios';

const API_URL = 'http://localhost:5000/chat';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const chatService = {
  // Get all conversations
  getConversations: async () => {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get or create conversation with a specific user
  getOrCreateConversation: async (userId) => {
    try {
      const response = await api.get(`/conversations/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send a message
  sendMessage: async (conversationId, text) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, { text });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    try {
      const response = await api.patch(`/conversations/${conversationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await api.delete(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default chatService;
