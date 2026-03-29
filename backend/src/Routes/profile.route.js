import express from 'express';
import { getProfile, updateProfile } from '../Controllers/profile.controller.js';
import { verifyToken } from '../Middlewares/verifyToken.js';
import multer from 'multer';

// Memory storage for avatar (uploaded directly to Cloudinary)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.get('/me',   verifyToken, getProfile);
router.patch('/me', verifyToken, upload.single('avatar'), updateProfile);

export default router;