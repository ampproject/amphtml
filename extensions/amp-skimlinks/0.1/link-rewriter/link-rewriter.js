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

import {ChunkPriority, chunk} from '../../../../src/chunk';
import {EVENTS, ORIGINAL_URL_ATTRIBUTE} from './constants';
import {LinkReplacementCache} from './link-replacement-cache';
import {Observable} from '../../../../src/observable';
import {TwoStepsResponse} from './two-steps-response';
import {userAssert} from '../../../../src/log';

/** @typedef {!Array<{anchor: !HTMLElement, replacementUrl: ?string}>}} */
export let AnchorReplacementList;

/**
 * LinkRewriter works together with LinkRewriterManager to allow rewriting
 * links at click time. E.g: Replacing a link by its affiliate version only if
 * the link can be monetised.
 *
 * A page can have multiple LinkRewriter running at the same time.
 *
 * LinkRewriter class is in charge of:
 * - Scanning the page to find links based on an optional CSS selector.
 *
 * - Asking the "resolveUnknownLinks" function which links can be replaced
 *   so we already know the replacement URL at click time.
 *
 * - Keeping track of the replacement link of each links on the page.
 *
 * - Swapping the anchor url to its replacement url when instructed
 *   by the LinkRewriterManager.
 */
export class LinkRewriter {
  /**
   * @param {!Document|!ShadowRoot} rootNode
   * @param {string} id
   * @param {function(!Array<!HTMLElement>):!TwoStepsResponse} resolveUnknownLinks
   * @param {?{linkSelector: string}=} options
   */
  constructor(rootNode, id, resolveUnknownLinks, options) {
    /** @public {!../../../../src/observable.Observable} */
    this.events = new Observable();

    /** @public {string} */
    this.id = id;

    /** @private {!Document|!ShadowRoot} */
    this.rootNode_ = rootNode;

    /** @private {function(!Array<!HTMLElement>):!TwoStepsResponse} */
    this.resolveUnknownLinks_ = resolveUnknownLinks;

    /** @private {string} */
    this.linkSelector_ = options.linkSelector || 'a';

    /** @private {number} */
    this.restoreDelay_ = 300; //ms

    /** @private {!./link-replacement-cache.LinkReplacementCache} */
    this.anchorReplacementCache_ = new LinkReplacementCache();
  }

  /**
   * Get the replacement url associated with the anchor.
   * @param {!HTMLElement} anchor
   * @return {?string}
   * @public
   */
  getReplacementUrl(anchor) {
    if (!this.isWatchingLink(anchor)) {
      return null;
    }

    return this.anchorReplacementCache_.getReplacementUrlForAnchor(anchor);
  }

  /**
   * Get the anchor to replacement url cache.
   * Useful to extract information for tracking purposes.
   * @return {!AnchorReplacementList}
   * @public
   */
  getAnchorReplacementList() {
    return this.anchorReplacementCache_.getAnchorReplacementList();
  }

  /**
   * Returns True if the LinkRewriter instance is supposed to handle
   * this particular anchor.
   * By default LinkRewriter handles all the links on the page but
   * inclusion/exclusion rules can be created by using the "linkSelector"
   * option. When using this option all the links not matching the css selector
   * will be ignored and isWatchingLink(anchor) will return false.
   * @param {!HTMLElement} anchor
   * @return {boolean}
   * @public
   */
  isWatchingLink(anchor) {
    return this.anchorReplacementCache_.isInCache(anchor);
  }

  /**
   * This function is called when the user clicks on a link.
   * It swaps temporarly the href of an anchor by its associated
   * replacement url but only for the time needed by the browser
   * to handle the click on the anchor and navigate to the new url.
   * After 300ms, if the page is still open (target="_blank" scenario),
   * the link is restored to its initial value.
   * @param {!HTMLElement} anchor
   * @return {boolean} - 'true' if the linkRewriter has changed the url
   *  'false' otherwise.
   * @public
   */
  rewriteAnchorUrl(anchor) {
    const newUrl = this.getReplacementUrl(anchor);
    if (!newUrl || newUrl === anchor.href) {
      return false;
    }
    // Save so we can restore it.
    anchor.setAttribute(ORIGINAL_URL_ATTRIBUTE, anchor.href);
    anchor.href = newUrl;
    // Restore link to original after X ms.
    setTimeout(() => {
      anchor.href = anchor.getAttribute(ORIGINAL_URL_ATTRIBUTE);
      anchor.removeAttribute(ORIGINAL_URL_ATTRIBUTE);
    }, this.restoreDelay_);

    return true;
  }

