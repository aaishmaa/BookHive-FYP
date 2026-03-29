import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Mail, Lock, Eye, EyeOff, Shield, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [formErr,  setFormErr]  = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr("");
    if (!email || !password) { setFormErr("Please fill in all fields."); return; }

    try {
      await login(email, password);
      // Check role after login
      const { user } = useAuthStore.getState();
      if (user?.role !== "admin") {
        // Not admin — log them out and show error
        await useAuthStore.getState().logout();
        setFormErr("Access denied. This login is for admins only.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      // error is handled by store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f4c54] via-[#1C7C84] to-[#2E86AB] flex items-center justify-center p-4">

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-8 h-8 border border-white rounded-full"
            style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, opacity: Math.random() }} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[420px] p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1C7C84] rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[22px] font-bold text-gray-900">BookHive Admin</h1>
          <div className="flex items-center gap-1.5 mt-1.5 bg-[#1C7C84]/10 px-3 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5 text-[#1C7C84]" />
            <span className="text-[12px] font-semibold text-[#1C7C84]">Administrator Access</span>
          </div>
          <p className="text-[13px] text-gray-400 mt-2 text-center">
            This portal is restricted to authorized admins only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-600 mb-1.5">Admin Email</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#1C7C84] transition bg-gray-50">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@bookhive.com"
                className="w-full outline-none text-[13px] text-gray-700 bg-transparent placeholder:text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-600 mb-1.5">Password</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#1C7C84] transition bg-gray-50">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input type={showPass ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full outline-none text-[13px] text-gray-700 bg-transparent placeholder:text-gray-400" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="text-gray-400 hover:text-gray-600 transition shrink-0">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Errors */}
          {(formErr || error) && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-red-500 text-[13px]">⚠ {formErr || error}</span>
            </motion.div>
          )}

          {/* Submit */}
          <button type="submit" disabled={isLoading}
            className="w-full bg-[#1C7C84] hover:bg-[#155f65] text-white font-bold py-3 rounded-xl text-[14px] transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2 shadow-md">
            {isLoading
              ? <><Loader className="w-4 h-4 animate-spin" /> Verifying...</>
              : <><Shield className="w-4 h-4" /> Login as Admin</>
            }
          </button>
        </form>

        {/* Back to student login */}
        <div className="text-center mt-6 pt-5 border-t border-gray-100">
          <p className="text-[12.5px] text-gray-400">
            Not an admin?{" "}
            <button onClick={() => navigate("/login")}
              className="text-[#1C7C84] font-semibold hover:underline">
              Go to Student Login
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;