import {user} from '../../log';

import {EVENTS, ORIGINAL_URL_ATTRIBUTE} from './constants';
import {EventMessenger} from './event-messenger';
import {createAnchorReplacementTuple, isAnchorReplacementTuple, isTwoStepsResponse} from './link-rewrite-helpers';

/**
 * LinkRewriter works conjointly with LinkRewriterService to allow rewriting
 * links at runtime. E.g: Replacing a link by its affiliate version only if
 * the link can be monetised. A page can have multiple LinkRewriter running
 * at the same time.
 *
 * LinkRewriter class is in charge of:
 * - Scanning the page to find links based on an optional css selector.
 * - Asking the "resolveUnknownLinks" function which links can be replaced.
 * - Keeping track of the replacement link of each link on the page.
 * - Swapping the anchor url to its replacement url when instructed
 *  by the LinkRewriterService.
 */
export class LinkRewriter {
  /**.
   * @param {Document} iframeDoc
   * @param {string} id
   * @param {Function} resolveUnknownLinks
   * @param {Object=} options
   */
  constructor(iframeDoc, id, resolveUnknownLinks, options) {
    /** @public {!./event-messenger.EventMessenger} */
    this.events = new EventMessenger();

    /** @public {string} */
    this.id = id;

    /** @private {Document} */
    this.iframeDoc_ = iframeDoc;


    /** @private {Function} */
    this.resolveUnknownLinks_ = resolveUnknownLinks;

    /** @private {string} */
    this.linkSelector_ = options.linkSelector;

    /** @private {number} */
    this.restoreDelay_ = 300; //ms


    /** @private */
    this.anchorReplacementMap_ = new Map();
  }

  /**
   * @public
   * Get the replacement url associated with the anchor.
   * @param {?HTMLElement} anchor
   * @return {?string}
   */
  getReplacementUrl(anchor) {
    if (!this.isWatchingLink(anchor)) {
      return null;
    }

    return this.anchorReplacementMap_.get(anchor);
  }

  /**
   * @public
   * Get the anchor to replacement url Map
   * @return {Map}
   */
  getAnchorLinkReplacementMap() {
    return this.anchorReplacementMap_;
  }

  /**
   * @public
   * Returns True if the LinkRewriter instance is supposed to handle
   * this particular anchor.
   * By default LinkRewriter handles all the links on the page but
   * inclusion/exclusion rules can be created by using the "linkSelector"
   * option. When using this option all the links not matching the css selector
   * will be ignored and isWatchingLink(anchor) will return false.
   * @param {?HTMLElement} anchor
   * @return {boolean}
   */
  isWatchingLink(anchor) {
    return this.anchorReplacementMap_.has(anchor);
  }

  /**
   * @public
   * This function is called when the user clicks on a link.
   * It swaps temporarly the href of an anchor by its associated
   * replacement url but only for the time needed by the browser
   * to handle the click on the anchor and navigate to to the new url.
   * After 300ms, if the page is still open (target="_blank" scenario),
   * the link is restored to its initial value.
   * @param {?HTMLElement} anchor
   * @return {boolean} - 'true' if the linkRewriter has changed the url
   *  'false' otherwise.
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
   * @public
   * Scan the page to find links and send "page_scanned" event when scan
   * is completed and we know the replacement url of all the links
   * currently in the DOM.
   * @return {Promise}
   */
  onDomUpdated() {
    return this.scanLinksOnPage_().then(() => {
      this.events.send(EVENTS.PAGE_SCANNED);
    });
  }

  /**
   * @private
   * Scan the page to find all the links on the page.
   * If new anchors are discovered, ask to the "resolveUnknownLinks"
   * function what is the replacement url for each anchor. The response which can
   * be synchronous, asynchronous or both at the same time will be stored
   * internally and used if a click on one of this anchor happens later.
   * @return {Promise}
   */
  scanLinksOnPage_() {
    const anchorList = this.getLinksInDOM_();
    this.removeDetachedAnchorsFromMap_(anchorList);

    // Get the list of new links.
    const unknownAnchors = this.getUnknownAnchors_(anchorList);

    //  Ask for the affiliate status of the new anchors.
    if (!unknownAnchors.length) {
      return Promise.resolve();
    }

    // Mark all new anchors discovered to the default unknown.
    // Note: Only anchors with a status will be considered in the click handlers.
    // (Other anchors are assumed to be the ones exluded by linkSelector_)
    const unknownAnchorsTuples = unknownAnchors.map(anchor => {
      return createAnchorReplacementTuple(anchor, undefined);
    });

    this.updateAnchorMap_(unknownAnchorsTuples);
    const twoStepsResponse = this.resolveUnknownLinks_(unknownAnchors);
    user().assert(isTwoStepsResponse(twoStepsResponse),
        'Invalid response from provided resolveUnknownLinks, use the return value of createTwoStepsResponse(syncResponse, asyncResponse)');

    if (twoStepsResponse.syncResponse) {
      this.updateAnchorMap_(twoStepsResponse.syncResponse);
    }
    // Anchors for which the status needs to be resolved asynchronously
    if (twoStepsResponse.asyncResponse) {
      return twoStepsResponse.asyncResponse.then(this.updateAnchorMap_.bind(this));
    }

    return Promise.resolve();
  }

  /**
   * @private
   * Filter the list of anchors to returns only the ones
   * that were not in the page at the time of the last page scan.
   * @param {*} anchorList
   */
  getUnknownAnchors_(anchorList) {
    const unknownAnchors = [];
    anchorList.forEach(anchor => {
      if (!this.isWatchingLink(anchor)) {
        unknownAnchors.push(anchor);
      }
    });

    return unknownAnchors;
  }

  /**
   * @private
   * Update the state of the internal Anchor to replacement url Map.
   * @param {*} anchorReplacementTupleList
   */
  updateAnchorMap_(anchorReplacementTupleList) {
    anchorReplacementTupleList.forEach(replacementTuple => {
      user().assert(isAnchorReplacementTuple(replacementTuple),
          'Expected anchorReplacementTuple, use "createAnchorReplacementTuple()"'
      );
      this.anchorReplacementMap_.set(replacementTuple[0], replacementTuple[1]);
    });
  }

  /**
   * @private
   * Remove from the internal anchor Map the links that are no longer in the page.
   * @param {Array<HTMLElement>} anchorList - The list of links in the page.
   */
  removeDetachedAnchorsFromMap_(anchorList) {
    this.anchorReplacementMap_.forEach((value, anchor) => {
      // Delete if anchor is not in the DOM anymore so it can
      // be garbage collected.
      if (anchorList.indexOf(anchor) === -1) {
        this.anchorReplacementMap_.delete(anchor);
      }
    });
  }

  /**
   * @private
   * Get the list of anchors element in the page.
   * (Based on linkSelector option)
   * @return {Array<HTMLElement>}
   */
  getLinksInDOM_() {
    const q = this.iframeDoc_.querySelectorAll(this.linkSelector_ || 'a');
    return [].slice.call(q);
  }
}
