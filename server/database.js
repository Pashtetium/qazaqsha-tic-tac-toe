import { createRequire } from 'module';
import Game from './entities/Game.js';

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

/**
 * @typedef {import('../shared/types.js').GameData} GameData
 */

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database('data/game.db', (err) => {
        if (err) {
          console.error('Failed to connect to database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async init() {
    const sql = `
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        roomCode TEXT UNIQUE NOT NULL,
        boardState TEXT NOT NULL,
        tPosition INTEGER NOT NULL,
        currentPlayer TEXT,
        status TEXT NOT NULL,
        winner TEXT,
        player1SocketId TEXT,
        player2SocketId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) {
          console.error('Failed to initialize tables:', err);
          reject(err);
        } else {
          console.log('Database tables initialized');
          resolve();
        }
      });
    });
  }

  /**
   * @param {Game} game
   */
  async saveGame(game) {
    const data = game.toJSON();
    const sql = `
      INSERT OR REPLACE INTO games
      (id, roomCode, boardState, tPosition, currentPlayer, status, winner, player1SocketId, player2SocketId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [
          data.id,
          data.roomCode,
          JSON.stringify(data.boardState),
          data.tPosition,
          data.currentPlayer,
          data.status,
          data.winner,
          data.player1SocketId,
          data.player2SocketId,
          data.createdAt,
          data.updatedAt,
        ],
        (err) => {
          if (err) {
            console.error('Failed to save game:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * @param {string} roomCode
   * @returns {Promise<Game | null>}
   */
  async findGameByRoomCode(roomCode) {
    const sql = 'SELECT * FROM games WHERE roomCode = ?';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [roomCode], (err, row) => {
        if (err) {
          console.error('Failed to find game:', err);
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          const data = {
            ...row,
            boardState: JSON.parse(row.boardState),
          };
          resolve(Game.fromJSON(data));
        }
      });
    });
  }
}

export default new Database();
