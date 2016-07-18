import SyncPromise from './sync-promise';
import { resolveWithResult, rejectWithError } from '../util';

/**
 * A wrapper around IDBRequest to give it a Promise-like API.
 */
export default class Request {
  /**
   * @param {!IDBRequest} request
   * @param {Transaction=} transaction The wrapped IDBTransaction that issued
   *     this request.
   * @param {!Cursor|!Index|!ObjectStore} source A source that opened this
   *     cursor, either a wrapped IDBCursor, a wrapped IDBObjectStore, or a
   *     wrapped IDBIndex.
   * @template T
   */
  constructor(request, transaction = null, source = null) {
    /** @const */
    this.request_ = request;

    /** @const */
    this.transaction = transaction;

    /** @const */
    this.source = source;

    /**
     * A Promise like that will resolve once the request finishes.
     *
     * @const
     * @type {!SyncPromise<T>}
     */
    this.promise_ = new SyncPromise((resolve, reject) => {
      if (request.readyState === 'done') {
        if (request.error) {
          reject(request.error);
        } else {
          resolve(request.result);
        }
      } else {
        request.onsuccess = resolveWithResult(resolve);
        request.onerror = rejectWithError(reject);
      }
    });
  }

  /**
   * The current state of the request.
   * @see https://www.w3.org/TR/IndexedDB/#idl-def-IDBRequestReadyState
   *
   * @return {!IDBRequestReadyState}
   */
  get readyState() {
    return this.request_.readyState;
  }

  /**
   * Creates a new Promise-like that will transition into the state returned by
   * `onRejected` if this request fails.
   *
   * @param {function(T):R} onRejected
   * @return {SyncPromise<R>} A Promise-like
   * @template R
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  /**
   * Creates a new Promise-like that will transition into the state returned by
   * `onFulfilled` if this request succeedes, or `onRejected` if this request
   * fails.
   *
   * @param {function(T):S} onFulfilled
   * @param {function(T):R} onRejected
   * @return {SyncPromise<S>} A Promise-like
   * @template S
   * @template R
   */
  then(onFulfilled, onRejected) {
    return this.promise_.then(onFulfilled, onRejected);
  }
}
