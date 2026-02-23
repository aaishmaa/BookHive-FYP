import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Phone, MapPin, Calendar, GraduationCap,
  Upload, ChevronRight, Loader, X, Image, Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useStudentStore } from "../store/studentProfileStore";

const RequiredStar = () => <span className="text-red-500 ml-0.5">*</span>;

const StudentProfileForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createProfile, isLoading, error, clearError } = useStudentStore();

  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    location: "",
    collegeName: "",
    citizenshipFront: null,
    citizenshipBack: null,
  });

  const [previews, setPreviews] = useState({
    citizenshipFront: null,
    citizenshipBack: null,
  });

  const [errors, setErrors] = useState({});

  // Auto-fill name and email from logged-in user
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setSubmitError("");
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, [field]: file });
    setPreviews({ ...previews, [field]: URL.createObjectURL(file) });
    setErrors({ ...errors, [field]: "" });
  };

  const removeImage = (field) => {
    setForm({ ...form, [field]: null });
    setPreviews({ ...previews, [field]: null });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.age) newErrors.age = "Age is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.collegeName.trim()) newErrors.collegeName = "College name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!form.citizenshipFront) newErrors.citizenshipFront = "Front side is required";
    if (!form.citizenshipBack) newErrors.citizenshipBack = "Back side is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setSubmitError("");

    try {
      // Build FormData to send files + fields
      const formData = new FormData();
      formData.append("fullName",    form.fullName);
      formData.append("email",       form.email);
      formData.append("phone",       form.phone);
      formData.append("age",         form.age);
      formData.append("gender",      form.gender);
      formData.append("address",     form.address);
      formData.append("location",    form.location);
      formData.append("collegeName", form.collegeName);
      formData.append("citizenshipFront", form.citizenshipFront);
      formData.append("citizenshipBack",  form.citizenshipBack);

      await createProfile(formData);
      navigate("/homepage");
    } catch (err) {
      setSubmitError(err.response?.data?.msg || "Something went wrong. Please try again.");
    }
  };

  const inputClass = (field) =>
    `w-full outline-none bg-transparent text-gray-800 text-sm placeholder-gray-400 ${
      errors[field] ? "placeholder-red-300" : ""
    }`;

  const wrapperClass = (field) =>
    `flex items-center border rounded-lg px-3 py-2.5 bg-white transition ${
      errors[field] ? "border-red-400" : "border-[#1C7C84]"
    }`;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  });

  return (
    <div className="min-h-screen bg-[#F4FAFA] font-sans py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1C7C84] mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Complete Your Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Please fill in your details to get started as a student
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div {...fadeUp(0.1)} className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 1 ? "bg-[#1C7C84] text-white" : "bg-gray-200 text-gray-500"
            }`}>1</div>
            <span className={`text-sm font-medium ${step === 1 ? "text-[#1C7C84]" : "text-gray-400"}`}>
              Personal Info
            </span>
          </div>
          <div className={`flex-1 h-1 rounded-full transition-all ${step === 2 ? "bg-[#1C7C84]" : "bg-gray-200"}`} />
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className={`text-sm font-medium ${step === 2 ? "text-[#1C7C84]" : "text-gray-400"}`}>
              Documents
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 2 ? "bg-[#1C7C84] text-white" : "bg-gray-200 text-gray-500"
            }`}>2</div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          {/* Card Top Header */}
          <div className="bg-[#1C7C84] px-8 py-5 text-white">
            <h2 className="text-lg font-bold">
              {step === 1 ? "👤 Personal Information" : "📄 Citizenship Document"}
            </h2>
            <p className="text-sm opacity-80 mt-0.5">
              {step === 1
                ? "Your name and email have been auto-filled from your account"
                : "Upload front and back of your citizenship card"}
            </p>
          </div>

          <div className="px-8 py-8">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-5">

                {/* Full Name */}
                <motion.div {...fadeUp(0.05)}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <RequiredStar />
                  </label>
                  <div className={`${wrapperClass("fullName")} bg-[#f0fafa]`}>
                    <User className="w-4 h-4 text-[#1C7C84] mr-2 shrink-0" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full outline-none bg-transparent text-gray-800 text-sm"
                    />
                    {user?.name && (
                      <span className="text-xs text-[#1C7C84] bg-[#1C7C84]/10 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                        auto-filled
                      </span>
                    )}
                  </div>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </motion.div>

                {/* Email */}
                <motion.div {...fadeUp(0.08)}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <RequiredStar />
                  </label>
                  <div className={`${wrapperClass("email")} bg-[#f0fafa]`}>
                    <Mail className="w-4 h-4 text-[#1C7C84] mr-2 shrink-0" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full outline-none bg-transparent text-gray-800 text-sm"
                      readOnly={!!user?.email}
                    />
                    {user?.email && (
                      <span className="text-xs text-[#1C7C84] bg-[#1C7C84]/10 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                        auto-filled
                      </span>
                    )}
                  </div>
                  {user?.email && (
                    <p className="text-xs text-gray-400 mt-1">🔒 Email is locked to your verified account</p>
                  )}
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </motion.div>

                {/* Phone + Age */}
                <motion.div {...fadeUp(0.12)} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <RequiredStar />
                    </label>
                    <div className={wrapperClass("phone")}>
                      <Phone className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="98XXXXXXXX"
                        className={inputClass("phone")}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age <RequiredStar />
                    </label>
                    <div className={wrapperClass("age")}>
                      <Calendar className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                      <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="e.g. 21"
                        min="16"
                        max="60"
                        className={inputClass("age")}
                      />
                    </div>
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                  </div>
                </motion.div>

                {/* Gender */}
                <motion.div {...fadeUp(0.16)}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <RequiredStar />
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2.5 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1C7C84] transition ${
                      errors.gender ? "border-red-400" : "border-[#1C7C84]"
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </motion.div>

                {/* Address */}
                <motion.div {...fadeUp(0.20)}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <RequiredStar />
                  </label>
                  <div className={wrapperClass("address")}>
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street address"
                      className={inputClass("address")}
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </motion.div>

                {/* Location */}
                <motion.div {...fadeUp(0.24)}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location / City <RequiredStar />
                  </label>
                  <div className={wrapperClass("location")}>
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Kathmandu"
                      className={inputClass("location")}
                    />
                  </div>
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </motion.div>

                {/* College Name */}
                <motion.div {...fadeUp(0.28)}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College Name <RequiredStar />
                  </label>
                  <div className={wrapperClass("collegeName")}>
                    <GraduationCap className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      name="collegeName"
                      value={form.collegeName}
                      onChange={handleChange}
                      placeholder="e.g. Tribhuvan University"
                      className={inputClass("collegeName")}
                    />
                  </div>
                  {errors.collegeName && <p className="text-red-500 text-xs mt-1">{errors.collegeName}</p>}
                </motion.div>

                {/* Next */}
                <motion.button
                  {...fadeUp(0.32)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-[#1C7C84] text-white py-3 rounded-lg font-semibold hover:bg-[#146C70] transition flex items-center justify-center gap-2 mt-2"
                >
                  Next: Upload Documents <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-gray-500 bg-[#F4FAFA] rounded-lg px-4 py-3 border border-dashed border-[#1C7C84]">
                  📌 Please upload a clear photo of both sides of your citizenship card or government-issued ID.
                </p>

                {/* Front Upload */}
                <motion.div {...fadeUp(0.05)}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizenship — Front Side <RequiredStar />
                  </label>
                  {previews.citizenshipFront ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-[#1C7C84] h-44">
                      <img src={previews.citizenshipFront} alt="Front" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage("citizenshipFront")}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 transition"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-[#1C7C84] text-white text-xs px-2 py-0.5 rounded-full">
                        Front
                      </span>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-xl cursor-pointer transition hover:bg-[#1C7C84]/5 ${
                      errors.citizenshipFront ? "border-red-400 bg-red-50" : "border-[#1C7C84]"
                    }`}>
                      <Upload className="w-8 h-8 text-[#1C7C84] mb-2" />
                      <p className="text-sm font-medium text-[#1C7C84]">Click to upload front side</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => handleImageUpload(e, "citizenshipFront")} />
                    </label>
                  )}
                  {errors.citizenshipFront && <p className="text-red-500 text-xs mt-1">{errors.citizenshipFront}</p>}
                </motion.div>

                {/* Back Upload */}
                <motion.div {...fadeUp(0.1)}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizenship — Back Side <RequiredStar />
                  </label>
                  {previews.citizenshipBack ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-[#1C7C84] h-44">
                      <img src={previews.citizenshipBack} alt="Back" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage("citizenshipBack")}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 transition"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-[#1C7C84] text-white text-xs px-2 py-0.5 rounded-full">
                        Back
                      </span>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-xl cursor-pointer transition hover:bg-[#1C7C84]/5 ${
                      errors.citizenshipBack ? "border-red-400 bg-red-50" : "border-[#1C7C84]"
                    }`}>
                      <Image className="w-8 h-8 text-[#1C7C84] mb-2" />
                      <p className="text-sm font-medium text-[#1C7C84]">Click to upload back side</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => handleImageUpload(e, "citizenshipBack")} />
                    </label>
                  )}
                  {errors.citizenshipBack && <p className="text-red-500 text-xs mt-1">{errors.citizenshipBack}</p>}
                </motion.div>

                {/* Global submit error from backend */}
                {(submitError || error) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-red-600 text-sm font-medium">{submitError || error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep(1); clearError(); }}
                    className="flex-1 border-2 border-[#1C7C84] text-[#1C7C84] py-3 rounded-lg font-semibold hover:bg-[#1C7C84]/5 transition"
                  >
                    ← Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-grow bg-[#1C7C84] text-white py-3 rounded-lg font-semibold hover:bg-[#146C70] transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader className="w-5 h-5 animate-spin" /> Submitting...</>
                    ) : (
                      "Submit & Continue"
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Fields marked with <span className="text-red-500">*</span> are required
        </p>
      </div>
    </div>
  );
};

export default StudentProfileForm;