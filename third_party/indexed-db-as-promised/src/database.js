import ObjectStore from './object-store';
import Transaction from './transaction';

export default class Database {
  constructor(database) {
    this.database = database;
  }

  get name() {
    return this.database.name;
  }

  get objectStoreNames() {
    return this.database.objectStoreNames;
  }

  get version() {
    return this.database.version;
  }

  get onabort() {
    return this.database.onabort;
  }

  set onabort(handler) {
    this.database.onabort = handler;
  }

  get onclose() {
    return this.database.onclose;
  }

  set onclose(handler) {
    this.database.onclose = handler;
  }

  get onerror() {
    return this.database.onerror;
  }

  set onerror(handler) {
    this.database.onerror = handler;
  }

  get onversionchange() {
    return this.database.onversionchange;
  }

  set onversionchange(handler) {
    this.database.onversionchange = handler;
  }

  close() {
    this.database.close();
  }

  createObjectStore(name, params = {}) {
    const store = this.database.createObjectStore(name, params);
    return new ObjectStore(
      store,
      new Transaction(store.transaction, this)
    );
  }

  deleteObjectStore(name) {
    this.database.deleteObjectStore(name);
  }

  transaction(scope, mode = 'readonly') {
    return new Transaction(
      this.database.transaction(scope, mode),
      this
    );
  }
}
