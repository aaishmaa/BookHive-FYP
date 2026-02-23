import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Eye, User, Mail, Phone,
  MapPin, Calendar, GraduationCap, ChevronDown,
  Search, Filter, X, ZoomIn, BookOpen, LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// ── Mock data (replace with real API data later) ──────────────────────────────
const MOCK_STUDENTS = [
  {
    _id: "1",
    fullName: "Aaishma Manandhar",
    email: "aaishma@example.com",
    phone: "9841234567",
    age: 21,
    gender: "Female",
    address: "Lazimpat, Kathmandu",
    location: "Kathmandu",
    collegeName: "Tribhuvan University",
    citizenshipFront: "https://placehold.co/600x380/1C7C84/white?text=Citizenship+Front",
    citizenshipBack: "https://placehold.co/600x380/146C70/white?text=Citizenship+Back",
    status: "pending",
    createdAt: "2026-02-20T10:30:00Z",
  },
  {
    _id: "2",
    fullName: "Rohan Shrestha",
    email: "rohan@example.com",
    phone: "9807654321",
    age: 23,
    gender: "Male",
    address: "Patan, Lalitpur",
    location: "Lalitpur",
    collegeName: "Kathmandu University",
    citizenshipFront: "https://placehold.co/600x380/1C7C84/white?text=Citizenship+Front",
    citizenshipBack: "https://placehold.co/600x380/146C70/white?text=Citizenship+Back",
    status: "pending",
    createdAt: "2026-02-21T14:15:00Z",
  },
  {
    _id: "3",
    fullName: "Priya Tamang",
    email: "priya@example.com",
    phone: "9823456789",
    age: 20,
    gender: "Female",
    address: "Bhaktapur",
    location: "Bhaktapur",
    collegeName: "Pokhara University",
    citizenshipFront: "https://placehold.co/600x380/1C7C84/white?text=Citizenship+Front",
    citizenshipBack: "https://placehold.co/600x380/146C70/white?text=Citizenship+Back",
    status: "approved",
    createdAt: "2026-02-19T09:00:00Z",
  },
  {
    _id: "4",
    fullName: "Bikash Gurung",
    email: "bikash@example.com",
    phone: "9812345678",
    age: 22,
    gender: "Male",
    address: "Pokhara",
    location: "Pokhara",
    collegeName: "Pokhara University",
    citizenshipFront: "https://placehold.co/600x380/1C7C84/white?text=Citizenship+Front",
    citizenshipBack: "https://placehold.co/600x380/146C70/white?text=Citizenship+Back",
    status: "declined",
    createdAt: "2026-02-18T16:45:00Z",
  },
];

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    declined: "bg-red-100 text-red-600 border-red-200",
  };
  const labels = { pending: "Pending", approved: "Approved", declined: "Declined" };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// ── Image lightbox ────────────────────────────────────────────────────────────
