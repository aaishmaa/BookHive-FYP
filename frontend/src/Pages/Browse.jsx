import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Search, Heart, MessageCircle, Share2, Bookmark,ChevronDown, SlidersHorizontal, TrendingUp, Star, Clock, X,} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBookStore }     from "../store/bookStore";
import { useWishlistStore } from "../store/wishlistStore";
import TopSellers from "../Components/TopSeller";

const TABS = ["All", "Buy", "Rent", "Exchange"];
const SORTS = ["Newest", "Oldest"];

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


const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  return `${Math.floor(s / 86400)} days ago`;
};

// ─── FilterDropdown ───────────────────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center gap-2 border rounded-lg px-3.5 py-2 text-[13px] transition min-w-[130px]
          ${disabled ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" :
            value ? "bg-[#1C7C84]/5 border-[#1C7C84] text-[#1C7C84] font-semibold" :
            "bg-white border-gray-200 text-gray-600 hover:border-[#1C7C84]"}`}>
        <span className="flex-1 text-left truncate">{value || label}</span>
        {value
          ? <X className="w-3.5 h-3.5 shrink-0" onClick={(e) => { e.stopPropagation(); onChange(""); }} />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[180px] py-1 max-h-56 overflow-y-auto">
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

// ─── PriceDropdown ────────────────────────────────────────────────────────────
function PriceDropdown({ min, max, onChange }) {
  const [open, setOpen] = useState(false);
  const [lMin, setLMin] = useState(min);
  const [lMax, setLMax] = useState(max);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const active = min || max;
  const label  = active ? `₹${min||0} – ₹${max||"∞"}` : "Price Range";
  const clear  = () => { setLMin(""); setLMax(""); onChange("", ""); };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 border rounded-lg px-3.5 py-2 text-[13px] transition min-w-[130px]
          ${active ? "bg-[#1C7C84]/5 border-[#1C7C84] text-[#1C7C84] font-semibold" :
            "bg-white border-gray-200 text-gray-600 hover:border-[#1C7C84]"}`}>
        <span className="flex-1 text-left">{label}</span>
        {active
          ? <X className="w-3.5 h-3.5 shrink-0" onClick={(e) => { e.stopPropagation(); clear(); }} />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-30 w-[220px] p-4">
            <p className="text-[12px] font-semibold text-gray-600 mb-3">Price Range (₹)</p>
            <div className="flex items-center gap-2 mb-3">
              <input type="number" min="0" placeholder="Min" value={lMin} onChange={e => setLMin(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1C7C84]" />
              <span className="text-gray-400 text-[12px]">–</span>
              <input type="number" min="0" placeholder="Max" value={lMax} onChange={e => setLMax(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1C7C84]" />
            </div>
            <div className="flex gap-2">
              <button onClick={clear}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-500 hover:bg-gray-50 transition">Clear</button>
              <button onClick={() => { onChange(lMin, lMax); setOpen(false); }}
                className="flex-1 py-1.5 rounded-lg bg-[#1C7C84] text-white text-[12px] font-semibold hover:bg-[#155f65] transition">Apply</button>
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

  const handleSave = async () => {
    setSaving(true);
    await onToggleSave(book._id, savedIds[book._id]);
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">

      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D1E8EA] flex items-center justify-center text-[#1C7C84] text-xs font-bold shrink-0">{initials}</div>
          <div>
            <p className="text-[13.5px] font-semibold text-gray-800 leading-tight">{book.seller}</p>
            <p className="text-[11.5px] text-gray-400">{timeAgo(book.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {book.level && <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{book.level}</span>}
          <span className={`text-[11.5px] font-medium px-3 py-1 rounded-full ${typeStyle[book.type] ?? "bg-gray-100 text-gray-500"}`}>{book.type}</span>
        </div>
      </div>

      <div className="relative w-full h-[210px] overflow-hidden cursor-pointer" onClick={() => navigate(`/book/${book._id}`)}>
        <img src={book.img || book.images?.[0] || "https://placehold.co/700x400/1C7C84/white?text=No+Image"}
          alt={book.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
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
            <button onClick={() => setLiked(!liked)} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition">
              <Heart className={`w-[17px] h-[17px] ${liked ? "fill-red-500 text-red-500" : ""}`} />
              <span className="text-[12.5px] text-gray-500">{liked ? (book.likes ?? 0) + 1 : (book.likes ?? 0)}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#1C7C84] transition">
              <MessageCircle className="w-[17px] h-[17px]" />
              <span className="text-[12.5px] text-gray-500">{book.comments ?? 0}</span>
            </button>
            <button className="text-gray-400 hover:text-[#1C7C84] transition"><Share2 className="w-[17px] h-[17px]" /></button>
          </div>
          <button onClick={handleSave} disabled={saving} className="transition disabled:opacity-40">
            {saving
              ? <div className="w-[17px] h-[17px] border-2 border-[#1C7C84] border-t-transparent rounded-full animate-spin" />
              : <Bookmark className={`w-[17px] h-[17px] transition ${isSaved ? "fill-[#1C7C84] text-[#1C7C84]" : "text-gray-300 hover:text-gray-400"}`} />}
          </button>
        </div>

        <h3 onClick={() => navigate(`/book/${book._id}`)}
          className="text-[14.5px] font-bold text-gray-900 leading-snug mb-0.5 hover:text-[#1C7C84] transition cursor-pointer">
          {book.title}
        </h3>
        <p className="text-[12px] text-gray-400 mb-1">{book.author}</p>
        {book.category && <p className="text-[11.5px] text-gray-400 mb-2">📂 {book.category}</p>}

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

// ─── BrowsePage ───────────────────────────────────────────────────────────────
const BrowsePage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [inputVal,  setInputVal]  = useState("");
  const [search,    setSearch]    = useState("");
  const [level,     setLevel]     = useState("");
  const [classYear, setClassYear] = useState("");
  const [category,  setCategory]  = useState("");
  const [priceMin,  setPriceMin]  = useState("");
  const [priceMax,  setPriceMax]  = useState("");
  const [sort,      setSort]      = useState("Newest");

  const { books, isLoading, fetchBooks }                               = useBookStore();
  const { wishlist, fetchWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  const typeMap = { All: "all", Buy: "Sell", Rent: "Rent", Exchange: "Exchange" };

  const classOpts    = level ? LEVEL_DATA[level] || [] : [];
  const categoryOpts = CATEGORIES_BY_LEVEL[level] || CATEGORIES_BY_LEVEL[""];

  const handleLevelChange = (val) => { setLevel(val); setClassYear(""); setCategory(""); };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(inputVal), 400);
    return () => clearTimeout(t);
  }, [inputVal]);

  useEffect(() => {
    fetchBooks(typeMap[activeTab] || "all", search, category, level, classYear);
  }, [activeTab, search, category, level, classYear]);

  useEffect(() => { fetchWishlist(); }, []);

  // Client-side price filter + sort
  const filtered = [...books]
    .filter(b => {
      if (!priceMin && !priceMax) return true;
      if (b.type === "Exchange")  return true;
      const num = parseFloat(b.price?.replace(/[₹,\/mo]/g, "") || "0");
      if (priceMin && num < parseFloat(priceMin)) return false;
      if (priceMax && num > parseFloat(priceMax)) return false;
      return true;
    })
    .sort((a, b) => sort === "Oldest"
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt)
    );

  const savedIds = wishlist.reduce((acc, w) => { acc[w.bookId] = w.id; return acc; }, {});
  const handleToggleSave = async (bookId, wishlistId) => {
    if (wishlistId) await removeFromWishlist(wishlistId);
    else await addToWishlist(bookId);
  };

  const hasFilters = level || classYear || category || priceMin || priceMax || search;
  const clearAll   = () => {
    setInputVal(""); setSearch(""); setLevel(""); setClassYear("");
    setCategory(""); setPriceMin(""); setPriceMax("");
  };

  const recentUploads = books.slice(0, 3).map(b => ({ id: b._id, title: b.title, time: timeAgo(b.createdAt) }));

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto px-6 py-5">

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-5 focus-within:border-[#1C7C84] transition max-w-2xl">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="text" placeholder="Search by title, author, seller..."
            value={inputVal} onChange={e => setInputVal(e.target.value)}
            className="w-full outline-none text-[13.5px] text-gray-700 placeholder:text-gray-400 bg-transparent" />
          {inputVal && (
            <button onClick={() => { setInputVal(""); setSearch(""); }}
              className="text-gray-300 hover:text-gray-500 transition text-lg leading-none">×</button>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-full text-[13.5px] font-medium border transition
                ${activeTab === t
                  ? "bg-[#1C7C84] text-white border-[#1C7C84]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7C84] hover:text-[#1C7C84]"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <FilterDropdown label="Level"       value={level}     options={Object.keys(LEVEL_DATA)} onChange={handleLevelChange} />
          <FilterDropdown label="Class / Year" value={classYear} options={classOpts}              onChange={setClassYear} disabled={!level} />
          <FilterDropdown label="Category"    value={category}  options={categoryOpts}            onChange={setCategory} />
          <PriceDropdown  min={priceMin} max={priceMax} onChange={(mn, mx) => { setPriceMin(mn); setPriceMax(mx); }} />
          <FilterDropdown label="Sort" value={sort} options={SORTS} onChange={setSort} />

          {hasFilters && (
            <button onClick={clearAll}
              className="flex items-center gap-1 text-[12px] text-red-400 hover:text-red-600 font-medium px-2 transition">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        {/* Active chips */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              search    && { label: `"${search}"`,      clear: () => { setInputVal(""); setSearch(""); } },
              level     && { label: level,              clear: () => handleLevelChange("") },
              classYear && { label: classYear,          clear: () => setClassYear("") },
              category  && { label: category,           clear: () => setCategory("") },
              (priceMin||priceMax) && { label: `₹${priceMin||0}–₹${priceMax||"∞"}`, clear: () => { setPriceMin(""); setPriceMax(""); } },
            ].filter(Boolean).map((chip, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-[#1C7C84]/10 text-[#1C7C84] text-[12px] font-medium px-3 py-1 rounded-full">
                {chip.label}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={chip.clear} />
              </span>
            ))}
          </div>
        )}

        {/* Count */}
        <p className="text-[13px] text-gray-500 mb-4 font-medium">
          {isLoading ? "Loading..." : `${filtered.length} book${filtered.length !== 1 ? "s" : ""} found`}
          {search && !isLoading && <span> for "<span className="text-[#1C7C84]">{search}</span>"</span>}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 pb-8">
          {isLoading ? (
            <div className="col-span-3 flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#1C7C84] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-medium">{search ? `No books found for "${search}"` : "No books found"}</p>
              {hasFilters && (
                <button onClick={clearAll} className="mt-2 text-[13px] text-[#1C7C84] font-semibold hover:underline">Clear filters</button>
              )}
            </div>
          ) : (
            filtered.map((book, i) => (
              <BookCard key={book._id} book={book} index={i} savedIds={savedIds} onToggleSave={handleToggleSave} />
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <aside className="w-[248px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#1C7C84]" />
            <h3 className="text-[13px] font-bold text-gray-800">Trending Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Engineering","Medical","Management","IT","Law","Science","Mathematics"].map(c => (
              <span key={c} onClick={() => setCategory(category === c ? "" : c)}
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

export default BrowsePage;