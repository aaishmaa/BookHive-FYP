import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookStore }    from "../store/bookStore";
import { useRequestStore } from "../store/requestStore";
import { useAuthStore }    from "../store/authStore";
import axios from "axios";
import {
  ArrowLeft, User, BookOpen, Tag, MapPin,
  MessageCircle, ArrowLeftRight, Heart, Share2,
  Eye, Calendar, Check, RefreshCcw, Loader, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REQ_URL   = import.meta.env.MODE === "development" ? "http://localhost:5000/requests" : "/requests";
const BOOKS_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/books"    : "/books";

const badgeBg = {
  "Like New": "bg-emerald-600", "Very Good": "bg-blue-600",
  Good: "bg-gray-700", Fair: "bg-amber-600", Acceptable: "bg-slate-600",
};
const typeStyle = {
  Sell: "bg-[#EEF2FF] text-indigo-500",
  Rent: "bg-purple-50 text-purple-500",
  Exchange: "bg-green-50 text-green-600",
};
const statusColors = {
  Pending:  "bg-amber-50 text-amber-600",
  Accepted: "bg-emerald-50 text-emerald-600",
  Declined: "bg-red-50 text-red-400",
};
const avatarColors = ["bg-[#1C7C84]","bg-purple-500","bg-amber-500","bg-rose-500","bg-blue-500"];
const getColor = (name) => avatarColors[(name?.charCodeAt(0)||0) % avatarColors.length];

// ── Exchange Modal — pick your own book ───────────────────────────────────────
function ExchangeModal({ book, onClose, onSubmit, submitting }) {
  const [myBooks,      setMyBooks]      = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [message,      setMessage]      = useState("");
  const [error,        setError]        = useState("");

  useEffect(() => {
    axios.get(`${BOOKS_URL}/my`, { withCredentials: true })
      .then(res => {
        // Only show active exchange books (not the same book)
        const available = (res.data.books || []).filter(
          b => b.status === 'Active' && b._id !== book._id
        );
        setMyBooks(available);
      })
      .catch(() => setMyBooks([]))
      .finally(() => setLoadingBooks(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedBook) { setError("Please select a book to offer."); return; }
    setError("");
    await onSubmit({
      type:           "Exchange",
      offerBookId:    selectedBook._id,
      offerBookTitle: selectedBook.title,
      offerBookImg:   selectedBook.img || selectedBook.images?.[0] || '',
      offer:          selectedBook.title,
      message,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">Request Exchange</h2>
            <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[300px]">
              for "{book.title}" · from {book.seller}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* What they want */}
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <img src={book.img || book.images?.[0] || "https://placehold.co/60x60"}
              alt={book.title} className="w-12 h-14 rounded-lg object-cover shrink-0 border border-green-200" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-green-600 font-semibold uppercase tracking-wide">You want</p>
              <p className="text-[13.5px] font-bold text-gray-900 truncate">{book.title}</p>
              <p className="text-[12px] text-gray-400">by {book.author}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <ArrowLeftRight className="w-4 h-4 text-[#1C7C84]" />
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Pick your book */}
          <div>
            <p className="text-[13px] font-bold text-gray-700 mb-3">
              Select your book to offer <span className="text-red-500">*</span>
            </p>

            {loadingBooks ? (
              <div className="flex justify-center py-6">
                <Loader className="w-5 h-5 animate-spin text-[#1C7C84]" />
              </div>
            ) : myBooks.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-[13px] text-gray-500 font-medium">No books available to offer</p>
                <p className="text-[12px] text-gray-400 mt-1">Upload a book first to exchange</p>
                <button onClick={() => { onClose(); }}
                  className="mt-3 text-[12.5px] text-[#1C7C84] font-semibold hover:underline">
                  + Upload a book
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {myBooks.map(b => (
                  <div key={b._id} onClick={() => setSelectedBook(b)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition
                      ${selectedBook?._id === b._id
                        ? "border-[#1C7C84] bg-[#1C7C84]/5"
                        : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                    <img src={b.img || b.images?.[0] || "https://placehold.co/60x60/1C7C84/white?text=B"}
                      alt={b.title} className="w-10 h-12 rounded-lg object-cover shrink-0 border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{b.title}</p>
                      <p className="text-[11.5px] text-gray-400 truncate">{b.author}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{b.badge || "Good"}</span>
                        <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                          b.type === 'Exchange' ? 'bg-emerald-50 text-emerald-600' :
                          b.type === 'Rent'     ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-600'}`}>
                          {b.type}
                        </span>
                      </div>
                    </div>
                    {selectedBook?._id === b._id && (
                      <div className="w-6 h-6 rounded-full bg-[#1C7C84] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected preview */}
          {selectedBook && (
            <div className="flex items-center gap-2 bg-[#1C7C84]/5 border border-[#1C7C84]/20 rounded-xl px-4 py-3">
              <ArrowLeftRight className="w-4 h-4 text-[#1C7C84] shrink-0" />
              <p className="text-[12.5px] text-gray-700">
                Offering <span className="font-bold text-[#1C7C84]">"{selectedBook.title}"</span> in exchange
              </p>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">
              Message <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea rows={2} placeholder="Add a note to the seller..."
              value={message} onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#1C7C84] transition resize-none" />
          </div>

          {error && <p className="text-[12px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting || !selectedBook}
              className="flex-1 py-2.5 rounded-xl bg-[#1C7C84] hover:bg-[#155f65] text-white text-[13px] font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
              Send Exchange Request
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Borrow Modal ──────────────────────────────────────────────────────────────
function BorrowModal({ book, onClose, onSubmit, submitting }) {
  const [returnBy, setReturnBy] = useState("");
  const [message,  setMessage]  = useState("");
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    if (!returnBy) { setError("Please select a return date."); return; }
    setError("");
    await onSubmit({ type: "Borrow", returnBy, message });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">Request to Borrow</h2>
            <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[300px]">{book.title} · from {book.seller}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition text-xl leading-none">×</button>
        </div>
        <div className="mb-4">
          <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Return By <span className="text-red-500">*</span></label>
          <input type="date" value={returnBy} min={new Date().toISOString().split("T")[0]}
            onChange={e => setReturnBy(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#1C7C84] transition" />
        </div>
        <div className="mb-5">
          <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Message <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea rows={3} placeholder="Add a note to the seller..."
            value={message} onChange={e => setMessage(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#1C7C84] transition resize-none" />
        </div>
        {error && <p className="text-[12px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Send Request</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── BookDetailPage ────────────────────────────────────────────────────────────
const BookDetailPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { currentBook, isLoading, error, fetchBookById } = useBookStore();
  const { sendRequest } = useRequestStore();
  const { user, isAuthenticated } = useAuthStore();

  const [activeImg,    setActiveImg]    = useState(0);
  const [liked,        setLiked]        = useState(false);
  const [showModal,    setShowModal]    = useState(null); // 'exchange' | 'borrow'
  const [submitting,   setSubmitting]   = useState(false);
  const [requestSent,  setRequestSent]  = useState(false);
  const [requestError, setRequestError] = useState("");
  const [bookRequests, setBookRequests] = useState([]);
  const [reqLoading,   setReqLoading]   = useState(false);

  useEffect(() => { if (id) fetchBookById(id); }, [id]);

  useEffect(() => {
    if (currentBook?._id) fetchBookRequests(currentBook._id);
  }, [currentBook?._id]);

  const fetchBookRequests = async (bookId) => {
    setReqLoading(true);
    try {
      const res = await axios.get(`${REQ_URL}/book/${bookId}`, { withCredentials: true });
      setBookRequests(res.data.requests || []);
    } catch {}
    setReqLoading(false);
  };

  const isOwner = user && currentBook &&
    (currentBook.userId?._id || currentBook.userId)?.toString() === user._id?.toString();

  const handleRequest = async (data) => {
    setSubmitting(true);
    setRequestError("");
    try {
      await sendRequest({ bookId: currentBook._id, senderName: user?.name || "Unknown", ...data });
      setShowModal(null);
      setRequestSent(true);
      fetchBookRequests(currentBook._id);
    } catch (err) {
      setRequestError(err?.response?.data?.msg || err?.message || "Failed to send request.");
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
      <button onClick={() => navigate("/home")} className="text-[#1C7C84] text-sm font-semibold hover:underline">← Back to Home</button>
    </div>
  );

  const images = currentBook.images?.length > 0
    ? currentBook.images
    : [currentBook.img || "https://placehold.co/800x500/1C7C84/white?text=No+Image"];

  const acceptedCount = bookRequests.filter(r => r.status === "Accepted").length;
  const pendingCount  = bookRequests.filter(r => r.status === "Pending").length;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 px-6 py-8">
      <AnimatePresence>
        {showModal === 'exchange' && (
          <ExchangeModal book={currentBook} onClose={() => setShowModal(null)}
            onSubmit={handleRequest} submitting={submitting} />
        )}
        {showModal === 'borrow' && (
          <BorrowModal book={currentBook} onClose={() => setShowModal(null)}
            onSubmit={handleRequest} submitting={submitting} />
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

            {/* ── Left ── */}
            <div className="lg:w-[42%] shrink-0 flex flex-col">
              <div className="relative w-full h-72 lg:h-[300px] overflow-hidden bg-gray-100">
                <img src={images[activeImg]} alt={currentBook.title} className="w-full h-full object-cover" />
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
                      className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition
                        ${activeImg === i ? "border-[#1C7C84]" : "border-transparent hover:border-gray-300"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Requesters panel */}
              <div className="border-t border-gray-100 p-4 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4 text-[#1C7C84]" />
                    <h3 className="text-[13px] font-bold text-gray-800">
                      {currentBook.type === "Exchange" ? "Exchange Requests" : "Interested People"}
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1C7C84]/10 text-[#1C7C84]">
                    {currentBook.enquiries ?? bookRequests.length} total
                  </span>
                </div>

                {bookRequests.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {acceptedCount > 0 && <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">✓ {acceptedCount} accepted</span>}
                    {pendingCount  > 0 && <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">⏳ {pendingCount} pending</span>}
                  </div>
                )}

                {reqLoading ? (
                  <div className="flex justify-center py-4"><Loader className="w-5 h-5 animate-spin text-[#1C7C84]" /></div>
                ) : bookRequests.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    <p className="text-[12px]">No requests yet</p>
                    <p className="text-[11px] mt-0.5 text-gray-300">Be the first to request!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {bookRequests.map((req, i) => (
                      <div key={req.id?.toString() || i}
                        className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                        <div className={`w-8 h-8 rounded-full ${getColor(req.from)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                          {req.fi}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-semibold text-gray-800 truncate">{req.from}</p>
                          {req.offerBookTitle ? (
                            <p className="text-[11px] text-[#1C7C84] font-medium truncate">📚 Offers: {req.offerBookTitle}</p>
                          ) : req.offer ? (
                            <p className="text-[11px] text-gray-400 truncate">{req.offer}</p>
                          ) : null}
                          <p className="text-[10.5px] text-gray-300">{req.time}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColors[req.status] || "bg-gray-100 text-gray-500"}`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right ── */}
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
                {currentBook.author && <p className="text-[13px] text-gray-400 mt-1">by {currentBook.author}</p>}
                <p className="text-[24px] font-extrabold text-[#1C7C84] mt-2">{currentBook.price}</p>
              </div>

              <div className="flex items-center gap-4 text-[12px] text-gray-400 flex-wrap">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5"/>{currentBook.views ?? 0} views</span>
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5"/>{currentBook.likes ?? 0} likes</span>
                <span className="flex items-center gap-1"><RefreshCcw className="w-3.5 h-3.5"/>{currentBook.enquiries ?? 0} requests</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/>{new Date(currentBook.createdAt).toLocaleDateString()}</span>
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

              <div className="flex flex-col gap-2.5 mt-auto pt-2">
                {requestSent && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-[13px] text-emerald-700 font-medium">
                    <Check className="w-4 h-4 shrink-0" />
                    Request sent! You'll be notified when the seller responds.
                  </motion.div>
                )}
                {requestError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-[12.5px] text-red-500">
                    {requestError}
                  </motion.div>
                )}

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
                      <button onClick={() => isAuthenticated ? setShowModal('borrow') : navigate("/login")}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition text-[14px] flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" /> Request to Borrow
                      </button>
                    )}
                    {currentBook.type === "Exchange" && (
                      <button onClick={() => isAuthenticated ? setShowModal('exchange') : navigate("/login")}
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