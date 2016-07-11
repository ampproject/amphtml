import ObjectStore from './object-store';
import TransactionRequest, { Transaction } from './transaction';

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

  close() {
    this.database.close();
  }

  createObjectStore(name, params = {}) {
    const store = this.database.createObjectStore(name, params);
    return new ObjectStore(
      store,
      new Transaction(store.transaction, this)// ,
      // TODO params
    );
  }

  deleteObjectStore(name) {
    this.database.deleteObjectStore(name);
  }

  transaction(scope, mode = 'readonly', params = {}) {
    return new TransactionRequest(
      this.database.transaction(scope, mode),
      this,
      params
    );
  }
}
