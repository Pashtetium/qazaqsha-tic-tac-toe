import Board from './Board.js';
import Player from './Player.js';
import { randomUUID } from 'crypto';

/**
 * @typedef {import('../../shared/types.js').GameStatus} GameStatus
 * @typedef {import('../../shared/types.js').PlayerSymbol} PlayerSymbol
 * @typedef {import('../../shared/types.js').GameData} GameData
 */

class Game {
  constructor() {
    this.id = randomUUID();
    this.roomCode = this.generateRoomCode();
    this.board = new Board();
    this.player1 = null;
    this.player2 = null;
    this.currentPlayer = null;
    this.status = 'waiting';
    this.winner = null;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * @returns {string}
   */
  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * @param {string} socketId
   * @returns {boolean}
   */
  addPlayer(socketId) {
    if (!this.player1) {
      this.player1 = new Player(socketId, 'X');
      return true;
    } else if (!this.player2 && this.player1.socketId !== socketId) {
      this.player2 = new Player(socketId, 'O');
      this.currentPlayer = 'X';
      this.status = 'active';
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * @param {string} socketId
   * @param {number} position
   * @returns {{ success: boolean; error?: string }}
   */
  makeMove(socketId, position) {
    if (this.status !== 'active') {
      return { success: false, error: 'Game is not active' };
    }

    const player = this.getPlayerBySocketId(socketId);
    if (!player) {
      return { success: false, error: 'You are not in this game' };
    }

    if (this.currentPlayer !== player.symbol) {
      return { success: false, error: 'Not your turn' };
    }

    const success = this.board.makeMove(position, player.symbol);
    if (!success) {
      return { success: false, error: 'Invalid move' };
    }

    const winner = this.board.checkWinner();
    if (winner) {
      this.winner = winner;
      this.status = 'finished';
    } else if (this.board.isFull()) {
      this.winner = 'draw';
      this.status = 'finished';
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    this.updatedAt = new Date().toISOString();
    return { success: true };
  }

  /**
   * @param {string} socketId
   * @returns {Player | null}
   */
  getPlayerBySocketId(socketId) {
    if (this.player1?.socketId === socketId) return this.player1;
    if (this.player2?.socketId === socketId) return this.player2;
    return null;
  }

  /**
   * @returns {GameData}
   */
  toJSON() {
    return {
      id: this.id,
      roomCode: this.roomCode,
      boardState: this.board.toArray(),
      tPosition: this.board.tPosition,
      currentPlayer: this.currentPlayer,
      status: this.status,
      winner: this.winner,
      player1SocketId: this.player1?.socketId || null,
      player2SocketId: this.player2?.socketId || null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * @param {GameData} data
   * @returns {Game}
   */
  static fromJSON(data) {
    const game = new Game();
    game.id = data.id;
    game.roomCode = data.roomCode;
    game.board = Board.fromArray(data.boardState);
    game.currentPlayer = data.currentPlayer;
    game.status = data.status;
    game.winner = data.winner;
    game.createdAt = data.createdAt;
    game.updatedAt = data.updatedAt;

    if (data.player1SocketId) {
      game.player1 = new Player(data.player1SocketId, 'X');
    }
    if (data.player2SocketId) {
      game.player2 = new Player(data.player2SocketId, 'O');
    }

    return game;
  }
}

export default Game;
