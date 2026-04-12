import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, CreditCard, Tag, Loader } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import axios from "axios";

const API = import.meta.env.MODE === "development" ? "http://localhost:5000/payment" : "/payment";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user }  = useAuthStore();
  const book      = location.state?.book;

  const [name,    setName]    = useState(user?.name  || "");
  const [address, setAddress] = useState("");
  const [city,    setCity]    = useState("");
  const [pin,     setPin]     = useState("");
  const [phone,   setPhone]   = useState("");
  const [payment, setPayment] = useState("khalti");
  const [discount,setDiscount]= useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-gray-400">No book selected for checkout.</p>
        <button onClick={() => navigate(-1)} className="text-[#1C7C84] font-semibold hover:underline">← Go Back</button>
      </div>
    );
  }

  const price    = parseFloat(book.price?.replace(/[A-Za-z.,\/\s]/g, "") || "0");
  const delivery = 40;
  const total    = price + delivery;

  const validate = () => {
    if (!name.trim() || !address.trim() || !city.trim() || !pin.trim() || !phone.trim()) {
      setError("Please fill in all delivery details.");
      return false;
    }
    return true;
  };

  const handleKhalti = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/initiate`, {
        bookId:        book._id,
        amount:        total,
        bookTitle:     book.title,
        customerName:  name,
        customerPhone: phone,
        customerEmail: user?.email || "",
        sellerId:      book.userId?._id || book.userId || "",
        sellerName:    book.seller || "Seller",
        buyerName:     user?.name  || "Buyer",
      }, { withCredentials: true });

      // Redirect to Khalti payment page
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        setError("Failed to get payment URL. Try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.msg || "Payment initiation failed.");
    }
    setLoading(false);
  };

  const handleCOD = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/cod`, {
        bookId:     book._id,
        bookTitle:  book.title,
        amount:     total,
        sellerId:   book.userId?._id || book.userId || "",
        sellerName: book.seller || "Seller",
        buyerName:  user?.name  || "Buyer",
        delivery:   { name, address, city, pin, phone },
      }, { withCredentials: true });
      navigate("/order-success", { state: { book, paymentMethod: "COD" } });
    } catch (err) {
      setError(err?.response?.data?.msg || "Failed to place order.");
    }
    setLoading(false);
  };

  const handleOrder = () => {
    if (payment === "khalti") handleKhalti();
    else handleCOD();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-[26px] font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left ── */}
          <div className="flex-1 space-y-4">

            {/* Delivery */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-[#1C7C84]" />
                <h2 className="text-[14.5px] font-bold text-gray-800">Delivery Details</h2>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#1C7C84] transition" />
                <input type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#1C7C84] transition" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#1C7C84] transition" />
                  <input type="text" placeholder="PIN Code" value={pin} onChange={e => setPin(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#1C7C84] transition" />
                </div>
                <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#1C7C84] transition" />
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-[#1C7C84]" />
                <h2 className="text-[14.5px] font-bold text-gray-800">Payment Method</h2>
              </div>
              <div className="space-y-2.5">
                {[
                  { id: "khalti", label: "Khalti (Online Payment)", desc: "Pay securely via Khalti wallet or card", badge: "Recommended" },
                  { id: "cod",    label: "Cash on Delivery",         desc: "Pay when the book arrives" },
                ].map(opt => (
                  <div key={opt.id} onClick={() => setPayment(opt.id)}
                    className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition
                      ${payment === opt.id ? "border-[#1C7C84] bg-[#1C7C84]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                      ${payment === opt.id ? "border-[#1C7C84]" : "border-gray-300"}`}>
                      {payment === opt.id && <div className="w-2 h-2 rounded-full bg-[#1C7C84]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13.5px] font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-[11.5px] text-gray-400">{opt.desc}</p>
                    </div>
                    {opt.badge && (
                      <span className="text-[11px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full shrink-0">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Discount Code */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Discount code"
                  value={discount} onChange={e => setDiscount(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#1C7C84] transition" />
                <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:border-[#1C7C84] hover:text-[#1C7C84] font-semibold px-4 py-2.5 rounded-xl text-[13px] transition">
                  <Tag className="w-3.5 h-3.5" /> Apply
                </button>
              </div>
            </motion.div>
          </div>

          {/* ── Order Summary ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="lg:w-[280px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-6">
              <h2 className="text-[14.5px] font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="flex items-start gap-3 mb-5 pb-5 border-b border-gray-100">
                <img src={book.img || book.images?.[0] || "https://placehold.co/60x60/1C7C84/white?text=B"}
                  alt={book.title} className="w-12 h-14 rounded-lg object-cover shrink-0 border border-gray-100" />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 leading-tight">{book.title}</p>
                  {book.author && <p className="text-[11.5px] text-gray-400 mt-0.5">by {book.author}</p>}
                  <p className="text-[11.5px] text-gray-400">Seller: {book.seller}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Subtotal</span><span>Rs.{price}</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Delivery</span><span>Rs.{delivery}</span>
                </div>
              </div>
              <div className="flex justify-between text-[15px] font-bold text-gray-900 border-t border-gray-100 pt-3 mb-5">
                <span>Total</span>
                <span className="text-[#1C7C84]">Rs.{total}</span>
              </div>

              {error && <p className="text-[12px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</p>}

              <button onClick={handleOrder} disabled={loading}
                className="w-full bg-[#1C7C84] hover:bg-[#155f65] text-white font-bold py-3 rounded-xl text-[14px] transition flex items-center justify-center gap-2 disabled:opacity-60">
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
                  : payment === "khalti" ? "💳 Pay with Khalti" : "📦 Place Order (COD)"
                }
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-3">
                {payment === "khalti" ? "🔒 Secured by Khalti" : "💵 Pay cash on delivery"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;