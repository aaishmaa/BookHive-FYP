import express from 'express';
import { initiatePayment, verifyPayment } from '../Controllers/khalti.controller.js';
import { verifyToken } from '../Middlewares/verifyToken.js';

const router = express.Router();

router.post('/initiate', verifyToken, initiatePayment);
router.get('/verify', verifyPayment);

export default router;