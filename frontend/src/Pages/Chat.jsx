import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image, Smile } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CONTACTS = [
  {
    id: 1, name: "Priya Sharma", initial: "P", online: true, time: "2m",
    lastMsg: "Is the book still available?",
    messages: [
      { id: 1, from: "them", text: "Hi! Is the Algorithms book still available?", time: "10:30 AM" },
      { id: 2, from: "me",   text: "Yes, it is! Are you interested?",             time: "10:32 AM" },
      { id: 3, from: "them", text: "Definitely! Can I see a few more pictures?",  time: "10:33 AM" },
      { id: 4, from: "me",   text: "Sure, let me send some. The book is in great condition with minimal highlighting.", time: "10:35 AM" },
      { id: 5, from: "them", text: "Is the price negotiable? I was thinking ₹400.", time: "10:38 AM" },
    ],
  },
  {
    id: 2, name: "Arjun Patel", initial: "A", online: false, time: "1h",
    lastMsg: "Can you do ₹350?",
    messages: [
      { id: 1, from: "them", text: "Hey, I saw your listing for Computer Networks.", time: "9:10 AM" },
      { id: 2, from: "me",   text: "Yes! It's in very good condition.",            time: "9:12 AM" },
      { id: 3, from: "them", text: "Can you do ₹350?",                             time: "9:15 AM" },
    ],
  },
  {
    id: 3, name: "Neha Gupta", initial: "N", online: true, time: "3h",
    lastMsg: "Thanks! I'll pick it up tomorrow",
    messages: [
      { id: 1, from: "me",   text: "Hi Neha, the book is ready for pickup.",       time: "8:00 AM" },
      { id: 2, from: "them", text: "Thanks! I'll pick it up tomorrow",             time: "8:05 AM" },
    ],
  },
  {
    id: 4, name: "Karan Singh", initial: "K", online: false, time: "1d",
    lastMsg: "What's the condition?",
    messages: [
      { id: 1, from: "them", text: "What's the condition of the book?",            time: "Yesterday" },
      { id: 2, from: "me",   text: "It's good — a few pencil marks but readable.", time: "Yesterday" },
    ],
  },
];

const avatarColor = (initial) => {
  const map = { P: "bg-[#1C7C84]", A: "bg-purple-500", N: "bg-amber-500", K: "bg-rose-500" };
  return map[initial] || "bg-gray-500";
};

// ─── Chat Page ────────────────────────────────────────────────────────────────
const ChatPage = () => {
  const [contacts, setContacts]       = useState(CONTACTS);
  const [activeId, setActiveId]       = useState(1);
  const [input, setInput]             = useState("");
  const bottomRef                     = useRef(null);

  const active = contacts.find(c => c.id === activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active?.messages?.length]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: input.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setContacts(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, newMsg], lastMsg: input.trim(), time: "now" }
        : c
    ));
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── Contact List ── */}
      <div className="w-[280px] shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition border-b border-gray-50 hover:bg-gray-50
                ${activeId === c.id ? "bg-[#1C7C84]/8 border-l-[3px] border-l-[#1C7C84]" : "border-l-[3px] border-l-transparent"}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full ${avatarColor(c.initial)} flex items-center justify-center text-white text-[13px] font-bold`}>
                  {c.initial}
                </div>
                {c.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-[13.5px] truncate ${activeId === c.id ? "font-semibold text-[#1C7C84]" : "font-semibold text-gray-800"}`}>
                    {c.name}
                  </p>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-1">{c.time}</span>
                </div>
                <p className="text-[12px] text-gray-400 truncate mt-0.5">{c.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat Window ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-gray-200 shrink-0">
          <div className="relative">
            <div className={`w-9 h-9 rounded-full ${avatarColor(active.initial)} flex items-center justify-center text-white text-[13px] font-bold`}>
              {active.initial}
            </div>
            {active.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900 leading-tight">{active.name}</p>
            <p className={`text-[11.5px] font-medium ${active.online ? "text-emerald-500" : "text-gray-400"}`}>
              {active.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          <AnimatePresence initial={false}>
            {active.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[60%] ${msg.from === "me" ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed
                      ${msg.from === "me"
                        ? "bg-[#1C7C84] text-white rounded-tr-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm"}`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 px-1">{msg.time}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-5 py-3.5 bg-white border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#1C7C84] transition">
            <button className="text-gray-400 hover:text-[#1C7C84] transition p-1">
              <Image className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-[#1C7C84] transition p-1">
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 bg-transparent outline-none text-[13.5px] text-gray-700 placeholder:text-gray-400 px-2"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition
                ${input.trim()
                  ? "bg-[#1C7C84] hover:bg-[#155f65] text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;