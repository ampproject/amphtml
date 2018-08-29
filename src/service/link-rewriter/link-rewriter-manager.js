import {AmpEvents} from '../../amp-events';
import {EVENTS, LINK_REWRITER_SERVICE_NAME, PRIORITY_META_TAG_NAME} from './constants';
import {LinkRewriter} from './link-rewriter';
import {Services} from '../../services';
import {registerServiceBuilderForDoc} from '../../service';

/**
 * LinkRewriterManager works together with LinkRewriter to allow rewriting
 * links at click time. E.g: Replacing a link by its affiliate version only if
 * the link can be monetised. A page can have multiple LinkRewriter running
 * at the same time.
 *
 * LinkRewriterManager class is in charge of:
 * - Keeping track of all the registered linkRewriters
 * - Notifying all the linkRewriters when the DOM has changed.
 * - Managing which LinkRewriter has the priority to replace a link
 *   (based on configurable priority list).
 * - Notifying the most relevant LinkRewriter that a click happened
 *   so the linkRewriter handles the potential replacement.
 * - Sending a click event to listeners to be able to track the click
 *   even if the url has not been replaced. (No anchor mutation is allowed
 *   in the listener handler)
 */
export class LinkRewriterManager {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @private {!Document} */
    this.iframeDoc_ = /** @type {!Document} */ (ampdoc.getRootNode());

    /**
     * @private {Array<string>}
     * List of link rewriter Id in priority order as defined
     * in the PRIORITY_META_TAG_NAME meta tag.
     * First element has the highest priority.
     */
    this.priorityList_ = this.getPriorityList_(ampdoc);


    /**
     * @private {Array<./link-rewriter.LinkRewriter>}
     * The list of all the LinkRewriter instances registed
     * in the page.
     */
    this.linkRewriters_ = [];

    this.installGlobalEventListener_(this.iframeDoc_);
  }


  /**
   * @public
   * Create and configure a new LinkRewriter on the page.
   * @param {string} linkRewriterId
   * @param {function(Array<HTMLElement>): Array<Array>} resolveUnknownLinks
   *   - A function returning for each anchors the associated replacement
   *    url if any.
   * @param {?Object} options - e.g: { linkSelector: "a:not(.ads)""}
   * @return {!./link-rewriter.LinkRewriter}
   */
  registerLinkRewriter(linkRewriterId, resolveUnknownLinks, options) {
    const linkRewriter = new LinkRewriter(
        this.iframeDoc_,
        linkRewriterId,
        resolveUnknownLinks,
        options
    );
    this.insertInListBasedOnPriority_(this.linkRewriters_, linkRewriter,
        this.priorityList_);
    // Trigger initial scan.
    linkRewriter.onDomUpdated();

    return linkRewriter;
  }


  /**
   * @public
   * Notify the LinkRewriteService that a click has happened on an anchor.
   * This is the chance for one of the registered LinkRewriter to rewrite the
   * url before the browser handles the click and navigates to the link url.
   *
   * The LinkRewriter allowed to replace the url will be chosen based on the
   * defined priority order (in link attribute or global meta tag).
   * If a LinkRewriter decides to not replace the url,  we will ask the next
   * one if it wants to replace the link until one replacement is made.
   *
   * A "CLICK" event will also be dispatched to notify listeners that a click
   * on an anchor has happened. This should mostly be used to send click
   * tracking requests, handlers of this events should not
   * mutate the anchor!
   * @param {HTMLElement} anchor
   * @param {string} clickType - 'click' or 'contextmenu'
   */
  maybeRewriteLink(anchor, clickType) {
    const suitableLinkRewriters = this.getSuitableLinkRewritersForLink_(anchor);
    if (suitableLinkRewriters.length) {
      let chosenLinkRewriter = null;

      // Iterate by order of priority until one of the linkRewriter
      // replaces the link.
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
        clickType,
      };

      suitableLinkRewriters.forEach(linkRewriter => {
        linkRewriter.events.send(EVENTS.CLICK, eventData);
      });
    }
  }

  /**
   * @private
   * Extract the priority list from the optional html meta tag.
   * The meta tag should contain a whitespace separated list of
   * LinkRewriter Ids.
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   * @return {Array<string>}
   */
  getPriorityList_(ampdoc) {
    const docInfo = Services.documentInfoForDoc(ampdoc);
    const value = docInfo.metaTags[PRIORITY_META_TAG_NAME];

    return value ? value.trim().split(/\s+/) : [];
  }

  /**
   * @private
   * Listen for DOM_UPDATE event.
   * @param {*} iframeDoc
   */
  installGlobalEventListener_(iframeDoc) {
    iframeDoc.addEventListener(AmpEvents.DOM_UPDATE,
        this.onDomChanged_.bind(this));
  }

  /**
   * @private
   * Notify all the registered LinkRewriter when new elements have been added
   * to the page so they can re-scan the page to find potential new links to
   * replace.
   */
  onDomChanged_() {
    this.linkRewriters_.forEach(linkRewriter => {
      linkRewriter.onDomUpdated();
    });
  }


  /**
   * @private
   * Extract the optional priority list for this specific anchor
   * from its attribute. The 'data-link-rewriters' attribute should
   * contain a whitespace separated list of LinkRewriter Ids.
   * @param {HTMLElement} anchor
   * @return {Array<string>}
   */
  parseLinkRewriterPriorityForAnchor_(anchor) {
    const dataValue = anchor.hasAttribute('data-link-rewriters')
      ? anchor.getAttribute('data-link-rewriters').trim()
      : null;
    if (!anchor || !dataValue) {
      return [];
    }

    return dataValue.trim().split(/\s+/);
  }

  /**
   * @private
   * Mutate linkRewriterList to insert a new LinkRewriter in the list
   * while keeping the list in order of priority as defined by the
   * idPriorityList.
   * @param {Array<./link-rewriter.LinkRewriter>} linkRewriterList
   * @param {!./link-rewriter.LinkRewriter} linkRewriter
   * @param {Array<string>} idPriorityList
   * @return {Array<./link-rewriter.LinkRewriter>} - Mutated linkRewriterList param.
   */
  insertInListBasedOnPriority_(linkRewriterList, linkRewriter, idPriorityList) {
    const priorityIndex = idPriorityList.indexOf(linkRewriter.id);
    if (priorityIndex > -1) {
      linkRewriterList.splice(priorityIndex, 0, linkRewriter);
    } else {
      linkRewriterList.push(linkRewriter);
    }

    return linkRewriterList;
  }

  /**
   * @private
   * Get the list of all the link rewriter "watching" a specific anchor.
   * See LinkRewriter.isWatchingLink for more details.
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
 * Register the global LinkRewriteService.
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installGlobalLinkRewriterServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      LINK_REWRITER_SERVICE_NAME,
      LinkRewriterManager,
      true
  );
}
