import { useLocation, useNavigate } from "react-router-dom";
import {
  Home, ShoppingCart, RotateCcw, ArrowLeftRight,
  FileText, Bookmark, CreditCard, Settings,
} from "lucide-react";

const navItems = [
  { label: "Home",          icon: Home,           path: "/" },
  { label: "Buy",           icon: ShoppingCart,   path: "/buy" },
  { label: "Rent",          icon: RotateCcw,      path: "/rent" },
  { label: "Exchange",      icon: ArrowLeftRight, path: "/exchange" },
  { label: "Digital Notes", icon: FileText,       path: "/digital-notes" },
  { label: "Saved Posts",   icon: Bookmark,       path: "/saved" },
  { label: "Transactions",  icon: CreditCard,     path: "/transactions" },
  { label: "Settings",      icon: Settings,       path: "/settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-[240px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto py-3 px-3">
      {navItems.map(({ label, icon: Icon, path }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg text-[14px] transition mb-0.5
              ${isActive
                ? "bg-[#EEF2FF] text-[#1C7C84] font-semibold"
                : "text-gray-600 font-normal hover:bg-gray-100 hover:text-gray-800"}`}
          >
            <Icon
              className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-[#1C7C84]" : "text-gray-400"}`}
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