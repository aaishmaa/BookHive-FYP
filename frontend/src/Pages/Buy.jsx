import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Search, Heart, MessageCircle,
  Share2, Bookmark, ChevronDown, SlidersHorizontal,
  TrendingUp, Star, Clock,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const BUY_BOOKS = [
  { id: 1, seller: "Aarav Mehta",   si: "A", time: "2 hours ago",  badge: "Good",      title: "Introduction to Algorithms",   author: "by Thomas H. Cormen",      price: "₹450", likes: 24, comments: 5,  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=380&fit=crop" },
  { id: 2, seller: "Neha Gupta",    si: "N", time: "3 hours ago",  badge: "Good",      title: "Business Law for Managers",    author: "by Akhileshwar Pathak",     price: "₹300", likes: 12, comments: 2,  img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=700&h=380&fit=crop" },
  { id: 3, seller: "Aryan Shah",    si: "A", time: "10 hours ago", badge: "Very Good", title: "Operating System Concepts",    author: "by Silberschatz & Galvin",  price: "₹520", likes: 16, comments: 2,  img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&h=380&fit=crop" },
  { id: 4, seller: "Meera Nair",    si: "M", time: "4 hours ago",  badge: "Like New",  title: "Gray's Anatomy",               author: "by Henry Gray",             price: "₹850", likes: 33, comments: 8,  img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&h=380&fit=crop" },
  { id: 5, seller: "Aditya Kumar",  si: "A", time: "1 day ago",    badge: "Like New",  title: "Design Patterns — GoF",        author: "by Gang of Four",           price: "₹670", likes: 42, comments: 9,  img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&h=380&fit=crop" },
  { id: 6, seller: "Rohan Verma",   si: "R", time: "8 hours ago",  badge: "Good",      title: "Machine Learning",             author: "by Tom Mitchell",           price: "₹480", likes: 29, comments: 6,  img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&h=380&fit=crop" },
];

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

const badgeBg = {
  "Like New":  "bg-emerald-600",
  "Very Good": "bg-blue-600",
  Good:        "bg-gray-700",
  Fair:        "bg-amber-600",
  Acceptable:  "bg-slate-600",
};

// ─── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({ book, index }) {
  const [liked, setSaved] = useState(false);
  const [saved, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Seller row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D1E8EA] flex items-center justify-center text-[#1C7C84] text-xs font-bold shrink-0">
            {book.si}
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-gray-800 leading-tight">{book.seller}</p>
            <p className="text-[11.5px] text-gray-400">{book.time}</p>
          </div>
        </div>
        <span className="text-[11.5px] font-medium px-3 py-1 rounded-full bg-[#1C7C84]/10 text-[#1C7C84]">
          Sell
        </span>
      </div>

      {/* Image */}
      <div className="relative w-full h-[220px] overflow-hidden">
        <img src={book.img} alt={book.title} className="w-full h-full object-cover" />
        <span className={`absolute top-3 right-3 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeBg[book.badge] ?? "bg-gray-600"}`}>
          {book.badge}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setSaved(!liked)} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition">
              <Heart className={`w-[17px] h-[17px] ${liked ? "fill-red-500 text-red-500" : ""}`} />
              <span className="text-[12.5px] text-gray-500">{liked ? book.likes + 1 : book.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#1C7C84] transition">
              <MessageCircle className="w-[17px] h-[17px]" />
              <span className="text-[12.5px] text-gray-500">{book.comments}</span>
            </button>
            <button className="text-gray-400 hover:text-[#1C7C84] transition">
              <Share2 className="w-[17px] h-[17px]" />
            </button>
          </div>
          <button onClick={() => setLiked(!saved)} className="transition">
            <Bookmark className={`w-[17px] h-[17px] ${saved ? "fill-[#1C7C84] text-[#1C7C84]" : "text-gray-300 hover:text-gray-400"}`} />
          </button>
        </div>

        <h3 className="text-[14.5px] font-bold text-gray-900 leading-snug mb-0.5">{book.title}</h3>
        <p className="text-[12px] text-gray-400 mb-3">{book.author}</p>

        <div className="flex items-center justify-between">
          <span className="text-[18px] font-extrabold text-[#1C7C84]">{book.price}</span>
          <button className="flex items-center gap-1.5 bg-[#1C7C84] hover:bg-[#155f65] text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition">
            ⊕ View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Buy Page ─────────────────────────────────────────────────────────────────
const BuyPage = () => {
  const [search, setSearch] = useState("");

  const filtered = BUY_BOOKS.filter(b =>
    search
      ? b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── Main ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1C7C84] flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Buy Books</h1>
            <p className="text-[13px] text-gray-400">Browse books available for purchase</p>
          </div>
        </motion.div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-5 focus-within:border-[#1C7C84] transition max-w-2xl">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search books to buy..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full outline-none text-[13.5px] text-gray-700 placeholder:text-gray-400 bg-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {["All Categories", "All Conditions", "Newest"].map((label) => (
            <div key={label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-[13px] text-gray-600 cursor-pointer hover:border-[#1C7C84] transition">
              <span>{label}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          ))}
          <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-[13px] text-gray-600 hover:border-[#1C7C84] hover:text-[#1C7C84] transition">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 pb-8">
          {filtered.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-medium">No books found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <aside className="w-[248px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#1C7C84]" />
            <h3 className="text-[13px] font-bold text-gray-800">Trending Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Engineering", "Medical", "Management", "IT", "Law"].map((c) => (
              <span key={c} className="px-3 py-1 bg-gray-100 text-gray-600 text-[12px] font-medium rounded-full cursor-pointer hover:bg-[#1C7C84]/10 hover:text-[#1C7C84] transition">{c}</span>
            ))}
          </div>
        </div>

        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <h3 className="text-[13px] font-bold text-gray-800">Top Sellers</h3>
          </div>
          {topSellers.map((s) => (
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

export default BuyPage;