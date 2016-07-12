import ObjectStore from './object-store';
import SyncPromise from './sync-promise';
import { recoverWith, rejectWithError } from './util';

export default class Transaction {
  constructor(transaction, db) {
    this.transaction = transaction;
    this.db = db;
    this.ran = false;

    this.promise = new SyncPromise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = rejectWithError(reject);
    });
  }

  get mode() {
    return this.transaction.mode;
  }

  get objectStoreNames() {
    return this.transaction.objectStoreNames;
  }

  get onabort() {
    return this.transaction.onabort;
  }

  set onabort(handler) {
    this.transaction.onabort = handler;
  }

  abort() {
    this.transaction.abort();
  }

  objectStore(name) {
    return new ObjectStore(this.transaction.objectStore(name), this);
  }

  run(callback) {
    if (this.ran) {
      throw new Error('Transaction has already run.');
    }

    this.ran = true;
    return new SyncPromise((resolve) => {
      resolve(callback(this));
    }).then((result) => {
      if (result === this) {
        throw new Error('Cannot access the transaction instance outside the run block.');
      }
      return this.promise.then((completion) => {
        return result;
      });
    }, (error) => {
      this.abort();
      throw error;
    });
  }
}
