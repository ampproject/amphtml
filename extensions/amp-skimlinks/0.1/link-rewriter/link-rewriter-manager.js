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

import {AmpEvents} from '../../../../src/amp-events';
import {EVENTS, PRIORITY_META_TAG_NAME} from './constants';
import {LinkRewriter} from './link-rewriter';
import {Priority} from '../../../../src/service/navigation';
import {Services} from '../../../../src/services';

/**
 * LinkRewriterManager works together with LinkRewriter to allow rewriting
 * links at click time. E.g: Replacing a link by its affiliate version only if
 * the link can be monetised.
 *
 * A page can have multiple LinkRewriter running at the same time but only one
 * LinkRewriterManager instance.
 *
 * LinkRewriterManager class is in charge of:
 * - Keeping track of all the registered linkRewriters.
 *
 * - Notifying all the link rewriters when the DOM has changed (potential new
 *   links on the page that LinkRewriters need to resolve ahead of the click).
 *
 * - Managing which LinkRewriter has the priority to replace a link
 *   (based on configurable priority list).
 *
 * - Watching for anchor clicks and allowing the top priority LinkRewriter to
 *   execute a potential "href" replacement. At the moment, only one
 *   LinkRewriter can mutate the link. If the top priority LinkRewriter decides
 *   to not replace the link, the second top priority LinkRewriter will be
 *   given a chance. The iteration continues until one LinkRewriter mutates the
 *   link or we reach the end of the list.
 *
 * - Sending a click event to listeners to be able to track the click
 *   even if the url has not been replaced. (No anchor mutation is allowed
 *   in the listener handler).
 */
export class LinkRewriterManager {
  /**
   * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /**
     * Use getRootNode() to support "shadow AMP" mode where the rootNode is not
     * necessarily the page document.
     * See https://www.ampproject.org/docs/integration/pwa-amp/amp-in-pwa
     * @private {!Document|!ShadowRoot}
     */
    this.rootNode_ = ampdoc.getRootNode();

    /**
     * List of link rewriter Id in priority order as defined
     * in the PRIORITY_META_TAG_NAME meta tag.
     * First element has the highest priority.
     * @private {!Array<string>}
     */
    this.priorityList_ = this.getPriorityList_(ampdoc);

    /**
     * @private {!Array<./link-rewriter.LinkRewriter>}
     * The list of all the LinkRewriter instances registered
     * in the page.
     */
    this.linkRewriters_ = [];

