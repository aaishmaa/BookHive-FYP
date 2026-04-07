import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, ImagePlus, BookOpen, Tag,
  ChevronDown, Loader, FileText, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBookStore }  from "../store/bookStore";
import { useNotesStore } from "../store/notesStore";
import { useAuthStore }  from "../store/authStore";

// ─── Level / Class / Category data ───────────────────────────────────────────
const LEVEL_DATA = {
  School: {
    classes: ["Class 10"],
    categories: ["Mathematics","Science","English","Nepali","Social Studies","Computer Science","Other"],
  },
  "High School (+2)": {
    classes: ["Class 11","Class 12"],
    categories: ["Mathematics","Physics","Chemistry","Biology","English","Nepali","Computer Science","Account","Economics","Other"],
  },
  Bachelor: {
    classes: ["1st Year","2nd Year","3rd Year","4th Year"],
    categories: ["Computer Science / IT","Engineering","Management / BBA / BBS","Medical / Nursing","Law","Education","Science","Arts / Humanities","Other"],
  },
};

const LEVELS      = Object.keys(LEVEL_DATA);
const CONDITIONS  = ["Like New","Very Good","Good","Fair","Acceptable"];
const LISTING_TYPES = ["Sell","Rent","Exchange","PDF Notes"];

const typeInfo = {
  Sell:        { color: "text-[#1C7C84] bg-[#1C7C84]/10 border-[#1C7C84]",    desc: "Sell permanently" },
  Rent:        { color: "text-purple-600 bg-purple-50 border-purple-400",       desc: "Rent by month" },
  Exchange:    { color: "text-emerald-600 bg-emerald-50 border-emerald-400",    desc: "Swap for another" },
  "PDF Notes": { color: "text-amber-600 bg-amber-50 border-amber-400",          desc: "Share as PDF" },
};

