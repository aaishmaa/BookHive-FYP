import { motion } from "framer-motion";
import { BookOpen, BookMarked, TrendingUp, Star, ChevronRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const featuredBooks = [
  { id: 1, title: "Atomic Habits",    author: "James Clear",        category: "Self-Help",   rating: 4.8, color: "#1C7C84" },
  { id: 2, title: "The Alchemist",    author: "Paulo Coelho",       category: "Fiction",     rating: 4.7, color: "#2E86AB" },
  { id: 3, title: "Deep Work",        author: "Cal Newport",        category: "Productivity",rating: 4.6, color: "#A23B72" },
  { id: 4, title: "Sapiens",          author: "Yuval Noah Harari",  category: "History",     rating: 4.9, color: "#F18F01" },
];

const categories = ["All", "Fiction", "Self-Help", "Science", "History", "Productivity", "Technology"];

const stats = [
  { label: "Books Read",  value: "12", icon: BookOpen   },
  { label: "Bookmarked",  value: "34", icon: BookMarked },
  { label: "Streak Days", value: "7",  icon: TrendingUp },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    // ✅ No min-h-screen, no overflow issues — fills the <main> from AppLayout
    <div className="h-full overflow-y-auto bg-[#F4FAFA] font-sans">
      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* ── WELCOME BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#1C7C84] to-[#2E86AB] rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <BookOpen className="w-64 h-64 -mt-10 -mr-10" />
          </div>
          <p className="text-sm font-medium opacity-80 mb-1">Good to see you back 👋</p>
          <h1 className="text-3xl font-bold mb-2">
            Hello, {user?.name?.split(" ")[0] || "Reader"}!
          </h1>
          <p className="text-sm opacity-80 mb-6">
            Continue your learning journey. You have 3 books in progress.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="bg-white text-[#1C7C84] font-semibold px-5 py-2 rounded-full text-sm hover:bg-opacity-90 transition flex items-center gap-2"
          >
            Browse Books <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* ── STATS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#F4FAFA] flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-[#1C7C84]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── CATEGORIES ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, i) => (
              <button
                key={i}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
                  ${i === 0
                    ? "bg-[#1C7C84] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#1C7C84] hover:text-[#1C7C84]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── FEATURED BOOKS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-800">Featured Books</h2>
            <button
              onClick={() => navigate("/home")}
              className="text-sm text-[#1C7C84] font-medium hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredBooks.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
              >
                {/* Cover */}
                <div
                  className="h-40 flex items-center justify-center"
                  style={{ backgroundColor: book.color + "20" }}
                >
                  <div
                    className="w-20 h-28 rounded-lg shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: book.color }}
                  >
                    <BookOpen className="w-8 h-8 text-white opacity-80" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <span className="text-xs font-medium text-[#1C7C84] bg-[#1C7C84]/10 px-2 py-0.5 rounded-full">
                    {book.category}
                  </span>
                  <h3 className="font-bold text-gray-800 mt-2 text-sm leading-tight">{book.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{book.author}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium text-gray-600">{book.rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── ADMIN PANEL (admin only) ── */}
        {user?.role === "admin" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-dashed border-[#1C7C84]"
          >
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-[#1C7C84]" />
              <h2 className="font-bold text-gray-800">Admin Panel</h2>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate("/admin/students")}
                className="px-4 py-2 bg-[#1C7C84] text-white rounded-lg text-sm font-medium hover:bg-[#146C70] transition"
              >
                Manage Users
              </button>
              <button className="px-4 py-2 bg-[#1C7C84] text-white rounded-lg text-sm font-medium hover:bg-[#146C70] transition">
                Add Books
              </button>
              <button className="px-4 py-2 bg-[#1C7C84] text-white rounded-lg text-sm font-medium hover:bg-[#146C70] transition">
                View Reports
              </button>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;