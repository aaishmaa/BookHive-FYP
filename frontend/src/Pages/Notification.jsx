import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, ShoppingCart, CreditCard, Star,
  Heart, MessageSquare, RefreshCcw, Bell, Loader, Trash2,
} from "lucide-react";
import { useNotificationStore } from "../store/notificationStore";

// Map icon string from backend → Lucide component
const ICON_MAP = {
  MessageCircle, ShoppingCart, CreditCard,
  Star, Heart, MessageSquare, RefreshCcw, Bell,
};

const NotificationsPage = () => {
  const {
    notifications, isLoading, error,
    fetchNotifications, markAllRead, markOneRead, deleteNotification,
  } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-[#1C7C84] text-white text-[12px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-[13px] font-semibold text-[#1C7C84] hover:underline transition">
              Mark all as read
            </button>
          )}
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader className="w-7 h-7 animate-spin text-[#1C7C84]" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-[13px] text-red-500">
            {error}
          </div>
        )}

        {/* List */}
        {!isLoading && (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {notifications.length > 0 ? notifications.map((n, i) => {
                const Icon = ICON_MAP[n.icon] || Bell;
                return (
                  <motion.div key={n.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    onClick={() => n.unread && markOneRead(n.id)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition group
                      ${n.unread
                        ? "bg-white border-[#1C7C84]/20 shadow-sm hover:shadow-md hover:border-[#1C7C84]/40"
                        : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}
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

                    {/* Right side: unread dot + delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {n.unread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1C7C84] shrink-0" />
                      )}
                    </div>
                  </motion.div>
                );
              }) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-16 text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-[14px] font-semibold">You're all caught up! 🎉</p>
                  <p className="text-[12.5px] mt-1">No notifications yet</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* All read message */}
            {notifications.length > 0 && unreadCount === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-6 text-gray-400">
                <p className="text-[13px] font-medium">You're all caught up! 🎉</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;