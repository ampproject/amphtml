import SyncPromise from './sync-promise';
import { resolveWithResult, rejectWithError } from '../util';

export default class Request {
  constructor(request, transaction = null, source = null) {
    this.request_ = request;
    this.transaction = transaction;
    this.source = source;
    this.promise_ = new SyncPromise((resolve, reject) => {
      if (request.readyState === 'done') {
        if (request.error) {
          reject(request.error);
        } else {
          resolve(request.result);
        }
      } else {
        request.onsuccess = resolveWithResult(resolve);
        request.onerror = rejectWithError(reject);
      }
    });
  }

  get readyState() {
    return this.request_.readyState;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  then(onFulfilled, onRejected) {
    return this.promise_.then(onFulfilled, onRejected);
  }
}
