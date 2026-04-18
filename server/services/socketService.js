const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next();
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.user = payload;
      next();
    } catch (error) {
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    if (user && user.id) {
      socket.join(`user:${user.id}`);
      socket.join(`role:${user.role}`);
      console.log(`Socket connected for user ${user.id} (${user.role})`, socket.id);
    } else {
      console.log('Socket connected without auth', socket.id);
    }

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id);
    });
  });
}

function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

function emitToRole(role, event, payload) {
  if (!io || !role) return;
  io.to(`role:${role}`).emit(event, payload);
}

function emitGlobal(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

module.exports = {
  initSocket,
  emitToUser,
  emitToRole,
  emitGlobal
};
