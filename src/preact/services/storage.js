class StorageService {
  async get(key) {
    const json = window.localStorage.getItem(key);
    return json ? JSON.parse(json) : undefined;
  }
  async set(key, value) {
    if (value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      const json = JSON.stringify(value);
      window.localStorage.setItem(key, json);
    }
  }
}

export const storageService = new StorageService();
