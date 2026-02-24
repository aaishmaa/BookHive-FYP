import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, ImagePlus, BookOpen, Tag, AlignLeft, DollarSign, ChevronDown } from "lucide-react";

const categories = [
  "Engineering", "Medical", "Management", "Law", "IT",
  "Science", "History", "Fiction", "Self-Help", "Productivity", "Technology", "Other"
];

const conditions = ["Like New", "Very Good", "Good", "Fair", "Acceptable"];

const LISTING_TYPES = ["Sell", "Rent", "Exchange", "PDF Notes"];

const UploadPage = () => {
  const [images, setImages]           = useState([]);
  const [listingType, setListingType] = useState("Sell");
  const [title, setTitle]             = useState("");
  const [author, setAuthor]           = useState("");
  const [category, setCategory]       = useState("");
  const [condition, setCondition]     = useState("");
  const [price, setPrice]             = useState("");
  const [description, setDescription] = useState("");
  const [dragging, setDragging]       = useState(false);
  const fileRef = useRef();

  const handleFiles = (files) => {
    const valid = Array.from(files)
      .filter(f => f.size <= 5 * 1024 * 1024 && f.type.startsWith("image/"))
      .slice(0, 5 - images.length);
    const previews = valid.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...previews]);
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ listingType, title, author, category, condition, price, description, images });
    alert("Listing posted successfully!");
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900">Upload a Book</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to list your book on BookHive</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <form onSubmit={handleSubmit}>

            {/* ── Image Upload ── */}
            <div className="p-6 border-b border-gray-100">
              <label className="block text-[13.5px] font-semibold text-gray-700 mb-3">
                Images
              </label>

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition
                  ${dragging
                    ? "border-[#1C7C84] bg-[#1C7C84]/5"
                    : "border-gray-200 hover:border-[#1C7C84] hover:bg-[#1C7C84]/5"}`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-[13.5px] font-medium text-gray-600">
                  Drag & drop images here, or <span className="text-[#1C7C84] font-semibold">click to browse</span>
                </p>
                <p className="text-[12px] text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              {/* Image previews */}
              {images.length > 0 && (
                <div className="flex gap-3 mt-4 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileRef.current.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-[#1C7C84] transition"
                    >
                      <ImagePlus className="w-5 h-5 text-gray-300" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Listing Type ── */}
            <div className="p-6 border-b border-gray-100">
              <label className="block text-[13.5px] font-semibold text-gray-700 mb-3">
                Listing Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {LISTING_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setListingType(type)}
                    className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition border
                      ${listingType === type
                        ? "bg-[#1C7C84] text-white border-[#1C7C84]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-[#1C7C84] hover:text-[#1C7C84]"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Book Title + Author ── */}
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Book Title
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#1C7C84] transition bg-white">
                    <BookOpen className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Data Structures & Algorithms"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full outline-none text-[13px] text-gray-700 placeholder:text-gray-400 bg-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Author
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#1C7C84] transition bg-white">
                    <Tag className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Thomas H. Cormen"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full outline-none text-[13px] text-gray-700 placeholder:text-gray-400 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Category + Condition ── */}
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#1C7C84] transition bg-white cursor-pointer pr-9"
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Condition
                  </label>
                  <div className="relative">
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#1C7C84] transition bg-white cursor-pointer pr-9"
                    >
                      <option value="" disabled>Select condition</option>
                      {conditions.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Price ── */}
            {listingType !== "Exchange" && listingType !== "PDF Notes" && (
              <div className="p-6 border-b border-gray-100">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Price {listingType === "Rent" && <span className="text-gray-400 font-normal">(per month)</span>}
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#1C7C84] transition bg-white w-1/2">
                  <span className="text-gray-500 mr-1.5 text-[13px] font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full outline-none text-[13px] text-gray-700 bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* ── Description ── */}
            <div className="p-6 border-b border-gray-100">
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <div className="border border-gray-200 rounded-lg focus-within:border-[#1C7C84] transition bg-white">
                <textarea
                  rows={4}
                  placeholder="Describe the book's condition, edition, highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full outline-none text-[13px] text-gray-700 placeholder:text-gray-400 px-3 py-2.5 resize-none bg-transparent rounded-lg"
                />
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="p-6">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full bg-[#1C7C84] hover:bg-[#155f65] text-white font-semibold py-3 rounded-xl text-[14px] transition flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Post Listing
              </motion.button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;