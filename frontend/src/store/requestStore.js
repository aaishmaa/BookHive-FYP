import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/requests"
    : "/requests";

axios.defaults.withCredentials = true;

export const useRequestStore = create((set) => ({
  requests:     [],   // received
  sentRequests: [],   // sent
  isLoading:    false,
  error:        null,

  // ── Fetch received requests ─────────────────────────────────────────────────
  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(API_URL);
      set({ requests: res.data.requests, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching requests", isLoading: false });
    }
  },

  // ── Fetch sent requests ─────────────────────────────────────────────────────
  fetchSentRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/sent`);
      set({ sentRequests: res.data.requests, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching sent requests", isLoading: false });
    }
  },

  // ── Send a new request ──────────────────────────────────────────────────────
  // Call this from BookDetailPage: sendRequest({ bookId, type, offer })
  sendRequest: async ({ bookId, type, offer }) => {
    set({ error: null });
    try {
      const res = await axios.post(API_URL, { bookId, type, offer });
      set((state) => ({ sentRequests: [res.data.request, ...state.sentRequests] }));
      return res.data.request;
    } catch (err) {
      const msg = err.response?.data?.msg || "Error sending request";
      set({ error: msg });
      throw new Error(msg);
    }
  },

  // ── Accept or decline ───────────────────────────────────────────────────────
  updateStatus: async (id, status) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}`, { status });
      const updated = res.data.request;
      set((state) => ({
        requests: state.requests.map(r => r.id === id ? updated : r),
      }));
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error updating request" });
      throw err;
    }
  },

  // ── Cancel sent request ─────────────────────────────────────────────────────
  cancelRequest: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({
        sentRequests: state.sentRequests.filter(r => r.id !== id),
      }));
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error cancelling request" });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));