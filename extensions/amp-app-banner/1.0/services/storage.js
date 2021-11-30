class StorageService {
  async get(key) {
    const json = window.localStorage.getItem(key);
    return JSON.parse(json);
  }
  async set(key, value) {
    const json = JSON.stringify(value);
    window.localStorage.setItem(key, json);
  }
}

export const storageService = new StorageService();
