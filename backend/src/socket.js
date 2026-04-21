
// Socket.io setup — real-time messaging

const onlineUsers = new Map(); // userId → socketId

export const initSocket = (io) => {

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // ── User comes online ─────────────────────────────────────────────────────
    socket.on('user:online', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User online: ${userId}`);
    });

    // ── Join a conversation room ──────────────────────────────────────────────
    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId);
      console.log(` Joined room: ${conversationId}`);
    });

    // ── Leave a conversation room ─────────────────────────────────────────────
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId);
    });

    // ── Send a message (real-time) ────────────────────────────────────────────
    // Frontend emits this AFTER saving via REST API
    socket.on('message:send', ({ conversationId, message }) => {
      // Broadcast to all others in the room
      socket.to(conversationId).emit('message:receive', {
        conversationId,
        message,
      });
    });

    // ── Typing indicators ─────────────────────────────────────────────────────
    socket.on('typing:start', ({ conversationId, userName }) => {
      socket.to(conversationId).emit('typing:start', { userName });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:stop');
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      // Remove from online users
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`❌ User offline: ${userId}`);
          break;
        }
      }
    });
  });
};

// Helper to get socket ID of a user (for direct messages)
export const getSocketId = (userId) => onlineUsers.get(userId);