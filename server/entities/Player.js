/**
 * @typedef {import('../../shared/types.js').PlayerSymbol} PlayerSymbol
 */

class Player {
  /**
   * @param {string} socketId
   * @param {PlayerSymbol} symbol
   */
  constructor(socketId, symbol) {
    this.socketId = socketId;
    this.symbol = symbol;
  }
}

export default Player;
