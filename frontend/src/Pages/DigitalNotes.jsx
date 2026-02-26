import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Heart, MessageCircle, Download, TrendingUp, Star, Clock } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ALL_NOTES = [
  { id: 1,  title: "Data Structures Complete Notes",  category: "Computer Science", seller: "Aarav Mehta",  time: "2 days ago",  downloads: 142, likes: 34, comments: 8  },
  { id: 2,  title: "Organic Chemistry Unit 1-5",      category: "Chemistry",        seller: "Priya Sharma", time: "1 week ago",  downloads: 98,  likes: 21, comments: 5  },
  { id: 3,  title: "Engineering Mathematics III",     category: "Mathematics",      seller: "Ravi Kumar",   time: "3 days ago",  downloads: 215, likes: 56, comments: 12 },
  { id: 4,  title: "Business Law Summary",            category: "Law",              seller: "Neha Gupta",   time: "5 days ago",  downloads: 67,  likes: 18, comments: 3  },
  { id: 5,  title: "Microprocessor Architecture",     category: "Electronics",      seller: "Karan Singh",  time: "4 days ago",  downloads: 83,  likes: 27, comments: 6  },
  { id: 6,  title: "Marketing Management Notes",      category: "Management",       seller: "Ananya Das",   time: "1 day ago",   downloads: 54,  likes: 15, comments: 2  },
  { id: 7,  title: "Digital Electronics Complete",    category: "Electronics",      seller: "Aryan Shah",   time: "6 days ago",  downloads: 176, likes: 44, comments: 9  },
  { id: 8,  title: "Fluid Mechanics Notes",           category: "Mathematics",      seller: "Sneha Iyer",   time: "2 weeks ago", downloads: 129, likes: 38, comments: 7  },
  { id: 9,  title: "Corporate Law Handbook",          category: "Law",              seller: "Meera Nair",   time: "3 days ago",  downloads: 91,  likes: 22, comments: 4  },
  { id: 10, title: "Operating Systems Notes",         category: "Computer Science", seller: "Rohan Verma",  time: "5 days ago",  downloads: 203, likes: 61, comments: 14 },
  { id: 11, title: "Organic Reactions Cheat Sheet",   category: "Chemistry",        seller: "Divya Reddy",  time: "1 week ago",  downloads: 77,  likes: 19, comments: 3  },
  { id: 12, title: "Strategic Management Notes",      category: "Management",       seller: "Aditya Kumar", time: "2 days ago",  downloads: 48,  likes: 11, comments: 1  },
];

const TABS = ["All", "Computer Science", "Chemistry", "Mathematics", "Law", "Electronics", "Management"];

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

const categoryColor = {
  "Computer Science": "text-[#1C7C84] bg-[#1C7C84]/10",
  Chemistry:          "text-purple-600 bg-purple-50",
  Mathematics:        "text-blue-600 bg-blue-50",
  Law:                "text-amber-700 bg-amber-50",
  Electronics:        "text-emerald-600 bg-emerald-50",
  Management:         "text-rose-600 bg-rose-50",
};

// ─── NoteCard ─────────────────────────────────────────────────────────────────
function NoteCard({ note, index }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Preview area */}
      <div className="h-[160px] bg-[#F4F6F8] flex items-center justify-center border-b border-gray-100 group-hover:bg-[#EEF2FF] transition-colors">
        <FileText className="w-12 h-12 text-[#1C7C84]/30 group-hover:text-[#1C7C84]/50 transition-colors" />
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-[13.5px] font-bold text-gray-900 leading-snug">{note.title}</h3>
        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${categoryColor[note.category] ?? "text-gray-500 bg-gray-100"}`}>
          {note.category}
        </span>
        <div className="flex items-center justify-between mt-2 text-[11.5px] text-gray-400">
          <span className="font-medium text-gray-500">{note.seller}</span>
          <span>{note.time}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition"
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <button className="flex items-center gap-1 text-gray-400 hover:text-[#1C7C84] transition">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
        <button className="flex items-center gap-1.5 bg-[#1C7C84] hover:bg-[#155f65] text-white text-[11.5px] font-semibold px-3 py-1.5 rounded-lg transition">
          <Download className="w-3.5 h-3.5" />
          {note.downloads}
        </button>
      </div>
    </motion.div>
  );
}

// ─── DigitalNotes Page ────────────────────────────────────────────────────────
const DigitalNotes = () => {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All"
    ? ALL_NOTES
    : ALL_NOTES.filter(n => n.category === activeTab);

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── Main Feed ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-5"
        >
          Digital Notes
        </motion.h1>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition whitespace-nowrap
                ${activeTab === t
                  ? "bg-[#1C7C84] text-white border-[#1C7C84]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7C84] hover:text-[#1C7C84]"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Notes grid — 3 columns matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-8">
          {filtered.map((note, i) => (
            <NoteCard key={note.id} note={note} index={i} />
          ))}
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

export default DigitalNotes;