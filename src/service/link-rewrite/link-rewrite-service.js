import {ALLOWED_CLICK_ACTION_TYPES, EVENTS, PRIORITY_META_TAG_NAME} from './constants';
import {AmpEvents} from '../../amp-events';

import LinkRewriter from './link-rewriter';

export default class LinkRewriterService {
  /**
   *
   * @param {*} rootNode - ampDoc.getRootNode()
   */
  constructor(iframeDoc) {
    this.priorityList_ = [];
    this.iframeDoc_ = iframeDoc;
    const metaTagSelector = `meta[name=${PRIORITY_META_TAG_NAME}]`;
    const meta = iframeDoc.querySelector(metaTagSelector);

    if (meta && meta.hasAttribute('content')) {
      this.priorityList_ = meta.getAttribute('content').trim().split(/\s+/);
    }

    this.installGlobalEventListener_(iframeDoc);
    this.linkRewriters_ = [];
  }

  /**
   * Register a new link rewriter on the page.
   * @param {*} name
   * @param {*} resolveUnknownLinks
   * @param {*} options
   */
  registerLinkRewriter(name, resolveUnknownLinks, options) {
    const linkRewriter = new LinkRewriter(this.iframeDoc_, name, resolveUnknownLinks, options);
    this.insertInListBasedOnPriority_(this.linkRewriters_, linkRewriter, this.priorityList_);

    return linkRewriter;
  }

  /**
   * Add DOM_UPDATE AND ANCHOR_CLICK listener.
   * @param {*} iframeDoc
   */
  installGlobalEventListener_(iframeDoc) {
    iframeDoc.addEventListener(AmpEvents.DOM_UPDATE,
        this.onDomChanged_.bind(this));
    iframeDoc.addEventListener(AmpEvents.ANCHOR_CLICK,
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
    const {clickActionType, anchor} = customEvent.detail;

    if (!ALLOWED_CLICK_ACTION_TYPES.includes(clickActionType)) {
      return;
    }
    const suitableLinkRewriters = this.getSuitableLinkRewritersForLink_(anchor);
    if (suitableLinkRewriters.length) {
      const orderedLinkRewriters = this.getLinkRewritersOrderByPriority_(suitableLinkRewriters, anchor);
      let chosenLinkRewriter = null;

      // Iterate by order of priority until one of the linkRewriter replaces the link.
      for (let i = 0; i < orderedLinkRewriters.length; i++) {
        const hasReplaced = orderedLinkRewriters[i].rewriteAnchorUrl(anchor);
        if (hasReplaced) {
          chosenLinkRewriter = orderedLinkRewriters[i];
          break;
        }
      }
      const replacedBy = chosenLinkRewriter ? chosenLinkRewriter.name : null;
      suitableLinkRewriters.forEach(linkRewriter => {
        linkRewriter.events.send(EVENTS.CLICK, {replacedBy});
      });
    }
  }

  /**
   * If link rewriter priorities are set on the anchor re-ordered the list of linkRewriters.
   * @param {*} suitableLinkRewriters
   * @param {*} anchor
   * @return {*} - suitableLinkRewriters ordered by priorities
   */
  getLinkRewritersOrderByPriority_(suitableLinkRewriters, anchor) {
    if (anchor.dataset.linkRewriters) {
      const priorities = anchor.dataset.linkRewriters.trim().split(/\s+/);
      return suitableLinkRewriters.reduce((orderedList, linkRewriter) => {
        return this.insertInListBasedOnPriority_(orderedList, linkRewriter, priorities);
      }, []);
    }

    return suitableLinkRewriters;
  }

  /**
   *
   * @param {*} linkRewriterList
   * @param {*} linkRewriter
   * @param {*} priorityList
   */
  insertInListBasedOnPriority_(linkRewriterList, linkRewriter, priorityList) {
    const priorityIndex = priorityList.indexOf(linkRewriter.name);
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
    return this.linkRewriters_.reduce((acc, linkRewriter) => {
      if (linkRewriter.isWatchingLink(anchor)) {
        acc.push(linkRewriter);
      }

      return acc;
    }, []);
  }
}
