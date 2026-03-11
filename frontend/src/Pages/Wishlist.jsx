import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ExternalLink, Trash2, TrendingUp, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const INITIAL_WISHLIST = [
  { id: 1, type: "Sell",     title: "Introduction to Algorithms",    author: "by Thomas H. Cormen",   price: "₹450",    seller: "Aarav Mehta",  time: "Added 2 hours ago",  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop" },
  { id: 2, type: "Rent",     title: "Organic Chemistry M & B",       author: "by Robert Morrison",    price: "₹150/mo", seller: "Priya Sharma", time: "Added 1 day ago",    img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&h=120&fit=crop" },
  { id: 3, type: "Exchange", title: "Engineering Mathematics",        author: "by B.S. Grewal",        price: "Exchange",seller: "Ravi Kumar",   time: "Added 3 days ago",   img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=120&h=120&fit=crop" },
  { id: 4, type: "Sell",     title: "Gray's Anatomy",                 author: "by Henry Gray",         price: "₹850",    seller: "Meera Nair",   time: "Added 5 days ago",   img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&h=120&fit=crop" },
];

const typeStyle = {
  Sell:     "bg-[#1C7C84]/10 text-[#1C7C84]",
  Rent:     "bg-purple-50 text-purple-500",
  Exchange: "bg-emerald-50 text-emerald-600",
};

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

const Wishlist = () => {
  const [items, setItems] = useState(INITIAL_WISHLIST);
  const navigate = useNavigate();

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1C7C84] flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Wishlist</h1>
            <p className="text-[13px] text-gray-400">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
          </div>
        </motion.div>

        {/* Items */}
        <div className="max-w-2xl flex flex-col gap-3 pb-8">
          <AnimatePresence>
            {items.length > 0 ? items.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 px-4 py-4 flex items-center gap-4 hover:shadow-sm transition group"
              >
                <img src={item.img} alt={item.title}
                  className="w-[60px] h-[68px] rounded-lg object-cover border border-gray-100 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${typeStyle[item.type]}`}>{item.type}</span>
                    <span className="text-[11.5px] text-gray-400">{item.time}</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-gray-900 leading-snug truncate">{item.title}</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">{item.author}</p>
                  <p className="text-[13px] font-bold text-[#1C7C84] mt-1">
                    {item.price}
                    <span className="text-[11.5px] font-normal text-gray-400 ml-1.5">· {item.seller}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => navigate("/home")}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1C7C84] hover:bg-[#1C7C84]/10 transition">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-400">
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="text-[14px] font-semibold">Your wishlist is empty</p>
                <button onClick={() => navigate("/home")}
                  className="mt-3 text-[13px] text-[#1C7C84] font-semibold hover:underline">
                  Browse books to add
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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

export default Wishlist;