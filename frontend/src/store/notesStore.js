import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/notes"
  : "/notes";

axios.defaults.withCredentials = true;

export const useNotesStore = create((set, get) => ({
  notes:     [],
  myNotes:   [],
  isLoading: false,
  error:     null,

  fetchNotes: async (category = "") => {
    set({ isLoading: true, error: null });
    try {
      const url = category && category !== "All" ? `${API_URL}?category=${category}` : API_URL;
      const res = await axios.get(url);
      set({ notes: res.data.notes, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Error fetching notes", isLoading: false });
    }
  },

  fetchMyNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/my`);
      set({ myNotes: res.data.notes, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching your notes", isLoading: false });
    }
  },

  createNote: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        notes:    [res.data.note, ...state.notes],
        myNotes:  [res.data.note, ...state.myNotes],
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Error uploading note", isLoading: false });
      throw err;
    }
  },

  // ── ADD THIS ──────────────────────────────────────────────────────────────
  downloadNote: async (noteId) => {
  try {
    await axios.patch(`${API_URL}/${noteId}/count`);
    window.open(`${API_URL}/${noteId}/download`, '_blank');
    return true;
  } catch (err) {
    console.error("Download failed:", err);
    return null;
  }
},
}));