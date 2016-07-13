import ObjectStore from './object-store';
import Transaction from './transaction';

export default class Database {
  constructor(database) {
    this.database_ = database;
  }

  get name() {
    return this.database_.name;
  }

  get objectStoreNames() {
    return this.database_.objectStoreNames;
  }

  get version() {
    return this.database_.version;
  }

  get onabort() {
    return this.database_.onabort;
  }

  set onabort(handler) {
    this.database_.onabort = handler;
  }

  get onclose() {
    return this.database_.onclose;
  }

  set onclose(handler) {
    this.database_.onclose = handler;
  }

  get onerror() {
    return this.database_.onerror;
  }

  set onerror(handler) {
    this.database_.onerror = handler;
  }

  get onversionchange() {
    return this.database_.onversionchange;
  }

  set onversionchange(handler) {
    this.database_.onversionchange = handler;
  }

  close() {
    this.database_.close();
  }

  createObjectStore(name, params = {}) {
    const store = this.database_.createObjectStore(name, params);
    return new ObjectStore(
      store,
      new Transaction(store.transaction, this)
    );
  }

  deleteObjectStore(name) {
    this.database_.deleteObjectStore(name);
  }

  transaction(scope, mode = 'readonly') {
    return new Transaction(
      this.database_.transaction(scope, mode),
      this
    );
  }
}
