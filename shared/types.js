/**
 * @typedef {'waiting' | 'active' | 'finished'} GameStatus
 */

/**
 * @typedef {'X' | 'O'} PlayerSymbol
 */

/**
 * @typedef {'X' | 'O' | 'T' | null} CellValue
 */

/**
 * @typedef {{
 *   id: string,
 *   symbol: PlayerSymbol,
 *   socketId: string
 * }} PlayerData
 */

/**
 * @typedef {{
 *   id: string,
 *   roomCode: string,
 *   boardState: CellValue[],
 *   tPosition: number,
 *   currentPlayer: PlayerSymbol | null,
 *   status: GameStatus,
 *   winner: string | null,
 *   player1SocketId: string | null,
 *   player2SocketId: string | null,
 *   createdAt: string,
 *   updatedAt: string
 * }} GameData
 */

export {};
