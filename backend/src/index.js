import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { dbConnect } from './Config/dbConnect.js';
import path from 'path';

import authRoutes         from './Routes/auth.route.js';
import studentRoutes      from './Routes/studentProfile.route.js';
import bookRoutes         from './Routes/book.route.js';
import notesRoutes        from './Routes/notes.route.js';
import requestRoutes      from './Routes/request.route.js';
import wishlistRoutes     from './Routes/wishlist.route.js';
import notificationRoutes from './Routes/notification.route.js';
import profileRoutes      from './Routes/profile.route.js'; 
import topSellersRoutes from './Routes/topSeller.route.js';
import chatRoutes         from './Routes/chat.route.js';
     

dotenv.config();

const app = express();

// Allow multiple frontend ports for development
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth',          authRoutes);
app.use('/student',       studentRoutes);
app.use('/books',         bookRoutes);
app.use('/notes',         notesRoutes);
app.use('/requests',      requestRoutes);
app.use('/wishlist',      wishlistRoutes);
app.use('/notifications', notificationRoutes);
app.use('/profile',       profileRoutes);  
app.use('/top-sellers', topSellersRoutes);
app.use('/chat',          chatRoutes);                      
app.use('/uploads',       express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => res.send('BookHive API is running!'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

dbConnect();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));