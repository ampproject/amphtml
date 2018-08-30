/**
 * Stores a list of anchors and their associated replacement URL.
 * This class could easily be replaced by a Map but Map is not allowed
 * in this project.
 */
export class LinkReplacementCache {
  /**
   * Constructor
   */
  constructor() {
    /** @private {Array<HTMLElement>} */
    this.anchorList_ = [];
    /** @private {Array<string>} */
    this.replacementList_ = [];
  }

  /**
   * @public
   * Reset the list of anchors to the new provided list but keep
   * the replacement values associated with pre-existing anchors.
   * @param {Array<HTMLElement>} newAnchorList - array of "<a>".
   */
  updateLinkList(newAnchorList) {
    const newReplacementList = newAnchorList.reduce((replacementList, anchor) => {
      let replacementValue = null;
      const index = this.anchorList_.indexOf(anchor);

      // Was the anchor already in the cache?
      if (index !== -1) {
        // If so copy the previous replacement URL associated with it to the
        // new replacement list.
        replacementValue = this.replacementList_[index];
      }
      replacementList.push(replacementValue);

      return replacementList;
    }, []);

    this.anchorList_ = newAnchorList;
    this.replacementList_ = newReplacementList;
  }

  /**
   * @public
   * @param {Array<{anchor: HTMLElement, replacementUrl: string}>} replacementList
   */
  updateReplacementUrls(replacementList) {
    replacementList.forEach(({anchor, replacementUrl}) => {
      const anchorIndex = this.anchorList_.indexOf(anchor);
      if (anchorIndex !== -1) {
        this.replacementList_[anchorIndex] = replacementUrl;
      }
    });
  }

  /**
   * @public
   * Returns the replacement url associated with an anchor.
   * @param {HTMLElement} anchor
   * @return {?string}
   */
  getReplacementUrlForAnchor(anchor) {
    const index = this.anchorList_.indexOf(anchor);

    return index !== -1 ? this.replacementList_[index] : null;
  }

  /**
   * @public
   * @param {HTMLElement} anchor
   * @return {boolean}
   */
  isInCache(anchor) {
    return this.anchorList_.indexOf(anchor) !== -1;
  }

  /**
   * @public
   * Get the list of all the anchors present in the cache, associated with their
   * replacementUrl
   * @return {Array<{anchor: HTMLElement, replacementUrl: string}>}
   */
  getAnchorReplacementList() {
    return this.anchorList_.map(anchor => {
      return {
        anchor,
        replacementUrl: this.getReplacementUrlForAnchor(anchor),
      };
    });
  }
}
