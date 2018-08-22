import {user} from '../../log';

import {EVENTS, ORIGINAL_URL_ATTRIBUTE} from './constants';
import {createAnchorReplacementTuple, isAnchorReplacementTuple, isTwoStepsResponse} from './link-rewrite-helpers';
import EventMessenger from './event-messenger';


export default class LinkRewriter {
  /**
   * Create a new linkRewriter instance you can then register to the LinkRewriteService.
   * @param {*} iframeDoc
   * @param {*} name
   * @param {*} resolveUnknownLinks
   * @param {*} options
   */
  constructor(iframeDoc, name, resolveUnknownLinks, options) {
    this.name = name;
    this.iframeDoc_ = iframeDoc;
    this.resolveUnknownLinks_ = resolveUnknownLinks;
    this.linkSelector_ = options.linkSelector;
    this.restoreDelay_ = 300; //ms
    this.events = new EventMessenger();
    this.reset();
  }

  /**
   *
   */
  reset() {
    this.anchorReplacementMap_ = new Map();
  }

  /**
   * Get the replacement url for a specific anchor.
   * @param {HTMLElement} anchor
   * @return {string}
   */
  getReplacementUrl(anchor) {
    if (!this.isWatchingLink(anchor)) {
      return null;
    }

    return this.anchorReplacementMap_.get(anchor);
  }

  /**
   * Get the anchor to replacement url Map
   * @return {Map}
   */
  getAnchorLinkReplacementMap() {
    return this.anchorReplacementMap_;
  }

  /**
   * Returns True if the link is not excluded by the linkSelector option.
   * @param {*} anchor
   */
  isWatchingLink(anchor) {
    return this.anchorReplacementMap_.has(anchor);
  }

  /**
   * Swap temporarly the href of an anchor by the associated replacement url.
   * @param {*} anchor
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
   * Scan the page to find links and send events when scan is complete.
   */
  onDomUpdated() {
    return this.scanLinksOnPage_().then(() => {
      this.events.send(EVENTS.PAGE_SCANNED);
    });
  }

  /**
   * Find all the anchors in the page (based on linkSelector option) and
   */
  scanLinksOnPage_() {
    const anchorList = this.getLinksInDOM_();
    this.removeDetachedAnchorsFromMap_(anchorList);

    // Get the list of new links.
    const unknownAnchors = this.getNewAnchors_(anchorList);

    //  Ask for the affiliate status of the new anchors.
    if (unknownAnchors.length) {
      // Mark all new anchors discovered to the default unknown.
      // Note: Only anchors with a status will be considered in the click handlers.
      // (Other anchors are assumed to be the ones exluded by linkSelector_)
      this.updateAnchorMap_(unknownAnchors.map(anchor => {
        return createAnchorReplacementTuple(anchor);
      }));
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
    }

    return Promise.resolve();
  }

  /**
   * Filter the list of anchors to returns only the ones
   * that were not in the page at the time of the last page scan.
   * @param {*} anchorList
   */
  getNewAnchors_(anchorList) {
    const unknownAnchors = [];
    anchorList.forEach(anchor => {
      if (!this.isWatchingLink(anchor)) {
        unknownAnchors.push(anchor);
      }
    });

    return unknownAnchors;
  }

  /**
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
   * Remove from the internal anchor Map the links that are no longer in the page.
   * @param {*} anchorList - The list of links in the page.
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
   * Get the list of anchors element in the page.
   * (Based on linkSelector option)
   */
  getLinksInDOM_() {
    return [].slice.call(this.iframeDoc_.querySelectorAll(this.linkSelector_ || 'a'));
  }
}
