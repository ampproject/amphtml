import Request from './request';
import CursorRequest from './cursor';

export default class Index {
  constructor(index, transaction, objectStore) {
    this.index_ = index;
    this.transaction_ = transaction;
    this.objectStore = objectStore;
  }

  get keyPath() {
    return this.index_.keyPath;
  }

  get multiEntry() {
    return this.index_.multiEntry;
  }

  get name() {
    return this.index_.name;
  }

  get unique() {
    return this.index_.unique;
  }

  count(query = null) {
    return new Request(
      query == null ? this.index_.count() : this.index_.count(query),
      this.transaction_,
      this
    );
  }

  get(key) {
    return new Request(this.index_.get(key), this.transaction_, this);
  }

  getAll(query = null, count = Infinity) {
    return new Request(this.index_.getAll(query, count), this.transaction_, this);
  }

  getAllKeys(query = null, count = Infinity) {
    return new Request(this.index_.getAllKeys(query, count), this.transaction_, this);
  }

  openCursor(query = null, direction = 'next') {
    return new CursorRequest(this.index_.openCursor(query, direction), this.transaction_, this);
  }

  openKeyCursor(query = null, direction = 'next') {
    return new CursorRequest(this.index_.openKeyCursor(query, direction), this.transaction_, this);
  }
}
