import { useState, useEffect } from "react";
import { BookOpen, Search, Bell, Upload, MessageCircle, Home, User, BookMarked } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore }  from "../store/authStore";
import { useBookStore }  from "../store/bookStore";
import { useNotificationStore } from "../store/notificationStore";

const navLinks = [
  { label: "Home",          icon: Home,          path: "/home" },
  { label: "Browse",        icon: BookMarked,    path: "/browse" },
  { label: "Upload",        icon: Upload,        path: "/upload" },
  { label: "Chat",          icon: MessageCircle, path: "/chat" },
  { label: "Notifications", icon: Bell,          path: "/notifications" },
];

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuthStore();
  const { searchQuery, setSearchQuery } = useBookStore();
  const { notifications, fetchNotifications } = useNotificationStore();

  const [inputVal, setInputVal] = useState("");

  // Fetch notifications on mount for unread dot
  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputVal), 400);
    return () => clearTimeout(timer);
  }, [inputVal]);

  // Clear search when leaving searchable pages
  useEffect(() => {
    const searchablePages = ["/home", "/browse", "/buy", "/rent", "/exchange"];
    if (!searchablePages.includes(location.pathname)) {
      setInputVal("");
      setSearchQuery("");
    }
  }, [location.pathname]);

  const handleInput = (val) => {
    setInputVal(val);
    const searchablePages = ["/home", "/browse", "/buy", "/rent", "/exchange"];
    if (!searchablePages.includes(location.pathname)) navigate("/home");
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 h-[60px] flex items-center justify-between shrink-0 z-50 sticky top-0">

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate("/home")}>
        <div className="w-8 h-8 bg-[#1C7C84] rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-[16px] font-bold text-gray-900">BookHive</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 w-[420px] max-w-[38vw] focus-within:border-[#1C7C84] transition">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input type="text" placeholder="Search books, notes, authors..."
          className="bg-transparent outline-none text-sm text-gray-600 w-full placeholder:text-gray-400"
          value={inputVal} onChange={e => handleInput(e.target.value)} />
        {inputVal && (
          <button onClick={() => { setInputVal(""); setSearchQuery(""); }}
            className="text-gray-300 hover:text-gray-500 transition text-lg leading-none">×</button>
        )}
      </div>

      {/* Right nav */}
      <div className="flex items-center gap-1 shrink-0">
        {navLinks.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button key={label} onClick={() => navigate(path)}
              className={`relative flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition
                ${isActive ? "bg-[#1C7C84] text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {/* Real unread notification dot */}
              {label === "Notifications" && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}

        {/* Avatar — shows profile image if set, else initials */}
        <button onClick={() => navigate("/profile")}
          className="ml-1 w-8 h-8 rounded-full border border-[#1C7C84]/20 overflow-hidden hover:opacity-90 transition shrink-0">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#D1E8EA] flex items-center justify-center">
              {initials
                ? <span className="text-[11px] font-bold text-[#1C7C84]">{initials}</span>
                : <User className="w-4 h-4 text-gray-500" />
              }
            </div>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;