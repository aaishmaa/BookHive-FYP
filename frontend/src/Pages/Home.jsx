import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, MessageCircle, Share2, Bookmark,
  ChevronDown, SlidersHorizontal,
  TrendingUp, Star, Clock,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ALL_BOOKS = [
  { id: 1,  seller: "Aarav Mehta",   si: "A", time: "2 hours ago",  type: "Sell",     badge: "Good",       title: "Introduction to Algorithms",       author: "by Thomas H. Cormen",       price: "₹450",     likes: 24, comments: 5, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=380&fit=crop" },
  { id: 2,  seller: "Priya Sharma",  si: "P", time: "5 hours ago",  type: "Rent",     badge: "Like New",   title: "Organic Chemistry Morrison & Boyd", author: "by Robert Morrison",        price: "₹150/mo",  likes: 18, comments: 3, img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=700&h=380&fit=crop" },
  { id: 3,  seller: "Ravi Kumar",    si: "R", time: "1 day ago",    type: "Exchange", badge: "Fair",       title: "Engineering Mathematics",           author: "by B.S. Grewal",            price: "For Exchange", likes: 9, comments: 2, img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=700&h=380&fit=crop" },
  { id: 4,  seller: "Neha Gupta",    si: "N", time: "3 hours ago",  type: "Sell",     badge: "Good",       title: "Business Law for Managers",         author: "by Akhileshwar Pathak",     price: "₹300",     likes: 14, comments: 1, img: "https://images.unsplash.com/photo-1568667256549-094345857637?w=700&h=380&fit=crop" },
  { id: 5,  seller: "Karan Singh",   si: "K", time: "6 hours ago",  type: "Rent",     badge: "Very Good",  title: "Computer Networks",                 author: "by Andrew Tanenbaum",       price: "₹200/mo",  likes: 21, comments: 4, img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=700&h=380&fit=crop" },
  { id: 6,  seller: "Ananya Das",    si: "A", time: "12 hours ago", type: "Exchange", badge: "Acceptable", title: "Microeconomics Theory",             author: "by Hal Varian",             price: "For Exchange", likes: 7, comments: 0, img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=700&h=380&fit=crop" },
  { id: 7,  seller: "Meera Nair",    si: "M", time: "4 hours ago",  type: "Sell",     badge: "Like New",   title: "Gray's Anatomy",                    author: "by Henry Gray",             price: "₹850",     likes: 33, comments: 8, img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&h=380&fit=crop" },
  { id: 8,  seller: "Rohan Verma",   si: "R", time: "8 hours ago",  type: "Rent",     badge: "Good",       title: "Machine Learning",                  author: "by Tom Mitchell",           price: "₹180/mo",  likes: 29, comments: 6, img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&h=380&fit=crop" },
  { id: 9,  seller: "Divya Reddy",   si: "D", time: "2 days ago",   type: "Exchange", badge: "Fair",       title: "Financial Accounting",              author: "by R.L. Gupta",             price: "For Exchange", likes: 5, comments: 1, img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&h=380&fit=crop" },
  { id: 10, seller: "Aryan Shah",    si: "A", time: "10 hours ago", type: "Sell",     badge: "Very Good",  title: "Operating System Concepts",         author: "by Silberschatz & Galvin",  price: "₹520",     likes: 16, comments: 2, img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&h=380&fit=crop" },
  { id: 11, seller: "Sneha Iyer",    si: "S", time: "3 days ago",   type: "Rent",     badge: "Good",       title: "Pharmacology Essentials",           author: "by Rang & Dale",            price: "₹220/mo",  likes: 11, comments: 3, img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&h=380&fit=crop" },
  { id: 12, seller: "Aditya Kumar",  si: "A", time: "1 day ago",    type: "Sell",     badge: "Like New",   title: "Design Patterns — GoF",             author: "by Gang of Four",           price: "₹670",     likes: 42, comments: 9, img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&h=380&fit=crop" },
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

const TABS = ["All", "Buy", "Rent", "Exchange", "Digital Notes"];

const typeStyle = {
  Sell:     "bg-[#EEF2FF] text-indigo-500",
  Rent:     "bg-purple-50 text-purple-500",
  Exchange: "bg-green-50 text-green-600",
};

const badgeBg = {
  "Like New":  "bg-emerald-600",
  "Very Good": "bg-blue-600",
  Good:        "bg-gray-700",
  Fair:        "bg-amber-600",
  Used:        "bg-orange-700",
  Acceptable:  "bg-slate-600",
};

// ─── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({ book, index }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
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
        <span className={`text-[11.5px] font-medium px-3 py-1 rounded-full ${typeStyle[book.type]}`}>
          {book.type}
        </span>
      </div>

      <div className="relative w-full h-[220px] overflow-hidden">
        <img src={book.img} alt={book.title} className="w-full h-full object-cover" />
        <span className={`absolute top-3 right-3 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeBg[book.badge] ?? "bg-gray-600"}`}>
          {book.badge}
        </span>
      </div>

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setLiked(!liked)} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition">
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
          <button onClick={() => setSaved(!saved)} className="transition">
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

// ─── Home Page ────────────────────────────────────────────────────────────────
// NOTE: No Navbar or Sidebar here — AppLayout in App.jsx provides those
const Home = () => {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = ALL_BOOKS.filter((b) =>
    activeTab === "All"   ? true :
    activeTab === "Buy"   ? b.type === "Sell" :
    b.type === activeTab
  );

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── Feed ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-full text-[13.5px] font-medium border transition
                ${activeTab === t
                  ? "bg-[#1C7C84] text-white border-[#1C7C84]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7C84] hover:text-[#1C7C84]"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-[13px] text-gray-600 cursor-pointer hover:border-[#1C7C84] transition min-w-[150px]">
            <span className="flex-1">All Categories</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-[13px] text-gray-600 cursor-pointer hover:border-[#1C7C84] transition min-w-[130px]">
            <span className="flex-1">Newest</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
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
        </div>
      </div>

      {/* ── Right Panel ── */}
      <aside className="w-[260px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#1C7C84]" />
            <h3 className="text-[13px] font-bold text-gray-800">Trending Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Engineering", "Medical", "Management", "IT", "Law"].map((c) => (
              <span key={c} className="px-3 py-1 bg-gray-100 text-gray-600 text-[12px] font-medium rounded-full cursor-pointer hover:bg-[#1C7C84]/10 hover:text-[#1C7C84] transition">
                {c}
              </span>
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
              <div className="w-9 h-9 rounded-full bg-[#D1E8EA] flex items-center justify-center text-[#1C7C84] text-[13px] font-bold shrink-0">
                {s.initial}
              </div>
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

export default Home;