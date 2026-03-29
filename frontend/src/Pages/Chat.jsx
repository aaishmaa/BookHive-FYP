import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image, Smile, Loader } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";

const getInitial = (name) => name?.charAt(0).toUpperCase() || "U";

const avatarColor = (name) => {
  const colors = ["bg-[#1C7C84]", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-blue-500", "bg-green-500"];
  return colors[name?.charCodeAt(0) % colors.length] || "bg-gray-500";
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString();
};

const formatLastMsgTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

// ─── Chat Page ───────────
const ChatPage = () => {
  const { conversations, activeConversation, loading, error, fetchConversations, sendMessage: storeSendMessage, markAsRead } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
      markAsRead(activeConversation._id);
    }
  }, [activeConversation, markAsRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages?.length]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConversation || sending) return;
    
    setSending(true);
    try {
      await storeSendMessage(activeConversation._id, input);
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Loader className="w-8 h-8 text-[#1C7C84] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── Contact List ── */}
      <div className="w-[280px] shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p className="text-[13px]">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.participants.find(p => p._id !== user?._id);
              const lastMsg = conv.messages[conv.messages.length - 1];
              const isActive = activeConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  onClick={() => {
                    const chatStore = useChatStore.getState();
                    chatStore.setActiveConversation(conv);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition border-b border-gray-50 hover:bg-gray-50
                    ${isActive ? "bg-[#1C7C84]/8 border-l-[3px] border-l-[#1C7C84]" : "border-l-[3px] border-l-transparent"}`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full ${avatarColor(otherUser?.name)} flex items-center justify-center text-white text-[13px] font-bold`}>
                      {getInitial(otherUser?.name)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-[13.5px] truncate ${isActive ? "font-semibold text-[#1C7C84]" : "font-semibold text-gray-800"}`}>
                        {otherUser?.name}
                      </p>
                      <span className="text-[11px] text-gray-400 shrink-0 ml-1">
                        {formatLastMsgTime(conv.updatedAt)}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-400 truncate mt-0.5">
                      {lastMsg?.text || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Window ── */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Chat header */}
          {(() => {
            const otherUser = activeConversation.participants.find(p => p._id !== user?._id);
            return (
              <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-gray-200 shrink-0">
                <div className="relative">
                  <div className={`w-9 h-9 rounded-full ${avatarColor(otherUser?.name)} flex items-center justify-center text-white text-[13px] font-bold`}>
                    {getInitial(otherUser?.name)}
                  </div>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 leading-tight">{otherUser?.name}</p>
                  <p className="text-[11.5px] font-medium text-gray-400">Active now</p>
                </div>
              </div>
            );
          })()}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            <AnimatePresence initial={false}>
              {activeConversation.messages.map((msg) => {
                const isOwnMessage = msg.senderId._id === user?._id;
                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[60%] ${isOwnMessage ? "items-end" : "items-start"} flex flex-col`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed
                          ${isOwnMessage
                            ? "bg-[#1C7C84] text-white rounded-tr-sm"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm"}`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
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
                disabled={sending}
                className="flex-1 bg-transparent outline-none text-[13.5px] text-gray-700 placeholder:text-gray-400 px-2 disabled:opacity-50"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition
                  ${(input.trim() && !sending)
                    ? "bg-[#1C7C84] hover:bg-[#155f65] text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                {sending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-400 text-[14px]">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;