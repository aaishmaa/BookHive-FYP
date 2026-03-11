import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Check, X, TrendingUp, Star, Clock, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MOCK_REQUESTS = [
  { id: 1, from: "Priya Sharma",  fi: "P", book: "Introduction to Algorithms", type: "Exchange", offer: "Organic Chemistry M&B",    time: "2 hours ago",  status: "Pending" },
  { id: 2, from: "Karan Singh",   fi: "K", book: "Engineering Mathematics",     type: "Rent",     offer: "₹150/month for 3 months", time: "5 hours ago",  status: "Pending" },
  { id: 3, from: "Neha Gupta",    fi: "N", book: "Computer Networks",           type: "Exchange", offer: "Business Law for Managers",time: "1 day ago",   status: "Accepted" },
  { id: 4, from: "Aryan Shah",    fi: "A", book: "Machine Learning",            type: "Rent",     offer: "₹200/month for 2 months", time: "2 days ago",  status: "Declined" },
  { id: 5, from: "Divya Reddy",   fi: "D", book: "Organic Chemistry M&B",      type: "Exchange", offer: "Microeconomics Theory",    time: "3 days ago",  status: "Pending" },
];

const statusStyle = {
  Pending:  { bg: "bg-amber-50",   text: "text-amber-600",  border: "border-amber-200" },
  Accepted: { bg: "bg-emerald-50", text: "text-emerald-600",border: "border-emerald-200" },
  Declined: { bg: "bg-red-50",     text: "text-red-400",    border: "border-red-200" },
};

const typeStyle = {
  Exchange: "bg-emerald-50 text-emerald-600",
  Rent:     "bg-purple-50 text-purple-500",
};

const avatarColor = (i) => {
  const map = { P:"bg-[#1C7C84]", K:"bg-purple-500", N:"bg-amber-500", A:"bg-rose-500", D:"bg-blue-500" };
  return map[i] || "bg-gray-400";
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

const Requests = () => {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const update = (id, status) =>
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));

  const filtered = filter === "All" ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1C7C84] flex items-center justify-center shrink-0">
            <RefreshCcw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Requests</h1>
            <p className="text-[13px] text-gray-400">Exchange & rental requests from other students</p>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5">
          {["All","Pending","Accepted","Declined"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition
                ${filter === f ? "bg-[#1C7C84] text-white border-[#1C7C84]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7C84] hover:text-[#1C7C84]"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Request cards */}
        <div className="flex flex-col gap-3 max-w-2xl pb-8">
          <AnimatePresence>
            {filtered.length > 0 ? filtered.map((req, i) => {
              const s = statusStyle[req.status];
              return (
                <motion.div key={req.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-xl border ${s.border} px-5 py-4 hover:shadow-sm transition`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${avatarColor(req.fi)} flex items-center justify-center text-white text-[13px] font-bold shrink-0`}>
                      {req.fi}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13.5px] font-bold text-gray-900">{req.from}</p>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${typeStyle[req.type]}`}>{req.type}</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{req.status}</span>
                      </div>
                      <p className="text-[12.5px] text-gray-600 mt-1">
                        Wants your <span className="font-semibold text-gray-800">"{req.book}"</span>
                      </p>
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        Offering: <span className="text-gray-600 font-medium">{req.offer}</span>
                      </p>
                      <p className="text-[11.5px] text-gray-400 mt-1">{req.time}</p>
                    </div>
                  </div>

                  {req.status === "Pending" && (
                    <div className="flex items-center gap-2 mt-4">
                      <button onClick={() => update(req.id, "Accepted")}
                        className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition">
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button onClick={() => update(req.id, "Declined")}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-[12.5px] font-semibold px-4 py-2 rounded-lg transition border border-red-200">
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button onClick={() => navigate("/chat")}
                        className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[12.5px] font-semibold px-4 py-2 rounded-lg transition border border-gray-200">
                        <MessageCircle className="w-3.5 h-3.5" /> Message
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            }) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-400">
                <RefreshCcw className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="text-[14px] font-semibold">No requests found</p>
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

export default Requests;