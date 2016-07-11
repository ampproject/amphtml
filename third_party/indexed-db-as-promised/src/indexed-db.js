import Request from './request';
import Database from './database';

const iDb = {
  deleteDatabase(name) {
    return Promise.resolve(new Request(indexedDB.deleteDatabase(name)));
  },

  open(name, version = 1, { upgrade, blocked } = {}) {
    let db;
    const request = indexedDB.open(name, version);
    function instance() {
      return db || (db = new Database(request.result));
    }

    if (upgrade) {
      request.onupgradeneeded = (event) => upgrade(instance(), event);
    }
    if (blocked) {
      request.onblocked = (event) => blocked(event);
    }

    return Promise.resolve(new Request(request).then(instance));
  },
};

export default iDb;
