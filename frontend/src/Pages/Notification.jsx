import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ShoppingCart, CreditCard, Star, Heart, MessageSquare } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  {
    id: 1, unread: true,  time: "2 min ago",
    text: 'Priya Sharma sent you a message about "Algorithms"',
    icon: MessageCircle, iconBg: "bg-[#1C7C84]/10", iconColor: "text-[#1C7C84]",
  },
  {
    id: 2, unread: true,  time: "1 hour ago",
    text: 'Your book "Engineering Math" has been sold!',
    icon: ShoppingCart,  iconBg: "bg-[#1C7C84]/10", iconColor: "text-[#1C7C84]",
  },
  {
    id: 3, unread: false, time: "3 hours ago",
    text: "Payment of ₹450 received from Arjun Patel",
    icon: CreditCard,    iconBg: "bg-emerald-50",    iconColor: "text-emerald-600",
  },
  {
    id: 4, unread: false, time: "5 hours ago",
    text: "Neha Gupta left a 5-star review on your listing",
    icon: Star,          iconBg: "bg-amber-50",      iconColor: "text-amber-500",
  },
  {
    id: 5, unread: false, time: "1 day ago",
    text: ' 12 people liked your "Data Structures Notes"',
    icon: Heart,         iconBg: "bg-red-50",        iconColor: "text-red-400",
  },
  {
    id: 6, unread: false, time: "2 days ago",
    text: "Karan Singh commented on your book listing",
    icon: MessageSquare, iconBg: "bg-purple-50",     iconColor: "text-purple-500",
  },
];

// ─── Notifications Page ───────────────────────────────────────────────────────
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markOneRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-[#1C7C84] text-white text-[12px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[13px] font-semibold text-[#1C7C84] hover:underline transition"
            >
              Mark all as read
            </button>
          )}
        </motion.div>

        {/* Notification list */}
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {notifications.map((n, i) => {
              const Icon = n.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  onClick={() => markOneRead(n.id)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition
                    ${n.unread
                      ? "bg-white border-[#1C7C84]/20 shadow-sm hover:shadow-md hover:border-[#1C7C84]/40"
                      : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full ${n.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-[18px] h-[18px] ${n.iconColor}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13.5px] leading-snug ${n.unread ? "font-semibold text-gray-900" : "font-normal text-gray-600"}`}>
                      {n.text}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>

                  {/* Unread dot */}
                  {n.unread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1C7C84] shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {notifications.every(n => !n.unread) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-gray-400"
            >
              <p className="text-[14px] font-medium">You're all caught up! 🎉</p>
              <p className="text-[12.5px] mt-1">No new notifications</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;