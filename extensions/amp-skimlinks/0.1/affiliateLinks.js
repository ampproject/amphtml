import {AmpEvents} from '../../../src/amp-events';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';


export const LINK_STATUS__AFFILIATE = 'affiliate';
export const LINK_STATUS__NON_AFFILIATE = 'non-affiliate';
export const LINK_STATUS__IGNORE_LINK = 'ignore';
export const LINK_STATUS__UNKNOWN = 'unkonwn';

export default class AffiliateLinks {
  constructor(ampDoc, resolveUnknownLinks, getLinkAffiliateStatus, options) {
    user().assert(typeof resolveUnknownLinks === 'function', 'resolveUnknownLinks is required and should be a function.');
    user().assert(typeof getLinkAffiliateStatus === 'function', 'getLinkAffiliateStatus is required and should be a function.');
    options = options || {};

    this.resolveUnknownLinks_ = resolveUnknownLinks;
    this.getLinkAffiliateStatus_ = getLinkAffiliateStatus;
    this.linkMap_ = new Map();
    this.ampDoc_ = ampDoc;

    this.urlReplacement_ = Services.urlReplacementsForDoc(ampDoc);

    this.onAffiliate_ = options.onAffiliatedClick;
    this.onNonAffiliate_ = options.onNonAffiliate;
    this.linkSelector_ = options.linkSelector;

    this.installGlobalEventListener_(ampDoc.getRootNode());
    this.reset();
  }

  installGlobalEventListener_(rootNode) {
    rootNode.addEventListener(AmpEvents.DOM_UPDATE, this.onDomChanged.bind(this));
    rootNode.addEventListener(AmpEvents.ANCHOR_CLICK, this.clickHandler_.bind(this));
  }

  onDomChanged() {
    console.log("ON DOM CHANGED");
    // this.reset();
  }


  reset() {
    this.linkMap_.clear();
    const links = this.getLinksInDOM_();
    // Resolve status of links with an already known domain
    const unknownLinks = this.updateLinkMap_(links);

    // If there are some unresolved links, ask beacon.
    if (unknownLinks.length) {
      this.resolveUnknownLinks_(unknownLinks).then(() => {
        const stillUnknown = this.updateLinkMap_(unknownLinks);
        dev().assert(stillUnknown.length === 0, 'Some links are still unknown after calling resolveUnknownLinks(), check your implementation of the function.');
      });
    }
  }

  updateLinkMap_(links) {
    const unknownLinks = [];

    links.forEach(link => {
      const status = this.getLinkAffiliateStatus_(link);
      this.linkMap_.set(link, {
        status,
      });

      if (status === LINK_STATUS__UNKNOWN) {
        unknownLinks.push(link);
      }
    });

    return unknownLinks;
  }

  clickHandler_(customEvent) {
    const {clickActionType, anchor} = customEvent.detail;

    if (clickActionType !== 'navigate-outbound' && clickActionType !== 'open-context-menu') {
      return;
    }

    const linkState = this.linkMap_.get(anchor);
    if (linkState && linkState.status === LINK_STATUS__AFFILIATE) {
      const initialHref = anchor.href;
      anchor.href = `https://go.redirectingat.com?id=68019X1559797&url=${initialHref}`;
    }

    console.log('Received click', anchor, linkState);
  }

  getLinksInDOM_() {
    return document.querySelectorAll(this.linkSelector_ || 'a');
  }
}
