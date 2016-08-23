import ObjectStore from './object-store';
import SyncPromise from './sync-promise';
import { rejectWithError } from '../util';

/**
 * A wrapper around IDBTransaction, which provides access to other wrapped APIs.
 */
export default class Transaction {
  /**
   * @param {!IDBTransaction} transaction
   * @param {!Database} db The database that opened the transaction.
   */
  constructor(transaction, db) {
    /** @const */
    this.transaction_ = transaction;

    /** @const */
    this.db = db;

    /**
     * Whether this transaction has run. We limit the transaction to only
     * "running" once inside a `#run` callback to provide a clear indication
     * that transactions **will** close if there is no work currently being
     * done. Any attempts to access objectStores or double-run will result in
     * errors.
     *
     * There _is_ a special case when the transaction is in `versionchange`
     * mode, since this transaction is "run" automatically. In this case,
     * access to objectStores is allowed outside the `#run` block.
     * @type {boolean}
     */
    this.ran_ = transaction.mode === 'versionchange';

    /**
     * A promise that will only resolve when the transaction has finished all
     * work.
     *
     * @const
     * @type {!SyncPromise<undefined>}
     **/
    this.promise_ = new SyncPromise((resolve, reject) => {
      transaction.oncomplete = () => {
        this.ran_ = true;
        resolve();
      };
      transaction.onerror = rejectWithError(reject);
    });
  }

  /**
   * The access mode the transaction runs in.
   * @see https://www.w3.org/TR/IndexedDB/#idl-def-IDBTransactionMode
   *
   * @return {!IDBTransactionMode}
   */
  get mode() {
    return this.transaction_.mode;
  }

  /**
   * The names of all the objectStores the transaction may access.
   *
   * @return {!DOMStringList}
   */
  get objectStoreNames() {
    return this.transaction_.objectStoreNames;
  }

  /**
   * A proxy to the database's `onabort` property, which handles an `abort`
   * event.
   *
   * @return {EventHandler}
   */
  get onabort() {
    return this.transaction_.onabort;
  }

  /**
   * A proxy to set the database's `onabort` property, which handles an `abort`
   * event.
   *
   * @param {EventHandler} handler
   */
  set onabort(handler) {
    this.transaction_.onabort = handler;
  }

  /**
   * Aborts the transaction, rolling back any changes that have happened.
   */
  abort() {
    this.transaction_.abort();
  }

  /**
   * Opens the objectStore `name`.
   *
   * @param {string} name
   * @return {!ObjectStore} A wrapped IDBObjectStore.
   * @throws {Error} If attempting to access the objectStore outside of the ru     block. An exception is made if the transaction is the automatically run
   *     `versionchange`.
   */
  objectStore(name) {
    if (!this.ran_) {
      throw new Error('Cannot access objectStore outside of the #run block.');
    }

    return new ObjectStore(this.transaction_.objectStore(name), this);
  }

  /**
   * Opens a "run" block, allowing access to the transaction's objectStores.
   * The Promise-like returned will wait for both the transaction to complete
   * and the `callback`'s result before resolving with the result.
   *
   * @param {function(!Transaction):T} callback
   * @return {SyncPromise<T>} A Promise-like that will resolve with the
   *     `callback`'s result after the transaction completes.
   * @throws {Error} If called a second time. This is to clearly demonstrate
   *     that transactions will close automatically if there is no work to be
   *     done.
   * @template T
   */
  run(callback) {
    if (this.ran_) {
      throw new Error('Transaction has already run.');
    }
    this.ran_ = true;

    return new SyncPromise((resolve) => {
      resolve(callback(this));
    }).then((result) => {
      // Wait until the transaction completes, but return the callback's
      // resolved result.
      return this.promise_.then(() => result);
    }, (error) => {
      // When an error is thrown, abort the transaction.
      this.abort();
      throw error;
    });
  }
}
