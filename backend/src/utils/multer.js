import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Config/cloudinary.config.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bookhive/citizenship', // folder name in your Cloudinary dashboard
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ quality: 'auto' }],
  },
});

export const upload = multer({ storage });