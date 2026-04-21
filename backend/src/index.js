import express      from 'express';
import cors         from 'cors';
import cookieParser from 'cookie-parser';
import dotenv       from 'dotenv';
import { createServer } from 'http';
import { Server }       from 'socket.io';
import { dbConnect }    from './Config/dbConnect.js';
import path from 'path';

import authRoutes         from './Routes/auth.route.js';
import studentRoutes      from './Routes/studentProfile.route.js';
import bookRoutes         from './Routes/book.route.js';
import notesRoutes        from './Routes/notes.route.js';
import requestRoutes      from './Routes/request.route.js';
import wishlistRoutes     from './Routes/wishlist.route.js';
import notificationRoutes from './Routes/notification.route.js';
import profileRoutes      from './Routes/profile.route.js';
import topSellersRoutes   from './Routes/topSeller.route.js';
import chatRoutes         from './Routes/chat.route.js';
import adminRoutes        from './Routes/admin.route.js';
import transactionRoutes  from './Routes/transaction.route.js';
import reviewRoutes       from './Routes/review.route.js';
import paymentRoutes      from './Routes/payment.route.js';

import { initSocket } from './socket.js';

dotenv.config();

const app    = express();
const server = createServer(app);

// ── Socket.io — skip in test mode to avoid port conflicts ─────────────────────
if (process.env.NODE_ENV !== 'test') {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
    }
  });
  initSocket(io);
}

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth',          authRoutes);
app.use('/student',       studentRoutes);
app.use('/books',         bookRoutes);
app.use('/notes',         notesRoutes);
app.use('/requests',      requestRoutes);
app.use('/wishlist',      wishlistRoutes);
app.use('/notifications', notificationRoutes);
app.use('/profile',       profileRoutes);
app.use('/top-sellers',   topSellersRoutes);
app.use('/chat',          chatRoutes);
app.use('/admin',         adminRoutes);
app.use('/uploads',       express.static(path.join(process.cwd(), 'uploads')));
app.use('/transactions',  transactionRoutes);
app.use('/reviews',       reviewRoutes);
app.use('/payment',       paymentRoutes);

app.get('/', (req, res) => res.send('BookHive API is running!'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// ── Connect DB and start server ───────────────────────────────────────────────
dbConnect();

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

export default app;   // ← Supertest imports this