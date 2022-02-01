import {elementStringOrPassThru} from '#core/error/message-helpers';
import {isArray, isElement, isString} from '#core/types';
import {remove} from '#core/types/array';

/**
 * @fileoverview This file provides the base implementation for assertion
 * functions. Most files should never import from this; instead, import from
 * `dev` or `user`. It is also used by the Log class for its assertions.
 */

/** @typedef {function(*, string, ...*):*} AssertionFunctionStringDef */
/** @typedef {function(*, Array<*>):*} AssertionFunctionArrayDef */

/**
 * A base assertion function, provided to various assertion helpers.
 * @typedef {AssertionFunctionStringDef|AssertionFunctionArrayDef} AssertionFunctionDef
 */

/**
 * Throws an error if the second argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 * @param {?string} sentinel
 * @param {*} shouldBeTruthy
 * @param {string} opt_message
 * @param {...*} var_args Arguments substituted into %s in the message
 * @return {asserts shouldBeTruthy}
 * @throws {Error} when shouldBeTruthy is not truthy.
 */
export function assert(
  sentinel,
  shouldBeTruthy,
  opt_message = 'Assertion failed',
  var_args
) {
  if (shouldBeTruthy) {
    return /** @type {void} */ (shouldBeTruthy);
  }

  // Include the sentinel string if provided and not already present
  if (sentinel && opt_message.indexOf(sentinel) == -1) {
    opt_message += sentinel;
  }

  // Skip the first 3 arguments to isolate format params
  // const messageArgs = Array.prototype.slice.call(arguments, 3);
  // Index at which message args start
  let i = 3;

  // Substitute provided values into format string in message
  const splitMessage = opt_message.split('%s');
  let message = splitMessage.shift();
  const messageArray = [message];

  while (splitMessage.length) {
    const subValue = arguments[i++];
    const nextConstant = /** @type {NonNullable<*>} */ (splitMessage.shift());

    message += elementStringOrPassThru(subValue) + nextConstant;
    messageArray.push(subValue, nextConstant.trim());
  }

  const error = new Error(message);
  error.messageArray = remove(messageArray, (x) => x !== '');
  // __AMP_REPORT_ERROR is installed globally per window in the entry point in
  // AMP documents. It may not be present for Bento/Preact elements on non-AMP
  // pages.
  self.__AMP_REPORT_ERROR?.(error);
  throw error;
}

/**
 * Asserts types, backbone of `assertNumber`, `assertString`, etc.
 *
 * It understands array-based "id"-contracted messages.
 *
 * Otherwise creates a sprintf syntax string containing the optional message or the
 * default. The `subject` of the assertion is added at the end.
 *
 * @param {AssertionFunctionDef} assertFn underlying assertion function to call
 * @param {*} subject
 * @param {*} shouldBeTruthy
 * @param {string} defaultMessage
 * @param {Array<*>|string=} opt_message
 * @return {asserts shouldBeTruthy}
 * @private
 */
function assertType_(
  assertFn,
  subject,
  shouldBeTruthy,
  defaultMessage,
  opt_message
) {
  if (isArray(opt_message)) {
    /** @type {AssertionFunctionArrayDef} */ (assertFn)(
      shouldBeTruthy,
      /** @type {Array<*>} */ (opt_message).concat([subject])
    );
  } else {
    /** @type {AssertionFunctionStringDef} */ (assertFn)(
      shouldBeTruthy,
      `${opt_message || defaultMessage}: %s`,
      subject
    );
  }

  return /** @type {void} */ (subject);
}

/**
 * Throws an error if the first argument isn't an Element.
 *
 * For more details see `assert`.
 *
 * @param {AssertionFunctionDef} assertFn underlying assertion function to call
 * @param {*} shouldBeElement
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeElement is Element}
 * @throws {Error} when shouldBeElement is not an Element
 */
export function assertElement(assertFn, shouldBeElement, opt_message) {
  return assertType_(
    assertFn,
    shouldBeElement,
    isElement(shouldBeElement),
    'Element expected',
    opt_message
  );
}

/**
 * Throws an error if the first argument isn't a string. The string can
 * be empty.
 *
 * For more details see `assert`.
 *
 * @param {AssertionFunctionDef} assertFn underlying assertion function to call
 * @param {*} shouldBeString
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeString is string}
 * @throws {Error} when shouldBeString is not an String
 */
export function assertString(assertFn, shouldBeString, opt_message) {
  return assertType_(
    assertFn,
    shouldBeString,
    isString(shouldBeString),
    'String expected',
    opt_message
  );
}

/**
 * Throws an error if the first argument isn't a number. The allowed values
 * include `0` and `NaN`.
 *
 * For more details see `assert`.
 *
 * @param {AssertionFunctionDef} assertFn underlying assertion function to call
 * @param {*} shouldBeNumber
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeNumber is number}
 * @throws {Error} when shouldBeNumber is not an Number
 */
export function assertNumber(assertFn, shouldBeNumber, opt_message) {
  return assertType_(
    assertFn,
    shouldBeNumber,
    typeof shouldBeNumber == 'number',
    'Number expected',
    opt_message
  );
}

/**
 * Throws an error if the first argument is not an array.
 * The array can be empty.
 *
 * For more details see `assert`.
 *
 * @param {AssertionFunctionDef} assertFn underlying assertion function to call
 * @param {*} shouldBeArray
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeArray is Array} The array value
 * @throws {Error} when shouldBeArray is not an Array
 */
export function assertArray(assertFn, shouldBeArray, opt_message) {
  return assertType_(
    assertFn,
    shouldBeArray,
    isArray(shouldBeArray),
    'Array expected',
    opt_message
  );
}

/**
 * Throws an error if the first argument isn't a boolean.
 *
 * For more details see `assert`.
 *
 * @param {AssertionFunctionDef} assertFn underlying assertion function to call
 * @param {*} shouldBeBoolean
 * @param {Array<*>|string=} opt_message The assertion message
 * @return {asserts shouldBeBoolean is boolean} The boolean value.
 * @throws {Error} when shouldBeBoolean is not an Boolean
 */
export function assertBoolean(assertFn, shouldBeBoolean, opt_message) {
  return assertType_(
    assertFn,
    shouldBeBoolean,
    !!shouldBeBoolean === shouldBeBoolean,
    'Boolean expected',
    opt_message
  );
}
