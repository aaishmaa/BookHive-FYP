import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, ArrowUpRight, ArrowDownLeft, Clock,
  CheckCircle, XCircle, TrendingUp, Star,
} from "lucide-react";
import { Clock as ClockIcon } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ALL_TRANSACTIONS = [
  {
    id: 1, title: "Introduction to Algorithms", sub: "Bought from Aarav Mehta",
    date: "Feb 20, 2026", type: "purchase", amount: -490, status: "Completed",
  },
  {
    id: 2, title: "Engineering Mathematics", sub: "Sold to Neha Gupta",
    date: "Feb 18, 2026", type: "sale", amount: +320, status: "Completed",
  },
  {
    id: 3, title: "Organic Chemistry", sub: "Rented from Priya Sharma",
    date: "Feb 22, 2026", type: "rental", amount: -150, status: "Pending",
  },
  {
    id: 4, title: "Business Law for Managers", sub: "Bought from Ravi Kumar",
    date: "Feb 15, 2026", type: "purchase", amount: -300, status: "Cancelled",
  },
  {
    id: 5, title: "Computer Networks", sub: "Rented from Karan Singh",
    date: "Feb 10, 2026", type: "rental", amount: -200, status: "Completed",
  },
];

const TABS = ["All", "Purchases", "Sales", "Rentals"];

const topSellers = [
  { name: "Priya Sharma", rating: "4.9", books: "24 books", initial: "P" },
  { name: "Arjun Patel",  rating: "4.8", books: "18 books", initial: "A" },
  { name: "Sara Khan",    rating: "4.7", books: "15 books", initial: "S" },
];

const recentUploads = [
  { title: "Data Structures & Algorithms", time: "2h ago" },
  { title: "Organic Chemistry Vol. 2",     time: "4h ago" },
  { title: "Business Law Notes",           time: "8h ago" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeIcon = {
  purchase: { Icon: ArrowUpRight,   bg: "bg-[#1C7C84]/10", color: "text-[#1C7C84]" },
  sale:     { Icon: ArrowDownLeft,  bg: "bg-emerald-50",   color: "text-emerald-600" },
  rental:   { Icon: Clock,          bg: "bg-amber-50",     color: "text-amber-500"  },
};

const statusStyle = {
  Completed: { color: "text-emerald-600", Icon: CheckCircle  },
  Pending:   { color: "text-amber-500",   Icon: ClockIcon    },
  Cancelled: { color: "text-red-500",     Icon: XCircle      },
};

// ─── Transactions Page ────────────────────────────────────────────────────────
const TransactionsPage = () => {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = ALL_TRANSACTIONS.filter(t => {
    if (activeTab === "All")       return true;
    if (activeTab === "Purchases") return t.type === "purchase";
    if (activeTab === "Sales")     return t.type === "sale";
    if (activeTab === "Rentals")   return t.type === "rental";
    return true;
  });

  const totalSpent  = ALL_TRANSACTIONS.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
  const totalEarned = ALL_TRANSACTIONS.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1C7C84] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Transactions</h1>
            <p className="text-[13px] text-gray-400">Your purchase, sale & rental history</p>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          {[
            { label: "Total Spent",        value: `₹${totalSpent}`,                   color: "text-gray-900" },
            { label: "Total Earned",       value: `₹${totalEarned}`,                  color: "text-gray-900" },
            { label: "Total Transactions", value: `${ALL_TRANSACTIONS.length}`,        color: "text-gray-900" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 px-5 py-4 text-center">
              <p className="text-[12px] text-gray-400 mb-1">{s.label}</p>
              <p className={`text-[22px] font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mb-5 border-b border-gray-200">
          {TABS.map((t) => (
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

        {/* Transaction list */}
        <div className="flex flex-col gap-2.5 pb-8">
          {filtered.map((tx, i) => {
            const { Icon, bg, color } = typeIcon[tx.type];
            const { color: sColor, Icon: SIcon } = statusStyle[tx.status];
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition"
              >
                {/* Type icon */}
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-[18px] h-[18px] ${color}`} />
                </div>

                {/* Title + sub + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-gray-900 leading-tight">{tx.title}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{tx.sub}</p>
                  <p className="text-[11.5px] text-gray-400 mt-0.5">{tx.date}</p>
                </div>

                {/* Amount + status */}
                <div className="text-right shrink-0">
                  <p className={`text-[15px] font-bold ${tx.amount < 0 ? "text-red-500" : "text-emerald-600"}`}>
                    {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount)}
                  </p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${sColor}`}>
                    <SIcon className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-medium">{tx.status}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No transactions found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <aside className="w-[248px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto">

        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#1C7C84]" />
            <h3 className="text-[13px] font-bold text-gray-800">Trending Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Engineering", "Medical", "Management", "IT", "Law"].map((c) => (
              <span key={c} className="px-3 py-1 bg-gray-100 text-gray-600 text-[12px] font-medium rounded-full cursor-pointer hover:bg-[#1C7C84]/10 hover:text-[#1C7C84] transition">
                {c}
              </span>
            ))}
          </div>
        </div>

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
                <p className="text-[11.5px] text-gray-400 mt-0.5"><span className="text-amber-400">★</span> {s.rating} · {s.books}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-4 h-4 text-gray-400" />
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

export default TransactionsPage;