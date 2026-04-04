import express from 'express';
import { getProfile, updateProfile, getPublicProfile } from '../Controllers/profile.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.get('/me',          verifyToken, getProfile);
router.patch('/me',        verifyToken, upload.single('avatar'), updateProfile);
router.get('/user/:userId', verifyToken, getPublicProfile);   

export default router;