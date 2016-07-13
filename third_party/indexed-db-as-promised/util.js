export function resolveWithResult(resolve) {
  return (event) => {
    resolve(event.target.result);
  };
}

export function rejectWithError(reject) {
  return (event) => {
    reject(event.target.error);
  };
}
