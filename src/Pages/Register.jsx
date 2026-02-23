import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    specialChar: false,
  });

  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const validatePassword = (pwd) => {
    const errors = {
      length: pwd.length >= 5,
      uppercase: /[A-Z]/.test(pwd),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    setPasswordErrors(errors);
    return Object.values(errors).every(Boolean);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("You must accept the terms and conditions!");
      return;
    }
    if (!validatePassword(password)) {
      alert("Password does not meet all requirements");
      return;
    }
    try {
      await signup(email, password, name, userType);
      navigate("/verify-email"); // after signup → go to login
    } catch (err) {
      console.log(err);
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
          <h2 className="text-2xl md:text-3xl font-semibold">"Inspiring every mind, every moment."</h2>
          <p className="text-center mt-4 text-sm md:text-base">Your path to personalized learning success.</p>
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
          {/* Top right Login link */}
          <div className="flex justify-end text-sm mb-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/Login" className="text-[#1C7C84] font-semibold hover:underline">
                Login
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
            <h3 className="text-xl font-bold mb-1">🎓<br />Register For Free</h3>
            <p className="text-sm">Create your new account</p>
          </motion.div>

          {/* User Type */}
          <div className="mt-2 mb-5">
            <label className="block text-gray-700 font-medium mb-2 text-sm">Select Your User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full appearance-none bg-white border border-[#1C7C84] text-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C7C84] transition duration-200 cursor-pointer"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="flex items-center border border-[#1C7C84] rounded-md px-3 py-2 bg-white">
                <Mail className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full outline-none bg-transparent text-gray-800"
                  required
                />
              </div>
            </div>

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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
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
              {/* Password Rules */}
              <div className="text-sm mt-2 space-y-1">
                <p className={passwordErrors.length ? "text-green-600" : "text-red-500"}>• At least 5 characters</p>
                <p className={passwordErrors.uppercase ? "text-green-600" : "text-red-500"}>• At least 1 uppercase letter</p>
                <p className={passwordErrors.specialChar ? "text-green-600" : "text-red-500"}>• At least 1 special character</p>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-center space-x-2 text-gray-700 text-sm mt-2">
              <input
                type="checkbox"
                className="accent-[#1C7C84]"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>I accept the <span className="text-blue-700">terms and conditions</span></span>
            </label>

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
              {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Create my account"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;