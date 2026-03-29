import express from 'express';
import { getTopSellers } from '../Controllers/topSeller.controller.js';

const router = express.Router();

router.get('/', getTopSellers);   
export default router;