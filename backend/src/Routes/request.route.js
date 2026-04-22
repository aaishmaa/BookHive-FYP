import express from 'express';
import {
  getMyRequests, getSentRequests,
  createRequest, updateRequestStatus,
  deleteRequest, getBookRequests,
} from '../Controllers/request.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';

const router = express.Router();

router.get('/book/:bookId', verifyToken, getBookRequests);  
router.get('/sent',         verifyToken, getSentRequests);  //  MUST be before /:id
router.get('/',             verifyToken, getMyRequests);
router.post('/',            verifyToken, createRequest);
router.patch('/:id',        verifyToken, updateRequestStatus);
router.delete('/:id',       verifyToken, deleteRequest);

export default router;