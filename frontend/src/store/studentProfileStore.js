import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/student"
    : "/student";

axios.defaults.withCredentials = true;

export const useStudentStore = create((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  // Submit student profile form with images
  createProfile: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      set({ profile: response.data.profile, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.msg || "Error submitting profile",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch existing student profile
  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        withCredentials: true,
      });
      set({ profile: response.data.profile, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.msg || "Error fetching profile",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));