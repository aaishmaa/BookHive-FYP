import { useState } from "react";
import { BookOpen, Search, Bell, Upload, MessageCircle, Home, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const navLinks = [
  { label: "Home",          icon: Home,          path: "/home" },
  { label: "Upload",        icon: Upload,        path: "/upload" },
  { label: "Chat",          icon: MessageCircle, path: "/chat" },
  { label: "Notifications", icon: Bell,          path: "/notifications" },
];

const Navbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const handleSearch = (val) => {
    setSearch(val);
    onSearch && onSearch(val);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 h-[60px] flex items-center justify-between shrink-0 z-50 sticky top-0">

      {/* Logo */}
      <div
        className="flex items-center gap-2 shrink-0 cursor-pointer"
        onClick={() => navigate("/home")}
      >
        <div className="w-8 h-8 bg-[#1C7C84] rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-[16px] font-bold text-gray-900">BookHive</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 w-[420px] max-w-[38vw] focus-within:border-[#1C7C84] transition shadow-none">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search books, notes, authors..."
          className="bg-transparent outline-none text-sm text-gray-600 w-full placeholder:text-gray-400"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Right nav */}
      <div className="flex items-center gap-1 shrink-0">
        {navLinks.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`relative flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition
                ${isActive
                  ? "bg-[#1C7C84] text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {label === "Notifications" && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}

        {/* Avatar */}
        <button
          onClick={() => navigate("/profile")}
          className="ml-1 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition"
        >
          <User className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;