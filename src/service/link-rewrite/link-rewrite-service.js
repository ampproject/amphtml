import {ALLOWED_CLICK_ACTION_TYPES, EVENTS} from './constants';
import {AmpEvents} from '../../amp-events';

import LinkRewriter from './link-rewriter';

export default class LinkRewriterService {
  /**
   *
   * @param {*} ampDoc
   */
  constructor(ampDoc) {
    const options = options || {};
    this.installGlobalEventListener_(ampDoc.getRootNode());
    this.linkRewriters_ = [];
  }

  /**
   * Register a new link rewriter on the page.
   * @param {*} element
   * @param {*} name
   * @param {*} resolveUnknownLinks
   * @param {*} options
   */
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

  /**
   * Add DOM_UPDATE AND ANCHOR_CLICK listener.
   * @param {*} rootNode
   */
  installGlobalEventListener_(rootNode) {
    rootNode.addEventListener(AmpEvents.DOM_UPDATE,
        this.onDomChanged_.bind(this));
    rootNode.addEventListener(AmpEvents.ANCHOR_CLICK,
        this.clickHandler_.bind(this));
  }

  /**
   * Notify all the rewriter when new elements have been added to the page.
   */
  onDomChanged_() {
    this.linkRewriters_.forEach(linkRewriter => {
      linkRewriter.onDomUpdated();
    });
  }

  /**
   * Call the most appropriate link rewriter when the user clicks on an anchor element.
   * @param {*} customEvent
   */
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
      const data = { anchor, replacedBy: linkRewriter.name, hasReplaced };
      linkRewriter.events.send(EVENTS.CLICK, data);
    });

    clickEvent.preventDefault();
    console.log('Received click', anchor.href);
  }

  /**
   * Find a registered link rewriter from its name.
   * @param {*} maybeLinkRewriters
   * @param {*} name
   */
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

  /**
   * Find the link rewriter that has the highest priority for a specific anchor.
   * @param {*} anchor
   * @param {*} suitableLinkRewriters
   */
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

  /**
   * Get the list of all the link rewriter watching a specific anchor.
   * @param {*} anchor
   */
  getSuitableLinkRewritersForLink_(anchor) {
    return this.linkRewriters_.reduce((acc, linkRewriter) => {
      if (linkRewriter.isWatchingLink(anchor)) {
        acc.push(linkRewriter);
      }

      return acc;
    }, []);
  }
}