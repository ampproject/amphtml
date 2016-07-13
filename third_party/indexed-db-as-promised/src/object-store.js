import Request from './request';
import CursorRequest from './cursor';
import Index from './index';

export default class ObjectStore {
  constructor(store, transaction) {
    this.store_ = store;
    this.transaction = transaction;
  }

  get autoIncrement() {
    return this.store_.autoIncrement;
  }

  get indexNames() {
    return this.store_.indexNames;
  }

  get keyPath() {
    return this.store_.keyPath;
  }

  get name() {
    return this.store_.name;
  }

  add(item, key = undefined) {
    return new Request(this.store_.add(item, key), this.transaction, this);
  }

  clear() {
    return new Request(this.store_.clear(), this.transaction, this);
  }

  count(query = null) {
    return new Request(
      query == null ? this.store_.count() : this.store_.count(query),
      this.transaction,
      this
    );
  }

  createIndex(name, keyPath, params = {}) {
    return new Index(this.store_.createIndex(name, keyPath, params), this.transaction, this);
  }

  delete(key) {
    return new Request(this.store_.delete(key), this.transaction, this);
  }

  deleteIndex(name) {
    this.store_.deleteIndex(name);
  }

  get(key) {
    return new Request(this.store_.get(key), this.transaction, this);
  }

  getAll(query = null, count = Infinity) {
    return new Request(this.store_.getAll(query, count), this.transaction, this);
  }

  getAllKeys(query = null, count = Infinity) {
    return new Request(this.store_.getAllKeys(query, count), this.transaction, this);
  }

  index(name) {
    return new Index(this.store_.index(name), this.transaction, this);
  }

  openCursor(query = null, direction = 'next') {
    return new CursorRequest(this.store_.openCursor(query, direction), this.transaction, this);
  }

  openKeyCursor(query = null, direction = 'next') {
    return new CursorRequest(this.store_.openKeyCursor(query, direction), this.transaction, this);
  }

  put(item, key = undefined) {
    return new Request(this.store_.put(item, key), this.transaction, this);
  }
}
