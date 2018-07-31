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


export class AnchorRewriteDataResponse {
  /**
   *
   * @param {*} anchorRewriteStatusList
   * @param {*} asyncPromise
   */
  constructor(anchorRewriteStatusList, asyncPromise) {
    if (asyncPromise) {
      user().assert(asyncPromise instanceof Promise,
          'AnchorRewriteStatusResponse(), if provider, second argument needs to be a promise');
    }

    this.syncData = anchorRewriteStatusList;
    this.asyncData = asyncPromise;
  }
}
