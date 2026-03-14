import express from 'express';
import {
  getWishlist, addToWishlist,
  removeFromWishlist, checkWishlist,
} from '../Controllers/wishlist.controller.js';
import { verifyToken } from '../Middlewares/verifyToken.js';

const router = express.Router();

router.get('/check/:bookId', verifyToken, checkWishlist);  // MUST be before /:id
router.get('/',              verifyToken, getWishlist);
router.post('/',             verifyToken, addToWishlist);
router.delete('/:id',        verifyToken, removeFromWishlist);

export default router;