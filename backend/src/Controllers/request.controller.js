import { Request } from '../models/request.model.js';
import { Book }    from '../models/book.model.js';

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)} days ago`;
};

const fmt = (r) => ({
  id:     r._id,
  from:   r.fromUserName,
  fi:     r.fromUserName?.[0]?.toUpperCase() || "?",
  book:   r.bookTitle,
  type:   r.type,
  offer:  r.offer,
  time:   timeAgo(r.createdAt),
  status: r.status,
});

// ── GET /requests — requests received by logged-in user ───────────────────────
export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ toUserId: req.userId }).sort({ createdAt: -1 });
    res.json({ requests: requests.map(fmt) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET /requests/sent — requests sent by logged-in user ──────────────────────
export const getSentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ fromUserId: req.userId }).sort({ createdAt: -1 });
    res.json({ requests: requests.map(fmt) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── POST /requests — send a new request ──────────────────────────────────────
export const createRequest = async (req, res) => {
  try {
    const { bookId, type, offer } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    if (book.userId.toString() === req.userId)
      return res.status(400).json({ msg: "You can't request your own book" });

    // Prevent duplicate pending requests
    const existing = await Request.findOne({
      fromUserId: req.userId, bookId, status: 'Pending'
    });
    if (existing) return res.status(400).json({ msg: 'You already have a pending request for this book' });

    const request = await Request.create({
      fromUserId:   req.userId,
      fromUserName: req.userName,   // set by verifyToken middleware
      toUserId:     book.userId,
      bookId,
      bookTitle:    book.title,
      type,
      offer,
    });

    // Increment enquiries on the book
    await Book.findByIdAndUpdate(bookId, { $inc: { enquiries: 1 } });

    res.status(201).json({ request: fmt(request) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── PATCH /requests/:id — accept or decline ───────────────────────────────────
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Accepted', 'Declined'].includes(status))
      return res.status(400).json({ msg: 'Invalid status' });

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.toUserId.toString() !== req.userId)
      return res.status(403).json({ msg: 'Not authorized' });

    request.status = status;
    await request.save();
    res.json({ request: fmt(request) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── DELETE /requests/:id — cancel a sent request ──────────────────────────────
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.fromUserId.toString() !== req.userId)
      return res.status(403).json({ msg: 'Not authorized' });

    await request.deleteOne();
    res.json({ msg: 'Request cancelled' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};