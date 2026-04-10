import axios from 'axios';
import { Transaction } from '../Models/transaction.model.js';
import { Book }        from '../Models/book.model.js';

const KHALTI_SECRET = process.env.KHALTI_SECRET_KEY;
const KHALTI_URL    = 'https://a.khalti.com/api/v2'; // use https://dev.khalti.com/api/v2 for sandbox

// ── POST /payment/initiate ────────────────────────────────────────────────────
// Called when user clicks "Pay with Khalti"
export const initiatePayment = async (req, res) => {
  try {
    const { bookId, amount, bookTitle, returnUrl } = req.body;

    if (!bookId || !amount)
      return res.status(400).json({ msg: 'bookId and amount are required' });

    // Amount must be in paisa (1 Rs = 100 paisa)
    const amountInPaisa = Math.round(parseFloat(amount) * 100);

    const payload = {
      return_url:    returnUrl || `${process.env.CLIENT_URL}/payment/success`,
      website_url:   process.env.CLIENT_URL || 'http://localhost:5173',
      amount:        amountInPaisa,
      purchase_order_id:   `book_${bookId}_${Date.now()}`,
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
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Returns { pidx, payment_url, expires_at, ... }
    res.json({
      pidx:        response.data.pidx,
      payment_url: response.data.payment_url,  // redirect user here
      expires_at:  response.data.expires_at,
    });

  } catch (err) {
    console.error('Khalti initiate error:', err.response?.data || err.message);
    res.status(500).json({ msg: err.response?.data?.detail || 'Payment initiation failed' });
  }
};

// ── POST /payment/verify ──────────────────────────────────────────────────────
// Called after user completes payment — verify with Khalti
export const verifyPayment = async (req, res) => {
  try {
    const { pidx, bookId, bookTitle, amount, sellerId, sellerName } = req.body;

    if (!pidx) return res.status(400).json({ msg: 'pidx is required' });

    // Verify with Khalti
    const response = await axios.post(
      `${KHALTI_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { status, total_amount, transaction_id } = response.data;

    if (status !== 'Completed') {
      return res.status(400).json({ msg: `Payment not completed. Status: ${status}` });
    }

    // ── Payment verified ✅ ────────────────────────────────────────────────────

    // Mark book as Sold
    if (bookId) {
      await Book.findByIdAndUpdate(bookId, { status: 'Sold' });
    }

    // Create transaction record for buyer
    await Transaction.create({
      userId:        req.userId,
      bookId:        bookId   || null,
      bookTitle:     bookTitle || 'Book Purchase',
      type:          'purchase',
      amount:        -(total_amount / 100), // convert paisa → Rs
      counterpart:   sellerName || 'Seller',
      status:        'Completed',
    });

    // Create transaction record for seller (if we know who they are)
    if (sellerId) {
      await Transaction.create({
        userId:        sellerId,
        bookId:        bookId   || null,
        bookTitle:     bookTitle || 'Book Sale',
        type:          'sale',
        amount:        +(total_amount / 100),
        counterpart:   req.body.buyerName || 'Buyer',
        status:        'Completed',
      });
    }

    res.json({
      msg:            'Payment verified successfully',
      transaction_id,
      amount:         total_amount / 100,
      status:         'Completed',
    });

  } catch (err) {
    console.error('Khalti verify error:', err.response?.data || err.message);
    res.status(500).json({ msg: err.response?.data?.detail || 'Payment verification failed' });
  }
};