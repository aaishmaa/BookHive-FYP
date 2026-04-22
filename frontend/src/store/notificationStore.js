import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/notifications"
    : "/notifications";

axios.defaults.withCredentials = true;

export const useNotificationStore = create((set) => ({
  notifications: [],
  isLoading:     false,
  error:         null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(API_URL);
      set({ notifications: res.data.notifications, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching notifications", isLoading: false });
    }
  },

  markAllRead: async () => {
    try {
      await axios.patch(`${API_URL}/read-all`);
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, unread: false })),
      }));
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error" });
    }
  },

  markOneRead: async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/read`);
      set(state => ({
       
        notifications: state.notifications.map(n =>
          n.id?.toString() === id?.toString() ? { ...n, unread: false } : n
        ),
      }));
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error" });
    }
  },

  deleteNotification: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      set(state => ({
        notifications: state.notifications.filter(n =>
          n.id?.toString() !== id?.toString()
        ),
      }));
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error" });
    }
  },

  clearError: () => set({ error: null }),
}));