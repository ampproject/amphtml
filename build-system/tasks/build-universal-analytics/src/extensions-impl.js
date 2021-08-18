export default new (class {
  // Forbidden term: pr*loadExtension
  /* eslint-disable local/no-forbidden-terms */
  /**
   * @param {string} name
   * @return {!Promise}
   */
  preloadExtension(name) {
    /* eslint-enable local/no-forbidden-terms */
    // We know for sure that we try to load `amp-crypto-polyfill`.
    // In its place, we install it synchronously in the same bundle from amp.js
    if (name !== 'amp-crypto-polyfill') {
      throw new Error(name);
    }
    return Promise.resolve();
  }
})();
