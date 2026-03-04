import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/books"
    : "/books";

axios.defaults.withCredentials = true;

export const useBookStore = create((set) => ({
  books: [],
  currentBook: null,       // ← ADD
  isLoading: false,
  error: null,

  fetchBooks: async (type = "all") => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}?type=${type}`);
      set({ books: response.data.books, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.msg || "Error fetching books", isLoading: false });
    }
  },

  fetchBookById: async (id) => {       // ← ADD THIS WHOLE FUNCTION
    set({ isLoading: true, error: null, currentBook: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      set({ currentBook: response.data.book, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.msg || "Book not found", isLoading: false });
    }
  },

  createBook: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      set((state) => ({
        books: [response.data.book, ...state.books],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.msg || "Error creating listing", isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));