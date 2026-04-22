import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';

dotenv.config();

export const verifyToken = async (req, res, next) => {
 const token =
  req.cookies.token ||
  req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Not authorized invalid token" });
    }

    req.userId = decoded.id;

    const user = await User.findById(decoded.id).select('-password');
    req.user     = user;
    req.userName = user?.name || 'Unknown';   

    next();

  } catch (error) {
    console.log("error in verifyToken ", error);
    return res.status(401).json({
  success: false,
  message: "Invalid or expired token",
});
  }
};