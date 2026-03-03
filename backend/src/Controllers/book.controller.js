import { Book } from '../models/book.model.js';
import { User } from '../models/user.model.js';

export const getBooks = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type && type !== 'all' ? { type } : {};

    const books = await Book.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      books,
    });

  } catch (error) {
    console.log("GET BOOKS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      badge,
      type,
      price,
      description,
    } = req.body;

    // ✅ Check images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // ✅ Get image URLs from Cloudinary
    const imageURLs = req.files.map((file) => file.path);

    // ✅ Get logged-in user from DB
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Create book with seller from DB
    const book = new Book({
      userId: req.userId,
      seller: user.name,   // ✅ FIXED HERE
      title,
      author,
      category,
      badge,
      type,
      price,
      description,
      images: imageURLs,
      img: imageURLs[0],
    });

    await book.save();

    res.status(201).json({
      success: true,
      book,
    });

  } catch (error) {
    console.log("CREATE BOOK ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};