import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Mail, Star, Edit3,
  BookOpen, TrendingUp, ArrowLeftRight, Download,
  Heart, MessageCircle, Share2, Bookmark,
  TrendingUp as TrendIcon, Clock, Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore }    from "../store/authStore";
import { useBookStore }    from "../store/bookStore";
import { useNotesStore }   from "../store/notesStore";
import { useWishlistStore } from "../store/wishlistStore";

const typeStyle = {
  Sell:     "bg-[#1C7C84]/10 text-[#1C7C84]",
  Rent:     "bg-purple-50 text-purple-500",
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

function BookCard({ book, index }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const initials = book.seller?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";
  return (
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.25, delay:index*0.05 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
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
      <div className="relative w-full h-[200px] overflow-hidden" onClick={() => navigate(`/book/${book._id}`)}>
        <img src={book.img || book.images?.[0] || "https://placehold.co/700x380/1C7C84/white?text=Book"}
          alt={book.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        {book.badge && <span className={`absolute top-3 right-3 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeBg[book.badge]??'bg-gray-600'}`}>{book.badge}</span>}
        {book.status && book.status !== 'Active' && (
          <span className={`absolute top-3 left-3 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full ${book.status==='Sold'?'bg-gray-800':book.status==='Expired'?'bg-red-500':'bg-slate-500'}`}>{book.status}</span>
        )}
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setLiked(!liked)} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition">
              <Heart className={`w-[17px] h-[17px] ${liked?"fill-red-500 text-red-500":""}`} />
              <span className="text-[12.5px] text-gray-500">{liked?(book.likes??0)+1:(book.likes??0)}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#1C7C84] transition">
              <MessageCircle className="w-[17px] h-[17px]" />
              <span className="text-[12.5px] text-gray-500">{book.comments??0}</span>
            </button>
            <button className="text-gray-400 hover:text-[#1C7C84] transition"><Share2 className="w-[17px] h-[17px]" /></button>
          </div>
          <button onClick={() => setSaved(!saved)} className="transition">
            <Bookmark className={`w-[17px] h-[17px] ${saved?"fill-[#1C7C84] text-[#1C7C84]":"text-gray-300 hover:text-gray-400"}`} />
          </button>
        </div>
        <h3 onClick={() => navigate(`/book/${book._id}`)} className="text-[14px] font-bold text-gray-900 leading-snug mb-0.5 hover:text-[#1C7C84] transition">{book.title}</h3>
        <p className="text-[12px] text-gray-400 mb-3">{book.author}</p>
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-extrabold text-[#1C7C84]">{book.price}</span>
          <button onClick={() => navigate(`/book/${book._id}`)} className="flex items-center gap-1.5 bg-[#1C7C84] hover:bg-[#155f65] text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition">⊕ View Details</button>
        </div>
      </div>
    </motion.div>
  );
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("Uploaded Books");
  const navigate = useNavigate();
  const { user }                                    = useAuthStore();
  const { myBooks, myLoading, fetchMyBooks }         = useBookStore();
  const { myNotes, fetchMyNotes }                    = useNotesStore();
  const { wishlist, fetchWishlist }                  = useWishlistStore();

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

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full h-[120px] bg-gradient-to-r from-[#1C7C84] to-[#2E86AB] shrink-0" />
        <div className="px-6 pb-0">

          {/* Profile card */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="bg-white rounded-2xl border border-gray-200 px-6 pt-5 pb-5 -mt-6 relative shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-16 h-16 rounded-full bg-[#1C7C84] flex items-center justify-center text-white text-2xl font-bold -mt-10 border-4 border-white shadow-md shrink-0">
                {getInitials(displayName)}
              </div>
              <button onClick={() => navigate("/settings")}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#1C7C84] hover:text-[#1C7C84] transition">
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 leading-tight">{displayName}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-[12.5px] text-gray-500 flex-wrap">
              <Mail className="w-3.5 h-3.5" /><span>{user?.email || "—"}</span>
              {user?.college && <><span className="text-gray-300 mx-1">|</span><MapPin className="w-3.5 h-3.5 text-[#1C7C84]" /><span>{user.college}</span></>}
            </div>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[1,2,3,4].map(i=><Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/>)}
                <Star className="w-3.5 h-3.5 text-gray-200 fill-gray-200"/>
                <span className="text-[12px] text-gray-500 ml-1">(4.2 · 24 reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : "—"}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="grid grid-cols-4 gap-3 mt-4">
            {[
              { icon: BookOpen,       label: "Books Listed", value: myLoading ? "—" : totalListed   },
              { icon: TrendingUp,     label: "Books Sold",   value: myLoading ? "—" : totalSold     },
              { icon: ArrowLeftRight, label: "Exchanges",    value: myLoading ? "—" : totalExchange },
              { icon: Download,       label: "Notes",        value: myLoading ? "—" : totalNotes    },
            ].map((s,i) => (
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
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-2.5 text-[13.5px] font-medium border-b-2 transition -mb-px
                  ${activeTab===t?"border-[#1C7C84] text-[#1C7C84]":"border-transparent text-gray-500 hover:text-gray-700"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="py-5 pb-8">

            {/* Uploaded Books */}
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

            {/* Digital Notes */}
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

            {/* Reviews */}
            {activeTab === "Reviews" && (
              <div className="text-center py-16 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-3 opacity-25"/>
                <p className="text-[14px] font-semibold">No reviews yet</p>
              </div>
            )}

            {/* Saved Posts */}
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
                      <img src={item.img || "https://placehold.co/80x80/1C7C84/white?text=Book"} alt={item.title}
                        className="w-[54px] h-[62px] rounded-lg object-cover border border-gray-100 shrink-0"
                        onError={e=>{e.target.src="https://placehold.co/80x80/1C7C84/white?text=Book"}}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-bold text-gray-900 truncate">{item.title}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{item.author}</p>
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