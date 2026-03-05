import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { dbConnect } from './Config/dbConnect.js';
import notesRoutes from './Routes/notes.route.js';
import path from 'path';

import authRoutes from './Routes/auth.route.js';
import studentRoutes from './Routes/studentProfile.route.js';
import bookRoutes from './Routes/book.route.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/books', bookRoutes);
app.use('/notes', notesRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Test Route
app.get('/', (req, res) => {
  res.send('BookHive API is running!');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Database Connection
dbConnect();

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

