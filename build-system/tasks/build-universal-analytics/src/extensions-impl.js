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
    // In its place, we inject it in the bundle to install it synchronously
    if (name !== 'amp-crypto-polyfill') {
      throw new Error(name);
    }
    return Promise.resolve();
  }
})();
