import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, Share2, Bookmark,
  ChevronDown, SlidersHorizontal, Search,
  TrendingUp, Star, Clock, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBookStore }     from "../store/bookStore";
import { useWishlistStore } from "../store/wishlistStore";
import TopSellers from "../Components/TopSeller";


const TABS = ["All", "Buy", "Rent", "Exchange", "Digital Notes"];

const LEVEL_DATA = {
  "School":           ["Class 10"],
  "High School (+2)": ["Class 11", "Class 12"],
  "Bachelor":         ["1st Year", "2nd Year", "3rd Year", "4th Year"],
};

const CATEGORIES_BY_LEVEL = {
  "School":           ["Mathematics","Science","English","Nepali","Social Studies","Computer Science","Other"],
  "High School (+2)": ["Mathematics","Physics","Chemistry","Biology","English","Nepali","Computer Science","Account","Economics","Other"],
  "Bachelor":         ["Computer Science / IT","Engineering","Management / BBA / BBS","Medical / Nursing","Law","Education","Science","Arts / Humanities","Other"],
  "":                 ["Engineering","Medical / Nursing","Management","Law","IT / Computer Science","Science","Mathematics","English","History","Fiction","Other"],
};

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
  Acceptable:  "bg-slate-600",
};

// ─── Simple dropdown ──────────────────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const display = value || label;
  const active  = !!value;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center gap-2 border rounded-lg px-3.5 py-2 text-[13px] transition min-w-[130px]
          ${disabled ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" :
            active ? "bg-[#1C7C84]/5 border-[#1C7C84] text-[#1C7C84] font-semibold" :
            "bg-white border-gray-200 text-gray-600 hover:border-[#1C7C84]"}`}>
        <span className="flex-1 text-left truncate">{display}</span>
        {active
          ? <X className="w-3.5 h-3.5 shrink-0" onClick={(e) => { e.stopPropagation(); onChange(""); }} />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[170px] py-1 max-h-52 overflow-y-auto">
            {options.map(o => (
              <button key={o} onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#1C7C84]/5 transition
                  ${o === value ? "text-[#1C7C84] font-semibold bg-[#1C7C84]/5" : "text-gray-700"}`}>
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Price range dropdown ─────────────────────────────────────────────────────
function PriceDropdown({ min, max, onChange }) {
  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = min || max;
  const label  = active ? `Rs.${min || 0} – Rs.${max || "∞"}` : "Price Range";

  const apply = () => { onChange(localMin, localMax); setOpen(false); };
  const clear = () => { setLocalMin(""); setLocalMax(""); onChange("", ""); };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 border rounded-lg px-3.5 py-2 text-[13px] transition min-w-[130px]
          ${active ? "bg-[#1C7C84]/5 border-[#1C7C84] text-[#1C7C84] font-semibold" :
            "bg-white border-gray-200 text-gray-600 hover:border-[#1C7C84]"}`}>
        <span className="flex-1 text-left">{label}</span>
        {active
          ? <X className="w-3.5 h-3.5 shrink-0" onClick={(e) => { e.stopPropagation(); clear(); }} />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-30 w-[220px] p-4">
            <p className="text-[12px] font-semibold text-gray-600 mb-3">Price Range (Rs.)</p>
            <div className="flex items-center gap-2 mb-3">
              <input type="number" min="0" placeholder="Min"
                value={localMin} onChange={e => setLocalMin(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1C7C84]" />
              <span className="text-gray-400 text-[12px]">–</span>
              <input type="number" min="0" placeholder="Max"
                value={localMax} onChange={e => setLocalMax(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1C7C84]" />
            </div>
            <div className="flex gap-2">
              <button onClick={clear}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-500 hover:bg-gray-50 transition">
                Clear
              </button>
              <button onClick={apply}
                className="flex-1 py-1.5 rounded-lg bg-[#1C7C84] text-white text-[12px] font-semibold hover:bg-[#155f65] transition">
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({ book, index, savedIds, onToggleSave }) {
  const navigate = useNavigate();
  const [liked,  setLiked]  = useState(false);
  const [saving, setSaving] = useState(false);

  const isSaved  = !!savedIds[book._id];
  const initials = book.seller
    ? book.seller.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 3600)  return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
    return `${Math.floor(s / 86400)} days ago`;
  };

  const handleSave = async () => {
    setSaving(true);
    await onToggleSave(book._id, savedIds[book._id]);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5 cursor-pointer group"
          onClick={e => { e.stopPropagation(); if (book.userId) navigate(`/user/${book.userId}`); }}>
          <div className="w-8 h-8 rounded-full bg-[#D1E8EA] flex items-center justify-center text-[#1C7C84] text-xs font-bold shrink-0 group-hover:ring-2 group-hover:ring-[#1C7C84] transition">
            {initials}
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-gray-800 leading-tight group-hover:text-[#1C7C84] transition">{book.seller}</p>
            <p className="text-[11.5px] text-gray-400">{timeAgo(book.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {book.level && (
            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {book.level}
            </span>
          )}
          <span className={`text-[11.5px] font-medium px-3 py-1 rounded-full ${typeStyle[book.type] ?? "bg-gray-100 text-gray-500"}`}>
            {book.type}
          </span>
        </div>
      </div>

      <div className="relative w-full h-[220px] overflow-hidden cursor-pointer"
        onClick={() => navigate(`/book/${book._id}`)}>
        <img
          src={book.img || book.images?.[0] || "https://placehold.co/700x380/1C7C84/white?text=No+Image"}
          alt={book.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {book.badge && (
          <span className={`absolute top-3 right-3 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeBg[book.badge] ?? "bg-gray-600"}`}>
            {book.badge}
          </span>
        )}
        {book.classYear && (
          <span className="absolute top-3 left-3 bg-black/50 text-white text-[10.5px] font-medium px-2 py-0.5 rounded-full">
            {book.classYear}
          </span>
        )}
      </div>

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setLiked(!liked)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition">
              <Heart className={`w-[17px] h-[17px] ${liked ? "fill-red-500 text-red-500" : ""}`} />
              <span className="text-[12.5px] text-gray-500">{liked ? (book.likes ?? 0) + 1 : (book.likes ?? 0)}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#1C7C84] transition">
              <MessageCircle className="w-[17px] h-[17px]" />
              <span className="text-[12.5px] text-gray-500">{book.comments ?? 0}</span>
            </button>
            {/* Enquiries — how many people requested this book */}
            {(book.enquiries ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[12px] text-amber-500 font-medium">
                 {book.enquiries} {book.enquiries === 1 ? "request" : "requests"}
              </span>
            )}
            <button className="text-gray-400 hover:text-[#1C7C84] transition">
              <Share2 className="w-[17px] h-[17px]" />
            </button>
          </div>
          <button onClick={handleSave} disabled={saving}
            title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
            className="transition disabled:opacity-40">
            {saving
              ? <div className="w-[17px] h-[17px] border-2 border-[#1C7C84] border-t-transparent rounded-full animate-spin" />
              : <Bookmark className={`w-[17px] h-[17px] transition ${isSaved ? "fill-[#1C7C84] text-[#1C7C84]" : "text-gray-300 hover:text-gray-400"}`} />
            }
          </button>
        </div>

        <h3 className="text-[14.5px] font-bold text-gray-900 leading-snug mb-0.5 cursor-pointer hover:text-[#1C7C84] transition"
          onClick={() => navigate(`/book/${book._id}`)}>
          {book.title}
        </h3>
        <p className="text-[12px] text-gray-400 mb-1">{book.author}</p>
        {book.category && (
          <p className="text-[11.5px] text-gray-400 mb-2">📂 {book.category}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[18px] font-extrabold text-[#1C7C84]">{book.price}</span>
          <button onClick={() => navigate(`/book/${book._id}`)}
            className="flex items-center gap-1.5 bg-[#1C7C84] hover:bg-[#155f65] text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition">
            ⊕ View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [level,     setLevel]     = useState("");
  const [classYear, setClassYear] = useState("");
  const [category,  setCategory]  = useState("");
  const [priceMin,  setPriceMin]  = useState("");
  const [priceMax,  setPriceMax]  = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { books, isLoading, fetchBooks }                               = useBookStore();
  const { wishlist, fetchWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  const typeMap = { All: "all", Buy: "Sell", Rent: "Rent", Exchange: "Exchange" };

  // Derive dependent options
  const classOpts    = level ? LEVEL_DATA[level] || [] : [];
  const categoryOpts = CATEGORIES_BY_LEVEL[level] || CATEGORIES_BY_LEVEL[""];

  const handleLevelChange = (val) => {
    setLevel(val);
    setClassYear("");
    setCategory("");
  };

  useEffect(() => {
    fetchBooks(typeMap[activeTab] || "all", "", category, level, classYear);
  }, [activeTab, category, level, classYear]);

  useEffect(() => { fetchWishlist(); }, []);

  // Client-side price filter (avoids extra backend param)
  const filteredBooks = books.filter(b => {
    if (!priceMin && !priceMax) return true;
    if (b.type === "Exchange")  return true;
    const num = parseFloat(b.price?.replace(/[Rs.,\/mo]/g, "").replace(/Rs/g, "") || "0");
    if (priceMin && num < parseFloat(priceMin)) return false;
    if (priceMax && num > parseFloat(priceMax)) return false;
    return true;
  });

  const savedIds = wishlist.reduce((acc, w) => { acc[w.bookId] = w.id; return acc; }, {});

  const handleToggleSave = async (bookId, wishlistId) => {
    if (wishlistId) await removeFromWishlist(wishlistId);
    else await addToWishlist(bookId);
  };

  const hasActiveFilters = level || classYear || category || priceMin || priceMax;

  const clearAllFilters = () => {
    setLevel(""); setClassYear(""); setCategory("");
    setPriceMin(""); setPriceMax("");
  };

  const recentUploads = books.slice(0, 3).map(b => ({
    id:    b._id,
    title: b.title,
    time:  b.createdAt ? `${Math.floor((Date.now() - new Date(b.createdAt)) / 3600000)}h ago` : "recently",
  }));

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto px-6 py-5">

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {TABS.map(t => (
            <button key={t}
              onClick={() => {
                if (t === "Digital Notes") { navigate("/digital-notes"); return; }
                setActiveTab(t);
              }}
              className={`px-5 py-2 rounded-full text-[13.5px] font-medium border transition
                ${activeTab === t
                  ? "bg-[#1C7C84] text-white border-[#1C7C84]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7C84] hover:text-[#1C7C84]"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Level */}
          <FilterDropdown
            label="Level"
            value={level}
            options={Object.keys(LEVEL_DATA)}
            onChange={handleLevelChange}
          />
          {/* Class/Year — unlocks after level */}
          <FilterDropdown
            label="Class / Year"
            value={classYear}
            options={classOpts}
            onChange={setClassYear}
            disabled={!level}
          />
          {/* Category */}
          <FilterDropdown
            label="Category"
            value={category}
            options={categoryOpts}
            onChange={setCategory}
          />
          {/* Price */}
          <PriceDropdown
            min={priceMin} max={priceMax}
            onChange={(mn, mx) => { setPriceMin(mn); setPriceMax(mx); }}
          />
          {/* Sort */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-[13px] text-gray-600 cursor-pointer hover:border-[#1C7C84] transition min-w-[110px]">
            <span className="flex-1">Newest</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button onClick={clearAllFilters}
              className="flex items-center gap-1 text-[12px] text-red-400 hover:text-red-600 font-medium transition px-2">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              level     && { label: level,     clear: () => handleLevelChange("") },
              classYear && { label: classYear,  clear: () => setClassYear("") },
              category  && { label: category,   clear: () => setCategory("") },
              (priceMin || priceMax) && { label: `Rs.${priceMin||0}–Rs.${priceMax||"∞"}`, clear: () => { setPriceMin(""); setPriceMax(""); } },
            ].filter(Boolean).map((chip, i) => (
              <span key={i}
                className="flex items-center gap-1.5 bg-[#1C7C84]/10 text-[#1C7C84] text-[12px] font-medium px-3 py-1 rounded-full">
                {chip.label}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={chip.clear} />
              </span>
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && (
          <p className="text-[12.5px] text-gray-400 mb-3 font-medium">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 pb-8">
          {isLoading ? (
            <div className="col-span-3 flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#1C7C84] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <Search className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 text-sm font-medium">No books found.</p>
              {hasActiveFilters && (
                <button onClick={clearAllFilters}
                  className="mt-2 text-[13px] text-[#1C7C84] font-semibold hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredBooks.map((book, i) => (
              <BookCard key={book._id} book={book} index={i} savedIds={savedIds} onToggleSave={handleToggleSave} />
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <aside className="w-[260px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#1C7C84]" />
            <h3 className="text-[13px] font-bold text-gray-800">Trending Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Engineering","Medical","Management","IT","Law","Science","Mathematics"].map(c => (
              <span key={c}
                onClick={() => { setCategory(category === c ? "" : c); setActiveTab("All"); }}
                className={`px-3 py-1 text-[12px] font-medium rounded-full cursor-pointer transition
                  ${category === c ? "bg-[#1C7C84] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#1C7C84]/10 hover:text-[#1C7C84]"}`}>
                {c}
              </span>
            ))}
          </div>
        </div>
        <TopSellers />
        <div className="px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-[13px] font-bold text-gray-800">Recent Uploads</h3>
          </div>
          {recentUploads.length === 0
            ? <p className="text-[12px] text-gray-400">No recent uploads yet</p>
            : recentUploads.map(u => (
              <div key={u.id} onClick={() => navigate(`/book/${u.id}`)}
                className="mb-3.5 last:mb-0 cursor-pointer group">
                <p className="text-[13px] font-semibold text-gray-800 leading-tight group-hover:text-[#1C7C84] transition truncate">{u.title}</p>
                <p className="text-[11.5px] text-gray-400 mt-0.5">{u.time}</p>
              </div>
            ))
          }
        </div>
      </aside>
    </div>
  );
};

export default Home;