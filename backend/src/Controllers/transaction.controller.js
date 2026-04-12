import { Transaction } from '../Models/transaction.model.js';  // capital M

const fmt = (t) => ({
  id:        t._id,
  title:     t.bookTitle,
  sub:       t.counterpart
               ? (t.amount < 0 ? `From ${t.counterpart}` : `To ${t.counterpart}`)
               : '',
  date:      new Date(t.createdAt).toLocaleDateString('en-US', {
               month: 'short', day: 'numeric', year: 'numeric'
             }),
  type:      t.type,
  amount:    t.amount,
  status:    t.status,
  bookId:    t.bookId,
  requestId: t.requestId,
});

// ── GET /transactions ─────────────────────────────────────────────────────────
export const getTransactions = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.userId };
    if (type && type !== 'all') query.type = type;

    const transactions = await Transaction
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    const all    = await Transaction.find({ userId: req.userId });
    const spent  = all.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
    const earned = all.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);

    res.json({
      transactions: transactions.map(fmt),
      stats: {
        totalSpent:        spent,
        totalEarned:       earned,
        totalTransactions: all.length,
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── Helper used by khalti.controller.js ──────────────────────────────────────
export const createTransaction = async (data) => {
  try {
    await Transaction.create(data);
  } catch (err) {
    console.error('Transaction error:', err.message);
  }
};