const ImageLightbox = ({ src, label, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-6"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.85 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.85 }}
      className="relative max-w-2xl w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[#1C7C84] px-4 py-2 rounded-t-xl flex items-center justify-between">
        <span className="text-white text-sm font-semibold">{label}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>
      <img src={src} alt={label} className="w-full rounded-b-xl object-cover shadow-2xl" />
    </motion.div>
  </motion.div>
);

// ── Detail modal ──────────────────────────────────────────────────────────────
const StudentDetailModal = ({ student, onClose, onApprove, onDecline }) => {
  const [lightbox, setLightbox] = useState(null);

  const fields = [
    { icon: Mail,           label: "Email",       value: student.email },
    { icon: Phone,          label: "Phone",       value: student.phone },
    { icon: Calendar,       label: "Age",         value: `${student.age} years` },
    { icon: User,           label: "Gender",      value: student.gender },
    { icon: MapPin,         label: "Address",     value: student.address },
    { icon: MapPin,         label: "Location",    value: student.location },
    { icon: GraduationCap,  label: "College",     value: student.collegeName },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-[#1C7C84] px-6 py-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
            <div>
              <h2 className="text-white text-xl font-bold">{student.fullName}</h2>
              <p className="text-white text-xs opacity-80 mt-0.5">
                Submitted {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={student.status} />
              <button onClick={onClose} className="text-white hover:text-gray-200 ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Personal Details Grid */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 bg-[#F4FAFA] rounded-xl px-4 py-3">
                    <Icon className="w-4 h-4 text-[#1C7C84] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm text-gray-800 font-semibold">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizenship Documents */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                Citizenship Documents
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { src: student.citizenshipFront, label: "Front Side" },
                  { src: student.citizenshipBack,  label: "Back Side"  },
                ].map(({ src, label }) => (
                  <div key={label} className="relative group rounded-xl overflow-hidden border-2 border-[#1C7C84]/30 cursor-pointer"
                    onClick={() => setLightbox({ src, label })}
                  >
                    <img src={src} alt={label} className="w-full h-36 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                      <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-[#1C7C84] py-1 text-center">
                      <span className="text-white text-xs font-semibold">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Click image to enlarge</p>
            </div>

            {/* Action Buttons */}
            {student.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onDecline(student._id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-red-400 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition"
                >
                  <XCircle className="w-5 h-5" /> Decline
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onApprove(student._id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1C7C84] text-white py-3 rounded-xl font-semibold hover:bg-[#146C70] transition"
                >
                  <CheckCircle className="w-5 h-5" /> Approve
                </motion.button>
              </div>
            )}

            {student.status !== "pending" && (
              <div className={`rounded-xl py-3 text-center text-sm font-semibold ${
                student.status === "approved"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {student.status === "approved"
                  ? "✅ This application has been approved"
                  : "❌ This application has been declined"}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <ImageLightbox
            src={lightbox.src}
            label={lightbox.label}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminStudentReview = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleApprove = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: "approved" } : s))
    );
  };

  const handleDecline = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: "declined" } : s))
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/Login");
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.collegeName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:      students.length,
    pending:  students.filter((s) => s.status === "pending").length,
    approved: students.filter((s) => s.status === "approved").length,
    declined: students.filter((s) => s.status === "declined").length,
  };

  return (
    <div className="min-h-screen bg-[#F4FAFA] font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-[#1C7C84]" />
          <span className="text-xl font-bold text-[#1C7C84]">BookHive</span>
          <span className="ml-2 text-xs bg-[#1C7C84]/10 text-[#1C7C84] font-semibold px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-800">{user?.name || "Admin"}</p>
            <p className="text-xs text-[#1C7C84]">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-800">Student Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage student profile submissions
          </p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total",    count: counts.all,      color: "text-gray-700",   bg: "bg-gray-100"   },
            { label: "Pending",  count: counts.pending,  color: "text-yellow-700", bg: "bg-yellow-50"  },
            { label: "Approved", count: counts.approved, color: "text-green-700",  bg: "bg-green-50"   },
            { label: "Declined", count: counts.declined, color: "text-red-600",    bg: "bg-red-50"     },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl px-5 py-4 border border-gray-100 shadow-sm`}>
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 shadow-sm">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email, college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-sm text-gray-700 w-full bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </motion.div>

        {/* Student Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No students found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((student, i) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                {/* Card top strip */}
                <div className="h-1.5 w-full" style={{
                  backgroundColor:
                    student.status === "approved" ? "#22c55e" :
                    student.status === "declined" ? "#ef4444" : "#f59e0b"
                }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#1C7C84] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {student.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{student.fullName}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={student.status} />
                  </div>

                  {/* Info row */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { icon: Phone,         val: student.phone        },
                      { icon: Calendar,      val: `${student.age} yrs` },
                      { icon: MapPin,        val: student.location     },
                      { icon: GraduationCap, val: student.collegeName  },
                    ].map(({ icon: Icon, val }) => (
                      <div key={val} className="flex items-center gap-2 bg-[#F4FAFA] rounded-lg px-3 py-2">
                        <Icon className="w-3.5 h-3.5 text-[#1C7C84] shrink-0" />
                        <span className="text-xs text-gray-600 truncate">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Citizenship thumbnails */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { src: student.citizenshipFront, label: "Front" },
                      { src: student.citizenshipBack,  label: "Back"  },
                    ].map(({ src, label }) => (
                      <div key={label} className="relative rounded-lg overflow-hidden border border-[#1C7C84]/20 h-20">
                        <img src={src} alt={label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-[#1C7C84]/80 text-white text-xs text-center py-0.5">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action row */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(student)}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#1C7C84] text-[#1C7C84] py-2 rounded-lg text-sm font-semibold hover:bg-[#1C7C84]/5 transition"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>

                    {student.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleDecline(student._id)}
                          className="px-3 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition"
                          title="Decline"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(student._id)}
                          className="px-3 py-2 rounded-lg bg-[#1C7C84] text-white hover:bg-[#146C70] transition"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <StudentDetailModal
            student={selected}
            onClose={() => setSelected(null)}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudentReview;