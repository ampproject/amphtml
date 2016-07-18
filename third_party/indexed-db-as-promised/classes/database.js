import ObjectStore from './object-store';
import Transaction from './transaction';

/**
 * A wrapper around IDBDatabase, which provides access to other wrapped APIs.
 */
export default class Database {
  /**
   * @param {!IDBDatabase} database
   */
  constructor(database) {
    /** @const */
    this.database_ = database;
  }

  /**
   * The database's name.
   *
   * @return {string}
   */
  get name() {
    return this.database_.name;
  }

  /**
   * The names of all the objectStores in the database.
   *
   * @return {!DOMStringList}
   */
  get objectStoreNames() {
    return this.database_.objectStoreNames;
  }

  /**
   * The current database version.
   *
   * @return {number}
   */
  get version() {
    return this.database_.version;
  }

  /**
   * A proxy to the database's `onabort` property, which handles an `abort`
   * event.
   *
   * @return {EventHandler}
   */
  get onabort() {
    return this.database_.onabort;
  }

  /**
   * A proxy to set the database's `onabort` property, which handles an `abort`
   * event.
   *
   * @param {EventHandler} handler
   */
  set onabort(handler) {
    this.database_.onabort = handler;
  }

  /**
   * A proxy to the database's `onerror` property, which handles an `error`
   * event.
   *
   * @return {EventHandler}
   */
  get onerror() {
    return this.database_.onerror;
  }

  /**
   * A proxy to set the database's `onerror` property, which handles an `error`
   * event.
   *
   * @param {EventHandler} handler
   */
  set onerror(handler) {
    this.database_.onerror = handler;
  }

  /**
   * A proxy to the database's `onversionchange` property, which handles the
   * `versionchange` event. Note that this is not the same as the `upgrade`
   * handler provided to `IndexedDBP#open`.
   *
   * @return {EventHandler}
   */
  get onversionchange() {
    return this.database_.onversionchange;
  }

  /**
   * A proxy to set the database's `onversionchange` property, which handles
   * the `versionchange` event. Note that this is not the same as the `upgrade`
   * handler provided to `IndexedDBP#open`.
   *
   * @param {EventHandler} handler
   */
  set onversionchange(handler) {
    this.database_.onversionchange = handler;
  }

  /**
   * Closes this database connection.
   */
  close() {
    this.database_.close();
  }

  /**
   * Creates an objectStore. Note that this may only be called inside the
   * `upgrade` handler provided to `IndexedDBP#open`.
   *
   * @param {string} name
   * @param {IDBObjectStoreParameters=} Options to use when creating the
   *     objectStore, such as `autoIncrement`, `keyPath`.
   *     @see https://www.w3.org/TR/IndexedDB/#idl-def-IDBObjectStoreParameters
   * @return {!ObjectStore} A wrapped IDBObjectStore.
   */
  createObjectStore(name, params = {}) {
    const store = this.database_.createObjectStore(name, params);
    return new ObjectStore(
      store,
      new Transaction(store.transaction, this)
    );
  }

  /**
   * Deletes the `name` objectStore. Note that this may only be called inside
   * the `upgrade` handler provided to `IndexedDBP#open`.
   *
   * @param {string} name
   */
  deleteObjectStore(name) {
    this.database_.deleteObjectStore(name);
  }

  /**
   * Opens a new transaction to read or read/write data to the specified
   * objectStores. Note that this may not be called inside the `upgrade`
   * handler provided to `IndexedDBP#open`.
   *
   * @param {string|!Array<string>} scope The objectStore(s) that may be
   *     accessed inside the transaction.
   * @param {IDBTransactionMode=} mode Limits data access to the provided mode:
   *     either `readonly` or `readwrite`.
   *     @see https://www.w3.org/TR/IndexedDB/#idl-def-IDBTransactionMode
   * @return {!Transaction} A wrapped IDBTransaction.
   */
  transaction(scope, mode = 'readonly') {
    return new Transaction(
      this.database_.transaction(scope, mode),
      this
    );
  }
}
