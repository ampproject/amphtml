/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    /** @private {!Array<!HTMLElement>} */
    this.anchorList_ = [];

    /** @private {!Array<?string>} */
    this.replacementList_ = [];
  }

  /**
   * Reset the list of anchors to the new provided list but keep
   * the replacement values associated with pre-existing anchors.
   * @param {!Array<!HTMLElement>} newAnchorList - array of "<a>".
   * @public
   */
  updateLinkList(newAnchorList) {
    // Copy the previous replacement URL to the
    // new replacement list.
    // Warning: This step needs to be done before updating this.anchorList_
    // since getReplacementUrlForAnchor relies on it.
    this.replacementList_ = newAnchorList.map(
      this.getReplacementUrlForAnchor.bind(this)
    );

    this.anchorList_ = newAnchorList;
  }

  /**
   * @param {!./link-rewriter.AnchorReplacementList} replacementList
   * @public
   */
  updateReplacementUrls(replacementList) {
    replacementList.forEach((replacementItem) => {
      const {anchor, replacementUrl} = replacementItem;
      const anchorIndex = this.anchorList_.indexOf(anchor);
      if (anchorIndex !== -1) {
        this.replacementList_[anchorIndex] = replacementUrl;
      }
    });
  }

  /**
   * Returns the replacement url associated with an anchor.
   * @param {!HTMLElement} anchor
   * @return {?string}
   * @public
   */
  getReplacementUrlForAnchor(anchor) {
    const index = this.anchorList_.indexOf(anchor);

    return index !== -1 ? this.replacementList_[index] : null;
  }

  /**
   * @param {!HTMLElement} anchor
   * @return {boolean}
   * @public
   */
  isInCache(anchor) {
    return this.anchorList_.indexOf(anchor) !== -1;
  }

  /**
   * Get the list of all the anchors present in the cache, associated with their
   * replacementUrl.
   * @return {!./link-rewriter.AnchorReplacementList}
   * @public
   */
  getAnchorReplacementList() {
    return this.anchorList_.map((anchor) => {
      return /** @type {!{anchor: !HTMLElement, replacementUrl: ?string}} */ ({
        anchor,
        replacementUrl: this.getReplacementUrlForAnchor(anchor),
      });
    });
  }
}
