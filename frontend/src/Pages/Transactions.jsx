import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, ArrowUpRight, ArrowDownLeft, Clock,
  CheckCircle, XCircle, TrendingUp, Loader, RefreshCcw,
} from "lucide-react";
import axios from "axios";
import TopSellers from "../Components/TopSeller";   

const API = import.meta.env.MODE === "development"
  ? "http://localhost:5000/transactions"
  : "/transactions";

const TABS = ["All", "Purchases", "Sales", "Rentals"];

const typeIcon = {
  purchase: { Icon: ArrowUpRight,  bg: "bg-[#1C7C84]/10", color: "text-[#1C7C84]"   },
  sale:     { Icon: ArrowDownLeft, bg: "bg-emerald-50",   color: "text-emerald-600" },
  rental:   { Icon: Clock,         bg: "bg-amber-50",     color: "text-amber-500"   },
  exchange: { Icon: RefreshCcw,    bg: "bg-purple-50",    color: "text-purple-500"  },
};

const statusStyle = {
  Completed: { color: "text-emerald-600", Icon: CheckCircle },
  Pending:   { color: "text-amber-500",   Icon: Clock       },
  Cancelled: { color: "text-red-500",     Icon: XCircle     },
};

const TransactionsPage = () => {
  const [activeTab,    setActiveTab]    = useState("All");
  const [transactions, setTransactions] = useState([]);
  const [stats,        setStats]        = useState({ totalSpent: 0, totalEarned: 0, totalTransactions: 0 });
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState("");

  const fetchTransactions = async (tab = "All") => {
    setIsLoading(true); setError("");
    try {
      const typeMap = { "All":"all","Purchases":"purchase","Sales":"sale","Rentals":"rental" };
      const params  = typeMap[tab] !== "all" ? `?type=${typeMap[tab]}` : "";
      const res     = await axios.get(`${API}${params}`, { withCredentials: true });
      setTransactions(res.data.transactions || []);
      setStats(res.data.stats || { totalSpent:0, totalEarned:0, totalTransactions:0 });
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load transactions");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTransactions(activeTab); }, [activeTab]);

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1C7C84] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Transactions</h1>
            <p className="text-[13px] text-gray-400">Your purchase, sale & rental history</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Spent",        value: `Rs.${stats.totalSpent}`       },
            { label: "Total Earned",       value: `Rs.${stats.totalEarned}`      },
            { label: "Total Transactions", value: `${stats.totalTransactions}`  },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 px-5 py-4 text-center">
              <p className="text-[12px] text-gray-400 mb-1">{s.label}</p>
              <p className="text-[22px] font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mb-5 border-b border-gray-200">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 text-[13.5px] font-medium border-b-2 transition -mb-px
                ${activeTab === t ? "border-[#1C7C84] text-[#1C7C84]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>

        {isLoading && <div className="flex justify-center py-16"><Loader className="w-7 h-7 animate-spin text-[#1C7C84]" /></div>}
        {error && !isLoading && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-[13px] text-red-500">{error}</div>}

        {!isLoading && (
          <div className="flex flex-col gap-2.5 pb-8">
            {transactions.length > 0 ? transactions.map((tx, i) => {
              const { Icon, bg, color } = typeIcon[tx.type] || typeIcon.purchase;
              const { color: sColor, Icon: SIcon } = statusStyle[tx.status] || statusStyle.Pending;
              return (
                <motion.div key={tx.id?.toString() || i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition">
                  <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-[18px] h-[18px] ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-gray-900 leading-tight">{tx.title}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{tx.sub}</p>
                    <p className="text-[11.5px] text-gray-400 mt-0.5">{tx.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[15px] font-bold ${tx.amount < 0 ? "text-red-500" : tx.amount === 0 ? "text-purple-500" : "text-emerald-600"}`}>
                      {tx.amount === 0 ? "Exchange" : `${tx.amount > 0 ? "+" : ""}Rs.${Math.abs(tx.amount)}`}
                    </p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${sColor}`}>
                      <SIcon className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-medium">{tx.status}</span>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="text-center py-16 text-gray-400">
                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No transactions found</p>
                <p className="text-[12px] mt-1">Transactions appear here when requests are accepted</p>
              </div>
            )}
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
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-[13px] font-bold text-gray-800">How Transactions Work</h3>
          </div>
          <div className="space-y-3">
            {[
              { n:"1", t:"Send a request",      d:"Request to buy, rent or exchange a book" },
              { n:"2", t:"Request accepted",    d:"Owner accepts your request" },
              { n:"3", t:"Transaction created", d:"A transaction record is auto-created" },
              { n:"4", t:"View history",        d:"All transactions appear here" },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1C7C84] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{step.n}</span>
                <div>
                  <p className="text-[12.5px] font-semibold text-gray-700">{step.t}</p>
                  <p className="text-[11.5px] text-gray-400">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default TransactionsPage;