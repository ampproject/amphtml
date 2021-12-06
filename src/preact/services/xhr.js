class XhrService {
  fetchJson(url) {
    return fetch(url);
  }
}

export const xhrService = new XhrService();
