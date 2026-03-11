import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Plus, Eye, Pencil, Trash2, TrendingUp, Star, Clock, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBookStore } from "../store/bookStore";

const topSellers = [
  { name: "Priya Sharma", rating: "4.9", books: "24 books", initial: "P" },
  { name: "Arjun Patel",  rating: "4.8", books: "18 books", initial: "A" },
  { name: "Sara Khan",    rating: "4.7", books: "15 books", initial: "S" },
];

const recentUploads = [
  { title: "Data Structures & Algorithms", time: "2h ago" },
  { title: "Organic Chemistry Vol. 2",     time: "4h ago" },
  { title: "Business Law Notes",           time: "6h ago" },
];

const statusStyle = {
  Active:  { pill: "text-emerald-600 bg-emerald-50" },
  Sold:    { pill: "text-gray-500 bg-gray-100" },
  Expired: { pill: "text-red-400 bg-red-50" },
};

// Derive a display status from book data
const getStatus = (book) => {
  if (book.status) return book.status;   // if backend sends it
  if (book.sold)   return "Sold";
  return "Active";
};

const FILTERS = ["All", "Active", "Sold", "Expired"];

const MyListings = () => {
  const navigate = useNavigate();
  const { myBooks, myLoading, error, fetchMyBooks, deleteBook } = useBookStore();
  const [activeFilter, setActiveFilter] = useState("All");
  const [deletingId, setDeletingId]     = useState(null);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const counts = {
    Active:  myBooks.filter(b => getStatus(b) === "Active").length,
    Sold:    myBooks.filter(b => getStatus(b) === "Sold").length,
    Expired: myBooks.filter(b => getStatus(b) === "Expired").length,
  };

  const filtered = activeFilter === "All"
    ? myBooks
    : myBooks.filter(b => getStatus(b) === activeFilter);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    setDeletingId(id);
    try {
      await deleteBook(id);
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── Main ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C7C84] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-gray-900 leading-tight">My Listings</h1>
              <p className="text-[13px] text-gray-400">{myBooks.length} total listing{myBooks.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 bg-[#1C7C84] hover:bg-[#155f65] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {FILTERS.map(f => {
            const count = f === "All" ? myBooks.length : counts[f];
            return (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition
                  ${activeFilter === f
                    ? "bg-[#1C7C84] text-white border-[#1C7C84]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7C84] hover:text-[#1C7C84]"}`}
              >
                {f}{f !== "All" && count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {myLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#1C7C84] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !myLoading && (
          <div className="max-w-3xl bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-[13px] text-red-500">
            {error}
          </div>
        )}

        {/* Listing rows */}
        {!myLoading && (
          <div className="flex flex-col gap-2.5 max-w-3xl pb-8">
            <AnimatePresence>
              {filtered.length > 0 ? filtered.map((book, i) => {
                const status = getStatus(book);
                const s = statusStyle[status] || statusStyle.Active;
                const img = book.img || book.images?.[0] || "https://placehold.co/120x120/1C7C84/white?text=Book";

                return (
                  <motion.div key={book._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.04 }}
                    className="bg-white rounded-xl border border-gray-200 px-4 py-3.5 flex items-center gap-4 hover:shadow-sm transition"
                  >
                    {/* Thumbnail */}
                    <img src={img} alt={book.title}
                      className="w-[52px] h-[60px] rounded-lg object-cover border border-gray-100 shrink-0"
                      onError={e => { e.target.src = "https://placehold.co/120x120/1C7C84/white?text=Book"; }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
                        <h3 className="text-[14px] font-bold text-gray-900 truncate">{book.title}</h3>
                        <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${s.pill}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-400">{book.author ? `by ${book.author}` : ""}</p>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-[12px] text-gray-400">
                          <Eye className="w-3.5 h-3.5" />
                          {book.views ?? 0} views
                        </span>
                        <span className="flex items-center gap-1 text-[12px] text-gray-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {book.enquiries ?? 0} enquiries
                        </span>
                        <span className={`text-[13px] font-bold ${book.type === "Exchange" ? "text-emerald-600" : "text-[#1C7C84]"}`}>
                          {book.type === "Exchange" ? "Exchange" : book.price}
                        </span>
                        {book.createdAt && (
                          <span className="text-[11.5px] text-gray-400">{timeAgo(book.createdAt)}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => navigate(`/book/${book._id}`)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1C7C84] hover:bg-[#1C7C84]/10 transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book._id)}
                        disabled={deletingId === book._id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingId === book._id
                          ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </motion.div>
                );
              }) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-20 text-gray-400"
                >
                  <Layers className="w-10 h-10 mx-auto mb-3 opacity-25" />
                  <p className="text-[14px] font-semibold">
                    No {activeFilter !== "All" ? activeFilter.toLowerCase() + " " : ""}listings yet
                  </p>
                  <button onClick={() => navigate("/upload")}
                    className="mt-3 text-[13px] text-[#1C7C84] font-semibold hover:underline">
                    + Upload your first book
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Right Panel ── */}
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
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <h3 className="text-[13px] font-bold text-gray-800">Top Sellers</h3>
          </div>
          {topSellers.map(s => (
            <div key={s.name} className="flex items-center gap-3 mb-4 last:mb-0">
              <div className="w-9 h-9 rounded-full bg-[#D1E8EA] flex items-center justify-center text-[#1C7C84] text-[13px] font-bold shrink-0">{s.initial}</div>
              <div>
                <p className="text-[13px] font-semibold text-gray-800 leading-tight">{s.name}</p>
                <p className="text-[11.5px] text-gray-400 mt-0.5"><span className="text-amber-400">★</span> {s.rating} · {s.books}</p>
              </div>
            </div>
          ))}
        </div>
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

export default MyListings;