// ─── Reusable select ──────────────────────────────────────────────────────────
function Select({ value, onChange, options, placeholder, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none border rounded-xl px-3 py-2.5 pr-9 text-[13px] outline-none transition bg-white cursor-pointer
          ${disabled ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50" : "border-gray-200 text-gray-700 focus:border-[#1C7C84]"}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ step, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <div className="w-5 h-5 rounded-full bg-[#1C7C84] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          {step}
        </div>
        <h2 className="text-[13px] font-bold text-gray-700">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── UploadPage ───────────────────────────────────────────────────────────────
const UploadPage = () => {
  const navigate = useNavigate();
  const fileRef  = useRef();
  const pdfRef   = useRef();
  const { user } = useAuthStore();

  const { createBook, isLoading: bookLoading, error: bookError, clearError: clearBookError } = useBookStore();
  const { createNote, isLoading: noteLoading, error: noteError }                             = useNotesStore();

  const isLoading = bookLoading || noteLoading;
  const error     = bookError  || noteError;

  // Form state
  const [listingType, setListingType] = useState("Sell");
  const [images,      setImages]      = useState([]);
  const [pdfFile,     setPdfFile]     = useState(null);
  const [title,       setTitle]       = useState("");
  const [author,      setAuthor]      = useState("");
  const [level,       setLevel]       = useState("");        // School | High School (+2) | Bachelor
  const [classYear,   setClassYear]   = useState("");        // Class 10, 1st Year, etc.
  const [category,    setCategory]    = useState("");        // subject / field
  const [condition,   setCondition]   = useState("");
  const [price,       setPrice]       = useState("");
  const [description, setDescription] = useState("");
  const [dragging,    setDragging]    = useState(false);
  const [pdfDragging, setPdfDragging] = useState(false);
  const [formError,   setFormError]   = useState("");

  // Clear any stale errors from previous pages on mount
  useEffect(() => {
    if (clearBookError) clearBookError();
  }, []);

  const isPdfMode   = listingType === "PDF Notes";
  const classOpts   = level ? LEVEL_DATA[level].classes    : [];
  const categoryOpts= level ? LEVEL_DATA[level].categories : [];

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleFiles = (files) => {
    const valid = Array.from(files)
      .filter(f => f.size <= 5 * 1024 * 1024 && f.type.startsWith("image/"))
      .slice(0, 5 - images.length);
    setImages(prev => [...prev, ...valid.map(f => ({ file: f, url: URL.createObjectURL(f) }))]);
  };

  const handlePdf = (files) => {
    const file = Array.from(files)[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFormError("Please upload a PDF file only."); return;
    }
    if (file.size > 20 * 1024 * 1024) { setFormError("PDF too large. Max 20 MB."); return; }
    setPdfFile(file); setFormError("");
  };

  const handleLevelChange = (val) => {
    setLevel(val);
    setClassYear("");   // reset dependent fields
    setCategory("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (clearBookError) clearBookError();

    if (!title.trim())  { setFormError("Title is required.");           return; }
    if (!level)         { setFormError("Please select a level.");        return; }
    if (!classYear)     { setFormError("Please select a class / year."); return; }
    if (!category)      { setFormError("Please select a category.");     return; }

    // PDF Notes flow
    if (isPdfMode) {
      if (!pdfFile) { setFormError("Please upload a PDF file."); return; }
      try {
        const fd = new FormData();
        fd.append("title",     title.trim());
        fd.append("level",     level);
        fd.append("classYear", classYear);
        fd.append("category",  category);
        fd.append("file",      pdfFile);
        await createNote(fd);
        navigate("/digital-notes");
      } catch {}
      return;
    }

    // Book flow
    if (images.length === 0) { setFormError("Please upload at least one image."); return; }
    if (!condition)           { setFormError("Please select a condition.");         return; }
    if ((listingType === "Sell" || listingType === "Rent") && !price) {
      setFormError("Please enter a price."); return;
    }

    try {
      const fd = new FormData();
      fd.append("title",       title.trim());
      fd.append("author",      author.trim());
      fd.append("level",       level);
      fd.append("classYear",   classYear);
      fd.append("category",    category);
      fd.append("badge",       condition);
      fd.append("description", description.trim());
      fd.append("type",        listingType);
      fd.append("seller",      user?.name || "Unknown");
      fd.append("price",
        listingType === "Sell" ? `₹${price}` :
        listingType === "Rent" ? `₹${price}/mo` : "For Exchange"
      );
      images.forEach(img => fd.append("images", img.file));
      await createBook(fd);
      navigate("/home");
    } catch {}
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[22px] font-bold text-gray-900">
            {isPdfMode ? "📄 Upload Study Notes" : "📚 List a Book"}
          </h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {isPdfMode
              ? "Share your notes as a PDF with fellow students"
              : "Fill in the details to post your book on BookHive"}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Step 1: Listing Type ── */}
          <Section step="1" title="Listing Type">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {LISTING_TYPES.map(t => {
                const active = listingType === t;
                const info   = typeInfo[t];
                return (
                  <button key={t} type="button"
                    onClick={() => { setListingType(t); setPrice(""); setFormError(""); setPdfFile(null); setImages([]); }}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 text-center transition
                      ${active ? info.color + " shadow-sm" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}
                  >
                    <span className="text-[13px] font-bold">{t}</span>
                    <span className={`text-[10.5px] leading-tight ${active ? "opacity-75" : "text-gray-400"}`}>{info.desc}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ── Step 2: Upload ── */}
          <Section step="2" title={isPdfMode ? "PDF File" : "Book Photos"}>
            {isPdfMode ? (
              pdfFile ? (
                <div className="flex items-center gap-4 border-2 border-[#1C7C84] rounded-xl px-5 py-4 bg-[#F4FAFA]">
                  <div className="w-11 h-11 rounded-lg bg-[#1C7C84]/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#1C7C84]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{pdfFile.name}</p>
                    <p className="text-[11.5px] text-gray-400 mt-0.5">{(pdfFile.size/(1024*1024)).toFixed(2)} MB · PDF</p>
                  </div>
                  <button type="button" onClick={() => setPdfFile(null)}
                    className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <div onClick={() => pdfRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setPdfDragging(true); }}
                  onDragLeave={() => setPdfDragging(false)}
                  onDrop={e => { e.preventDefault(); setPdfDragging(false); handlePdf(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center cursor-pointer transition
                    ${pdfDragging ? "border-[#1C7C84] bg-[#1C7C84]/5" : "border-gray-200 hover:border-[#1C7C84] hover:bg-gray-50"}`}>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-[13px] font-medium text-gray-600">
                    Drop PDF here or <span className="text-[#1C7C84] font-semibold">browse</span>
                  </p>
                  <p className="text-[11.5px] text-gray-400 mt-1">PDF only · Max 20 MB</p>
                  <input ref={pdfRef} type="file" accept="application/pdf" className="hidden"
                    onChange={e => handlePdf(e.target.files)} />
                </div>
              )
            ) : (
              <>
                <div onClick={() => fileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center cursor-pointer transition
                    ${dragging ? "border-[#1C7C84] bg-[#1C7C84]/5" : "border-gray-200 hover:border-[#1C7C84] hover:bg-gray-50"}`}>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-[13px] font-medium text-gray-600">
                    Drop images here or <span className="text-[#1C7C84] font-semibold">browse</span>
                  </p>
                  <p className="text-[11.5px] text-gray-400 mt-1">PNG, JPG · Max 5 MB each · Up to 5 images</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => handleFiles(e.target.files)} />
                </div>
                {images.length > 0 && (
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border-2 border-gray-200 group shrink-0">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-[#1C7C84]/80 text-white text-[9px] text-center py-0.5 font-semibold">Main</span>
                        )}
                        <button type="button" onClick={() => setImages(p => p.filter((_,idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <button type="button" onClick={() => fileRef.current.click()}
                        className="w-[72px] h-[72px] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-[#1C7C84] transition shrink-0">
                        <ImagePlus className="w-5 h-5 text-gray-300" />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </Section>

          {/* ── Step 3: Book / Notes Details ── */}
          <Section step="3" title={isPdfMode ? "Notes Details" : "Book Details"}>
            <div className="space-y-4">

              {/* Title + Author */}
              <div className={`grid gap-4 ${!isPdfMode ? "grid-cols-2" : "grid-cols-1"}`}>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                    {isPdfMode ? "Notes Title" : "Book Title"} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#1C7C84] transition bg-white">
                    <BookOpen className="w-4 h-4 text-gray-300 shrink-0" />
                    <input type="text"
                      placeholder={isPdfMode ? "e.g. Data Structures Notes" : "e.g. Introduction to Algorithms"}
                      value={title} onChange={e => setTitle(e.target.value)}
                      className="w-full outline-none text-[13px] text-gray-700 placeholder:text-gray-400 bg-transparent" />
                  </div>
                </div>
                {!isPdfMode && (
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Author</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#1C7C84] transition bg-white">
                      <Tag className="w-4 h-4 text-gray-300 shrink-0" />
                      <input type="text" placeholder="e.g. Thomas H. Cormen"
                        value={author} onChange={e => setAuthor(e.target.value)}
                        className="w-full outline-none text-[13px] text-gray-700 placeholder:text-gray-400 bg-transparent" />
                    </div>
                  </div>
                )}
              </div>

              {/* Level → Class/Year → Category (cascading) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={level}
                    onChange={handleLevelChange}
                    options={LEVELS}
                    placeholder="Select level"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                    Class / Year <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={classYear}
                    onChange={setClassYear}
                    options={classOpts}
                    placeholder={level ? "Select class" : "Select level first"}
                    disabled={!level}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={category}
                    onChange={setCategory}
                    options={categoryOpts}
                    placeholder={level ? "Select category" : "Select level first"}
                    disabled={!level}
                  />
                </div>
              </div>

              {/* Condition (books only) */}
              {!isPdfMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={condition}
                      onChange={setCondition}
                      options={CONDITIONS}
                      placeholder="Select condition"
                    />
                  </div>

                  {/* Price */}
                  {listingType !== "Exchange" ? (
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                        Price <span className="text-red-500">*</span>
                        {listingType === "Rent" && <span className="text-gray-400 font-normal ml-1">/month</span>}
                      </label>
                      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#1C7C84] transition bg-white">
                        <span className="text-gray-400 text-[13px] font-semibold shrink-0">Rs.</span>
                        <input type="number" min="0" placeholder="0" value={price}
                          onChange={e => setPrice(e.target.value)}
                          className="w-full outline-none text-[13px] text-gray-700 bg-transparent" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 w-full mt-5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-[12px] text-emerald-700 font-medium">Marked as "For Exchange"</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {!isPdfMode && (
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Description</label>
                  <div className="border border-gray-200 rounded-xl focus-within:border-[#1C7C84] transition bg-white overflow-hidden">
                    <textarea rows={3}
                      placeholder="Describe the book's condition, edition, any highlights..."
                      value={description} onChange={e => setDescription(e.target.value)}
                      className="w-full outline-none text-[13px] text-gray-700 placeholder:text-gray-400 px-3 py-2.5 resize-none bg-transparent" />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Errors */}
          <AnimatePresence>
            {(formError || error) && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-[13px] font-medium">{formError || error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
            type="submit" disabled={isLoading}
            className="w-full bg-[#1C7C84] hover:bg-[#155f65] text-white font-bold py-3.5 rounded-xl text-[14px] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading
              ? <><Loader className="w-4 h-4 animate-spin" />{isPdfMode ? "Uploading..." : "Posting..."}</>
              : <>{isPdfMode ? <FileText className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {isPdfMode ? "Upload Notes" : "Post Listing"}</>
            }
          </motion.button>

        </form>
      </div>
    </div>
  );
};

export default UploadPage;