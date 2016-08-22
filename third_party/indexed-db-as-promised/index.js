import Request from './classes/request';
import Database from './classes/database';
import Transaction from './classes/transaction';
import SyncPromise from './classes/sync-promise';


/**
 * An event emitted during the `versionchange` transaction, containing the
 * new version, old version, and the transaction itself.
 *
 * @typedef {{
 *   oldVersion: number,
 *   newVersion: number,
 *   transaction: ?Transaction,
 * }}
 */
let VersionChangeEvent;

/**
 * An object which provides the `upgrade` and `blocked` callbacks to use when
 * upgrading the database's version. The `upgrade` callback's
 * `VersionChangeEvent` will contain a `Transaction` object, while the
 * `blocked` callback's will not.
 *
 * @typedef {{
 *   upgrade: ?function(!Database, !VersionChangeEvent),
 *   blocked: ?function(!VersionChangeEvent),
 * }}
 */
let OpenCallbacks;

/**
 * A helper to create a brand new VersionChangeEvent with an wrapped
 * Transaction.
 *
 * @param {!Event} event The native version change event emitted.
 * @param {?Database} db The database whose version is changing.
 * @return {!VersionChangeEvent}
 */
function versionChangeEvent(event, db = null) {
  const transaction = event.target.transaction;
  return {
    oldVersion: event.oldVersion,
    newVersion: event.newVersion,
    transaction: transaction && new Transaction(transaction, db),
  };
}

/**
 * An IndexedDB factory instance that wraps IndexedDB in a thin promise-like
 * API.
 */
const indexedDBP = {
  /**
   * Deletes the database `name`.
   *
   * @return {!Request<undefined>} A wrapped IDBRequest to delete the database.
   */
  deleteDatabase(name) {
    return new Request(indexedDB.deleteDatabase(name));
  },

  /**
   * Opens a new connection to the database `name`, possibly upgrading the
   * database's version. Optional callbacks `upgrade` and `blocked` may be
   * provided, which will be called, respectively, when upgrading the database
   * version or when an already open connection prevents the database from
   * upgrading to the new version.
   *
   * @param {string} name The database to open a connection to.
   * @param {number=} version The desired version of the database. If this is
   *     higher than the database's current version, the `upgrade` callback
   *     will be called once there are no currently open connections to the
   *     database. If there are currently open connections, the `blocked`
   *     callback will be called first.
   * @param {?OpenCallbacks=} An object which provides the `upgrade` and
   *     `blocked` callbacks to use when upgrading the database's version.
   * @return {!Request<IDBDatabase>} A wrapped IDBRequest to open the database.
   */
  open(name, version = 1, { upgrade, blocked } = {}) {
    const request = indexedDB.open(name, version);
    const wrapped = new Request(request);
    let db;

    // A helper to avoid creating multiple wrapped Database instances.
    function instance() {
      return db || (db = new Database(request.result));
    }

    /**
     * This is the wrapped Request's resolve function. We're wrapping it so
     * that the request resolves with our wrapped Database instance.
     *
     * @type {!function(*)}
     */
    const resolve = request.onsuccess;
    request.onsuccess = () => {
      resolve({ target: { result: instance() } });
    };

    if (upgrade) {
      request.onupgradeneeded = (event) => {
        upgrade(instance(), versionChangeEvent(event, db));
      };
    }
    if (blocked) {
      request.onblocked = (event) => {
        blocked(versionChangeEvent(event));
      };
    }

    return wrapped;
  },
};

export default indexedDBP;
export {
  SyncPromise,
};
