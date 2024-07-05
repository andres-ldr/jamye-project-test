import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

const PORT: number = Number(process.env.BACKEND_PORT) || 4000;

const app = express();

const server: http.Server = http.createServer(app);

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  // optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: corsOptions,
});

io.on('connection', (socket) => {
  console.log(`user ${socket.id}`);

  socket.emit('me', socket.id);

  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded');
  });

  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('callUser', { signal: signalData, from, name });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
