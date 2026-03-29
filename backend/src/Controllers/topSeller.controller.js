import { Book } from '../models/book.model.js';
import { User } from '../models/user.model.js';

// ── GET /top-sellers — top users by number of active listings ─────────────────
export const getTopSellers = async (req, res) => {
  try {
    // Aggregate books by userId, count active listings
    const topSellers = await Book.aggregate([
      { $match: { status: 'Active' } },
      { $group: {
          _id:        '$userId',
          bookCount:  { $sum: 1 },
          totalViews: { $sum: '$views' },
          seller:     { $first: '$seller' },
      }},
      { $sort: { bookCount: -1 } },
      { $limit: 5 },
    ]);

    // Enrich with user profile image
    const enriched = await Promise.all(
      topSellers.map(async (s) => {
        const user = await User.findById(s._id).select('name profileImage');
        return {
          id:           s._id,
          name:         user?.name || s.seller || 'Unknown',
          initial:      (user?.name || s.seller || 'U')[0].toUpperCase(),
          books:        s.bookCount,
          profileImage: user?.profileImage || '',
          views:        s.totalViews,
        };
      })
    );

    res.json({ topSellers: enriched });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};