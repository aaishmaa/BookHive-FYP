import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ExternalLink, Trash2, TrendingUp, Clock, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlistStore } from "../store/wishlistStore";
import TopSellers from "../Components/TopSeller";   // ← import

const typeStyle = {
  Sell:     "bg-[#1C7C84]/10 text-[#1C7C84]",
  Buy:      "bg-[#1C7C84]/10 text-[#1C7C84]",
  Rent:     "bg-purple-50 text-purple-500",
  Exchange: "bg-emerald-50 text-emerald-600",
};

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, isLoading, error, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (id) => {
    setRemovingId(id);
    try { await removeFromWishlist(id); } catch {}
    setRemovingId(null);
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto px-6 py-6">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1C7C84] flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Wishlist</h1>
            <p className="text-[13px] text-gray-400">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
          </div>
        </motion.div>

        {isLoading && <div className="flex justify-center py-16"><Loader className="w-7 h-7 animate-spin text-[#1C7C84]" /></div>}
        {error && !isLoading && <div className="max-w-2xl bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-[13px] text-red-500">{error}</div>}

        {!isLoading && (
          <div className="max-w-2xl flex flex-col gap-3 pb-8">
            <AnimatePresence>
              {wishlist.length > 0 ? wishlist.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 px-4 py-4 flex items-center gap-4 hover:shadow-sm transition">
                  <img
                    src={item.img || "https://placehold.co/120x120/1C7C84/white?text=Book"}
                    alt={item.title}
                    onError={e => { e.target.src = "https://placehold.co/120x120/1C7C84/white?text=Book"; }}
                    className="w-[60px] h-[68px] rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${typeStyle[item.type] || typeStyle.Sell}`}>{item.type}</span>
                      <span className="text-[11.5px] text-gray-400">{item.savedTime}</span>
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-900 leading-snug truncate">{item.title}</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">{item.author}</p>
                    <p className="text-[13px] font-bold text-[#1C7C84] mt-1">
                      {item.price}
                      {item.priceNote && <span className="text-[11.5px] font-normal text-gray-400">{item.priceNote}</span>}
                      <span className="text-[11.5px] font-normal text-gray-400 ml-1.5">· {item.seller}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => navigate(`/book/${item.bookId}`)} title="View listing"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1C7C84] hover:bg-[#1C7C84]/10 transition">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRemove(item.id)} disabled={removingId === item.id} title="Remove from wishlist"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40">
                      {removingId === item.id
                        ? <Loader className="w-3.5 h-3.5 animate-spin text-red-400" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-20 text-gray-400">
                  <Heart className="w-10 h-10 mx-auto mb-3 opacity-25" />
                  <p className="text-[14px] font-semibold">Your wishlist is empty</p>
                  <button onClick={() => navigate("/home")} className="mt-3 text-[13px] text-[#1C7C84] font-semibold hover:underline">Browse books to add</button>
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
        <TopSellers />  
        <div className="px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-[13px] font-bold text-gray-800">Recent Uploads</h3>
          </div>
          <p className="text-[12px] text-gray-400">No recent uploads</p>
        </div>
      </aside>
    </div>
  );
};

export default Wishlist;