  /**
   * Scan the page to find links and send "page_scanned" event when scan
   * is completed and we know the replacement url of all the links
   * currently in the DOM.
   * @return {!Promise}
   * @public
   */
  onDomUpdated() {
    return new Promise(resolve => {
      const task = () => {
        return this.scanLinksOnPage_().then(() => {
          this.events.fire({type: EVENTS.PAGE_SCANNED});
          resolve();
        });
      };
      const elementOrShadowRoot =
        /** @type {!Element|!ShadowRoot} */ (this.rootNode_.nodeType ==
        Node.DOCUMENT_NODE
          ? this.rootNode_.documentElement
          : this.rootNode_);
      chunk(elementOrShadowRoot, task, ChunkPriority.LOW);
    });
  }

  /**
   * Scan the page to find all the links on the page.
   * If new anchors are discovered, ask to the "resolveUnknownLinks"
   * function what is the replacement url for each anchor. The response
   * which can be synchronous, asynchronous or both at the same time will be
   * stored internally and used if a click on one of this anchor happens later.
   * @return {!Promise}
   * @private
   */
  scanLinksOnPage_() {
    const anchorList = this.getLinksInDOM_();
    // Get the list of new links.
    const unknownAnchors = this.getUnknownAnchors_(anchorList);
    // Delete anchors removed from the DOM so they can be garbage
    // collected.
    this.anchorReplacementCache_.updateLinkList(anchorList);

    //  Ask for the affiliate status of the new anchors.
    if (!unknownAnchors.length) {
      return Promise.resolve();
    }

    // Register all new anchors discovered as "unknown" status.
    // Note: Only anchors with a status will be considered in the click
    // handlers. (Other anchors are assumed to be the ones exluded by
    // linkSelector_)
    this.anchorReplacementCache_.updateReplacementUrls(
      unknownAnchors.map(anchor => ({anchor, replacementUrl: null}))
    );
    const twoStepsResponse = this.resolveUnknownLinks_(unknownAnchors);
    userAssert(
      twoStepsResponse instanceof TwoStepsResponse,
      'Invalid response from provided "resolveUnknownLinks" function.' +
        '"resolveUnknownLinks" should return an instance of TwoStepsResponse'
    );

    if (twoStepsResponse.syncResponse) {
      this.anchorReplacementCache_.updateReplacementUrls(
        twoStepsResponse.syncResponse
      );
    }
    // Anchors for which the status needs to be resolved asynchronously
    if (twoStepsResponse.asyncResponse) {
      return twoStepsResponse.asyncResponse.then(data => {
        this.anchorReplacementCache_.updateReplacementUrls(data);
      });
    }

    return Promise.resolve();
  }

  /**
   * Filter the list of anchors to returns only the ones
   * that were not in the page at the time of the last page scan.
   * @param {!Array<!HTMLElement>} anchorList
   * @private
   */
  getUnknownAnchors_(anchorList) {
    const unknownAnchors = [];
    anchorList.forEach(anchor => {
      // If link is not already in cache
      if (!this.isWatchingLink(anchor)) {
        unknownAnchors.push(anchor);
      }
    });

    return unknownAnchors;
  }

  /**
   * Get the list of anchors element in the page.
   * (Based on linkSelector option)
   * @return {!Array<!HTMLElement>}
   * @private
   */
  getLinksInDOM_() {
    const q = this.rootNode_.querySelectorAll(this.linkSelector_);
    return [].slice.call(q);
  }
}
