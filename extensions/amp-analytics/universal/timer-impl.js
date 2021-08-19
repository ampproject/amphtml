export default new (class {
  /**
   * @param {function():void} cb
   * @param {number} ms
   */
  delay(cb, ms) {
    setTimeout(cb, ms);
  }
  /**
   * @param {number} ms
   * @return {Promise<void>}
   */
  promise(ms) {
    return new Promise((resolve) => {
      this.delay(resolve, ms);
    });
  }
})();
