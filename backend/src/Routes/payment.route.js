import express from 'express';
import { initiatePayment, verifyPayment, cashOnDelivery } from '../Controllers/khalti.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';

const router = express.Router();

router.post('/initiate', verifyToken, initiatePayment);
router.post('/verify',   verifyToken, verifyPayment);
router.post('/cod',      verifyToken, cashOnDelivery);

export default router;