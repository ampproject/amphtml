import SyncPromise from './sync-promise';
import Request from './request';

class Cursor {
  constructor(cursor, transaction, source) {
    this.cursor = cursor;
    this.transaction = transaction;
    this.source = source;
  }

  get direction() {
    return this.cursor.direction;
  }

  get key() {
    return this.cursor.key;
  }

  get primaryKey() {
    return this.cursor.primaryKey;
  }

  get value() {
    return this.cursor.value;
  }

  advance(count) {
    this.cursor.advance(count);
  }

  continue(key = undefined) {
    this.cursor.continue(key);
  }

  delete() {
    return new Request(this.cursor.delete(), this.transaction, this);
  }

  update(item) {
    return new Request(this.cursor.update(item), this.transaction, this);
  }
}

export default class CursorRequest {
  constructor(cursorRequest, transaction, source) {
    this.cursorRequest = cursorRequest;
    this.promise = new Request(cursorRequest, this, source);
    this.transaction = transaction;
    this.source = source;
  }

  iterate(iterator) {
    return this.promise.then((result) => {
      const iterations = [];
      const request = this.cursorRequest;
      const cursor = result && new Cursor(result, this.transaction, this.source);

      const iterate = (result) => {
        if (!result) {
          return iterations;
        }

        return new SyncPromise((resolve) => {
          resolve(iterator(cursor));
        }).then((iteration) => {
          iterations.push(iteration);
          if (request.readyState === 'done') {
            return null;
          }
          return (this.promise = new Request(request, this.transaction, this.source));
        }).then(iterate);
      };

      return iterate(result);
    });
  }

  while(iterator) {
    let preempt = false;
    return this.iterate((cursor) => {
      return SyncPromise.resolve(iterator(cursor)).then((result) => {
        if (this.cursorRequest.readyState === 'done') {
          if (result === false) {
            preempt = true;
          } else {
            cursor.continue();
          }
        }
        return result;
      });
    }).then((results) => {
      if (preempt) {
        results.pop();
      }
      return results;
    });
  }
}
