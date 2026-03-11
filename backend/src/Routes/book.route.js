import express from 'express';
import {getBooks, getBookById, getMyBooks, createBook,deleteBook,} from '../Controllers/book.controller.js';
import { verifyToken } from '../Middlewares/verifyToken.js';
import { uploadBook } from '../utils/multer.js';

const router = express.Router();

router.get('/my',  verifyToken, getMyBooks);   //  MUST be before /:id
router.get('/',    getBooks);
router.get('/:id', getBookById);
router.post('/',   verifyToken, uploadBook.array('images', 5), createBook);
router.delete('/:id', verifyToken, deleteBook);

export default router;