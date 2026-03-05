import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/notes"
    : "/notes";

const BACKEND_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "";

axios.defaults.withCredentials = true;

export const useNotesStore = create((set) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async (category = "All") => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}?category=${category}`);
      set({ notes: response.data.notes, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching notes",
        isLoading: false,
      });
    }
  },

  createNote: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      set((state) => ({
        notes: [response.data.note, ...state.notes],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error uploading note",
        isLoading: false,
      });
      throw error;
    }
  },

  // Returns backend stream URL + updates count
  downloadNote: async (id) => {
    try {
      // Increment download count
      await axios.patch(`${API_URL}/${id}/count`, {}, { withCredentials: true });
      // Return backend streaming URL — bypasses Cloudinary auth
      return `${BACKEND_URL}/notes/${id}/download`;
    } catch (error) {
      console.error("Download error:", error);
    }
  },

  clearError: () => set({ error: null }),
}));