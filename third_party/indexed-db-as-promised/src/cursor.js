import SyncPromise from './sync-promise';
import Request from './request';

class Cursor {
  constructor(cursor, transaction, source) {
    this.cursor_ = cursor;
    this.transaction = transaction;
    this.source = source;
  }

  get direction() {
    return this.cursor_.direction;
  }

  get key() {
    return this.cursor_.key;
  }

  get primaryKey() {
    return this.cursor_.primaryKey;
  }

  get value() {
    return this.cursor_.value;
  }

  advance(count) {
    this.cursor_.advance(count);
  }

  continue(key = undefined) {
    this.cursor_.continue(key);
  }

  delete() {
    return new Request(this.cursor_.delete(), this.transaction, this);
  }

  update(item) {
    return new Request(this.cursor_.update(item), this.transaction, this);
  }
}

export default class CursorRequest {
  constructor(cursorRequest, transaction, source) {
    this.cursorRequest_ = cursorRequest;
    this.promise_ = new Request(cursorRequest, this, source);
    this.transaction = transaction;
    this.source = source;
  }

  iterate(iterator) {
    return this.promise_.then((result) => {
      const iterations = [];
      const request = this.cursorRequest_;
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
          return (this.promise_ = new Request(request, this.transaction, this.source));
        }).then(iterate);
      };

      return iterate(result);
    });
  }

  while(iterator) {
    let preempt = false;
    return this.iterate((cursor) => {
      return SyncPromise.resolve(iterator(cursor)).then((result) => {
        if (this.cursorRequest_.readyState === 'done') {
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
