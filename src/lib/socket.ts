import { io, Socket } from 'socket.io-client';
import { getApiUrl, getToken } from './api';

let socket: Socket | null = null;

const getSocketUrl = () => {
  const apiUrl = getApiUrl();
  return apiUrl.replace(/\/api\/?$/, '');
};

export const connectSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = getToken();
  const url = getSocketUrl();

  socket = io(url, {
    auth: {
      token,
    },
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onSocketEvent = (event: string, callback: (...args: unknown[]) => void) => {
  const client = connectSocket();
  client.on(event, callback);
  return () => {
    client.off(event, callback);
  };
};

export const isSocketConnected = () => socket?.connected;

export default {
  connectSocket,
  disconnectSocket,
  onSocketEvent,
  isSocketConnected,
};