    this.installGlobalEventListener_(this.rootNode_);
    const navigation = Services.navigationForDoc(ampdoc);
    navigation.registerAnchorMutator(
      this.maybeRewriteLink.bind(this),
      Priority.LINK_REWRITER_MANAGER
    );
  }

  /**
   * Create and configure a new LinkRewriter on the page.
   * @param {string} linkRewriterId - A unique id used to identify the link rewriter.
   * @param {!function(!Array<!HTMLElement>): !./two-steps-response.TwoStepsResponse} resolveUnknownLinks
   *   - Function to determine which anchor should be replaced and by what URL.
   *     Should return an instance of './two-steps-response.TwoStepsResponse'.
   * @param {?{linkSelector: string}=} options
   *   - linkSelector is an optional CSS selector to restrict
   *    which anchors the link rewriter should handle.
   *    Anchors not matching the CSS selector will be ignored.
   *    If not provided the link rewrite will handle all the links
   *    found on the page.
   *
   * @return {!./link-rewriter.LinkRewriter}
   * @public
   */
  registerLinkRewriter(linkRewriterId, resolveUnknownLinks, options) {
    const linkRewriter = new LinkRewriter(
      this.rootNode_,
      linkRewriterId,
      resolveUnknownLinks,
      options
    );
    this.insertInListBasedOnPriority_(
      this.linkRewriters_,
      linkRewriter,
      this.priorityList_
    );
    // Trigger initial scan.
    linkRewriter.onDomUpdated();

    return linkRewriter;
  }

  /**
   * Notify the LinkRewriteService that a click has happened on an anchor.
   * This is the chance for one of the registered LinkRewriter to rewrite the
   * url before the browser handles the click and navigates to the link url.
   *
   * The LinkRewriter allowed to replace the url will be chosen based on the
   * defined priority order (in link attribute or global meta tag).
   * If a LinkRewriter decides to not replace the url,  we will ask the next
   * one if it wants to replace the link until one replacement is made.
   *
   * A "CLICK" event will also be dispatched to notify listeners that a click
   * on an anchor has happened. This should mostly be used to send click
   * tracking requests, handlers of this events should not
   * mutate the anchor!
   * @param {!Element} anchor
   * @param {!Event} event - 'click' or 'contextmenu' event.
   * @public
   */
  maybeRewriteLink(anchor, event) {
    const suitableLinkRewriters = this.getSuitableLinkRewritersForLink_(
      /** @type {!HTMLElement} */ (anchor)
    );
    if (suitableLinkRewriters.length) {
      let chosenLinkRewriter = null;

      // Iterate by order of priority until one of the linkRewriter
      // replaces the link.
      for (let i = 0; i < suitableLinkRewriters.length; i++) {
        const hasReplaced = suitableLinkRewriters[i].rewriteAnchorUrl(
          /** @type {!HTMLElement} */ (anchor)
        );
        if (hasReplaced) {
          chosenLinkRewriter = suitableLinkRewriters[i];
          break;
        }
      }
      const linkRewriterId = chosenLinkRewriter ? chosenLinkRewriter.id : null;

      // Emit click event for analytics purposes only,
      // anchor should not me mutated by handlers.
      const eventData = {
        linkRewriterId,
        anchor,
        clickType: event.type,
      };

      suitableLinkRewriters.forEach(linkRewriter => {
        const event = {
          type: EVENTS.CLICK,
          eventData,
        };

        linkRewriter.events.fire(event);
      });
    }
  }

  /**
   * Extract the priority list from the optional html meta tag.
   * The meta tag should contain a whitespace separated list of
   * LinkRewriter Ids.
   * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Array<string>}
   * @private
   */
  getPriorityList_(ampdoc) {
    const docInfo = Services.documentInfoForDoc(ampdoc);
    const value = docInfo.metaTags[PRIORITY_META_TAG_NAME];

    return value ? value.trim().split(/\s+/) : [];
  }

  /**
   * Listen for DOM_UPDATE event.
   * @param {!Document|!ShadowRoot} rootNode
   * @private
   */
  installGlobalEventListener_(rootNode) {
    rootNode.addEventListener(
      AmpEvents.DOM_UPDATE,
      this.onDomChanged_.bind(this)
    );
  }

  /**
   * Notify all the registered LinkRewriter when new elements have been added
   * to the page so they can re-scan the page to find potential new links to
   * replace.
   * @private
   */
  onDomChanged_() {
    this.linkRewriters_.forEach(linkRewriter => {
      linkRewriter.onDomUpdated();
    });
  }

  /**
   * Extract the optional priority list for this specific anchor
   * from its attribute. The 'data-link-rewriters' attribute should
   * contain a whitespace separated list of LinkRewriter Ids.
   * @param {!HTMLElement} anchor
   * @return {!Array<string>}
   * @private
   */
  parseLinkRewriterPriorityForAnchor_(anchor) {
    const dataValue = anchor.hasAttribute('data-link-rewriters')
      ? anchor.getAttribute('data-link-rewriters').trim()
      : null;
    if (!dataValue) {
      return [];
    }

    return dataValue.split(/\s+/);
  }

  /**
   * Mutate linkRewriterList to insert a new LinkRewriter in the list
   * while keeping the list in order of priority as defined by the
   * idPriorityList.
   * @param {!Array<./link-rewriter.LinkRewriter>} linkRewriterList
   * @param {!./link-rewriter.LinkRewriter} linkRewriter
   * @param {!Array<string>} idPriorityList
   * @return {!Array<./link-rewriter.LinkRewriter>} - Mutated linkRewriterList param.
   * @private
   */
  insertInListBasedOnPriority_(linkRewriterList, linkRewriter, idPriorityList) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description
    const B_HAS_PRIORITY = 1;
    const A_HAS_PRIORITY = -1;
    const compareFunction = (linkRewriterA, linkRewriterB) => {
      const indexA = idPriorityList.indexOf(linkRewriterA.id);
      const indexB = idPriorityList.indexOf(linkRewriterB.id);

      if (indexA === -1 && indexB === -1) {
        return 0; // Nothing to changes
      }
      // A is not in the priority list, give it the lowest priority.
      if (indexA === -1) {
        return B_HAS_PRIORITY;
      }
      // B is not in the priority list, give it the lowest priority.
      if (indexB === -1) {
        return A_HAS_PRIORITY;
      }

      // Higher index means lower priority.
      return indexA > indexB ? B_HAS_PRIORITY : A_HAS_PRIORITY;
    };

    linkRewriterList.push(linkRewriter);
    // Sort in place.
    linkRewriterList.sort(compareFunction);

    return linkRewriterList;
  }

  /**
   * Get the list of all the link rewriter "watching" a specific anchor.
   * See LinkRewriter.isWatchingLink for more details.
   * @param {!HTMLElement} anchor
   * @return {!Array<./link-rewriter.LinkRewriter>}
   * @private
   */
  getSuitableLinkRewritersForLink_(anchor) {
    const linkPriorityList = this.parseLinkRewriterPriorityForAnchor_(anchor);
    return this.linkRewriters_.reduce((acc, linkRewriter) => {
      if (linkRewriter.isWatchingLink(anchor)) {
        this.insertInListBasedOnPriority_(acc, linkRewriter, linkPriorityList);
      }

      return acc;
    }, []);
  }
}
