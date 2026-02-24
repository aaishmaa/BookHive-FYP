import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/Homepage");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-[#F4FAFA] text-gray-900">
      {/* LEFT SECTION */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative flex flex-col justify-center items-center w-full md:w-1/2 p-8 md:p-16"
        style={{
          backgroundImage: 'url("https://www.euroschoolindia.com/blogs/wp-content/uploads/2023/07/importance-of-education.jpg")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute z-10 text-center text-white px-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-center">
            "Inspiring every mind, every moment."
          </h2>
          <p className="text-center mt-4 text-sm md:text-base">
            Your path to personalized learning success.
          </p>
        </div>
      </motion.div>

      {/* RIGHT SECTION */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-center items-center w-full md:w-1/2 bg-[#F4FAFA] px-8 md:px-16 py-16 shadow-xl"
      >
        <div className="w-full max-w-md">
          {/* Top right Sign Up link */}
          <div className="flex justify-end text-sm mb-6">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/Register" className="text-[#1C7C84] font-semibold hover:underline">
                Sign up / Register
              </Link>
            </p>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#1C7C84] p-5 rounded-lg mb-8 shadow-md text-white py-8 px-6"
          >
            <h3 className="text-xl font-bold mb-1">🎓<br />Welcome!</h3>
            <p className="text-sm">Enter your credentials to continue</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center border border-[#1C7C84] rounded-md px-3 py-2 bg-white">
                <Mail className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none bg-transparent text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex items-center border border-[#1C7C84] rounded-md px-3 py-2 bg-white">
                <Lock className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none bg-transparent text-gray-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-gray-500 hover:text-[#1C7C84]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center space-x-2 text-gray-700">
                <input type="checkbox" className="accent-[#1C7C84]" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#1C7C84] hover:underline">
                Forgot your password?
              </Link>
            </div>

            {/* Error */}
            {error && <p className="text-red-500 font-semibold text-sm">{error}</p>}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1C7C84] text-white py-2.5 rounded-md font-semibold hover:bg-[#146C70] transition mt-4"
            >
              {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Login"}
            </motion.button>
          </form>

          <footer className="mt-10 text-center text-gray-500 text-sm">
            <p>2025 BookHive •{" "}
              <Link to="/privacy" className="hover:underline hover:text-[#1C7C84]">Privacy Policy</Link>
              {" "}•{" "}
              <Link to="/help" className="hover:underline hover:text-[#1C7C84]">Help</Link>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;