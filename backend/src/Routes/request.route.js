import express from 'express';
import {
  getMyRequests, getSentRequests,
  createRequest, updateRequestStatus, deleteRequest,
} from '../Controllers/request.controller.js';
import { verifyToken } from '../Middlewares/verifyToken.js';

const router = express.Router();

router.get('/',        verifyToken, getMyRequests);       // received requests
router.get('/sent',    verifyToken, getSentRequests);     // sent requests
router.post('/',       verifyToken, createRequest);       // send a request
router.patch('/:id',   verifyToken, updateRequestStatus); // accept / decline
router.delete('/:id',  verifyToken, deleteRequest);       // cancel

export default router;