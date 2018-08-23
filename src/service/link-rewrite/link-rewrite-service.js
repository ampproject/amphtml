import {AmpEvents} from '../../amp-events';
import {EVENTS, PRIORITY_META_TAG_NAME} from './constants';
import {Services} from '../../services';

import LinkRewriter from './link-rewriter';

export default class LinkRewriterService {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    this.priorityList_ = [];
    this.iframeDoc_ = ampdoc.getRootNode();
    this.priorityList_ = this.getPriorityList_(ampdoc);

    this.installGlobalEventListener_(this.iframeDoc_);
    this.linkRewriters_ = [];
  }

  /**
   * @param {*} ampdoc
   */
  getPriorityList_(ampdoc) {
    const docInfo = Services.documentInfoForDoc(ampdoc);
    const value = docInfo.metaTags[PRIORITY_META_TAG_NAME];

    return value ? value.trim().split(/\s+/) : [];
  }

  /**
   * Register a new link rewriter on the page.
   * @param {*} linkRewriterId
   * @param {*} resolveUnknownLinks
   * @param {*} options
   */
  registerLinkRewriter(linkRewriterId, resolveUnknownLinks, options) {
    const linkRewriter = new LinkRewriter(this.iframeDoc_, linkRewriterId, resolveUnknownLinks, options);
    this.insertInListBasedOnPriority_(this.linkRewriters_, linkRewriter, this.priorityList_);
    // Trigger initial scan.
    linkRewriter.onDomUpdated();

    return linkRewriter;
  }

  /**
   * Add DOM_UPDATE AND ANCHOR_CLICK listener.
   * @param {*} iframeDoc
   */
  installGlobalEventListener_(iframeDoc) {
    iframeDoc.addEventListener(AmpEvents.DOM_UPDATE,
        this.onDomChanged_.bind(this));
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
   * @param {*} anchor -
   */
  maybeRewriteLink(anchor) {
    const suitableLinkRewriters = this.getSuitableLinkRewritersForLink_(anchor);
    if (suitableLinkRewriters.length) {
      let chosenLinkRewriter = null;

      // Iterate by order of priority until one of the linkRewriter replaces the link.
      for (let i = 0; i < suitableLinkRewriters.length; i++) {
        const hasReplaced = suitableLinkRewriters[i].rewriteAnchorUrl(anchor);
        if (hasReplaced) {
          chosenLinkRewriter = suitableLinkRewriters[i];
          break;
        }
      }
      const linkRewriterId = chosenLinkRewriter ? chosenLinkRewriter.id : null;

      // Emit click event for analytics purposes only,
      // anchor should not me mutated by handlers.
      suitableLinkRewriters.forEach(linkRewriter => {
        linkRewriter.events.send(EVENTS.CLICK, {linkRewriterId, anchor});
      });
    }
  }

  /**
   * @param {*} anchor
   */
  parseLinkRewriterPriorityForAnchor_(anchor) {
    if (!anchor || !anchor.dataset.linkRewriters) {
      return [];
    }

    return anchor.dataset.linkRewriters.trim().split(/\s+/);
  }

  /**
   *
   * @param {*} linkRewriterList
   * @param {*} linkRewriter
   * @param {*} priorityList
   */
  insertInListBasedOnPriority_(linkRewriterList, linkRewriter, priorityList) {
    const priorityIndex = priorityList.indexOf(linkRewriter.id);
    if (priorityIndex > -1) {
      linkRewriterList.splice(priorityIndex, 0, linkRewriter);
    } else {
      linkRewriterList.push(linkRewriter);
    }

    return linkRewriterList;
  }

  /**
   * Get the list of all the link rewriter watching a specific anchor.
   * @param {*} anchor
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
