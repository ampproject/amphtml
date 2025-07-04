export class UnitInfo {
  /**
   * @param {string} code
   */
  constructor(code) {
    this.code = code;
  }

  /**
   * @param {string} path
   */
  setPath(path) {
    this.path = path;
  }

  /**
   * @param {number} lineItemId
   */
  setLineItemId(lineItemId) {
    this.lineItemId = lineItemId;
  }

  /**
   * @param {number} creativeId
   */
  setCreativeId(creativeId) {
    this.creativeId = creativeId;
  }

  /**
   * @param {string} servedSize
   */
  setServedSize(servedSize) {
    this.servedSize = servedSize;
  }

  /**
   * @param {Array<Array<number>>} sizes
   */
  setSizes(sizes) {
    this.sizes = sizes;
  }

  /**
   * @param {object} keyValues
   */
  setKeyValues(keyValues) {
    this.keyValues = keyValues;
  }

  /**
   * @param {string} provider
   */
  setProvider(provider) {
    this.provider = provider;
  }

  /**
   * @param {boolean} isVisible
   */
  setIsVisible(isVisible) {
    this.isVisible = isVisible;
  }

  /**
   * @param {boolean} isPending
   */
  setPendingUnitInit(isPending) {
    this.pendingUnitInit = isPending;
  }
}
