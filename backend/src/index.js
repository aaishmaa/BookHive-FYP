import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import dbConnect from './Config/dbConnect.js';
import authRoutes from './Routes/auth.route.js';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);

import studentRoutes from './Routes/studentProfile.route.js';

app.use('/student', studentRoutes);

app.get('/', (req, res) => res.send('API is running!'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

dbConnect();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));