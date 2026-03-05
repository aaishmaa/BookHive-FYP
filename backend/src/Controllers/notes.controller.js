import { Notes } from '../models/notes.model.js';
import { User } from '../models/user.model.js';
import cloudinary from '../Config/cloudinary.config.js';
import https from 'https';

export const getNotes = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category } : {};
    const notes = await Notes.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.log('GET NOTES ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:        'bookhive/notes',
          resource_type: 'raw',   // ← raw preserves PDF integrity
          public_id:     `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`,
        },
        (error, result) => {
          if (error) {
            console.log("CLOUDINARY ERROR:", error);
            reject(error);
          } else {
            console.log("CLOUDINARY RESULT:", result.secure_url || result.url);
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });

    const fileUrl = uploadResult.secure_url || uploadResult.url;

    if (!fileUrl) {
      return res.status(500).json({ success: false, message: 'Failed to get file URL from Cloudinary' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const note = new Notes({
      userId:  req.userId,
      seller:  user.name,
      title,
      category,
      fileUrl,
    });

    await note.save();
    res.status(201).json({ success: true, note });

  } catch (error) {
    console.log('CREATE NOTE ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadNote = async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Stream directly from Cloudinary to client using https
    https.get(note.fileUrl, (cloudinaryRes) => {
      // Handle Cloudinary redirects
      if (cloudinaryRes.statusCode === 301 || cloudinaryRes.statusCode === 302) {
        https.get(cloudinaryRes.headers.location, (redirectRes) => {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${note.title}.pdf"`);
          redirectRes.pipe(res);
        });
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${note.title}.pdf"`);
      cloudinaryRes.pipe(res);

    }).on('error', (err) => {
      console.log('STREAM ERROR:', err.message);
      res.status(500).json({ success: false, message: 'Failed to stream file' });
    });

  } catch (error) {
    console.log('DOWNLOAD ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};