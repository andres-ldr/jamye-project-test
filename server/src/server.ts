import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

const PORT: number = Number(process.env.BACKEND_PORT) || 4000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());

io.on('connection', (socket) => {
  socket.emit('me', socket.id);
  socket.on('joinRoom', (id) => {
    socket.join(id);
    // io.to(id).emit('me', socket.id);
  });

  socket.on('exchangeID', ({ room, id }) => {
    io.to(room).emit('receiveID', id);
  });

  socket.on('getRoomConnections', (room) => {
    const sockets = io.sockets.adapter.rooms.get(room);
    if (sockets) {
      const allSockets = Array.from(sockets);
      socket.emit('roomConnections', allSockets);
    } else {
      socket.emit(
        'roomConnections',
        'Room does not exist or has no connections'
      );
    }
  });

  socket.on('leaveRoom', (id) => {
    console.log('leaveRoom', id);

    socket.leave(id);
  });

  socket.on('callEnded', ({ room }) => {
    io.to(room).emit('callEnded');
  });

  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    io.in(userToCall).emit('callUser', { signal: signalData, from, name });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', {
      signal: data.signal,
      name: data.name,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
