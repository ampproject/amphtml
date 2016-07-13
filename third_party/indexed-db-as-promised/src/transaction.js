import ObjectStore from './object-store';
import SyncPromise from './sync-promise';
import { rejectWithError } from './util';

export default class Transaction {
  constructor(transaction, db) {
    this.transaction_ = transaction;
    this.db = db;
    this.ran_ = false;

    this.promise_ = new SyncPromise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = rejectWithError(reject);
    });
  }

  get mode() {
    return this.transaction_.mode;
  }

  get objectStoreNames() {
    return this.transaction_.objectStoreNames;
  }

  get onabort() {
    return this.transaction_.onabort;
  }

  set onabort(handler) {
    this.transaction_.onabort = handler;
  }

  abort() {
    this.transaction_.abort();
  }

  objectStore(name) {
    return new ObjectStore(this.transaction_.objectStore(name), this);
  }

  run(callback) {
    if (this.ran_) {
      throw new Error('Transaction has already run.');
    }

    this.ran_ = true;
    return new SyncPromise((resolve) => {
      resolve(callback(this));
    }).then((result) => {
      if (result === this) {
        throw new Error('Cannot access the transaction instance outside the run block.');
      }
      return this.promise_.then((completion) => {
        return result;
      });
    }, (error) => {
      this.abort();
      throw error;
    });
  }
}
