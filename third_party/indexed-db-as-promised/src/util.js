import SyncPromise from './sync-promise';

export function resolveWithResult(resolve, result = null) {
  return (event) => {
    resolve(result || event.target.result);
  };
}

export function recoverWith(resolve, callback) {
  return (event) => {
    resolve(new SyncPromise((resolve) => {
      resolve(callback(event.target.error));
    }));
  };
}

export function rejectWithError(reject, error = null) {
  return (event) => {
    reject(error || event.target.error);
  };
}
