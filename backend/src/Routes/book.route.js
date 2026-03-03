import express from 'express';
import { getBooks, createBook } from '../Controllers/book.controller.js';
import { verifyToken } from '../Middlewares/verifyToken.js';
import { upload } from '../utils/multer.js';

const router = express.Router();

router.get('/', getBooks);                                            // public
router.post('/', verifyToken, upload.array('images', 5), createBook); // up to 5 images

export default router;