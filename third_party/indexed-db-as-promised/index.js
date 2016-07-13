import Request from './classes/request';
import Database from './classes/database';
import Transaction from './classes/transaction';
import SyncPromise from './classes/sync-promise';

const iDb = {
  deleteDatabase(name) {
    return SyncPromise.resolve(new Request(indexedDB.deleteDatabase(name)));
  },

  open(name, version = 1, { upgrade, blocked } = {}) {
    let db;
    const request = indexedDB.open(name, version);
    function instance() {
      return db || (db = new Database(request.result));
    }
    function versionChangeEvent(event) {
      const transaction = request.transaction;
      return {
        oldVersion: event.oldVersion,
        newVersion: event.newVersion,
        transaction: transaction && new Transaction(transaction, db),
      };
    }

    if (upgrade) {
      request.onupgradeneeded = (event) => {
        upgrade(instance(), versionChangeEvent(event));
      };
    }
    if (blocked) {
      request.onblocked = (event) => {
        blocked(versionChangeEvent(event));
      };
    }

    return SyncPromise.resolve(new Request(request).then(instance));
  },
};

export default iDb;
export {
  SyncPromise,
};
