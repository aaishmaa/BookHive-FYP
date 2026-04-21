import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Config/cloudinary.config.js';

// Citizenship images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bookhive/citizenship',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ quality: 'auto' }],
  },
});

// Book images
const bookStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bookhive/books',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ quality: 'auto' }],
  },
});

// PDF notes — memory storage so req.file.buffer is available
export const upload     = multer({ storage });
export const uploadBook = multer({ storage: bookStorage });
export const uploadNote = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  },
});