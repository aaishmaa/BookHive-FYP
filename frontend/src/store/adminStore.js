import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/admin"
  : "/admin";

axios.defaults.withCredentials = true;

export const useAdminStore = create((set) => ({
  stats:    null,
  students: [],
  books:    [],
  users:    [],
  isLoading: false,
  error:    null,

  fetchStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      set({ stats: res.data });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error" });
    }
  },

  fetchStudents: async (status = "all", search = "") => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      if (search) params.append("search", search);
      const res = await axios.get(`${API_URL}/students?${params}`);
      set({ students: res.data.students, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error", isLoading: false });
    }
  },

  updateStudentStatus: async (id, status) => {
    try {
      const res = await axios.patch(`${API_URL}/students/${id}`, { status });
      set(state => ({
        students: state.students.map(s =>
          s._id === id ? { ...s, status } : s
        ),
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error" });
      throw err;
    }
  },

  fetchBooks: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_URL}/books`);
      set({ books: res.data.books, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error", isLoading: false });
    }
  },

  deleteBook: async (id) => {
    try {
      await axios.delete(`${API_URL}/books/${id}`);
      set(state => ({ books: state.books.filter(b => b._id !== id) }));
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error" });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_URL}/users`);
      set({ users: res.data.users, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error", isLoading: false });
    }
  },
}));