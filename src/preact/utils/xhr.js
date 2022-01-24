export const xhrUtils = {
  /**
   * Wrapper around `fetch` that returns the parsed JSON result
   *
   * @param {RequestInfo} url
   * @return {Promise<*>}
   */
  async fetchJson(url) {
    return (await this.fetch(url)).json();
  },

  /**
   * Wrapper around `fetch` that checks the status code
   *
   * @param {RequestInfo} url
   * @return {Promise<Response>}
   */
  async fetch(url) {
    const response = await self.fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response;
  },
};
