import {hasOwn} from '../../utils/object';
import {user} from '../../log';

/**
 *
 * @param {*} anchor
 * @param {*} newUrl
 */
export function createAnchorReplacementTuple(anchor, newUrl) {
  return [anchor, newUrl];
}

/**
 *
 * @param {Array} tuple
 */
export function isAnchorReplacementTuple(tuple) {
  if (!Array.isArray(tuple)) {
    return false;
  }

  if (tuple.length !== 2) {
    return false;
  }

  const anchor = tuple[0];
  const url = tuple[1];
  if (!anchor || anchor.tagName !== 'A') {
    return false;
  }
  // url === null means no replacement
  if (url && typeof url !== 'string') {
    return false;
  }

  return true;
}

/**
 * Contains an optional synchronous and an optional asynchronous response.
 * @param {*} syncResponse
 * @param {*} asyncResponse
 */
export function createTwoStepsResponse(syncResponse, asyncResponse) {
  if (asyncResponse) {
    user().assert(asyncResponse instanceof Promise,
        'createTwoStepsResponse(syncResponse, asyncResponse), if provided, second argument needs to be a promise');
  }
  return {
    syncResponse,
    asyncResponse,
  };
}


/**
 *
 * @param {*} twoStepsResponse
 */
export function isTwoStepsResponse(twoStepsResponse) {
  const isValid = twoStepsResponse &&
    hasOwn(twoStepsResponse, 'syncResponse') &&
    hasOwn(twoStepsResponse, 'asyncResponse');

  return Boolean(isValid);
}
