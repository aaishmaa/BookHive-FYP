import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/books"
    : "/books";

axios.defaults.withCredentials = true;

export const useBookStore = create((set, get) => ({
  books:       [],   // all books (home/browse feed)
  myBooks:     [],   // logged-in user's books only
  currentBook: null,
  isLoading:   false,
  myLoading:   false,
  error:       null,
  searchQuery: "",

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchBooks("all", query, "");
  },

  // ── All books feed 
  fetchBooks: async (type = "all", search = "", category = "") => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (type && type !== "all")         params.append("type", type);
      if (search && search.trim())        params.append("search", search.trim());
      if (category && category !== "all") params.append("category", category);

      const url = params.toString() ? `${API_URL}?${params}` : API_URL;
      const res = await axios.get(url);
      set({ books: res.data.books, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching books", isLoading: false });
    }
  },

  // ── Single book ─────────────────────────────────────────────────────────────
  fetchBookById: async (id) => {
    set({ isLoading: true, error: null, currentBook: null });
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      set({ currentBook: res.data.book, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Book not found", isLoading: false });
    }
  },

  // ── My listings (GET /books/my) ─────────────────────────────────────────────
  fetchMyBooks: async () => {
    set({ myLoading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/my`);
      set({ myBooks: res.data.books, myLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching your listings", myLoading: false });
    }
  },

  // ── Create listing ──────────────────────────────────────────────────────────
  createBook: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        books:    [res.data.book, ...state.books],
        myBooks:  [res.data.book, ...state.myBooks],
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error creating listing", isLoading: false });
      throw err;
    }
  },

  // ── Delete listing ──────────────────────────────────────────────────────────
  deleteBook: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({
        books:   state.books.filter(b => b._id !== id),
        myBooks: state.myBooks.filter(b => b._id !== id),
      }));
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error deleting listing" });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));