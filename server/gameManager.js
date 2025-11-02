import Game from './entities/Game.js';
import database from './database.js';

class GameManager {
  constructor() {
    this.games = new Map();
  }

  /**
   * @returns {Promise<Game>}
   */
  async createGame() {
    const game = new Game();
    this.games.set(game.roomCode, game);
    await database.saveGame(game);
    return game;
  }

  /**
   * @param {string} roomCode
   * @param {string} socketId
   * @returns {Promise<Game | null>}
   */
  async joinGame(roomCode, socketId) {
    let game = this.games.get(roomCode);

    if (!game) {
      game = await database.findGameByRoomCode(roomCode);
      if (game) {
        this.games.set(roomCode, game);
      }
    }

    if (!game) {
      return null;
    }

    game.addPlayer(socketId);
    await database.saveGame(game);
    return game;
  }

  /**
   * @param {string} roomCode
   * @param {string} socketId
   * @param {number} position
   * @returns {Promise<{ success: boolean; game?: Game; error?: string }>}
   */
  async makeMove(roomCode, socketId, position) {
    const game = this.games.get(roomCode);

    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const result = game.makeMove(socketId, position);

    if (result.success) {
      await database.saveGame(game);
      return { success: true, game };
    }

    return result;
  }

  /**
   * @param {string} roomCode
   * @returns {Game | undefined}
   */
  getGame(roomCode) {
    return this.games.get(roomCode);
  }
}

export default new GameManager();
