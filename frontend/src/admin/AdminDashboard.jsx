import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, BarChart3, Settings, LogOut,
  ChevronRight, TrendingUp, Package, Home,
  Loader, Trash2, Check, X, Eye, RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore }  from "../store/authStore";
import { useAdminStore } from "../store/adminStore";

// ── Sidebar ───────────────────────────────────────────────────────────────────
const AdminSidebar = ({ active, setActive }) => {
  const navigate  = useNavigate();
  const { logout } = useAuthStore();
  const menuItems = [
    { id: "dashboard", label: "Dashboard",            icon: Home      },
    { id: "students",  label: "Student Applications", icon: Users     },
    { id: "books",     label: "Manage Books",         icon: BookOpen  },
    { id: "users",     label: "All Users",            icon: Users     },
    { id: "reports",   label: "Reports",              icon: BarChart3 },
    { id: "settings",  label: "Settings",             icon: Settings  },
  ];

  return (
    <div className="w-64 bg-[#1C7C84] text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-7 h-7" />
          <span className="text-xl font-bold">BookHive</span>
        </div>
        <p className="text-xs opacity-80">Admin Dashboard</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left text-sm font-medium
              ${active === id ? "bg-white/20 border-l-4 border-white" : "hover:bg-white/10"}`}>
            <Icon className="w-5 h-5 shrink-0" />{label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/20">
        <button onClick={async () => { await logout(); navigate("/admin/login"); }}
          className="w-full flex items-center gap-2 text-sm font-medium hover:bg-white/10 px-3 py-2 rounded-lg transition">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, loading }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-gray-600 text-sm font-medium">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">
      {loading ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" /> : value}
    </p>
  </motion.div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    pending:  "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-500",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || styles.pending}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};


// ── Books Grouped by Category ─────────────────────────────────────────────────
const BooksGrouped = ({ books, isLoading, deletingId, onDelete }) => {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [search,         setSearch]         = useState("");
  const [typeFilter,     setTypeFilter]     = useState("All");

  const toggleGroup = (key) => setExpandedGroups(p => ({ ...p, [key]: !p[key] }));

  // Filter books
  const filtered = books.filter(b => {
    const matchSearch = !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.seller?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || b.type === typeFilter;
    return matchSearch && matchType;
  });

  // Group by category
  const grouped = filtered.reduce((acc, book) => {
    const key = book.category || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(book);
    return acc;
  }, {});

  const sortedGroups = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  if (isLoading) return (
    <div className="flex justify-center py-16"><Loader className="w-7 h-7 animate-spin text-[#1C7C84]" /></div>
  );

  if (books.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>No books found</p>
    </div>
  );

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 max-w-sm">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search title or seller..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="outline-none text-[13px] text-gray-700 w-full bg-transparent" />
        </div>
        <div className="flex gap-2">
          {["All","Sell","Rent","Exchange"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold border transition
                ${typeFilter === t ? "bg-[#1C7C84] text-white border-[#1C7C84]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7C84]"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="text-[12.5px] text-gray-500 flex items-center">
          {filtered.length} books · {sortedGroups.length} categories
        </div>
      </div>

      {/* Category groups */}
      <div className="flex flex-col gap-3">
        {sortedGroups.map(([category, catBooks]) => {
          const isOpen    = expandedGroups[category];
          const activeCount = catBooks.filter(b => b.status === "Active").length;
          const soldCount   = catBooks.filter(b => b.status === "Sold").length;

          return (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Group header */}
              <button onClick={() => toggleGroup(category)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition text-left">
                <div className="w-10 h-10 rounded-lg bg-[#1C7C84]/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[#1C7C84]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-gray-900">{category}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11.5px] text-gray-500">{catBooks.length} total</span>
                    {activeCount > 0 && <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ {activeCount} active</span>}
                    {soldCount   > 0 && <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{soldCount} sold</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] font-bold text-[#1C7C84] bg-[#1C7C84]/10 px-3 py-1 rounded-full">
                    {catBooks.length} books
                  </span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Books list */}
              {isOpen && (
                <div className="border-t border-gray-100">
                  {catBooks.map((book, i) => (
                    <div key={book._id}
                      className={`flex items-center gap-4 px-5 py-3 ${i !== catBooks.length-1 ? "border-b border-gray-50" : ""} hover:bg-gray-50 transition`}>
                      <img src={book.img || book.images?.[0] || "https://placehold.co/60x60/1C7C84/white?text=B"}
                        alt={book.title} className="w-10 h-12 rounded-lg object-cover shrink-0 border border-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 truncate">{book.title}</p>
                        <p className="text-[11.5px] text-gray-400">{book.seller} · {book.price}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                          book.type === "Exchange" ? "bg-emerald-50 text-emerald-600" :
                          book.type === "Rent"     ? "bg-purple-50 text-purple-500" : "bg-blue-50 text-blue-600"}`}>
                          {book.type}
                        </span>
                        <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                          book.status === "Active" ? "bg-green-50 text-green-600" :
                          book.status === "Sold"   ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-400"}`}>
                          {book.status}
                        </span>
                        <button onClick={() => onDelete(book._id)} disabled={deletingId === book._id}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40">
                          {deletingId === book._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── AdminDashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const { logout } = useAuthStore();
  const {
    stats, students, books, users, isLoading,
    fetchStats, fetchStudents, fetchBooks, fetchUsers,
    updateStudentStatus, deleteBook,
  } = useAdminStore();

  const [active,     setActive]     = useState("dashboard");
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    if (active === "students") fetchStudents();
    if (active === "books")    fetchBooks();
    if (active === "users")    fetchUsers();
  }, [active]);

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete this book permanently?")) return;
    setDeletingId(id);
    await deleteBook(id);
    setDeletingId(null);
  };

  const handleStudentAction = async (id, status) => {
    setUpdatingId(id);
    await updateStudentStatus(id, status);
    setUpdatingId(null);
  };

  const statCards = [
    { icon: Users,       label: "Total Users",          value: stats?.totalUsers     ?? "—", color: "bg-blue-500"   },
    { icon: BookOpen,    label: "Total Books",           value: stats?.totalBooks     ?? "—", color: "bg-purple-500" },
    { icon: Package,     label: "Pending Applications",  value: stats?.pendingProfiles?? "—", color: "bg-yellow-500" },
    { icon: TrendingUp,  label: "Active Books",          value: stats?.totalActive    ?? "—", color: "bg-green-500"  },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active={active} setActive={setActive} />

      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-gray-900">
            {active === "dashboard" && "Dashboard"}
            {active === "students"  && "Student Applications"}
            {active === "books"     && "Manage Books"}
            {active === "users"     && "All Users"}
            {active === "reports"   && "Reports & Analytics"}
            {active === "settings"  && "Settings"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button onClick={async () => { await logout(); navigate("/admin/login"); }}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium">
              Logout
            </button>
          </div>
        </div>

        <div className="p-8">

          {/* ── Dashboard ── */}
          {active === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((s, i) => <StatCard key={i} {...s} loading={!stats} />)}
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Review Applications", action: "students", color: "bg-blue-50 text-blue-600"   },
                    { label: "Manage Books",         action: "books",    color: "bg-purple-50 text-purple-600" },
                    { label: "View All Users",       action: "users",    color: "bg-green-50 text-green-600"  },
                  ].map(item => (
                    <button key={item.label} onClick={() => setActive(item.action)}
                      className={`${item.color} p-4 rounded-lg font-semibold flex items-center justify-between group hover:shadow-md transition`}>
                      {item.label}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* ── Students ── */}
          {active === "students" && (
            <div>
              {isLoading ? (
                <div className="flex justify-center py-16"><Loader className="w-7 h-7 animate-spin text-[#1C7C84]" /></div>
              ) : students.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No student applications yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map((s, i) => (
                    <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1C7C84] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {s.fullName?.split(" ").map(n => n[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{s.fullName}</p>
                            <p className="text-xs text-gray-500">{s.email}</p>
                          </div>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="text-[12px] text-gray-500 mb-3">🎓 {s.collegeName} · 📍 {s.location}</p>
                      {s.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleStudentAction(s._id, "declined")}
                            disabled={updatingId === s._id}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-red-300 text-red-500 py-2 rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-50">
                            {updatingId === s._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Decline
                          </button>
                          <button onClick={() => handleStudentAction(s._id, "approved")}
                            disabled={updatingId === s._id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#1C7C84] text-white py-2 rounded-lg text-sm hover:bg-[#155f65] transition disabled:opacity-50">
                            {updatingId === s._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Books ── */}
          {active === "books" && (
            <BooksGrouped
              books={books}
              isLoading={isLoading}
              deletingId={deletingId}
              onDelete={handleDeleteBook}
            />
          )}

          {/* ── Users ── */}
          {active === "users" && (
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="flex justify-center py-16"><Loader className="w-7 h-7 animate-spin text-[#1C7C84]" /></div>
              ) : users.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No users found</p>
                </div>
              ) : users.map((u, i) => (
                <motion.div key={u._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    {u.profileImage
                      ? <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[#1C7C84] flex items-center justify-center text-white text-sm font-bold">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-gray-900 truncate">{u.name}</p>
                    <p className="text-[12px] text-gray-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      u.role === 'admin' ? 'bg-[#1C7C84]/10 text-[#1C7C84]' : 'bg-gray-100 text-gray-500'}`}>
                      {u.role}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      u.isVerfied ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {u.isVerfied ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Reports ── */}
          {active === "reports" && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Reports & analytics coming soon...</p>
            </div>
          )}

          {/* ── Settings ── */}
          {active === "settings" && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Settings coming soon...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;