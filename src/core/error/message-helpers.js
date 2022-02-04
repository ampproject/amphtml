import {isElement} from '#core/types';

/**
 * Triple zero width space.
 *
 * This is added to user error messages, so that we can later identify
 * them, when the only thing that we have is the message. This is the
 * case in many browsers when the global exception handler is invoked.
 */
export const USER_ERROR_SENTINEL = '\u200B\u200B\u200B';
/**
 * Four zero width space.
 */
export const USER_ERROR_EMBED_SENTINEL = '\u200B\u200B\u200B\u200B';

/**
 * Converts an element to a readable string; all other types are unchanged.
 * TODO(rcebulko): Unify with log.js
 * @param {*} val
 * @return {*}
 */
export function elementStringOrPassThru(val) {
  // Do check equivalent to `val instanceof Element` without cross-window bug
  if (isElement(val)) {
    val = /** @type {Element} */ (val);
    return val.tagName.toLowerCase() + (val.id ? `#${val.id}` : '');
  }
  return val;
}

/**
 * Tests if an error message contains the user sentinel.
 * @param {string} message
 * @return {boolean} Whether this message was a user error.
 */
export function isUserErrorMessage(message) {
  return message.indexOf(USER_ERROR_SENTINEL) >= 0;
}

/**
 * @param {string} message
 * @return {boolean} Whether this message was a a user error from an iframe embed.
 */
export function isUserErrorEmbedMessage(message) {
  return message.indexOf(USER_ERROR_EMBED_SENTINEL) >= 0;
}

/**
 * Strips the user error sentinel from an error message.
 * @param {string} message
 * @return {string} The new message without USER_ERROR_SENTINEL
 */
export function stripUserError(message) {
  return message.replace(USER_ERROR_SENTINEL, '');
}
