import { Request } from '../models/request.model.js';
import { Book }    from '../models/book.model.js';
import { createNotif } from './notification.controller.js';
import { createTransaction } from './transaction.controller.js';


const timeAgo = (d) => {
  if (!d) return "";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)} days ago`;
};

const fmt = (r) => ({
  id:             r._id,
  _id:            r._id,
  from:           r.fromUserName,
  fi:             r.fromUserName?.[0]?.toUpperCase() || "?",
  book:           r.bookTitle,
  bookImg:        r.bookImg        || '',
  bookId:         r.bookId,
  offerBookId:    r.offerBookId    || null,
  offerBookTitle: r.offerBookTitle || '',
  offerBookImg:   r.offerBookImg   || '',
  type:           r.type,
  offer:          r.offer          || '',
  returnBy:       r.returnBy,
  message:        r.message        || '',
  time:           timeAgo(r.createdAt),
  status:         r.status,
  fromUserId:     r.fromUserId,
  toUserId:       r.toUserId,
});

// ── GET /requests ─────────────────────────────────────────────────────────────
export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ toUserId: req.userId }).sort({ createdAt: -1 });
    res.json({ requests: requests.map(fmt) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET /requests/sent ────────────────────────────────────────────────────────
export const getSentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ fromUserId: req.userId }).sort({ createdAt: -1 });
    res.json({ requests: requests.map(fmt) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── POST /requests ────────────────────────────────────────────────────────────
export const createRequest = async (req, res) => {
  try {
    const {
      bookId, type, offerTitle,
      offerBookId, offerBookTitle, offerBookImg,
      returnBy, message, senderName,
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    if (book.userId.toString() === req.userId)
      return res.status(400).json({ msg: "You can't request your own book" });

    const existing = await Request.findOne({ fromUserId: req.userId, bookId, status: 'Pending' });
    if (existing)
      return res.status(400).json({ msg: 'You already have a pending request for this book' });

    // Validate offered book belongs to requester
    if (type === 'Exchange' && offerBookId) {
      const offerBook = await Book.findById(offerBookId);
      if (!offerBook) return res.status(404).json({ msg: 'Offered book not found' });
      if (offerBook.userId.toString() !== req.userId)
        return res.status(403).json({ msg: "You can only offer your own books" });
    }

    let offerStr = offerBookTitle || offerTitle || '';
    if (!offerStr && returnBy)
      offerStr = `Return by ${new Date(returnBy).toLocaleDateString()}`;

    const request = await Request.create({
      fromUserId:     req.userId,
      fromUserName:   senderName || req.userName || 'Unknown',
      toUserId:       book.userId,
      bookId,
      bookTitle:      book.title,
      bookImg:        book.img || book.images?.[0] || '',
      offerBookId:    offerBookId    || null,
      offerBookTitle: offerBookTitle || '',
      offerBookImg:   offerBookImg   || '',
      type,
      offer:          offerStr,
      returnBy:       returnBy || null,
      message:        message  || '',
    });

    await Book.findByIdAndUpdate(bookId, { $inc: { enquiries: 1 } });

    // Notify book owner
    const notifText = type === 'Exchange' && offerBookTitle
      ? `📩 ${senderName || req.userName} wants to exchange "${book.title}" for "${offerBookTitle}"`
      : `📩 ${senderName || req.userName} sent a ${type} request for "${book.title}"`;

    await createNotif(book.userId, 'request', notifText, '/requests');

    res.status(201).json({ request: fmt(request) });
  } catch (err) {
    console.error('CREATE REQUEST ERROR:', err.message);
    res.status(500).json({ msg: err.message });
  }
};

// ── PATCH /requests/:id ───────────────────────────────────────────────────────
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Accepted', 'Declined'].includes(status))
      return res.status(400).json({ msg: 'Invalid status' });

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.toUserId.toString() !== req.userId)
      return res.status(403).json({ msg: 'Not authorized' });
    if (request.status !== 'Pending')
      return res.status(400).json({ msg: 'Request already handled' });

    request.status = status;
    await request.save();
    if (status === 'Accepted') {
  if (request.type === 'Exchange') {
    // Both users get an exchange transaction
    await createTransaction({
      userId:      request.toUserId,
      bookId:      request.bookId,
      bookTitle:   request.bookTitle,
      type:        'exchange',
      amount:      0,
      counterpart: request.fromUserName,
      requestId:   request._id,
      status:      'Completed',
    });
    await createTransaction({
      userId:      request.fromUserId,
      bookId:      request.offerBookId || request.bookId,
      bookTitle:   request.offerBookTitle || request.bookTitle,
      type:        'exchange',
      amount:      0,
      counterpart: 'Seller',
      requestId:   request._id,
      status:      'Completed',
    });
  } else if (request.type === 'Borrow') {
    const book     = await Book.findById(request.bookId);
    const priceNum = parseInt(book?.price?.replace(/[^0-9]/g, '') || '0');
    // Sender pays
    await createTransaction({
      userId:      request.fromUserId,
      bookId:      request.bookId,
      bookTitle:   request.bookTitle,
      type:        'rental',
      amount:      -priceNum,
      counterpart: 'Seller',
      requestId:   request._id,
      status:      'Completed',
    });
    // Receiver earns
    await createTransaction({
      userId:      request.toUserId,
      bookId:      request.bookId,
      bookTitle:   request.bookTitle,
      type:        'sale',
      amount:      +priceNum,
      counterpart: request.fromUserName,
      requestId:   request._id,
      status:      'Completed',
    });
  }
}

    // If exchange accepted → mark both books as Sold
    if (status === 'Accepted' && request.type === 'Exchange') {
      await Book.findByIdAndUpdate(request.bookId, { status: 'Sold' });
      if (request.offerBookId)
        await Book.findByIdAndUpdate(request.offerBookId, { status: 'Sold' });

      await createNotif(
        request.fromUserId, 'request',
        `✅ Exchange accepted! "${request.bookTitle}" ↔ "${request.offerBookTitle}" — both books marked as exchanged.`,
        '/requests'
      );
      await createNotif(
        request.toUserId, 'sale',
        `🔄 Exchange complete! You gave "${request.bookTitle}", received "${request.offerBookTitle}".`,
        '/my-listings'
      );
    } else {
      await createNotif(
        request.fromUserId,
        status === 'Accepted' ? 'request' : 'system',
        status === 'Accepted'
          ? `✅ Your ${request.type} request for "${request.bookTitle}" was accepted!`
          : `❌ Your ${request.type} request for "${request.bookTitle}" was declined.`,
        '/requests'
      );
    }

    res.json({ request: fmt(request) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── DELETE /requests/:id ──────────────────────────────────────────────────────
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.fromUserId.toString() !== req.userId)
      return res.status(403).json({ msg: 'Not authorized' });
    if (request.status !== 'Pending')
      return res.status(400).json({ msg: 'Can only cancel pending requests' });
    await request.deleteOne();
    res.json({ msg: 'Request cancelled' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── GET /requests/book/:bookId ────────────────────────────────────────────────
export const getBookRequests = async (req, res) => {
  try {
    const requests = await Request.find({ bookId: req.params.bookId })
      .sort({ createdAt: -1 }).limit(10);
    res.json({
      requests: requests.map(r => ({
        id:             r._id,
        from:           r.fromUserName,
        fi:             r.fromUserName?.[0]?.toUpperCase() || "?",
        type:           r.type,
        offer:          r.offer          || '',
        offerBookTitle: r.offerBookTitle || '',
        offerBookImg:   r.offerBookImg   || '',
        status:         r.status,
        time:           timeAgo(r.createdAt),
      }))
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};