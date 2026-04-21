import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader, Home, ShoppingBag, QrCode } from "lucide-react";
import axios from "axios";

const API = import.meta.env.MODE === "development"
  ? "http://localhost:5000/payment"
  : "/payment";

const PaymentSuccess = () => {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const [status,   setStatus]   = useState("verifying");
  const [message,  setMessage]  = useState("");
  const [amount,   setAmount]   = useState(null);
  const [bookTitle,setBookTitle]= useState("");

  useEffect(() => {
    const verify = async () => {
      const pidx            = params.get("pidx");
      const txnStatus       = params.get("status");
      const purchaseOrderId = params.get("purchase_order_id") || "";
      const parts           = purchaseOrderId.split("_");
      const bookId          = parts.length >= 2 ? parts[1] : null;
      const title           = params.get("purchase_order_name") || "Book Purchase";

      setBookTitle(title);

      if (!pidx || txnStatus !== "Completed") {
        setStatus("failed");
        setMessage("Payment was not completed or was cancelled.");
        return;
      }

      try {
        const res = await axios.post(`${API}/verify`, {
          pidx, bookId, bookTitle: title,
        }, { withCredentials: true });

        setAmount(res.data.amount);
        setStatus("success");
        setMessage(`Payment of Rs. ${res.data.amount} verified successfully!`);
        setTimeout(() => navigate("/transactions"), 4000);

      } catch (err) {
        setStatus("failed");
        setMessage(err.response?.data?.msg || "Verification failed. Please contact support.");
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">

        {/* ── Verifying ── */}
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-5">
              <Loader className="w-8 h-8 animate-spin text-purple-600" />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">Verifying Payment...</h2>
            <p className="text-[13px] text-gray-400">Please wait, do not close this page</p>

            {/* Khalti QR  */}
            <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                <QrCode className="w-4 h-4 text-purple-500" />
                <p className="text-[12.5px] font-semibold text-purple-700">Paid via Khalti?</p>
              </div>
              <p className="text-[11.5px] text-purple-500">
                If you paid via QR or Khalti wallet, your payment is being confirmed automatically.
              </p>
            </div>
          </>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            {/* Confetti-like pulse */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
              <div className="relative w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
            </div>

            <h2 className="text-[22px] font-bold text-gray-900 mb-1">Payment Successful!</h2>
            <p className="text-[13px] text-gray-400 mb-4">{bookTitle}</p>

            {/* Amount card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-5">
              <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide mb-1">Amount Paid</p>
              <p className="text-[28px] font-extrabold text-emerald-700">Rs. {amount}</p>
              <p className="text-[11px] text-emerald-500 mt-1">via Khalti · Verified ✓</p>
            </div>

            {/* QR payment confirmation badge */}
            <div className="flex items-center justify-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 mb-5">
              <QrCode className="w-4 h-4 text-purple-500" />
              <p className="text-[12px] text-purple-700 font-medium">
                Payment received · Book marked as Sold
              </p>
            </div>

            <p className="text-[12px] text-gray-400 mb-5">Redirecting to your orders in 4 seconds...</p>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1 mb-5 overflow-hidden">
              <div className="bg-emerald-400 h-1 rounded-full animate-[progress_4s_linear_forwards]"
                   style={{ animation: 'width 4s linear forwards', width: '100%' }} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate("/home")}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl text-[13px] transition">
                <Home className="w-4 h-4" /> Home
              </button>
              <button onClick={() => navigate("/transactions")}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1C7C84] hover:bg-[#155f65] text-white font-semibold py-2.5 rounded-xl text-[13px] transition">
                <ShoppingBag className="w-4 h-4" /> My Orders
              </button>
            </div>
          </>
        )}

        {/* ── Failed ── */}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-[13px] text-gray-500 mb-4">{message}</p>

            {/* QR help message */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-left">
              <p className="text-[12px] text-amber-700 font-semibold mb-1">Paid via QR code?</p>
              <p className="text-[11.5px] text-amber-600">
                If you already scanned and paid, your transaction may still be processing.
                Check your Khalti app for confirmation, then check My Orders.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate("/home")}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl text-[13px] transition">
                Back to Home
              </button>
              <button onClick={() => navigate("/transactions")}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-[13px] transition">
                Check Orders
              </button>
              <button onClick={() => navigate(-2)}
                className="flex-1 bg-[#1C7C84] hover:bg-[#155f65] text-white font-semibold py-2.5 rounded-xl text-[13px] transition">
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;