export const xhrService = {
  /**
   * Simply calls `fetch(url).then(r => r.json())`
   * @param {RequestInfo} url
   * @return {Promise<Response>}
   */
  fetchJson(url) {
    return fetch(url).then((r) => r.json());
  },
};
