import { Notes } from '../models/notes.model.js';
import { User }  from '../models/user.model.js';
import cloudinary from '../Config/cloudinary.config.js';
import https from 'https';

export const getNotes = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category } : {};
    const notes = await Notes.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /notes/my ─────────────────────────────────────────────────────────────
export const getMyNotes = async (req, res) => {
  try {
    const notes = await Notes.find({ userId: req.userId }).sort({ createdAt: -1 }); // ← Notes not Note
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!req.file)
      return res.status(400).json({ success: false, message: 'PDF file is required' });

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'bookhive/notes', resource_type: 'raw',
          public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}` },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    const fileUrl = uploadResult.secure_url || uploadResult.url;
    if (!fileUrl)
      return res.status(500).json({ success: false, message: 'Failed to get file URL from Cloudinary' });

    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    const note = await Notes.create({ userId: req.userId, seller: user.name, title, category, fileUrl });
    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadNote = async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note)
      return res.status(404).json({ success: false, message: 'Note not found' });

    const fetchUrl = (url) => new Promise((resolve, reject) => {
      https.get(url, (r) => {
        if (r.statusCode === 301 || r.statusCode === 302) {
          fetchUrl(r.headers.location).then(resolve).catch(reject);
        } else resolve(r);
      }).on('error', reject);
    });

    const stream = await fetchUrl(note.fileUrl);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title}.pdf"`);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};