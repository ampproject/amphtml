export default new (class {
  /**
   * @param {string} url
   * @return {URL}
   */
  parse(url) {
    return new URL(url, self.location.href);
  }
})();
