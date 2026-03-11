import { useLocation, useNavigate } from "react-router-dom";
import {
  Home, BookOpen, List, RefreshCcw,
  Heart, FileText, CreditCard, Settings,
} from "lucide-react";

const navItems = [
  { label: "Home",          icon: Home,        path: "/home" },
  { label: "Browse Books",  icon: BookOpen,    path: "/browse" },
  { label: "My Listings",   icon: List,        path: "/my-listings" },
  { label: "Requests",      icon: RefreshCcw,  path: "/requests" },
  { label: "Wishlist",      icon: Heart,       path: "/wishlist" },
  { label: "Digital Notes", icon: FileText,    path: "/digital-notes" },
  { label: "Transactions",  icon: CreditCard,  path: "/transactions" },
  { label: "Settings",      icon: Settings,    path: "/settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto py-3 px-3">
      {navItems.map(({ label, icon: Icon, path }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg text-[13.5px] transition mb-0.5
              ${isActive
                ? "bg-[#EEF2FF] text-[#1C7C84] font-semibold"
                : "text-gray-600 font-normal hover:bg-gray-100 hover:text-gray-800"}`}
          >
            <Icon
              className={`w-[17px] h-[17px] shrink-0 ${isActive ? "text-[#1C7C84]" : "text-gray-400"}`}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            {label}
          </button>
        );
      })}
    </aside>
  );
};

export default Sidebar;