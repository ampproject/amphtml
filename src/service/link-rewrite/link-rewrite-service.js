import {AmpEvents} from '../../amp-events';
import {EVENTS, LINK_REWRITE_SERVICE_NAME, PRIORITY_META_TAG_NAME} from './constants';
import {LinkRewriter} from './link-rewriter';
import {Services} from '../../services';
import {registerServiceBuilderForDoc} from '../../service';

/**
 * @package
 */
export class LinkRewriteService {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    this.priorityList_ = [];
    this.iframeDoc_ = ampdoc.getRootNode();
    this.priorityList_ = this.getPriorityList_(ampdoc);

    this.installGlobalEventListener_(this.iframeDoc_);
    /** @private {Array<./link-rewriter.LinkRewriter>} */
    this.linkRewriters_ = [];
  }


  /**
   * @public
   * Register a new link rewriter on the page.
   * @param {string} linkRewriterId
   * @param {Function} resolveUnknownLinks
   * @param {?Object} options
   */
  registerLinkRewriter(linkRewriterId, resolveUnknownLinks, options) {
    const linkRewriter = new LinkRewriter(this.iframeDoc_, linkRewriterId, resolveUnknownLinks, options);
    this.insertInListBasedOnPriority_(this.linkRewriters_, linkRewriter, this.priorityList_);
    // Trigger initial scan.
    linkRewriter.onDomUpdated();

    return linkRewriter;
  }


  /**
   * @public
   * @param {HTMLElement} anchor
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
      const eventData = {
        linkRewriterId,
        anchor,
      };

      suitableLinkRewriters.forEach(linkRewriter => {
        linkRewriter.events.send(EVENTS.CLICK, eventData);
      });
    }
  }

  /**
   * @private
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   */
  getPriorityList_(ampdoc) {
    const docInfo = Services.documentInfoForDoc(ampdoc);
    const value = docInfo.metaTags[PRIORITY_META_TAG_NAME];

    return value ? value.trim().split(/\s+/) : [];
  }

  /**
   * @private
   * Add DOM_UPDATE AND ANCHOR_CLICK listener.
   * @param {*} iframeDoc
   */
  installGlobalEventListener_(iframeDoc) {
    iframeDoc.addEventListener(AmpEvents.DOM_UPDATE,
        this.onDomChanged_.bind(this));
  }

  /**
   * @private
   * Notify all the rewriter when new elements have been added to the page.
   */
  onDomChanged_() {
    this.linkRewriters_.forEach(linkRewriter => {
      linkRewriter.onDomUpdated();
    });
  }


  /**
   * @private
   * @param {HTMLElement} anchor
   * @return {Array<string>}
   */
  parseLinkRewriterPriorityForAnchor_(anchor) {
    const dataValue = anchor.getAttribute('data-link-rewriters')
    if (!anchor || !dataValue) {
      return [];
    }

    return dataValue.trim().split(/\s+/);
  }

  /**
   * @private
   * @param {Array<./link-rewriter.LinkRewriter>} linkRewriterList
   * @param {!./link-rewriter.LinkRewriter} linkRewriter
   * @param {Array<string>} priorityList
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
   * @private
   * Get the list of all the link rewriter watching a specific anchor.
   * @param {HTMLElement} anchor
   * @return {Array<./link-rewriter.LinkRewriter>}
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


/**
 * Register the link rewrite service.
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installGlobalLinkRewriteServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      LINK_REWRITE_SERVICE_NAME,
      LinkRewriteService,
      true
  );
}
