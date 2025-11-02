/**
 * @typedef {import('../../shared/types.js').CellValue} CellValue
 */

class Cell {
  /**
   * @param {number} position
   * @param {CellValue} value
   */
  constructor(position, value = null) {
    this.position = position;
    this.value = value;
  }

  /**
   * @returns {boolean}
   */
  isEmpty() {
    return this.value === null;
  }

  /**
   * @returns {boolean}
   */
  isWildcard() {
    return this.value === 'T';
  }

  /**
   * @param {CellValue} value
   */
  setValue(value) {
    if (!this.isEmpty() && !this.isWildcard()) {
      throw new Error('Cell is already occupied');
    }
    this.value = value;
  }

  /**
   * @param {CellValue} symbol
   * @returns {boolean}
   */
  matches(symbol) {
    return this.value === symbol || this.value === 'T';
  }
}

export default Cell;
