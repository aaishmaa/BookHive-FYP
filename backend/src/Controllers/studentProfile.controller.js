import { StudentProfile } from '../models/studentProfile.model.js';

export const createStudentProfile = async (req, res) => {
  try {
    const { fullName, email, phone, age, gender, address, location, collegeName } = req.body;

    // Check both images were uploaded
    if (!req.files?.citizenshipFront || !req.files?.citizenshipBack) {
      return res.status(400).json({ msg: 'Both citizenship images are required' });
    }

    // Check if profile already exists
    const existing = await StudentProfile.findOne({ userId: req.userId });
    if (existing) {
      return res.status(400).json({ msg: 'Profile already exists' });
    }

    const profile = new StudentProfile({
      userId: req.userId,
      fullName,
      email,
      phone,
      age,
      gender,
      address,
      location,
      collegeName,
      citizenshipFront: req.files.citizenshipFront[0].path, // Cloudinary URL
      citizenshipBack:  req.files.citizenshipBack[0].path,  // Cloudinary URL
    });

    await profile.save();

    res.status(201).json({ success: true, msg: 'Profile created successfully', profile });
  } catch (error) {
    console.log('error in createStudentProfile', error);
    res.status(500).json({ msg: error.message });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ success: false, msg: 'Profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.log('error in getStudentProfile', error);
    res.status(500).json({ msg: error.message });
  }
};