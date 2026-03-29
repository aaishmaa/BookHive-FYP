import { useEffect, useState } from "react";
import { Star, Loader } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/top-sellers"
  : "/top-sellers";

const avatarColors = [
  "bg-[#1C7C84]","bg-purple-500","bg-amber-500","bg-rose-500","bg-blue-500"
];

export default function TopSellers() {
  const [sellers,   setSellers]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setSellers(res.data.topSellers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-5 py-5 border-b border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <h3 className="text-[13px] font-bold text-gray-800">Top Sellers</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-3">
          <Loader className="w-4 h-4 animate-spin text-[#1C7C84]" />
        </div>
      ) : sellers.length === 0 ? (
        <p className="text-[12px] text-gray-400">No sellers yet</p>
      ) : (
        sellers.map((s, i) => (
          <div key={s.id?.toString() || i} className="flex items-center gap-3 mb-4 last:mb-0">
            {/* Avatar — real photo or colored initial */}
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-100">
              {s.profileImage ? (
                <img src={s.profileImage} alt={s.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-[13px] font-bold`}>
                  {s.initial}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 leading-tight truncate">{s.name}</p>
              <p className="text-[11.5px] text-gray-400 mt-0.5">
                <span className="text-amber-400">★</span> {s.books} {s.books === 1 ? "book" : "books"}
              </p>
            </div>
            {/* Rank badge */}
            <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0
              ${i === 0 ? "bg-amber-400 text-white" :
                i === 1 ? "bg-gray-300 text-gray-700" :
                i === 2 ? "bg-amber-700 text-white" :
                "bg-gray-100 text-gray-500"}`}>
              {i + 1}
            </span>
          </div>
        ))
      )}
    </div>
  );
}