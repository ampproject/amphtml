export const xhrUtils = {
  /**
   * Wrapper around `fetch` that returns the parsed JSON result
   *
   * @param {RequestInfo} url
   * @param {RequestInit} [init]
   * @return {Promise<*>}
   */
  fetchJson(url, init) {
    return this.fetch(url, init).then((res) => res.json());
  },

  /**
   * Wrapper around `fetch` that checks the status code
   *
   * @param {RequestInfo} url
   * @param {RequestInit} [init]
   * @return {Promise<Response>}
   */
  async fetch(url, init) {
    const response = await self.fetch(url, init);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response;
  },
};
