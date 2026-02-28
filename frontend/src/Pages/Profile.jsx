import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Mail, Star, Edit3,
  BookOpen, TrendingUp, ArrowLeftRight, Download,
  Heart, MessageCircle, Share2, Bookmark,
  TrendingUp as TrendIcon, Clock,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ALL_BOOKS = [
  { id: 1,  seller: "Aarav Mehta",  si: "A", time: "2 hours ago",  type: "Sell",     badge: "Good",      title: "Introduction to Algorithms",       author: "by Thomas H. Cormen",       price: "₹450",     likes: 24, comments: 5, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=380&fit=crop" },
  { id: 2,  seller: "Priya Sharma", si: "P", time: "5 hours ago",  type: "Rent",     badge: "Like New",  title: "Organic Chemistry Morrison & Boyd", author: "by Robert Morrison",        price: "₹150/mo",  likes: 18, comments: 3, img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=700&h=380&fit=crop" },
  { id: 3,  seller: "Ravi Kumar",   si: "R", time: "1 day ago",    type: "Exchange", badge: "Fair",      title: "Engineering Mathematics",           author: "by B.S. Grewal",            price: "For Exchange", likes: 9, comments: 2, img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=700&h=380&fit=crop" },
  { id: 4,  seller: "Neha Gupta",   si: "N", time: "3 hours ago",  type: "Sell",     badge: "Good",      title: "Business Law for Managers",         author: "by Akhileshwar Pathak",     price: "₹300",     likes: 14, comments: 1, img: "https://images.unsplash.com/photo-1568667256549-094345857637?w=700&h=380&fit=crop" },
  { id: 5,  seller: "Karan Singh",  si: "K", time: "6 hours ago",  type: "Rent",     badge: "Very Good", title: "Computer Networks",                 author: "by Andrew Tanenbaum",       price: "₹200/mo",  likes: 21, comments: 4, img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=700&h=380&fit=crop" },
  { id: 6,  seller: "Ananya Das",   si: "A", time: "12 hours ago", type: "Exchange", badge: "Acceptable",title: "Microeconomics Theory",             author: "by Hal Varian",             price: "For Exchange", likes: 7, comments: 0, img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=700&h=380&fit=crop" },
  { id: 7,  seller: "Meera Nair",   si: "M", time: "4 hours ago",  type: "Sell",     badge: "Like New",  title: "Gray's Anatomy",                    author: "by Henry Gray",             price: "₹850",     likes: 33, comments: 8, img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&h=380&fit=crop" },
  { id: 8,  seller: "Rohan Verma",  si: "R", time: "8 hours ago",  type: "Rent",     badge: "Good",      title: "Machine Learning",                  author: "by Tom Mitchell",           price: "₹180/mo",  likes: 29, comments: 6, img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&h=380&fit=crop" },
];

const DIGITAL_NOTES = [
  { id: 1, title: "Data Structures Complete Notes", category: "Computer Science", downloads: 142, time: "2 days ago" },
  { id: 2, title: "Algorithms Cheat Sheet",         category: "Computer Science", downloads: 98,  time: "1 week ago" },
  { id: 3, title: "OS Concepts Summary",            category: "Computer Science", downloads: 76,  time: "3 days ago" },
];

const REVIEWS = [
  { id: 1, name: "Priya Sharma",  initial: "P", rating: 5, text: "Great seller! Book was in perfect condition, exactly as described.", time: "2 days ago" },
  { id: 2, name: "Karan Singh",   initial: "K", rating: 4, text: "Fast response and smooth transaction. Would buy again.", time: "1 week ago" },
  { id: 3, name: "Neha Gupta",    initial: "N", rating: 5, text: "Highly recommended! Very cooperative and honest about book condition.", time: "2 weeks ago" },
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

const typeStyle = {
  Sell:     "bg-[#1C7C84]/10 text-[#1C7C84]",
  Rent:     "bg-purple-50 text-purple-500",
  Exchange: "bg-emerald-50 text-emerald-600",
};

const badgeBg = {
  "Like New":  "bg-emerald-600",
  "Very Good": "bg-blue-600",
  Good:        "bg-gray-700",
  Fair:        "bg-amber-600",
  Acceptable:  "bg-slate-600",
};

const TABS = ["Uploaded Books", "Digital Notes", "Reviews", "Saved Posts"];

// ─── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({ book, index }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
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

      <div className="relative w-full h-[200px] overflow-hidden">
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
        <h3 className="text-[14px] font-bold text-gray-900 leading-snug mb-0.5">{book.title}</h3>
        <p className="text-[12px] text-gray-400 mb-3">{book.author}</p>
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-extrabold text-[#1C7C84]">{book.price}</span>
          <button className="flex items-center gap-1.5 bg-[#1C7C84] hover:bg-[#155f65] text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition">
            ⊕ View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("Uploaded Books");
  const { user } = useAuthStore();

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const displayName = user?.name || "Aarav Mehta";

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── Main ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Cover banner */}
        <div className="w-full h-[120px] bg-gradient-to-r from-[#1C7C84] to-[#2E86AB] shrink-0" />

        {/* Profile card */}
        <div className="px-6 pb-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-2xl border border-gray-200 px-6 pt-5 pb-5 -mt-6 relative shadow-sm"
          >
            {/* Avatar + Edit */}
            <div className="flex items-start justify-between mb-3">
              <div className="w-16 h-16 rounded-full bg-[#1C7C84] flex items-center justify-center text-white text-2xl font-bold -mt-10 border-4 border-white shadow-md shrink-0">
                {getInitials(displayName)}
              </div>
              <button className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#1C7C84] hover:text-[#1C7C84] transition">
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>

            {/* Name + info */}
            <h2 className="text-[18px] font-bold text-gray-900 leading-tight">{displayName}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-[12.5px] text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-[#1C7C84]" />
              <span>IIT Delhi</span>
              <span className="text-gray-300 mx-1">|</span>
              <span>Computer Science · 3rd Year</span>
            </div>

            <p className="text-[13px] text-gray-500 mt-2.5 leading-relaxed max-w-xl">
              Passionate about sharing knowledge. CS undergrad who loves algorithms and open-source projects.
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                <Star className="w-3.5 h-3.5 text-gray-200 fill-gray-200" />
                <span className="text-[12px] text-gray-500 ml-1">(4.2 · 24 reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                Joined Sep 2023
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                <Mail className="w-3.5 h-3.5" />
                {user?.email || "aarav.mehta@iitd.ac.in"}
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="grid grid-cols-4 gap-3 mt-4"
          >
            {[
              { icon: BookOpen,       label: "Books Listed", value: "12" },
              { icon: TrendingUp,     label: "Books Sold",   value: "8"  },
              { icon: ArrowLeftRight, label: "Exchanges",    value: "3"  },
              { icon: Download,       label: "Downloads",    value: "156"},
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 py-4 flex flex-col items-center gap-1.5">
                <s.icon className="w-5 h-5 text-[#1C7C84]" />
                <p className="text-[20px] font-bold text-gray-900">{s.value}</p>
                <p className="text-[11.5px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-0 mt-5 border-b border-gray-200">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-5 py-2.5 text-[13.5px] font-medium border-b-2 transition -mb-px
                  ${activeTab === t
                    ? "border-[#1C7C84] text-[#1C7C84]"
                    : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-5 pb-8">

            {/* Uploaded Books */}
            {activeTab === "Uploaded Books" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                {ALL_BOOKS.map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))}
              </div>
            )}

            {/* Digital Notes */}
            {activeTab === "Digital Notes" && (
              <div className="flex flex-col gap-3 max-w-2xl">
                {DIGITAL_NOTES.map((note, i) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1C7C84]/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-[#1C7C84]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-gray-900">{note.title}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{note.category} · {note.time}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#1C7C84] text-[12.5px] font-semibold">
                      <Download className="w-4 h-4" />
                      {note.downloads}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Reviews */}
            {activeTab === "Reviews" && (
              <div className="flex flex-col gap-3 max-w-2xl">
                {REVIEWS.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 px-5 py-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-[#D1E8EA] flex items-center justify-center text-[#1C7C84] text-[13px] font-bold shrink-0">
                        {r.initial}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{r.name}</p>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} className={`w-3 h-3 ${idx < r.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                          ))}
                          <span className="text-[11px] text-gray-400 ml-1">{r.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[13px] text-gray-600 leading-relaxed">{r.text}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Saved Posts */}
            {activeTab === "Saved Posts" && (
              <div className="text-center py-16 text-gray-400">
                <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="text-[14px] font-semibold">No saved posts yet</p>
                <p className="text-[12.5px] mt-1">Books you save will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <aside className="w-[248px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendIcon className="w-4 h-4 text-[#1C7C84]" />
            <h3 className="text-[13px] font-bold text-gray-800">Trending Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Engineering", "Medical", "Management", "IT", "Law"].map(c => (
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

export default ProfilePage;