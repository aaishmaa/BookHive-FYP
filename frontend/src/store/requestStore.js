import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/requests"
    : "/requests";

axios.defaults.withCredentials = true;

export const useRequestStore = create((set) => ({
  requests:     [],   
  sentRequests: [],   
  isLoading:    false,
  error:        null,

  
  fetchAllRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const [receivedRes, sentRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(`${API_URL}/sent`),
      ]);
      set({
        requests:     receivedRes.data.requests || [],
        sentRequests: sentRes.data.requests     || [],
        isLoading:    false,
      });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching requests", isLoading: false });
    }
  },

  
  fetchRequests: async () => {
    try {
      const res = await axios.get(API_URL);
      set({ requests: res.data.requests || [] });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching requests" });
    }
  },

 
  fetchSentRequests: async () => {
    try {
      const res = await axios.get(`${API_URL}/sent`);
      set({ sentRequests: res.data.requests || [] });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching sent requests" });
    }
  },

  sendRequest: async (data) => {
    set({ error: null });
    try {
      const res = await axios.post(API_URL, data);
      set((state) => ({ sentRequests: [res.data.request, ...state.sentRequests] }));
      return res.data.request;
    } catch (err) {
      const msg = err.response?.data?.msg || "Error sending request";
      set({ error: msg });
      throw new Error(msg);
    }
  },

  
  updateStatus: async (id, status) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}`, { status });
      const updated = res.data.request;
      set((state) => ({
        requests: state.requests.map(r =>
          (r.id?.toString() === id?.toString() || r._id?.toString() === id?.toString())
            ? updated : r
        ),
      }));
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error updating request" });
      throw err;
    }
  },

  
  cancelRequest: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({
        sentRequests: state.sentRequests.filter(r =>
          r.id?.toString() !== id?.toString() &&
          r._id?.toString() !== id?.toString()
        ),
      }));
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error cancelling request" });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));