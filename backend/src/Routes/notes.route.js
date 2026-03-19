import express from 'express';
import { getNotes, getMyNotes, createNote, downloadNote } from '../Controllers/notes.controller.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';
import { uploadNote } from '../utils/multer.js';
import { Notes } from '../models/notes.model.js';

const router = express.Router();

router.get('/my',           verifyToken, getMyNotes);              // ← MUST be before /:id
router.get('/',             getNotes);
router.post('/',            verifyToken, uploadNote.single('file'), createNote);
router.get('/:id/download', verifyToken, downloadNote);
router.patch('/:id/count',  verifyToken, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (note) { note.downloads += 1; await note.save(); }
    res.status(200).json({ success: true, downloads: note?.downloads });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

export default router;