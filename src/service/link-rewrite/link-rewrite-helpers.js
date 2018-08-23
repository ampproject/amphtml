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
 * Create a reponse object for 'resolveUnknownAnchors()' function
 * in the format expected by LinkRewriter.
 *
 * Some replacement urls may be determine synchrously but others may need an
 * asynchrounous call. Being able to return a sync and async response offers
 * flexibility to handle all these scenarios:
 *
 * - If you don't need any api calls to determine your replacement url.
 *   Use: createTwoStepsResponse(syncResponse)
 *
 * - If you need a an api call to determine your replacement url
 *   Use: createTwoStepsResponse(null, asyncResponse)
 *
 * - If you need an api call to determine your replacement url but
 *   have implemented a synchronous cache system.
 *   Use: createTwoStepsResponse(syncResponse, asyncResponse);
 *
 * - If you want to return a temporary replacement url until you get the
 *   real replacement url from your api call.
 *   Use:  createTwoStepsResponse(syncResponse, asyncResponse)
 *
 * @param {*} syncResponse
 * @param {*} asyncResponse
 * @return {Object} - "two steps response" {syncResponse, asyncResponse}
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
  const isValid = twoStepsResponse && (
    hasOwn(twoStepsResponse, 'syncResponse') ||
    hasOwn(twoStepsResponse, 'asyncResponse'));

  return Boolean(isValid);
}
