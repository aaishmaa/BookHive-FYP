import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Check, X, TrendingUp, Star, Clock, MessageCircle, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRequestStore } from "../store/requestStore";

const statusStyle = {
  Pending:  { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200" },
  Accepted: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  Declined: { bg: "bg-red-50",     text: "text-red-400",     border: "border-red-200" },
};

const typeStyle = {
  Exchange: "bg-emerald-50 text-emerald-600",
  Rent:     "bg-purple-50 text-purple-500",
  Buy:      "bg-[#1C7C84]/10 text-[#1C7C84]",
};

const avatarColors = ["bg-[#1C7C84]","bg-purple-500","bg-amber-500","bg-rose-500","bg-blue-500","bg-indigo-500"];
const getAvatarColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length] || "bg-gray-400";

const topSellers = [
  { name: "Priya Sharma", rating: "4.9", books: "24 books", initial: "P" },
  { name: "Arjun Patel",  rating: "4.8", books: "18 books", initial: "A" },
  { name: "Sara Khan",    rating: "4.7", books: "15 books", initial: "S" },
];

const FILTERS = ["All", "Pending", "Accepted", "Declined"];

const Requests = () => {
  const navigate  = useNavigate();
  const { requests, isLoading, error, fetchRequests, updateStatus } = useRequestStore();
  const [filter,     setFilter]     = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [tab,        setTab]        = useState("received"); // received | sent

  useEffect(() => { fetchRequests(); }, []);

  const filtered = filter === "All"
    ? requests
    : requests.filter(r => r.status === filter);

  const counts = {
    Pending:  requests.filter(r => r.status === "Pending").length,
    Accepted: requests.filter(r => r.status === "Accepted").length,
    Declined: requests.filter(r => r.status === "Declined").length,
  };

  const handleUpdate = async (id, status) => {
    setUpdatingId(id);
    try { await updateStatus(id, status); } catch {}
    setUpdatingId(null);
  };

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

        {/* Tab: Received / Sent */}
        <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
          {["received", "sent"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-lg text-[13px] font-semibold transition capitalize
                ${tab === t ? "bg-white text-[#1C7C84] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "received" ? `Received (${requests.length})` : "Sent"}
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {FILTERS.map(f => {
            const count = f === "All" ? requests.length : (counts[f] ?? 0);
            return (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition
                  ${filter === f
                    ? "bg-[#1C7C84] text-white border-[#1C7C84]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7C84] hover:text-[#1C7C84]"}`}>
                {f} ({count})
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader className="w-7 h-7 animate-spin text-[#1C7C84]" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="max-w-2xl bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-[13px] text-red-500">{error}</div>
        )}

        {/* Request cards */}
        {!isLoading && (
          <div className="flex flex-col gap-3 max-w-2xl pb-8">
            <AnimatePresence>
              {filtered.length > 0 ? filtered.map((req, i) => {
                const s = statusStyle[req.status] || statusStyle.Pending;
                return (
                  <motion.div key={req.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.04 }}
                    className={`bg-white rounded-xl border ${s.border} px-5 py-4 hover:shadow-sm transition`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${getAvatarColor(req.fi)} flex items-center justify-center text-white text-[13px] font-bold shrink-0`}>
                        {req.fi}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13.5px] font-bold text-gray-900">{req.from}</p>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${typeStyle[req.type] || ""}`}>{req.type}</span>
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

                    {req.status === "Pending" && tab === "received" && (
                      <div className="flex items-center gap-2 mt-4">
                        <button onClick={() => handleUpdate(req.id, "Accepted")}
                          disabled={updatingId === req.id}
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50">
                          {updatingId === req.id
                            ? <Loader className="w-3.5 h-3.5 animate-spin" />
                            : <Check className="w-3.5 h-3.5" />}
                          Accept
                        </button>
                        <button onClick={() => handleUpdate(req.id, "Declined")}
                          disabled={updatingId === req.id}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-[12.5px] font-semibold px-4 py-2 rounded-lg transition border border-red-200 disabled:opacity-50">
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
                  <p className="text-[14px] font-semibold">No {filter !== "All" ? filter.toLowerCase() + " " : ""}requests yet</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
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
          <p className="text-[12px] text-gray-400">No recent uploads</p>
        </div>
      </aside>
    </div>
  );
};

export default Requests;