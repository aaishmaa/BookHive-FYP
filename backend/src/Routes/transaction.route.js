import express from 'express';
import { getTransactions } from '../Controllers/transaction.controller.js';
import { verifyToken }     from '../Middlewares/verifyToken.js';

const router = express.Router();

router.get('/', verifyToken, getTransactions);  // GET /transactions?type=purchase

export default router;