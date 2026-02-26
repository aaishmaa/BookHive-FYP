import { useState } from "react";
import { motion } from "framer-motion";
import {
  Moon, Bell, Lock, Shield, HelpCircle,
  LogOut, ChevronRight, TrendingUp, Star, Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const topSellers = [
  { name: "Priya Sharma", rating: "4.9", books: "24 books", initial: "P" },
  { name: "Arjun Patel",  rating: "4.8", books: "18 books", initial: "A" },
  { name: "Sara Khan",    rating: "4.7", books: "15 books", initial: "S" },
];

const recentUploads = [
  { title: "Data Structures & Algorithms", time: "2h ago" },
  { title: "Organic Chemistry Vol. 2",     time: "4h ago" },
  { title: "Business Law Notes",           time: "5h ago" },
];

// ─── Reusable row components ──────────────────────────────────────────────────
function SettingRow({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition group
        ${danger ? "text-red-500" : "text-gray-700"}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-[17px] h-[17px] shrink-0 ${danger ? "text-red-400" : "text-gray-400 group-hover:text-[#1C7C84]"} transition`} />
        <span className={`text-[13.5px] font-medium ${danger ? "text-red-500" : "text-gray-700"}`}>{label}</span>
      </div>
      {!danger && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1C7C84] transition" />}
    </button>
  );
}

function SectionCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4"
    >
      {title && (
        <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-4 pt-4 pb-2">
          {title}
        </p>
      )}
      <div className="divide-y divide-gray-100">{children}</div>
    </motion.div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ToggleRow({ icon: Icon, label, value, onChange }) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3">
        <Icon className="w-[17px] h-[17px] text-gray-400 shrink-0" />
        <span className="text-[13.5px] font-medium text-gray-700">{label}</span>
      </div>
      {/* Toggle switch */}
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200
          ${value ? "bg-[#1C7C84]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
            ${value ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto px-6 py-7">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-6"
        >
          Settings
        </motion.h1>

        <div className="max-w-2xl">

          {/* PREFERENCES */}
          <SectionCard title="Preferences">
            <ToggleRow
              icon={Moon}
              label="Dark Mode"
              value={darkMode}
              onChange={setDarkMode}
            />
            <SettingRow
              icon={Bell}
              label="Notification Preferences"
              onClick={() => navigate("/notifications")}
            />
          </SectionCard>

          {/* ACCOUNT */}
          <SectionCard title="Account">
            <SettingRow
              icon={Lock}
              label="Change Password"
              onClick={() => {}}
            />
            <SettingRow
              icon={Shield}
              label="Privacy Settings"
              onClick={() => {}}
            />
          </SectionCard>

          {/* SUPPORT */}
          <SectionCard title="Support">
            <SettingRow
              icon={HelpCircle}
              label="Help & Support"
              onClick={() => {}}
            />
          </SectionCard>

          {/* LOG OUT */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition group"
            >
              <LogOut className="w-[17px] h-[17px] text-red-400 shrink-0" />
              <span className="text-[13.5px] font-medium text-red-500">Log Out</span>
            </button>
          </motion.div>

        </div>
      </div>

      {/* ── Right Panel ── */}
      <aside className="w-[248px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">

        {/* Trending */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#1C7C84]" />
            <h3 className="text-[13px] font-bold text-gray-800">Trending Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Engineering", "Medical", "Management", "IT", "Law"].map((c) => (
              <span
                key={c}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-[12px] font-medium rounded-full cursor-pointer hover:bg-[#1C7C84]/10 hover:text-[#1C7C84] transition"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <h3 className="text-[13px] font-bold text-gray-800">Top Sellers</h3>
          </div>
          {topSellers.map((s) => (
            <div key={s.name} className="flex items-center gap-3 mb-4 last:mb-0">
              <div className="w-9 h-9 rounded-full bg-[#D1E8EA] flex items-center justify-center text-[#1C7C84] text-[13px] font-bold shrink-0">
                {s.initial}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-800 leading-tight">{s.name}</p>
                <p className="text-[11.5px] text-gray-400 mt-0.5">
                  <span className="text-amber-400">★</span> {s.rating} · {s.books}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Uploads */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-[13px] font-bold text-gray-800">Recent Uploads</h3>
          </div>
          {recentUploads.map((u) => (
            <div key={u.title} className="mb-3.5 last:mb-0">
              <p className="text-[13px] font-semibold text-gray-800 leading-tight">{u.title}</p>
              <p className="text-[11.5px] text-gray-400 mt-0.5">{u.time}</p>
            </div>
          ))}
        </div>
      </aside>

    </div>
  );
};

export default SettingsPage;