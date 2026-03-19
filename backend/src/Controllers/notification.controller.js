import { Notification } from '../models/notification.model.js'; 

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)   return `${Math.floor(s / 60)} min ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)} hours ago`;
  if (s < 604800) return `${Math.floor(s / 86400)} days ago`;
  return `${Math.floor(s / 604800)} weeks ago`;
};

const iconMap = {
  message: { iconBg: "bg-[#1C7C84]/10", iconColor: "text-[#1C7C84]",  icon: "MessageCircle" },
  sale:    { iconBg: "bg-[#1C7C84]/10", iconColor: "text-[#1C7C84]",  icon: "ShoppingCart"  },
  payment: { iconBg: "bg-emerald-50",   iconColor: "text-emerald-600", icon: "CreditCard"    },
  review:  { iconBg: "bg-amber-50",     iconColor: "text-amber-500",   icon: "Star"          },
  like:    { iconBg: "bg-red-50",       iconColor: "text-red-400",     icon: "Heart"         },
  comment: { iconBg: "bg-purple-50",    iconColor: "text-purple-500",  icon: "MessageSquare" },
  request: { iconBg: "bg-blue-50",      iconColor: "text-blue-500",    icon: "RefreshCcw"    },
  system:  { iconBg: "bg-gray-100",     iconColor: "text-gray-500",    icon: "Bell"          },
};

const fmt = (n) => ({
  id:    n._id,
  unread: n.unread,
  time:   timeAgo(n.createdAt),
  text:   n.text,
  link:   n.link,
  ...(iconMap[n.type] ?? iconMap.system),
});

export const getNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications: list.map(fmt) });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, unread: true }, { unread: false });
    res.json({ msg: 'All marked as read' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

export const markOneRead = async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { unread: false }, { new: true }
    );
    if (!n) return res.status(404).json({ msg: 'Not found' });
    res.json({ notification: fmt(n) });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

// ── Used by other controllers to fire notifications ───────────────────────────
export const createNotif = async (userId, type, text, link = "") => {
  try {
    await Notification.create({ userId, type, text, link });
  } catch (err) {
    console.error("Notif error:", err.message);
  }
};