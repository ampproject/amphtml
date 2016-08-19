import Request from './request';
import CursorRequest from './cursor';

/**
 * A wrapper around IDBIndex, which provides a thin Promise-like API.
 */
export default class Index {
  /**
   * @param {!IDBIndex} index
   * @param {!Transaction} transaction_ The transaction that opened this index
   * @param {!ObjectStore} objectStore the ObjectStore this index belongs to.
   */
  constructor(index, transaction, objectStore) {
    /** @const */
    this.index_ = index;

    /** @const */
    this.transaction_ = transaction;

    /** @const */
    this.objectStore = objectStore;
  }

  /**
   * The key path that populates records into the index.
   *
   * @return {*}
   */
  get keyPath() {
    return this.index_.keyPath;
  }

  /**
   * Whether there will be multiple entries for a record when the keyPath is an
   * array. When `multiEntry` is `true` there is one record for every record in
   * `keyPath`, when false there is only one record for the entire `keyPath`.
   *
   * @return {boolean}
   */
  get multiEntry() {
    return this.index_.multiEntry;
  }

  /**
   * The index's name.
   *
   * @return {string}
   */
  get name() {
    return this.index_.name;
  }

  /**
   * Whether the index limits itself to unique keys only.
   *
   * @return {boolean}
   */
  get unique() {
    return this.index_.unique;
  }

  /**
   * Counts the number of records in the index. An optional query may be
   * provided to limit the count to only records matching it.
   *
   * @param {*=} query The key of the records to count, or an IDBKeyRange of the
   *     keys to count.
   * @return {!Request<number>}
   */
  count(query = null) {
    return new Request(
      query == null ? this.index_.count() : this.index_.count(query),
      this.transaction_,
      this
    );
  }

  /**
   * Gets the record in the index that matches `key`, or the first record that
   * matches the key range.
   *
   * @param {*=} key The key of the record to get, or an IDBKeyRange of the
   *     keys.
   * @return {!Request<*>}
   */
  get(key) {
    return new Request(this.index_.get(key), this.transaction_, this);
  }

  /**
   * Gets all the records in the index that matches `key` or that match the key
   * range. Note that not all implementations of IndexedDB provide
   * `IDBIndex#getAll`.
   *
   * @param {*=} query The key of the records to get, or an IDBKeyRange of the
   *     keys.
   * @param {number=} count The maximum number of records to return.
   * @return {!Request<!Array<*>>}
   */
  getAll(query = null, count = Infinity) {
    return new Request(this.index_.getAll(query, count), this.transaction_, this);
  }

  /**
   * Gets all the keys of the records in the index that matches `key` or that
   * match the key range. Note that not all implementations of IndexedDB
   * provide `IDBIndex#getAllKeys`.
   *
   * @param {*=} query The key to get, or an IDBKeyRange of the keys.
   * @param {number=} count The maximum number of keys to return.
   * @return {!Request<!Array<*>>}
   */
  getAllKeys(query = null, count = Infinity) {
    return new Request(this.index_.getAllKeys(query, count), this.transaction_, this);
  }

  /**
   * Opens a cursor to iterate all records in the index, or those matched by `query`.
   *
   * @param {*=} query The key to iterate, or an IDBKeyRange of the keys.
   * @param {./cursor.Direction=} The direction to iterate in.
   * @return {!CursorRequest} A wrapper around an iterating IDBCursor.
   */
  openCursor(query = null, direction = 'next') {
    return new CursorRequest(this.index_.openCursor(query, direction), this.transaction_, this);
  }

  /**
   * Opens a cursor to iterate all keys in the index, or those matched by `query`.
   *
   * @param {*=} query The key to iterate, or an IDBKeyRange of the keys.
   * @param {./cursor.Direction=} The direction to iterate in.
   * @return {!CursorRequest} A wrapper around an iterating IDBCursor.
   */
  openKeyCursor(query = null, direction = 'next') {
    return new CursorRequest(this.index_.openKeyCursor(query, direction), this.transaction_, this);
  }
}
