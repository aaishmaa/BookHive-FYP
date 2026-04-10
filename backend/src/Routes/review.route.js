import express from 'express';
import { getReviews, createReview, deleteReview } from '../Controllers/review.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';

const router = express.Router();

router.get('/:bookId',          verifyToken, getReviews);
router.post('/:bookId',         verifyToken, createReview);
router.delete('/:reviewId',     verifyToken, deleteReview);

export default router;