import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const PORT: number = Number(process.env.BACKEND_PORT) || 4000;

const app = express();

const server: http.Server = http.createServer(app);

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
