/**
 * Some exceptions (DOMException, namely) have read-only message.
 * @param {Error} error
 * @return {Error}
 */
export function duplicateErrorIfNecessary(error) {
  const messageProperty = Object.getOwnPropertyDescriptor(error, 'message');
  if (messageProperty?.writable) {
    return error;
  }

  const {message, stack} = error;
  const e = new Error(message);
  // Copy all the extraneous things we attach.
  for (const prop in error) {
    /** @type {*} */ (e)[prop] = /** @type {*} */ (error)[prop];
  }
  // Ensure these are copied.
  e.stack = stack;
  return e;
}

/**
 * Creates an error object.
 * @param {...*} var_args
 * @return {Error}
 */
export function createError(var_args) {
  let error = null;
  let message = '';
  for (const arg of arguments) {
    if (arg instanceof Error && !error) {
      error = duplicateErrorIfNecessary(arg);
    } else {
      if (message) {
        message += ' ';
      }
      message += arg;
    }
  }

  if (!error) {
    error = new Error(message);
  } else if (message) {
    error.message = message + ': ' + error.message;
  }
  return error;
}

/**
 * Reports an error, if the global error reporting function is defined.
 * @param {Error} error
 */
function maybeReportError(error) {
  self.__AMP_REPORT_ERROR?.(error);
}

/**
 * Constructs and throws an error without terminating the current context. This
 * preserves whether the original error designation is a user error or a dev
 * error.
 * @param {...*} var_args
 */
export function rethrowAsync(var_args) {
  const error = createError.apply(null, arguments);
  setTimeout(() => {
    // __AMP_REPORT_ERROR is installed globally per window in the entry point.
    // It may not exist for Bento components without the runtime.
    maybeReportError(error);
    throw error;
  });
}

/**
 * Executes the provided callback in a try/catch and rethrows any errors
 * asynchronously.
 *
 * @param {function(S):T} callback
 * @param {...S} args
 * @return {T|undefined}
 * @template T
 * @template S
 */
export function tryCallback(callback, ...args) {
  try {
    return callback.apply(null, args);
  } catch (e) {
    rethrowAsync(e);
  }
}

/**
 * Creates an error object with its expected property set to true.
 * @param {...*} var_args
 * @return {Error}
 */
export function createExpectedError(var_args) {
  const error = createError.apply(null, arguments);
  error.expected = true;
  return error;
}

/**
 * Reports an error message.
 * @param {string} tag
 * @param {...*} args
 */
export function devError(tag, ...args) {
  const error = createError.apply(null, args);
  // TODO(rcebulko): Determine if/how this Error#name property is used.
  error.name = tag || error.name;
  maybeReportError(error);
}

/**
 * Reports an error message and marks with an expected property. If the
 * logging is disabled, the error is rethrown asynchronously.
 * @param {string} unusedTag
 * @param {...*} args
 */
export function devExpectedError(unusedTag, ...args) {
  maybeReportError(createExpectedError.apply(null, args));
}
