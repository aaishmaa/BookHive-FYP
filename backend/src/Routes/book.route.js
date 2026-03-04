import express from 'express';
import { getBooks, getBookById, createBook } from '../Controllers/book.controller.js';
import { verifyToken } from '../Middlewares/verifyToken.js';
import { uploadBook } from '../utils/multer.js';

const router = express.Router();

router.get('/',    getBooks);
router.get('/:id', getBookById);
router.post('/',   verifyToken, uploadBook.array('images', 5), createBook);

export default router;