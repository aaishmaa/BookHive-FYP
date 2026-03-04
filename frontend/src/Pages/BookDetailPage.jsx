import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookStore } from "../store/bookStore";
import { ArrowLeft, User, BookOpen, Tag, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const badgeBg = {
  "Like New":  "bg-emerald-600",
  "Very Good": "bg-blue-600",
  Good:        "bg-gray-700",
  Fair:        "bg-amber-600",
  Acceptable:  "bg-slate-600",
};

const typeStyle = {
  Sell:     "bg-[#EEF2FF] text-indigo-500",
  Rent:     "bg-purple-50 text-purple-500",
  Exchange: "bg-green-50 text-green-600",
};

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBook, isLoading, error, fetchBookById } = useBookStore();

  useEffect(() => {
    if (id) fetchBookById(id);
  }, [id]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-full">
      <div className="w-8 h-8 border-4 border-[#1C7C84] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !currentBook) return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <p className="text-gray-400 text-sm">{error || "Book not found"}</p>
      <button
        onClick={() => navigate("/home")}
        className="text-[#1C7C84] text-sm font-semibold hover:underline"
      >
        ← Back to Home
      </button>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 px-6 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1C7C84] text-sm font-medium mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Main image */}
          <div className="w-full h-72 overflow-hidden relative">
            <img
              src={currentBook.img || currentBook.images?.[0] || "https://placehold.co/800x400/1C7C84/white?text=No+Image"}
              alt={currentBook.title}
              className="w-full h-full object-cover"
            />
            {currentBook.badge && (
              <span className={`absolute top-4 right-4 text-white text-xs font-semibold px-3 py-1 rounded-full ${badgeBg[currentBook.badge] ?? "bg-gray-600"}`}>
                {currentBook.badge}
              </span>
            )}
          </div>

          <div className="p-6 space-y-5">

            {/* Title + Price */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{currentBook.title}</h1>
                <p className="text-sm text-gray-400 mt-1">{currentBook.author}</p>
              </div>
              <span className="text-2xl font-extrabold text-[#1C7C84] whitespace-nowrap">
                {currentBook.price}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {currentBook.type && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeStyle[currentBook.type] ?? "bg-gray-100 text-gray-500"}`}>
                  {currentBook.type}
                </span>
              )}
              {currentBook.category && (
                <span className="bg-[#1C7C84]/10 text-[#1C7C84] text-xs font-semibold px-3 py-1 rounded-full">
                  {currentBook.category}
                </span>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-[#F4FAFA] rounded-xl px-4 py-3">
                <User className="w-4 h-4 text-[#1C7C84] shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Seller</p>
                  <p className="text-sm font-semibold text-gray-800">{currentBook.seller}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#F4FAFA] rounded-xl px-4 py-3">
                <BookOpen className="w-4 h-4 text-[#1C7C84] shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Condition</p>
                  <p className="text-sm font-semibold text-gray-800">{currentBook.badge || "N/A"}</p>
                </div>
              </div>
              {currentBook.category && (
                <div className="flex items-center gap-3 bg-[#F4FAFA] rounded-xl px-4 py-3">
                  <Tag className="w-4 h-4 text-[#1C7C84] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Category</p>
                    <p className="text-sm font-semibold text-gray-800">{currentBook.category}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 bg-[#F4FAFA] rounded-xl px-4 py-3">
                <MapPin className="w-4 h-4 text-[#1C7C84] shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Listed</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(currentBook.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {currentBook.description && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{currentBook.description}</p>
              </div>
            )}

            {/* Extra images */}
            {currentBook.images?.length > 1 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">More Photos</h3>
                <div className="flex gap-3 flex-wrap">
                  {currentBook.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`photo ${i + 1}`}
                      className="w-24 h-24 rounded-xl object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Contact button */}
            <button className="w-full bg-[#1C7C84] hover:bg-[#146C70] text-white font-semibold py-3 rounded-xl transition text-sm">
              Contact Seller
            </button>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetailPage;