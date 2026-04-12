import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader, Home, ShoppingBag } from "lucide-react";
import axios from "axios";

const API = import.meta.env.MODE === "development"
  ? "http://localhost:5000/payment"
  : "/payment";

// Khalti redirects here after payment with:
// ?pidx=xxx&status=Completed&purchase_order_id=book_BOOKID_TIMESTAMP&purchase_order_name=TITLE&total_amount=xxx
const PaymentSuccess = () => {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const [status,   setStatus]   = useState("verifying");
  const [message,  setMessage]  = useState("");
  const [amount,   setAmount]   = useState(null);

  useEffect(() => {
    const verify = async () => {
      const pidx      = params.get("pidx");
      const txnStatus = params.get("status");

      // Extract bookId from purchase_order_id = "book_BOOKID_TIMESTAMP"
      const purchaseOrderId = params.get("purchase_order_id") || "";
      const parts   = purchaseOrderId.split("_");
      const bookId  = parts.length >= 2 ? parts[1] : null;
      const bookTitle = params.get("purchase_order_name") || "Book Purchase";

      if (!pidx || txnStatus !== "Completed") {
        setStatus("failed");
        setMessage("Payment was not completed or was cancelled.");
        return;
      }

      try {
        const res = await axios.post(`${API}/verify`, {
          pidx,
          bookId,
          bookTitle,
          // sellerId is encoded in purchase_order_id — controller parses it
        }, { withCredentials: true });

        setAmount(res.data.amount);
        setStatus("success");
        setMessage(`Payment of Rs. ${res.data.amount} verified successfully!`);

        // Auto-redirect after 3 seconds
        setTimeout(() => navigate("/transactions"), 3000);

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

        {/* Verifying */}
        {status === "verifying" && (
          <>
            <Loader className="w-12 h-12 animate-spin text-[#1C7C84] mx-auto mb-4" />
            <h2 className="text-[18px] font-bold text-gray-900">Verifying Payment...</h2>
            <p className="text-[13px] text-gray-400 mt-2">Please wait, do not close this page</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-[13.5px] text-gray-500 mb-1">{message}</p>
            <p className="text-[12px] text-gray-400 mb-6">Redirecting to transactions in 3 seconds...</p>
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

        {/* Failed */}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-[13px] text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/home")}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl text-[13px] transition">
                Back to Home
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