import {AmpEvents} from '../../../src/amp-events';
import { user } from '../../../src/log';

export const events = {
  PAGE_SCANNED: 'PAGE_SCANNED',
  CLICK: 'CLICK',
};

const ALLOWED_CLICK_ACTION_TYPES = ['navigate-outbound', 'open-context-menu'];
const ORIGINAL_URL_ATTRIBUTE = 'data-link-rewriter-original-url';


export default class LinkRewriterService {
  constructor(ampDoc) {
    const options = options || {};
    this.installGlobalEventListener_(ampDoc.getRootNode());
    this.linkRewriters_ = [];
  }

  registerLinkRewriter(element, name, resolveUnknownLinks, options) {
    // TODO Check priority attribute in element.
    const priority = null;
    const linkRewriter = new LinkRewriter(name, resolveUnknownLinks, options);
    if (priority) {
      this.linkRewriters_.splice(priority - 1, 0, linkRewriter);
    } else {
      this.linkRewriters_.push(linkRewriter);
    }

    return linkRewriter;
  }

  installGlobalEventListener_(rootNode) {
    rootNode.addEventListener(AmpEvents.DOM_UPDATE,
        this.onDomChanged_.bind(this));
    rootNode.addEventListener(AmpEvents.ANCHOR_CLICK,
        this.clickHandler_.bind(this));
  }

  onDomChanged_() {
    this.linkRewriters_.forEach(linkRewriter => {
      linkRewriter.onDomUpdated();
    });
  }

  clickHandler_(customEvent) {
    const {clickActionType, anchor, clickEvent} = customEvent.detail;

    if (!ALLOWED_CLICK_ACTION_TYPES.includes(clickActionType)) {
      return;
    }
    const suitableLinkRewriters = this.getSuitableLinkRewritersForLink_(anchor);
    const chosenLinkRewriter = this.getBestLinkRewriterForLink_(anchor, suitableLinkRewriters);
    let hasReplaced = false;
    if (chosenLinkRewriter) {
      hasReplaced = chosenLinkRewriter.rewriteAnchorUrl(anchor);
    }

    suitableLinkRewriters.forEach(linkRewriter => {
      const data = {anchor, replacedBy: linkRewriter.name, hasReplaced};
      linkRewriter.events.dispatch(events.CLICK, data);
    });

    clickEvent.preventDefault();
    console.log('Received click', anchor.href);
  }

  findLinkRewriterByName_(maybeLinkRewriters, name) {
    if (!name) {
      return null;
    }

    maybeLinkRewriters.forEach(linkRewriter => {
      if (linkRewriter.name === name) {
        return linkRewriter;
      }
    });

    return null;
  }

  getBestLinkRewriterForLink_(anchor, suitableLinkRewriters) {
    if (!suitableLinkRewriters.length) {
      return;
    }
    const linkRewriter = this.findLinkRewriterByName_(
        suitableLinkRewriters,
        anchor.dataset.linkRewriter
    );

    // Was a particular link rewriter specified,
    // if not take the one with highest priority
    return linkRewriter ? linkRewriter : suitableLinkRewriters[0];
  }

  getSuitableLinkRewritersForLink_(anchor) {
    return this.linkRewriters_.reduce((acc, linkRewriter) => {
      if (linkRewriter.isWatchingLink(anchor)) {
        acc.push(linkRewriter);
      }

      return acc;
    }, []);
  }
}

class LinkRewriter {
  constructor(name, resolveUnknownLinks, options) {
    this.name = name;
    this.askAnchorRewriteStatus_ = resolveUnknownLinks;
    this.linkSelector = options.linkSelector;
    this.anchorReplacementMap_ = new Map();
    this.restoreDelay_ = 300; //ms
    this.events = new LinkRewriterEvents();
    window.debugMap = this.anchorReplacementMap_;
  }

  getReplacementUrl(anchor) {
    if (!this.isWatchingLink(anchor)) {
      return null;
    }

    return this.anchorReplacementMap_.get(anchor).replacementUrl;
  }

  getAnchorLinkReplacementMap() {
    return this.anchorReplacementMap_;
  }

  isWatchingLink(anchor) {
    return this.anchorReplacementMap_.has(anchor);
  }

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

  onDomUpdated() {
    this.scanLinksOnPage_().then(() => {
      this.events.dispatch(events.PAGE_SCANNED);
    });
  }

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
        return new AnchorRewriteData(anchor);
      }));
      const response = this.askAnchorRewriteStatus_(unknownAnchors);
      user().assert(
          response instanceof AnchorRewriteDataResponse,
          // TODO: add link to readme
          '"resolveUnknownAnchors" returned value should be an instance of AnchorRewriteDataResponse',
      );
      // Anchors for which the status can be resolved synchronously
      if (response.syncData) {
        this.updateAnchorMap_(response.syncData);
      }

      // Anchors for which the status needs to be resolved asynchronously
      if (response.asyncData) {
        return response.asyncData.then(this.updateAnchorMap_.bind(this));
      }
    }

    return Promise.resolve();
  }

  getNewAnchors_(anchorList) {
    const unknownAnchors = [];
    anchorList.forEach(anchor => {
      if (!this.anchorReplacementMap_.has(anchor)) {
        unknownAnchors.push(anchor);
      }
    });

    return unknownAnchors;
  }

  updateAnchorMap_(anchorRewriteDataList) {
    anchorRewriteDataList.forEach(anchorRewriteData => {
      user().assert(anchorRewriteData instanceof AnchorRewriteData,
          'Expected instance of "AnchorRewriteData"'
      );
      this.anchorReplacementMap_.set(anchorRewriteData.anchor, anchorRewriteData);
    });
  }

  removeDetachedAnchorsFromMap_(anchorList) {
    this.anchorReplacementMap_.forEach((value, anchor) => {
      // Delete if anchor is not in the DOM anymore so it can
      // be garbage collected.
      if (anchorList.indexOf(anchor) === -1) {
        this.anchorReplacementMap_.delete(anchor);
      }
    });
  }

  getLinksInDOM_() {
    return [].slice.call(document.querySelectorAll(this.linkSelector_ || 'a'));
  }
}


export class AnchorRewriteData {
  constructor(anchor, newUrl, metaData) {
    this.anchor = anchor;
    this.initialUrl = anchor.href;
    this.metaData = metaData || {};
    this.replacementUrl = newUrl || null;
  }
}


export class AnchorRewriteDataResponse {
  constructor(anchorRewriteStatusList, asyncPromise) {
    if (asyncPromise) {
      user().assert(asyncPromise instanceof Promise,
          'AnchorRewriteStatusResponse(), if provider, second argument needs to be a promise');
    }

    this.syncData = anchorRewriteStatusList;
    this.asyncData = asyncPromise;
  }
}

class LinkRewriterEvents {
  constructor() {
    this.listeners_ = [];
  }

  dispatch(eventName, data) {
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
}