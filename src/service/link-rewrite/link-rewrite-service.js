import {ALLOWED_CLICK_ACTION_TYPES, EVENTS} from './constants';
import {AmpEvents} from '../../amp-events';

import LinkRewriter from './link-rewriter';

export default class LinkRewriterService {
  /**
   *
   * @param {*} rootNode - ampDoc.getRootNode()
   */
  constructor(rootNode) {
    this.priorities = [];
    const meta = rootNode.querySelector(
        'meta[name=amp-link-rewrite-priorities');

    if (meta && meta.hasAttribute('content')) {
      this.priorties = meta.getAttribute('content').trim().split(/\s+/);
    }

    this.installGlobalEventListener_(rootNode);
    this.linkRewriters_ = [];
  }

  /**
   * Register a new link rewriter on the page.
   * @param {*} name
   * @param {*} resolveUnknownLinks
   * @param {*} options
   */
  registerLinkRewriter(name, resolveUnknownLinks, options) {
    const linkRewriter = new LinkRewriter(name, resolveUnknownLinks, options);
    this.insertInListBasedOnPriority_(this.linkRewriters_, linkRewriter, this.priorities);

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
   * @param {*} priorities
   */
  insertInListBasedOnPriority_(linkRewriterList, linkRewriter, priorities) {
    const priorityIndex = priorities.indexOf(linkRewriter.name);
    if (priorityIndex > -1) {
      linkRewriterList.splice(priorityIndex, 0, linkRewriter);
    } else {
      linkRewriterList.push(linkRewriter);
    }
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
        anchor.dataset.linkRewriters
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
