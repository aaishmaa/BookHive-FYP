import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/wishlist"
    : "/wishlist";

axios.defaults.withCredentials = true;

export const useWishlistStore = create((set) => ({
  wishlist:  [],
  isLoading: false,
  error:     null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(API_URL);
      set({ wishlist: res.data.wishlist, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error fetching wishlist", isLoading: false });
    }
  },

  addToWishlist: async (bookId) => {
    try {
      const res = await axios.post(API_URL, { bookId });
      set((state) => ({ wishlist: [res.data.item, ...state.wishlist] }));
      return res.data.item;
    } catch (err) {
      const msg = err.response?.data?.msg || "Error saving book";
      set({ error: msg });
      throw new Error(msg);
    }
  },

  removeFromWishlist: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({ wishlist: state.wishlist.filter(w => w.id !== id) }));
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error removing book" });
      throw err;
    }
  },

  // Used on BookDetailPage to check if a book is already saved
  checkSaved: async (bookId) => {
    try {
      const res = await axios.get(`${API_URL}/check/${bookId}`);
      return res.data;  // { saved: bool, id: wishlistItemId }
    } catch {
      return { saved: false, id: null };
    }
  },

  clearError: () => set({ error: null }),
}));