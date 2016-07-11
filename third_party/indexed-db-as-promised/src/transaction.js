import ObjectStore from './object-store';
import SyncPromise from './sync-promise';
import { recoverWith, rejectWithError } from './util';

export class Transaction {
  constructor(transaction, db) {
    this.transaction = transaction;
    this.db = db;
  }

  get mode() {
    return this.transaction.mode;
  }

  get objectStoreNames() {
    return this.transaction.objectStoreNames;
  }

  abort() {
    this.transaction.abort();
  }

  objectStore(name) {
    return new ObjectStore(this.transaction.objectStore(name), this);
  }
}

export default class TransactionRequest {
  constructor(transactionRequest, db, { aborted }) {
    this.transactionRequest = transactionRequest;
    this.transaction = new Transaction(transactionRequest, db);
    this.sentinel = {};

    this.promise = new SyncPromise((resolve, reject) => {
      transactionRequest.oncomplete = () => resolve(this.sentinel);
      transactionRequest.onerror = rejectWithError(reject);
      transactionRequest.onabort = aborted ?
        recoverWith(resolve, aborted) :
        rejectWithError(reject);
    });
  }

  then(onFulfilled, onRejected) {
    return SyncPromise.resolve(this.transaction)
      .then(onFulfilled, onRejected)
      .then((result) => {
        return this.promise.then((completion) => {
          return completion === this.sentinel ? result : completion;
        });
      }, (error) => {
        this.transaction.abort();
        throw error;
      });
  }

  catch(onRejected) {
    this.then(null, onRejected);
  }
}
