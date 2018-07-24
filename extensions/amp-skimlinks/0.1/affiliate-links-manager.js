import {AmpEvents} from '../../../src/amp-events';
import {user} from '../../../src/log';

// Should be affiliateStatus.AFFILIATE, affiliateStatus.IGNORE...
export const LINK_STATUS__AFFILIATE = 'affiliate';
export const LINK_STATUS__NON_AFFILIATE = 'non-affiliate';
export const LINK_STATUS__IGNORE_LINK = 'ignore';
export const LINK_STATUS__UNKNOWN = 'unknown';

export const events = {
  PAGE_ANALYSED: 'PAGE_ANALYSED',
  CLICK: 'CLICK',
};

/**
 * Manage which links can be affiliated and which one can't based on
 * 'resolveUnknownAnchors' response and swap the link on user click.
 */
export default class AffiliateLinksManager {
  constructor(ampDoc, resolveUnknownAnchors, options) {
    user().assert(typeof resolveUnknownAnchors === 'function', 'resolveUnknownLinks is required and should be a function.');
    options = options || {};
    this.resolveUnknownAnchors_ = resolveUnknownAnchors;
    this.restoreDelay_ = 300; //ms
    this.affiliateUnkown_ = true;

    // Keep tracks of the affiliate status of each anchor link.
    this.anchorMap_ = new Map();
    this.linkSelector_ = options.linkSelector;

    this.installGlobalEventListener_(ampDoc.getRootNode());

    this.listeners_ = {};
  }

  getAnchorAffiliateMap() {
    return this.anchorMap_;
  }

  onDomChanged_() {
    this.analyseLinksOnPage_().then(() => {
      this.triggerEvent_(events.PAGE_ANALYSED);
    });
  }

  installGlobalEventListener_(rootNode) {
    rootNode.addEventListener(AmpEvents.DOM_UPDATE,
        this.onDomChanged_.bind(this));
    rootNode.addEventListener(AmpEvents.ANCHOR_CLICK,
        this.clickHandler_.bind(this));
  }

  analyseLinksOnPage_() {
    const anchorList = this.getLinksInDOM_();
    this.removeDetachedAnchorsFromMap_(anchorList);

    // Get the list of new links.
    const unknownAnchors = this.getNewAnchors_(anchorList);
    // Mark all new anchors discovered to the default unknown.
    // Note: Only anchors with a status will be considered in the click handlers.
    // (Other anchors are assumed to be the ones exluded by linkSelector_)
    this.updateAnchorMap_(unknownAnchors.map(anchor => {
      return {anchor, status: LINK_STATUS__UNKNOWN};
    }));

    //  Ask for the affiliate status of the new anchors.
    if (unknownAnchors.length) {
      const resolvedData = this.resolveUnknownAnchors_(unknownAnchors);

      // Anchors for which the status could be resolved synchronously
      if (resolvedData.resolvedLinks) {
        this.updateAnchorMap_(resolvedData.resolvedLinks);
      }

      // Anchors for which the status needs to be resolved asynchronously
      if (resolvedData.resolvedLinksPromise) {
        return resolvedData.resolvedLinksPromise.then(resolvedLinks => {
          this.updateAnchorMap_(resolvedLinks);
        });
      }
    }

    return Promise.resolve();

  }

  triggerEvent_(eventName, data) {
    const handlers = this.listeners_[eventName]
    if (!handlers) {
      return;
    }

    handlers.forEach(handler => {
      handler(data);
    });
  }

  listen(eventName, callback) {
    if (this.listeners_[eventName]) {
      this.listeners_[eventName].push(callback);
    } else {
      this.listeners_[eventName] = [callback];
    }
  }

  removeDetachedAnchorsFromMap_(anchorList) {
    this.anchorMap_.forEach((value, anchor) => {
      // Delete if anchor is not in the DOM anymore so it can
      // be garbage collected.
      if (anchorList.indexOf(anchor) === -1) {
        this.anchorMap_.delete(anchor);
      }
    });
  }

  getNewAnchors_(anchorList) {
    const unknownAnchors = [];
    anchorList.forEach(anchor => {
      if (!this.anchorMap_.has(anchor)) {
        unknownAnchors.push(anchor);
      }
    });

    return unknownAnchors;
  }

  updateAnchorMap_(resolvedLinksObjList) {
    resolvedLinksObjList.forEach(resolvedLinkObj => {
      this.anchorMap_.set(resolvedLinkObj.anchor, resolvedLinkObj.status);
    });
  }

  clickHandler_(customEvent) {
    const {clickActionType, anchor, clickEvent} = customEvent.detail;

    if (clickActionType !== 'navigate-outbound' && clickActionType !== 'open-context-menu') {
      return;
    }

    const linkState = this.anchorMap_.get(anchor);
    const isAffiliate = linkState === LINK_STATUS__AFFILIATE ||
          (linkState === LINK_STATUS__UNKNOWN && this.affiliateUnkown_);
    if (isAffiliate) {
      this.handleAffiliateClick_(anchor);
    }

    this.triggerEvent_(events.CLICK, {anchor, linkStatus: linkState});
    clickEvent.preventDefault();
    console.log('Received click', anchor, linkState);
  }

  handleAffiliateClick_(anchor) {
    const initialHref = anchor.href;
    anchor.href = `https://go.redirectingat.com?id=68019X1559797&url=${initialHref}`;
    setTimeout(() => {
      anchor.href = initialHref;
    }, this.restoreDelay_);
  }

  getLinksInDOM_() {
    return [].slice.call(document.querySelectorAll(this.linkSelector_ || 'a'));
  }
}
