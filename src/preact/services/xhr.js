class XhrService {
  /**
   * Simply calls `fetch`
   * @param {RequestInfo} url
   * @return {Promise<Response>}
   */
  fetchJson(url) {
    return fetch(url);
  }
}

// eslint-disable-next-line local/no-export-side-effect
export const xhrService = new XhrService();
