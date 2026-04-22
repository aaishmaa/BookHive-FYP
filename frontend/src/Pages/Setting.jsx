import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Bell, Lock, Shield, HelpCircle,
  LogOut, ChevronRight, TrendingUp, Clock,
  Eye, EyeOff, Check, X, Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import TopSellers from "../Components/TopSeller";  

const API = import.meta.env.MODE === "development" ? "http://localhost:5000" : "";

const recentUploads = [
  { title: "Data Structures & Algorithms", time: "2h ago" },
  { title: "Organic Chemistry Vol. 2",     time: "4h ago" },
  { title: "Business Law Notes",           time: "5h ago" },
];

function SettingRow({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition group
        ${danger ? "text-red-500" : "text-gray-700"}`}>
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      {title && (
        <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-4 pt-4 pb-2">{title}</p>
      )}
      <div className="divide-y divide-gray-100">{children}</div>
    </motion.div>
  );
}

function ToggleRow({ icon: Icon, label, value, onChange }) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3">
        <Icon className="w-[17px] h-[17px] text-gray-400 shrink-0" />
        <span className="text-[13.5px] font-medium text-gray-700">{label}</span>
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? "bg-[#1C7C84]" : "bg-gray-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [current,  setCurrent]  = useState("");
  const [newPass,  setNewPass]  = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showCurr, setShowCurr] = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!current || !newPass || !confirm) { setError("All fields are required."); return; }
    if (newPass.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPass !== confirm) { setError("New passwords don't match."); return; }
    setLoading(true);
    try {
      await axios.patch(`${API}/auth/change-password`,
        { currentPassword: current, newPassword: newPass },
        { withCredentials: true }
      );
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to change password.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold text-gray-900">Change Password</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition text-xl">×</button>
        </div>
        {success ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-[14px] font-semibold text-gray-800">Password changed successfully!</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Current Password</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#1C7C84] transition">
                <input type={showCurr ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)}
                  placeholder="Enter current password" className="flex-1 outline-none text-[13px] text-gray-700 bg-transparent" />
                <button onClick={() => setShowCurr(!showCurr)} className="text-gray-400 hover:text-gray-600">
                  {showCurr ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">New Password</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#1C7C84] transition">
                <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
                  placeholder="Min 6 characters" className="flex-1 outline-none text-[13px] text-gray-700 bg-transparent" />
                <button onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
              <div className={`flex items-center border rounded-xl px-3 py-2.5 transition
                ${confirm && newPass !== confirm ? "border-red-300" : "border-gray-200 focus-within:border-[#1C7C84]"}`}>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter new password" className="flex-1 outline-none text-[13px] text-gray-700 bg-transparent" />
                {confirm && (newPass === confirm ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-400" />)}
              </div>
            </div>
            {error && <p className="text-[12px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#1C7C84] hover:bg-[#155f65] text-white text-[13px] font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Update Password"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function PrivacyModal({ onClose }) {
  const [showEmail,    setShowEmail]    = useState(true);
  const [showListings, setShowListings] = useState(true);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState("");

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.patch(`${API}/auth/privacy`, { showEmail, showListings }, { withCredentials: true });
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save settings.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold text-gray-900">Privacy Settings</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition text-xl">×</button>
        </div>
        {success ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center"><Check className="w-6 h-6 text-emerald-600" /></div>
            <p className="text-[14px] font-semibold text-gray-800">Privacy settings saved!</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 mb-5">
              <ToggleRow icon={Eye} label="Show email on profile" value={showEmail} onChange={setShowEmail} />
              <ToggleRow icon={Shield} label="Show my listings publicly" value={showListings} onChange={setShowListings} />
            </div>
            {error && <p className="text-[12px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#1C7C84] hover:bg-[#155f65] text-white text-[13px] font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [darkMode,          setDarkMode]          = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPrivacyModal,  setShowPrivacyModal]  = useState(false);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <AnimatePresence>
        {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
        {showPrivacyModal  && <PrivacyModal        onClose={() => setShowPrivacyModal(false)} />}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-6 py-7">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-6">Settings</motion.h1>
        <div className="max-w-2xl">
          <SectionCard title="Preferences">
            <ToggleRow icon={Moon} label="Dark Mode" value={darkMode} onChange={setDarkMode} />
            <SettingRow icon={Bell} label="Notification Preferences" onClick={() => navigate("/notifications")} />
          </SectionCard>
          <SectionCard title="Account">
            <SettingRow icon={Lock}   label="Change Password"  onClick={() => setShowPasswordModal(true)} />
            <SettingRow icon={Shield} label="Privacy Settings" onClick={() => setShowPrivacyModal(true)} />
          </SectionCard>
          <SectionCard title="Support">
            <SettingRow icon={HelpCircle} label="Help & Support" onClick={() => {}} />
          </SectionCard>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition group">
              <LogOut className="w-[17px] h-[17px] text-red-400 shrink-0" />
              <span className="text-[13.5px] font-medium text-red-500">Log Out</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel — TopSellers from backend ── */}
      <aside className="w-[248px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#1C7C84]" />
            <h3 className="text-[13px] font-bold text-gray-800">Trending Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Engineering","Medical","Management","IT","Law"].map(c => (
              <span key={c} className="px-3 py-1 bg-gray-100 text-gray-600 text-[12px] font-medium rounded-full cursor-pointer hover:bg-[#1C7C84]/10 hover:text-[#1C7C84] transition">{c}</span>
            ))}
          </div>
        </div>
        <TopSellers />  
        <div className="px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-[13px] font-bold text-gray-800">Recent Uploads</h3>
          </div>
          {recentUploads.map(u => (
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