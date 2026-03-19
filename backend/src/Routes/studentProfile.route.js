import express from 'express';
import { createStudentProfile, getStudentProfile } from '../Controllers/studentProfile.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';
import { upload } from '../utils/multer.js';

const router = express.Router();

router.post(
  '/profile',
  verifyToken,
  upload.fields([
    { name: 'citizenshipFront', maxCount: 1 },
    { name: 'citizenshipBack',  maxCount: 1 },
  ]),
  createStudentProfile
);

router.get('/profile', verifyToken, getStudentProfile);

export default router;