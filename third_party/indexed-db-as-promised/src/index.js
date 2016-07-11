import Request from './request';
import CursorRequest from './cursor';

export default class Index {
  constructor(index, transaction, objectStore) {
    this.index = index;
    this.transaction = transaction;
    this.objectStore = objectStore;
  }

  get keyPath() {
    return this.index.keyPath;
  }

  get multiEntry() {
    return this.index.multiEntry;
  }

  get name() {
    return this.index.name;
  }

  get unique() {
    return this.index.unique;
  }

  count(query = null) {
    return new Request(
      query == null ? this.index.count() : this.index.count(query),
      this.transaction,
      this
    );
  }

  get(key) {
    return new Request(this.index.get(key), this.transaction, this);
  }

  getAll(query = null, count = Infinity) {
    return new Request(this.index.getAll(query, count), this.transaction, this);
  }

  getAllKeys(query = null, count = Infinity) {
    return new Request(this.index.getAllKeys(query, count), this.transaction, this);
  }

  openCursor(query = null, direction = 'next') {
    return new CursorRequest(this.index.openCursor(query, direction), this.transaction, this);
  }

  openKeyCursor(query = null, direction = 'next') {
    return new CursorRequest(this.index.openKeyCursor(query, direction), this.transaction, this);
  }
}
