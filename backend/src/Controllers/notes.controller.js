import { Notes }  from '../models/notes.model.js';
import { User }   from '../models/user.model.js';
import fs         from 'fs';
import path       from 'path';

const UPLOADS_DIR = 'uploads/notes';
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

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

export const getMyNotes = async (req, res) => {
  try {
    const notes = await Notes.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, category, level, classYear } = req.body;

    if (!req.file)
      return res.status(400).json({ success: false, message: 'PDF file is required' });

    // Save buffer to disk
    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filepath  = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filepath, req.file.buffer);

    // Store relative URL — served via express static
    const fileUrl = `/uploads/notes/${filename}`;

    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    const note = await Notes.create({
      userId:    req.userId,
      seller:    user.name,
      title,
      category,
      level:     level     || '',
      classYear: classYear || '',
      fileUrl,
      downloads: 0,
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('CREATE NOTE ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadNote = async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note)
      return res.status(404).json({ success: false, message: 'Note not found' });

    // Build absolute file path
    const filepath = path.join(process.cwd(), note.fileUrl);

    if (!fs.existsSync(filepath))
      return res.status(404).json({ success: false, message: 'File not found on server' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title}.pdf"`);
    fs.createReadStream(filepath).pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};