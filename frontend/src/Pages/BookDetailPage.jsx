import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookStore } from "../store/bookStore";
import { useRequestStore } from "../store/requestStore";
import { useAuthStore } from "../store/authStore";
import {
  ArrowLeft, User, BookOpen, Tag, MapPin,
  MessageCircle, ArrowLeftRight, Heart, Share2,
  Eye, Calendar, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

// ── Request Modal ─────────────────────────────────────────────────────────────
function RequestModal({ book, onClose, onSubmit, submitting }) {
  const requestType = book.type === "Exchange" ? "Exchange" : "Borrow";
  const [offerTitle, setOfferTitle] = useState("");
  const [returnBy,   setReturnBy]   = useState("");
  const [message,    setMessage]    = useState("");
  const [error,      setError]      = useState("");

  const handleSubmit = async () => {
    setError("");
    if (requestType === "Exchange" && !offerTitle.trim()) {
      setError("Please enter what you're offering in exchange."); return;
    }
    if (requestType === "Borrow" && !returnBy) {
      setError("Please select a return date."); return;
    }
    await onSubmit({ type: requestType, offerTitle, returnBy, message });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">
              {requestType === "Exchange" ? "Request Exchange" : "Request to Borrow"}
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5 max-w-[300px] truncate">
              {book.title} · from {book.seller}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition text-xl leading-none">
            ×
          </button>
        </div>

        {requestType === "Exchange" && (
          <div className="mb-4">
            <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">
              Your Offer <span className="text-red-500">*</span>
            </label>
            <input type="text"
              placeholder="e.g. Computer Networks by Tanenbaum"
              value={offerTitle} onChange={e => setOfferTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#1C7C84] transition" />
          </div>
        )}

        {requestType === "Borrow" && (
          <div className="mb-4">
            <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">
              Return By <span className="text-red-500">*</span>
            </label>
            <input type="date"
              value={returnBy} min={new Date().toISOString().split("T")[0]}
              onChange={e => setReturnBy(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#1C7C84] transition" />
          </div>
        )}

        <div className="mb-5">
          <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">
            Message <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea rows={3} placeholder="Add a note to the seller..."
            value={message} onChange={e => setMessage(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#1C7C84] transition resize-none" />
        </div>

        {error && (
          <p className="text-[12px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-[#1C7C84] hover:bg-[#155f65] text-white text-[13px] font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Check className="w-4 h-4" /> Send Request</>
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── BookDetailPage ────────────────────────────────────────────────────────────
const BookDetailPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { currentBook, isLoading, error, fetchBookById } = useBookStore();
  const { sendRequest } = useRequestStore();
  const { user, isAuthenticated } = useAuthStore();

  const [activeImg,    setActiveImg]    = useState(0);
  const [liked,        setLiked]        = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [requestSent,  setRequestSent]  = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    if (id) fetchBookById(id);
  }, [id]);

  // ── FIX: properly compare MongoDB ObjectId with user._id ──────────────────
  const isOwner = user && currentBook &&
    (currentBook.userId?._id || currentBook.userId)?.toString() === user._id?.toString();

  const handleRequest = async (data) => {
    setSubmitting(true);
    setRequestError("");
    try {
      await sendRequest({
        bookId:     currentBook._id,
        senderName: user?.name || "Unknown",
        ...data,
      });
      setShowModal(false);
      setRequestSent(true);
    } catch (err) {
      // ── FIX: show the actual backend error message ─────────────────────────
      const msg = err?.response?.data?.msg || err?.message || "Failed to send request.";
      console.error("REQUEST ERROR:", err?.response?.data);
      setRequestError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-full">
      <div className="w-8 h-8 border-4 border-[#1C7C84] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !currentBook) return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <p className="text-gray-400 text-sm">{error || "Book not found"}</p>
      <button onClick={() => navigate("/home")}
        className="text-[#1C7C84] text-sm font-semibold hover:underline">← Back to Home</button>
    </div>
  );

  const images = currentBook.images?.length > 0
    ? currentBook.images
    : [currentBook.img || "https://placehold.co/800x500/1C7C84/white?text=No+Image"];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 px-6 py-8">
      <AnimatePresence>
        {showModal && (
          <RequestModal
            book={currentBook}
            onClose={() => setShowModal(false)}
            onSubmit={handleRequest}
            submitting={submitting}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1C7C84] text-sm font-medium mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">

            {/* Images */}
            <div className="lg:w-[42%] shrink-0">
              <div className="relative w-full h-72 lg:h-[340px] overflow-hidden bg-gray-100">
                <img src={images[activeImg]} alt={currentBook.title}
                  className="w-full h-full object-cover" />
                {currentBook.badge && (
                  <span className={`absolute top-4 right-4 text-white text-xs font-semibold px-3 py-1 rounded-full ${badgeBg[currentBook.badge] ?? "bg-gray-600"}`}>
                    {currentBook.badge}
                  </span>
                )}
                <button onClick={() => setLiked(!liked)}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition">
                  <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </button>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition
                        ${activeImg === i ? "border-[#1C7C84]" : "border-transparent hover:border-gray-300"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeStyle[currentBook.type] ?? "bg-gray-100 text-gray-500"}`}>
                  {currentBook.type}
                </span>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1C7C84] hover:bg-[#1C7C84]/10 transition">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h1 className="text-[20px] font-bold text-gray-900 leading-snug">{currentBook.title}</h1>
                {currentBook.author && (
                  <p className="text-[13px] text-gray-400 mt-1">by {currentBook.author}</p>
                )}
                <p className="text-[24px] font-extrabold text-[#1C7C84] mt-2">{currentBook.price}</p>
              </div>

              <div className="flex items-center gap-4 text-[12px] text-gray-400">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{currentBook.views ?? 0} views</span>
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{currentBook.likes ?? 0} likes</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(currentBook.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: User,     label: "Seller",    value: currentBook.seller },
                  { icon: BookOpen, label: "Condition", value: currentBook.badge || "N/A" },
                  { icon: Tag,      label: "Category",  value: currentBook.category },
                  { icon: MapPin,   label: "Listed",    value: new Date(currentBook.createdAt).toLocaleDateString() },
                ].filter(i => i.value).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5 bg-[#F4FAFA] rounded-xl px-3.5 py-3">
                    <Icon className="w-4 h-4 text-[#1C7C84] shrink-0" />
                    <div>
                      <p className="text-[10.5px] text-gray-400">{label}</p>
                      <p className="text-[13px] font-semibold text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {currentBook.description && (
                <div>
                  <h3 className="text-[13px] font-bold text-gray-700 mb-1.5">Description</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{currentBook.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 mt-auto pt-2">

                {requestSent && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-[13px] text-emerald-700 font-medium">
                    <Check className="w-4 h-4 shrink-0" />
                    Request sent! You'll be notified when the seller responds.
                  </motion.div>
                )}

                {/* ── FIX: show actual error from backend ── */}
                {requestError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-[12.5px] text-red-500">
                    {requestError}
                  </motion.div>
                )}

                {/* ── FIX: isOwner now correctly compares ObjectIds ── */}
                {isOwner ? (
                  <button onClick={() => navigate("/my-listings")}
                    className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition text-[14px] flex items-center justify-center gap-2">
                    Manage This Listing
                  </button>
                ) : !requestSent ? (
                  <>
                    {currentBook.type === "Sell" && (
                      <button onClick={() => navigate("/chat")}
                        className="w-full bg-[#1C7C84] hover:bg-[#155f65] text-white font-semibold py-3 rounded-xl transition text-[14px] flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Contact Seller
                      </button>
                    )}
                    {currentBook.type === "Rent" && (
                      <button onClick={() => isAuthenticated ? setShowModal(true) : navigate("/login")}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition text-[14px] flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" /> Request to Borrow
                      </button>
                    )}
                    {currentBook.type === "Exchange" && (
                      <button onClick={() => isAuthenticated ? setShowModal(true) : navigate("/login")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition text-[14px] flex items-center justify-center gap-2">
                        <ArrowLeftRight className="w-4 h-4" /> Request Exchange
                      </button>
                    )}
                    <button onClick={() => navigate("/chat")}
                      className="w-full border border-[#1C7C84] text-[#1C7C84] hover:bg-[#1C7C84]/5 font-semibold py-3 rounded-xl transition text-[14px] flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Message Seller
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetailPage;