import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";

const OrderSuccess = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const book      = location.state?.book;
  const method    = location.state?.paymentMethod;

  return (
    <div className="h-full flex items-center justify-center bg-gray-50 px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-[22px] font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-[13.5px] text-gray-500 mb-6">
          {method === "COD"
            ? "Your order has been placed. Pay cash when the book is delivered."
            : "Payment successful! The seller will be notified."
          }
        </p>
        {book && (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-6 text-left">
            <img src={book.img || book.images?.[0] || "https://placehold.co/60x60"} alt={book.title}
              className="w-10 h-12 rounded-lg object-cover shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-gray-800">{book.title}</p>
              <p className="text-[12px] text-gray-400">Seller: {book.seller}</p>
            </div>
          </div>
        )}
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
      </motion.div>
    </div>
  );
};

export default OrderSuccess;