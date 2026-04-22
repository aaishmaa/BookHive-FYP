import express from 'express';
import { getTransactions } from '../Controllers/transaction.controller.js';
import { verifyToken }     from '../Middlewares/VerifyToken.js';

const router = express.Router();
// GET /transactions?type=purchase
router.get('/', verifyToken, getTransactions);  

export default router;