import { useState } from "react";
import { motion } from "framer-motion";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API = import.meta.env.MODE === "development"
  ? "http://localhost:5000/payment"
  : "/payment";

// ── Khalti Pay Button ─────────────────────────────────────────────────────────
// Usage: <KhaltiPayment book={currentBook} onSuccess={() => {}} />
const KhaltiPayment = ({ book, onSuccess }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [paid,    setPaid]    = useState(false);


  const priceNum = parseInt(book?.price?.replace(/[^0-9]/g, '') || '0');

  const handlePay = async () => {
    if (!priceNum) { setError("Invalid price"); return; }
    setLoading(true);
    setError("");

    try {
      // Step 1: Initiate payment - get payment_url
      const res = await axios.post(`${API}/initiate`, {
        bookId:        book._id,
        bookTitle:     book.title,
        amount:        priceNum,
        customerName:  user?.name  || '',
        customerEmail: user?.email || '',
        returnUrl:     `${window.location.origin}/payment/success`,
      }, { withCredentials: true });

      // Step 2: Redirect to Khalti payment page
      window.location.href = res.data.payment_url;

    } catch (err) {
      setError(err.response?.data?.msg || "Payment initiation failed");
      setLoading(false);
    }
  };

  if (paid) return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-[13px] text-emerald-700 font-medium">
      <CheckCircle className="w-4 h-4 shrink-0" />
      Payment successful! Book purchased.
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-[12.5px] text-red-500">
          <XCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handlePay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-[14px] transition disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg, #5C2D91 0%, #7B4FBF 100%)', color: 'white' }}
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {/* Khalti logo SVG */}
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.2"/>
              <text x="50%" y="55%" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" dy=".1em">K</text>
            </svg>
            Pay Rs. {priceNum} with Khalti
          </>
        )}
      </motion.button>
      <p className="text-[11px] text-gray-400 text-center">
        Secure payment powered by Khalti
      </p>
    </div>
  );
};

export default KhaltiPayment;