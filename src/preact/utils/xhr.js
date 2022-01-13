export const xhrUtils = {
  /**
   * Simple wrapper around `fetch`
   * @param {RequestInfo} url
   * @return {Promise<Response>}
   */
  fetchJson(url) {
    return self.fetch(url);
  },
};
