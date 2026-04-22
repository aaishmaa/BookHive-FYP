import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Mail, Star, Edit3,
  BookOpen, TrendingUp, ArrowLeftRight, Download,
  Heart, MessageCircle, Share2, Bookmark,
  TrendingUp as TrendIcon, Clock, Loader,
  X, Phone, GraduationCap, Save, Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore }    from "../store/authStore";
import { useBookStore }    from "../store/bookStore";
import { useNotesStore }   from "../store/notesStore";
import { useWishlistStore } from "../store/wishlistStore";

const API_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/profile"
  : "/profile";

const typeStyle = {
  Sell: "bg-[#1C7C84]/10 text-[#1C7C84]",
  Rent: "bg-purple-50 text-purple-500",
  Exchange: "bg-emerald-50 text-emerald-600",
};
const badgeBg = {
  "Like New": "bg-emerald-600", "Very Good": "bg-blue-600",
  Good: "bg-gray-700", Fair: "bg-amber-600", Acceptable: "bg-slate-600",
};
const TABS = ["Uploaded Books", "Digital Notes", "Reviews", "Saved Posts"];
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600) return `${Math.floor(s/60)} min ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)} days ago`;
};
const topSellers = [
  { name: "Priya Sharma", rating: "4.9", books: "24 books", initial: "P" },
  { name: "Arjun Patel",  rating: "4.8", books: "18 books", initial: "A" },
  { name: "Sara Khan",    rating: "4.7", books: "15 books", initial: "S" },
];

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditModal({ user, onClose, onSave }) {
  const avatarRef = useRef();
  const [form, setForm] = useState({
    name:    user?.name    || "",
    bio:     user?.bio     || "",
    college: user?.college || "",
    phone:   user?.phone   || "",
  });
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || "");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024)    { setError("Image must be under 5 MB");     return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",    form.name.trim());
      fd.append("bio",     form.bio.trim());
      fd.append("college", form.college.trim());
      fd.append("phone",   form.phone.trim());
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await axios.patch(`${API_URL}/me`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSave(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || "Error saving profile");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[460px] p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">Edit Profile</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Update your personal information</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar upload */}
        <div className="flex justify-center mb-5">
          <div className="relative group cursor-pointer" onClick={() => avatarRef.current.click()}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1C7C84] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md">
                {form.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#1C7C84] rounded-full flex items-center justify-center border-2 border-white">
              <Camera className="w-3 h-3 text-white" />
            </div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>
        <p className="text-center text-[11.5px] text-gray-400 -mt-3 mb-5">Click avatar to change photo</p>

        {/* Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.name} onChange={e => setF("name", e.target.value)}
              placeholder="e.g. Aarav Mehta"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#1C7C84] transition" />
          </div>

          {/* College */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5"/>College / University</span>
            </label>
            <input type="text" value={form.college} onChange={e => setF("college", e.target.value)}
              placeholder="e.g. Tribhuvan University"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#1C7C84] transition" />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/>Phone Number</span>
            </label>
            <input type="tel" value={form.phone} onChange={e => setF("phone", e.target.value)}
              placeholder="e.g. 98XXXXXXXX"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#1C7C84] transition" />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Bio</label>
            <textarea rows={3} value={form.bio} onChange={e => setF("bio", e.target.value)}
              placeholder="Tell others a bit about yourself..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#1C7C84] transition resize-none" />
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-[12px] text-red-500 mt-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#1C7C84] hover:bg-[#155f65] text-white text-[13px] font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({ book, index }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const initials = book.seller?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";
  return (
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.25, delay:index*0.05 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D1E8EA] flex items-center justify-center text-[#1C7C84] text-xs font-bold shrink-0">{initials}</div>
          <div>
            <p className="text-[13.5px] font-semibold text-gray-800 leading-tight">{book.seller}</p>
            <p className="text-[11.5px] text-gray-400">{timeAgo(book.createdAt)}</p>
          </div>
        </div>
        <span className={`text-[11.5px] font-medium px-3 py-1 rounded-full ${typeStyle[book.type] ?? "bg-gray-100 text-gray-500"}`}>{book.type}</span>
      </div>
      <div className="relative w-full h-[200px] overflow-hidden cursor-pointer" onClick={() => navigate(`/book/${book._id}`)}>
        <img src={book.img || book.images?.[0] || "https://placehold.co/700x380/1C7C84/white?text=Book"}
          alt={book.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
        {book.badge && <span className={`absolute top-3 right-3 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeBg[book.badge]??'bg-gray-600'}`}>{book.badge}</span>}
        {book.status && book.status !== 'Active' && (
          <span className={`absolute top-3 left-3 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full
            ${book.status==='Sold'?'bg-gray-800':book.status==='Expired'?'bg-red-500':'bg-slate-500'}`}>{book.status}</span>
        )}
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => setLiked(!liked)} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition">
            <Heart className={`w-[17px] h-[17px] ${liked?"fill-red-500 text-red-500":""}`}/>
            <span className="text-[12.5px] text-gray-500">{liked?(book.likes??0)+1:(book.likes??0)}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#1C7C84] transition">
            <MessageCircle className="w-[17px] h-[17px]"/>
            <span className="text-[12.5px] text-gray-500">{book.comments??0}</span>
          </button>
          <button className="text-gray-400 hover:text-[#1C7C84] transition"><Share2 className="w-[17px] h-[17px]"/></button>
        </div>
        <h3 onClick={() => navigate(`/book/${book._id}`)} className="text-[14px] font-bold text-gray-900 leading-snug mb-0.5 hover:text-[#1C7C84] transition cursor-pointer">{book.title}</h3>
        <p className="text-[12px] text-gray-400 mb-3">{book.author}</p>
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-extrabold text-[#1C7C84]">{book.price}</span>
          <button onClick={() => navigate(`/book/${book._id}`)} className="bg-[#1C7C84] hover:bg-[#155f65] text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition">⊕ View Details</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const [activeTab,  setActiveTab]  = useState("Uploaded Books");
  const [showEdit,   setShowEdit]   = useState(false);
  const navigate = useNavigate();

  const { user, setUser }                          = useAuthStore();
  const { myBooks, myLoading, fetchMyBooks }        = useBookStore();
  const { myNotes, fetchMyNotes }                   = useNotesStore();
  const { wishlist, fetchWishlist }                 = useWishlistStore();

  useEffect(() => {
    fetchMyBooks();
    if (fetchMyNotes) fetchMyNotes();
    fetchWishlist();
  }, []);

  const displayName   = user?.name || "User";
  const getInitials   = (n) => n?.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2) || "U";
  const totalListed   = myBooks.length;
  const totalSold     = myBooks.filter(b => b.status === 'Sold').length;
  const totalExchange = myBooks.filter(b => b.type  === 'Exchange').length;
  const totalNotes    = myNotes?.length || 0;
  const recentUploads = myBooks.slice(0,3).map(b => ({ title: b.title, time: timeAgo(b.createdAt) }));

  const handleSaveProfile = (updatedUser) => {
    if (setUser) setUser(updatedUser);
    else window.location.reload(); 
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && <EditModal user={user} onClose={() => setShowEdit(false)} onSave={handleSaveProfile} />}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full h-[120px] bg-gradient-to-r from-[#1C7C84] to-[#2E86AB] shrink-0" />
        <div className="px-6 pb-0">

          {/* Profile card */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="bg-white rounded-2xl border border-gray-200 px-6 pt-5 pb-5 -mt-6 relative shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-16 h-16 rounded-full -mt-10 border-4 border-white shadow-md shrink-0 overflow-hidden">
                {user?.profileImage
                  ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-[#1C7C84] flex items-center justify-center text-white text-2xl font-bold">{getInitials(displayName)}</div>
                }
              </div>
              <button onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#1C7C84] hover:text-[#1C7C84] transition">
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>

            <h2 className="text-[18px] font-bold text-gray-900 leading-tight">{displayName}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
                <Mail className="w-3.5 h-3.5"/>{user?.email || "—"}
              </span>
              {user?.college && (
                <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1C7C84]"/>{user.college}
                </span>
              )}
              {user?.phone && (
                <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
                  <Phone className="w-3.5 h-3.5"/>{user.phone}
                </span>
              )}
            </div>

            {user?.bio && <p className="text-[13px] text-gray-500 mt-2.5 leading-relaxed max-w-xl">{user.bio}</p>}

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[1,2,3,4].map(i=><Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/>)}
                <Star className="w-3.5 h-3.5 text-gray-200 fill-gray-200"/>
                <span className="text-[12px] text-gray-500 ml-1">(4.2 · 24 reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                <Calendar className="w-3.5 h-3.5"/>
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : "—"}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="grid grid-cols-4 gap-3 mt-4">
            {[
              { icon: BookOpen,       label: "Books Listed", value: myLoading?"—":totalListed   },
              { icon: TrendingUp,     label: "Books Sold",   value: myLoading?"—":totalSold     },
              { icon: ArrowLeftRight, label: "Exchanges",    value: myLoading?"—":totalExchange },
              { icon: Download,       label: "Notes",        value: myLoading?"—":totalNotes    },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 py-4 flex flex-col items-center gap-1.5">
                <s.icon className="w-5 h-5 text-[#1C7C84]"/>
                <p className="text-[20px] font-bold text-gray-900">{s.value}</p>
                <p className="text-[11.5px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-0 mt-5 border-b border-gray-200">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-2.5 text-[13.5px] font-medium border-b-2 transition -mb-px
                  ${activeTab===t?"border-[#1C7C84] text-[#1C7C84]":"border-transparent text-gray-500 hover:text-gray-700"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="py-5 pb-8">
            {activeTab === "Uploaded Books" && (
              myLoading ? (
                <div className="flex justify-center py-16"><Loader className="w-7 h-7 animate-spin text-[#1C7C84]"/></div>
              ) : myBooks.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-25"/>
                  <p className="text-[14px] font-semibold">No books listed yet</p>
                  <button onClick={() => navigate("/upload")} className="mt-3 text-[13px] text-[#1C7C84] font-semibold hover:underline">+ Upload your first book</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                  {myBooks.map((book,i) => <BookCard key={book._id} book={book} index={i}/>)}
                </div>
              )
            )}

            {activeTab === "Digital Notes" && (
              !myNotes || myNotes.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Download className="w-10 h-10 mx-auto mb-3 opacity-25"/>
                  <p className="text-[14px] font-semibold">No notes uploaded yet</p>
                  <button onClick={() => navigate("/upload")} className="mt-3 text-[13px] text-[#1C7C84] font-semibold hover:underline">+ Upload PDF Notes</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-w-2xl">
                  {myNotes.map((note,i) => (
                    <motion.div key={note._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                      className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition">
                      <div className="w-10 h-10 rounded-full bg-[#1C7C84]/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-[#1C7C84]"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-semibold text-gray-900 truncate">{note.title}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{note.category} · {timeAgo(note.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#1C7C84] text-[12.5px] font-semibold">
                        <Download className="w-4 h-4"/> {note.downloads||0}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}

            {activeTab === "Reviews" && (
              <div className="text-center py-16 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-3 opacity-25"/>
                <p className="text-[14px] font-semibold">No reviews yet</p>
              </div>
            )}

            {activeTab === "Saved Posts" && (
              wishlist.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-25"/>
                  <p className="text-[14px] font-semibold">No saved posts yet</p>
                  <button onClick={() => navigate("/home")} className="mt-3 text-[13px] text-[#1C7C84] font-semibold hover:underline">Browse books to save</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-w-2xl">
                  {wishlist.map((item,i) => (
                    <motion.div key={item.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                      onClick={() => navigate(`/book/${item.bookId}`)}
                      className="bg-white rounded-xl border border-gray-200 px-4 py-4 flex items-center gap-4 hover:shadow-sm transition cursor-pointer">
                      <img src={item.img||"https://placehold.co/80x80/1C7C84/white?text=Book"} alt={item.title}
                        className="w-[54px] h-[62px] rounded-lg object-cover border border-gray-100 shrink-0"
                        onError={e=>{e.target.src="https://placehold.co/80x80/1C7C84/white?text=Book"}}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-bold text-gray-900 truncate">{item.title}</p>
                        <p className="text-[12px] text-gray-400">{item.author}</p>
                        <p className="text-[13px] font-bold text-[#1C7C84] mt-1">{item.price} <span className="text-gray-400 font-normal text-[11.5px]">· {item.seller}</span></p>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">{item.savedTime}</span>
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <aside className="w-[248px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendIcon className="w-4 h-4 text-[#1C7C84]"/>
            <h3 className="text-[13px] font-bold text-gray-800">Trending Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Engineering","Medical","Management","IT","Law"].map(c=>(
              <span key={c} className="px-3 py-1 bg-gray-100 text-gray-600 text-[12px] font-medium rounded-full cursor-pointer hover:bg-[#1C7C84]/10 hover:text-[#1C7C84] transition">{c}</span>
            ))}
          </div>
        </div>
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400"/>
            <h3 className="text-[13px] font-bold text-gray-800">Top Sellers</h3>
          </div>
          {topSellers.map(s=>(
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
            <Clock className="w-4 h-4 text-gray-400"/>
            <h3 className="text-[13px] font-bold text-gray-800">Recent Uploads</h3>
          </div>
          {recentUploads.length === 0
            ? <p className="text-[12px] text-gray-400">No uploads yet</p>
            : recentUploads.map(u=>(
              <div key={u.title} className="mb-3.5 last:mb-0">
                <p className="text-[13px] font-semibold text-gray-800 leading-tight truncate">{u.title}</p>
                <p className="text-[11.5px] text-gray-400 mt-0.5">{u.time}</p>
              </div>
            ))
          }
        </div>
      </aside>
    </div>
  );
};

export default ProfilePage;