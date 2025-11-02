import Cell from './Cell.js';

/**
 * @typedef {import('../../shared/types.js').CellValue} CellValue
 * @typedef {import('../../shared/types.js').PlayerSymbol} PlayerSymbol
 */

class Board {
  constructor() {
    this.size = 4;
    this.cells = Array.from({ length: 16 }, (_, i) => new Cell(i));
    this.tPosition = this.getRandomOuterPosition();
    this.cells[this.tPosition].setValue('T');
  }

  /**
   * @returns {number}
   */
  getRandomOuterPosition() {
    const outerPositions = [0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15];
    return outerPositions[Math.floor(Math.random() * outerPositions.length)];
  }

  /**
   * @param {number} position
   * @param {PlayerSymbol} symbol
   * @returns {boolean}
   */
  makeMove(position, symbol) {
    if (position < 0 || position >= 16) {
      return false;
    }

    const cell = this.cells[position];
    if (!cell.isEmpty() || position === this.tPosition) {
      return false;
    }

    cell.setValue(symbol);
    return true;
  }

  /**
   * @returns {PlayerSymbol | null}
   */
  checkWinner() {
    const winPatterns = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
      [0, 4, 8, 12],
      [1, 5, 9, 13],
      [2, 6, 10, 14],
      [3, 7, 11, 15],
      [0, 5, 10, 15],
      [3, 6, 9, 12],
    ];

    for (const pattern of winPatterns) {
      const cells = pattern.map((i) => this.cells[i]);
      const values = cells.map((c) => c.value);
      const nonTValues = values.filter((v) => v !== 'T' && v !== null);

      if (nonTValues.length === 0) continue;

      const allSame = nonTValues.every((v) => v === nonTValues[0]);
      const allFilled = values.every((v) => v !== null);

      if (allSame && allFilled) {
        return nonTValues[0];
      }
    }

    return null;
  }

  /**
   * @returns {boolean}
   */
  isFull() {
    return this.cells.every((cell) => !cell.isEmpty());
  }

  /**
   * @returns {CellValue[]}
   */
  toArray() {
    return this.cells.map((cell) => cell.value);
  }

  /**
   * @param {CellValue[]} boardState
   */
  static fromArray(boardState) {
    const board = new Board();
    board.cells = boardState.map((value, i) => {
      const cell = new Cell(i, value);
      return cell;
    });
    board.tPosition = boardState.findIndex((v) => v === 'T');
    return board;
  }
}

export default Board;
