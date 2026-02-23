import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { ShieldCheck, Loader } from "lucide-react";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { error, isLoading, verifyEmail } = useAuthStore();

  const handleChange = (index, value) => {
    const newCode = [...code];
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      await verifyEmail(verificationCode);
      navigate("/form-page");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-[#F4FAFA] flex items-center justify-center px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden"
      >
        {/* Teal header */}
        <div className="bg-[#1C7C84] px-8 py-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7" />
            <h2 className="text-2xl font-bold">Verify Your Email</h2>
          </div>
          <p className="text-sm opacity-90">
            Enter the 6-digit code sent to your email address to complete registration.
          </p>
        </div>

        {/* Form body */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-4 text-center">
                Enter verification code
              </label>
              <div className="flex justify-between gap-2">
                {code.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="6"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="w-12 h-14 text-center text-2xl font-bold bg-[#F4FAFA] border-2 border-[#1C7C84] rounded-lg text-[#1C7C84] focus:outline-none focus:ring-2 focus:ring-[#1C7C84] transition shadow-sm"
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-500 font-semibold text-sm text-center">{error}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || code.some((digit) => !digit)}
              className="w-full bg-[#1C7C84] text-white py-3 rounded-lg font-semibold hover:bg-[#146C70] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Verify Email"
              )}
            </motion.button>

            <p className="text-center text-sm text-gray-500">
              Didn't receive a code?{" "}
              <button
                type="button"
                className="text-[#1C7C84] font-semibold hover:underline"
                onClick={() => alert("Resend feature coming soon!")}
              >
                Resend
              </button>
            </p>

            <p className="text-center text-sm text-gray-500">
              <a href="/Login" className="text-[#1C7C84] font-semibold hover:underline">
                ← Back to Login
              </a>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;