import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Download, Star, Mail, MapPin,
  GraduationCap, Calendar, ArrowLeft, Loader,
  Heart, MessageCircle, Share2,
} from "lucide-react";
import axios from "axios";

const BOOKS_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/books" : "/books";
const USERS_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/profile" : "/profile";

const typeStyle = {
  Sell: "bg-[#EEF2FF] text-indigo-500",
  Rent: "bg-purple-50 text-purple-500",
  Exchange: "bg-green-50 text-green-600",
};
const badgeBg = {
  "Like New": "bg-emerald-600", "Very Good": "bg-blue-600",
  Good: "bg-gray-700", Fair: "bg-amber-600", Acceptable: "bg-slate-600",
};
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600) return `${Math.floor(s/60)} min ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)} days ago`;
};

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [user,      setUser]      = useState(null);
  const [books,     setBooks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch user profile + their books in parallel
        const [profileRes, booksRes] = await Promise.all([
          axios.get(`${USERS_URL}/user/${userId}`, { withCredentials: true }),
          axios.get(`${BOOKS_URL}?sellerId=${userId}`, { withCredentials: true }),
        ]);
        setUser(profileRes.data.user);
        setBooks(booksRes.data.books || []);
      } catch (err) {
        setError("User not found");
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <Loader className="w-7 h-7 animate-spin text-[#1C7C84]" />
    </div>
  );

  if (error || !user) return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <p className="text-gray-400">{error || "User not found"}</p>
      <button onClick={() => navigate(-1)} className="text-[#1C7C84] font-semibold hover:underline">← Go Back</button>
    </div>
  );

  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "U";
  const totalSold = books.filter(b => b.status === "Sold").length;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Cover */}
      <div className="w-full h-[120px] bg-gradient-to-r from-[#1C7C84] to-[#2E86AB]" />

      <div className="max-w-4xl mx-auto px-6 pb-10">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1C7C84] text-sm font-medium mt-4 mb-2 transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 px-6 pt-5 pb-5 -mt-6 shadow-sm mb-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-16 h-16 rounded-full -mt-10 border-4 border-white shadow-md shrink-0 overflow-hidden">
              {user.profileImage
                ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-[#1C7C84] flex items-center justify-center text-white text-2xl font-bold">{initials}</div>
              }
            </div>
            <button onClick={() => navigate("/chat")}
              className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#1C7C84] border border-[#1C7C84] rounded-lg px-3 py-1.5 hover:bg-[#1C7C84]/5 transition">
              <MessageCircle className="w-3.5 h-3.5" /> Message
            </button>
          </div>

          <h2 className="text-[18px] font-bold text-gray-900">{user.name}</h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {user.college && (
              <span className="flex items-center gap-1 text-[12.5px] text-gray-500">
                <GraduationCap className="w-3.5 h-3.5 text-[#1C7C84]" />{user.college}
              </span>
            )}
            {user.email && (
              <span className="flex items-center gap-1 text-[12.5px] text-gray-500">
                <Mail className="w-3.5 h-3.5" />{user.email}
              </span>
            )}
          </div>
          {user.bio && <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{user.bio}</p>}

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/>)}
              <Star className="w-3.5 h-3.5 fill-gray-200 text-gray-200"/>
              <span className="text-[12px] text-gray-500 ml-1">(4.2)</span>
            </div>
            <span className="flex items-center gap-1 text-[12px] text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Books Listed", value: books.length },
            { label: "Books Sold",   value: totalSold    },
            { label: "Active",       value: books.filter(b => b.status === "Active").length },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 py-4 flex flex-col items-center gap-1">
              <p className="text-[20px] font-bold text-gray-900">{s.value}</p>
              <p className="text-[11.5px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Books */}
        <h3 className="text-[15px] font-bold text-gray-800 mb-3">
          Books by {user.name} ({books.filter(b => b.status === "Active").length} active)
        </h3>

        {books.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm">No books listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book, i) => (
              <motion.div key={book._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/book/${book._id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition cursor-pointer">
                <div className="relative h-[180px] overflow-hidden">
                  <img src={book.img || book.images?.[0] || "https://placehold.co/400x200/1C7C84/white?text=Book"}
                    alt={book.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  {book.badge && (
                    <span className={`absolute top-2 right-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeBg[book.badge] ?? "bg-gray-600"}`}>
                      {book.badge}
                    </span>
                  )}
                  {book.status !== "Active" && (
                    <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {book.status}
                    </span>
                  )}
                </div>
                <div className="px-3 py-3">
                  <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${typeStyle[book.type] ?? "bg-gray-100 text-gray-500"}`}>
                    {book.type}
                  </span>
                  <h4 className="text-[13.5px] font-bold text-gray-900 mt-1.5 truncate">{book.title}</h4>
                  <p className="text-[11.5px] text-gray-400 truncate">{book.author}</p>
                  <p className="text-[15px] font-extrabold text-[#1C7C84] mt-1">{book.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;