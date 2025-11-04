import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import database from './database.js';
import gameManager from './gameManager.js';

const require = createRequire(import.meta.url);
const { Server } = require('socket.io');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(PUBLIC_DIR, filePath);

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on('create-room', async () => {
    console.log(`Client ${socket.id} attempting to create room`);

    try {
      const game = await gameManager.createGame();
      console.log(`Game created with room code: ${game.roomCode}`);

      await gameManager.joinGame(game.roomCode, socket.id);

      socket.join(game.roomCode);
      console.log(`Client ${socket.id} joined room ${game.roomCode}`);

      socket.emit('room-created', {
        roomCode: game.roomCode,
        game: game.toJSON(),
      });

      console.log(`Room ${game.roomCode} created successfully by ${socket.id}`);
    } catch (error) {
      console.error(`Failed to create room for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  socket.on('join-room', async (data) => {
    const { roomCode } = data;
    console.log(`Client ${socket.id} attempting to join room ${roomCode}`);

    try {
      const game = await gameManager.joinGame(roomCode, socket.id);

      if (!game) {
        console.warn(`Room ${roomCode} not found`);
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      socket.join(roomCode);
      console.log(`Client ${socket.id} joined room ${roomCode}`);

      socket.emit('game-joined', { game: game.toJSON() });

      io.to(roomCode).emit('game-update', { game: game.toJSON() });

      console.log(`Client ${socket.id} successfully joined room ${roomCode}`);
    } catch (error) {
      console.error(`Failed to join room ${roomCode}:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('make-move', async (data) => {
    const { roomCode, position } = data;
    console.log(
      `Client ${socket.id} attempting move at position ${position} in room ${roomCode}`
    );

    try {
      const result = await gameManager.makeMove(roomCode, socket.id, position);

      if (!result.success) {
        console.warn(`Move failed: ${result.error}`);
        socket.emit('error', { message: result.error });
        return;
      }

      console.log(`Move successful at position ${position}`);

      io.to(roomCode).emit('game-update', { game: result.game.toJSON() });

      if (result.game.status === 'finished') {
        console.log(`Game ${roomCode} finished. Winner: ${result.game.winner}`);
        io.to(roomCode).emit('game-over', {
          winner: result.game.winner,
          game: result.game.toJSON(),
        });
      }
    } catch (error) {
      console.error(`Failed to make move:`, error);
      socket.emit('error', { message: 'Failed to make move' });
    }
  });
});

async function start() {
  try {
    await database.connect();
    await database.init();

    server.listen(PORT, () => {
      console.log(`Server is running on: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
