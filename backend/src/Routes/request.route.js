import express from 'express';
import {
  getMyRequests,
  getSentRequests,
  createRequest,
  updateRequestStatus,
  deleteRequest,
} from '../Controllers/request.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';

const router = express.Router();

router.get('/',       verifyToken, getMyRequests);       // received
router.get('/sent',   verifyToken, getSentRequests);     // sent  ← must be before /:id
router.post('/',      verifyToken, createRequest);
router.patch('/:id',  verifyToken, updateRequestStatus);
router.delete('/:id', verifyToken, deleteRequest);

export default router;