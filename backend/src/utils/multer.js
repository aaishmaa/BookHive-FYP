import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Config/cloudinary.config.js';
import path from 'path';
import fs from 'fs';

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

// PDF notes — save to local disk
const uploadsDir = 'uploads/notes';
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

export const upload     = multer({ storage });
export const uploadBook = multer({ storage: bookStorage });
export const uploadNote = multer({ 
  storage: diskStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});