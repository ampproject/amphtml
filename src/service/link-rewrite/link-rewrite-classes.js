import {user} from '../../log';

export class AnchorRewriteData {
  /**
   *
   * @param {*} anchor
   * @param {*} newUrl
   * @param {*} metaData
   */
  constructor(anchor, newUrl, metaData) {
    this.anchor = anchor;
    this.initialUrl = anchor.href;
    this.metaData = metaData || {};
    this.replacementUrl = newUrl || null;
  }
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
