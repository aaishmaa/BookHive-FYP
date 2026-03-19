import express from 'express';
import {
  getBooks, getBookById, getMyBooks,
  createBook, updateBook, deleteBook,
} from '../Controllers/book.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';
import { uploadBook }  from '../utils/multer.js';

const router = express.Router();

router.get('/',       getBooks);                                          
router.get('/my',     verifyToken, getMyBooks);
router.get('/:id',    getBookById);
router.post('/',      verifyToken, uploadBook.array('images', 5), createBook);
router.patch('/:id',  verifyToken, updateBook);
router.delete('/:id', verifyToken, deleteBook);

export default router;