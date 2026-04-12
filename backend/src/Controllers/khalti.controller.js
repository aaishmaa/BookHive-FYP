import axios from 'axios';
import { Transaction } from '../Models/transaction.model.js';
import { Book }        from '../Models/book.model.js';

const KHALTI_SECRET = process.env.KHALTI_SECRET_KEY;
const KHALTI_URL    = 'https://a.khalti.com/api/v2';

// ── POST /payment/initiate ────────────────────────────────────────────────────
export const initiatePayment = async (req, res) => {
  try {
    const { bookId, amount, bookTitle, sellerId, sellerName, buyerName } = req.body;

    if (!bookId || !amount)
      return res.status(400).json({ msg: 'bookId and amount are required' });

    const amountInPaisa = Math.round(parseFloat(amount) * 100);

    // Encode seller info into purchase_order_id so verify can use it
    // Format: book_BOOKID_SELLERID_TIMESTAMP
    const orderId = `book_${bookId}_${sellerId || 'none'}_${Date.now()}`;

    const payload = {
      return_url:          `${process.env.CLIENT_URL}/payment/success`,
      website_url:         process.env.CLIENT_URL || 'http://localhost:5173',
      amount:              amountInPaisa,
      purchase_order_id:   orderId,
      purchase_order_name: bookTitle || 'Book Purchase',
      customer_info: {
        name:  req.body.customerName  || 'BookHive User',
        email: req.body.customerEmail || '',
        phone: req.body.customerPhone || '',
      },
    };

    const response = await axios.post(
      `${KHALTI_URL}/epayment/initiate/`,
      payload,
      { headers: { Authorization: `Key ${KHALTI_SECRET}`, 'Content-Type': 'application/json' } }
    );

    res.json({
      pidx:        response.data.pidx,
      payment_url: response.data.payment_url,
      expires_at:  response.data.expires_at,
    });

  } catch (err) {
    console.error('Khalti initiate error:', err.response?.data || err.message);
    res.status(500).json({ msg: err.response?.data?.detail || 'Payment initiation failed' });
  }
};

// ── POST /payment/verify ──────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { pidx, bookId: bodyBookId, bookTitle: bodyTitle } = req.body;

    if (!pidx) return res.status(400).json({ msg: 'pidx is required' });

    const response = await axios.post(
      `${KHALTI_URL}/epayment/lookup/`,
      { pidx },
      { headers: { Authorization: `Key ${KHALTI_SECRET}`, 'Content-Type': 'application/json' } }
    );

    const { status, total_amount, transaction_id, purchase_order_id, purchase_order_name } = response.data;

    if (status !== 'Completed') {
      return res.status(400).json({ msg: `Payment not completed. Status: ${status}` });
    }

    // Parse order ID: book_BOOKID_SELLERID_TIMESTAMP
    const parts    = (purchase_order_id || '').split('_');
    const bookId   = bodyBookId   || (parts.length >= 2 ? parts[1] : null);
    const sellerId = parts.length >= 3 && parts[2] !== 'none' ? parts[2] : null;
    const bookTitle = bodyTitle || purchase_order_name || 'Book Purchase';
    const amountRs  = total_amount / 100;

    // Mark book as Sold
    if (bookId) {
      await Book.findByIdAndUpdate(bookId, { status: 'Sold' });
    }

    // Check if transaction already created (avoid duplicates on retry)
    const existing = await Transaction.findOne({ userId: req.userId, bookId, type: 'purchase' });
    if (!existing) {
      // Buyer transaction
      await Transaction.create({
        userId:      req.userId,
        bookId:      bookId || null,
        bookTitle,
        type:        'purchase',
        amount:      -amountRs,
        counterpart: req.body.sellerName || 'Seller',
        status:      'Completed',
      });

      // Seller transaction
      if (sellerId && sellerId !== 'none') {
        await Transaction.create({
          userId:      sellerId,
          bookId:      bookId || null,
          bookTitle,
          type:        'sale',
          amount:      +amountRs,
          counterpart: req.body.buyerName || 'Buyer',
          status:      'Completed',
        });
      }
    }

    res.json({
      msg:            'Payment verified successfully',
      transaction_id,
      amount:         amountRs,
      status:         'Completed',
    });

  } catch (err) {
    console.error('Khalti verify error:', err.response?.data || err.message);
    res.status(500).json({ msg: err.response?.data?.detail || 'Payment verification failed' });
  }
};

// ── POST /payment/cod ─────────────────────────────────────────────────────────
export const cashOnDelivery = async (req, res) => {
  try {
    const { bookId, bookTitle, amount, sellerId, sellerName, buyerName } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    await Book.findByIdAndUpdate(bookId, { status: 'Sold' });

    // Buyer transaction
    await Transaction.create({
      userId:      req.userId,
      bookId:      bookId || null,
      bookTitle:   bookTitle || book.title,
      type:        'purchase',
      amount:      -(parseFloat(amount) || 0),
      counterpart: sellerName || 'Seller',
      status:      'Completed',
    });

    // Seller transaction
    if (sellerId && sellerId !== 'none') {
      await Transaction.create({
        userId:      sellerId,
        bookId:      bookId || null,
        bookTitle:   bookTitle || book.title,
        type:        'sale',
        amount:      +(parseFloat(amount) || 0),
        counterpart: buyerName || 'Buyer',
        status:      'Completed',
      });
    }

    res.json({ msg: 'Order placed successfully (COD)' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};