import Request from './request';
import CursorRequest from './cursor';
import Index from './index';

export default class ObjectStore {
  constructor(store, transaction) {
    this.store = store;
    this.transaction = transaction;
  }

  get autoIncrement() {
    return this.store.autoIncrement;
  }

  get indexNames() {
    return this.store.indexNames;
  }

  get keyPath() {
    return this.store.keyPath;
  }

  get name() {
    return this.store.name;
  }

  add(item, key = undefined) {
    return new Request(this.store.add(item, key), this.transaction, this);
  }

  clear() {
    return new Request(this.store.clear(), this.transaction, this);
  }

  count(query = null) {
    return new Request(
      query == null ? this.store.count() : this.store.count(query),
      this.transaction,
      this
    );
  }

  createIndex(name, keyPath, params = {}) {
    return new Index(this.store.createIndex(name, keyPath, params), this.transaction, this);
  }

  delete(key) {
    return new Request(this.store.delete(key), this.transaction, this);
  }

  deleteIndex(name) {
    this.store.deleteIndex(name);
  }

  get(key) {
    return new Request(this.store.get(key), this.transaction, this);
  }

  getAll(query = null, count = Infinity) {
    return new Request(this.store.getAll(query, count), this.transaction, this);
  }

  getAllKeys(query = null, count = Infinity) {
    return new Request(this.store.getAllKeys(query, count), this.transaction, this);
  }

  index(name) {
    return new Index(this.store.index(name), this.transaction, this);
  }

  openCursor(query = null, direction = 'next') {
    return new CursorRequest(this.store.openCursor(query, direction), this.transaction, this);
  }

  openKeyCursor(query = null, direction = 'next') {
    return new CursorRequest(this.store.openKeyCursor(query, direction), this.transaction, this);
  }

  put(item, key = undefined) {
    return new Request(this.store.put(item, key), this.transaction, this);
  }
}
