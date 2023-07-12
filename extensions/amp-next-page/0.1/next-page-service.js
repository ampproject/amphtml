import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {removeElement} from '#core/dom';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {setStyle, toggle} from '#core/dom/style';

import {Services} from '#service';
import {installPositionObserverServiceForDoc} from '#service/position-observer/position-observer-impl';
import {PositionObserverFidelity_Enum} from '#service/position-observer/position-observer-worker';

import {triggerAnalyticsEvent} from '#utils/analytics';
import {dev, devAssert, user, userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-next-page-0.1.css';
import {MultidocManager} from '../../../src/multidoc-manager';
import {getAmpdoc} from '../../../src/service-helpers';
import {installStylesForDoc} from '../../../src/style-installer';

// TODO(emarchiori): Make this a configurable parameter.
const SEPARATOR_RECOS = 3;

const MAX_ARTICLES = 2;

const PRERENDER_VIEWPORT_COUNT = 3;

const TAG = 'amp-next-page';

/**
 * @typedef {{
 *   ampUrl: string,
 *   amp: (?../../../src/runtime.ShadowDoc | undefined),
 *   recUnit: {el: ?Element, isObserving: boolean},
 *   cancelled: boolean
 * }}
 */
export let DocumentRef;

/**
 * Window-scoped service to handle the amp-next-page lifecycle. Handles all
 * events and page lifecycle for the first {@code AmpNextPage} element
 * registered. All subsequent registrations will be ignored.
 */
export class NextPageService {
  /**
   * Creates an instance of NextPageService.
   */
  constructor() {
    /** @private {?Window} */
    this.win_ = null;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = null;

    /** @private {?./config.AmpNextPageConfig} */
    this.config_ = null;

    /** @private {string} */
    this.hideSelector_;

    /** @private {?Element} */
    this.separator_ = null;

    /** @private {?../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = null;

    /** @private {?MultidocManager} */
    this.multidocManager_ = null;

    /** @private {number} */
    this.nextArticle_ = 0;

    /** @private {boolean} */
    this.documentQueued_ = false;

    /** @private {?../../../src/service/navigation.Navigation} */
    this.navigation_ = null;

    /** @private {?../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = null;

    /** @private {?../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = null;

    /** @private @const {!Array<!DocumentRef>} */
    this.documentRefs_ = [];

    /** @private {?DocumentRef} */
    this.activeDocumentRef_ = null;

    /** @private {function(!Element): !Promise} */
    this.appendPageHandler_ = () => {};

    /** @private {?../../../src/service/url-impl.Url} */
    this.urlService_ = null;

    /** @private {string} */
    this.origin_ = '';

    /** @private {?../../../src/service/history-impl.History} */
    this.history_ = null;
  }

  /**
   * Returns true if the service has already been initialized.
   *
   * @return {*} TODO(#23582): Specify return type
   */
  isActive() {
    return this.config_ !== null;
  }

  /**
   * Registers the window-scoped service against the specified {@code
   * recommendationsOb}. Only the first call to this method will be used, any
   * subsequent calls will be ignored.
   * @param {!Element} element {@link AmpNextPage} element.
   * @param {!./config.AmpNextPageConfig} config Element configuration.
   * @param {?Element} separator Separator element to display between pages. If
   *     none is specified a default hairline separator will be used.
   */
  register(element, config, separator) {
    if (this.isActive()) {
      return;
    }

    const ampDoc = getAmpdoc(element);
    const {win} = ampDoc;

    this.config_ = config;
    this.win_ = win;
    this.separator_ = separator || this.createDefaultSeparator_();
    this.element_ = element;
    this.xhr_ = Services.xhrFor(win);

    if (this.config_.hideSelectors) {
      this.hideSelector_ = this.config_.hideSelectors.join(',');
    }

    this.navigation_ = Services.navigationForDoc(ampDoc);
    this.viewport_ = Services.viewportForDoc(ampDoc);
    this.mutator_ = Services.mutatorForDoc(ampDoc);
    this.multidocManager_ = new MultidocManager(
      win,
      Services.ampdocServiceFor(win),
      Services.extensionsFor(win),
      Services.timerFor(win)
    );
    this.urlService_ = Services.urlForDoc(dev().assertElement(this.element_));
    this.origin_ = this.urlService_.parse(ampDoc.getUrl()).origin;
    this.history_ = Services.historyForDoc(ampDoc);

    installPositionObserverServiceForDoc(ampDoc);
    this.positionObserver_ = Services.positionObserverForDoc(element);

    const {canonicalUrl} = Services.documentInfoForDoc(ampDoc);
    const documentRef = createDocumentRef(
      win.document.location.href,
      win.document.title,
      canonicalUrl
    );

    // TODO(wassgha): Untype as ShadowDoc and tighten the ShadowDoc type spec
    /** @type {!../../../src/runtime.ShadowDoc} */
    const amp = {
      ampdoc: ampDoc,
      url: win.document.location.href,
      title: win.document.title,
      canonicalUrl,
    };
    documentRef.amp = amp;

    this.documentRefs_.push(documentRef);
    this.activeDocumentRef_ = this.documentRefs_[0];

    this.viewport_.onScroll(() => this.scrollHandler_());
    this.viewport_.onResize(() => this.scrollHandler_());

    // Check scroll position immediately to handle documents which are shorter
    // than the viewport.
    this.scrollHandler_();
  }

  /**
   * Sets the handler to be called with a
   * @param {function(!Element): !Promise} handler Handler to be called when
   *     a new page needs adding to the DOM, with a container element for that
   *     page.
   */
  setAppendPageHandler(handler) {
    this.appendPageHandler_ = handler;
  }

  /**
   * Attach a ShadowDoc using the given document.
   * @param {!Element} shadowRoot Root element to attach the shadow document to.
   * @param {!Document} doc Document to attach.
   * @return {?../../../src/runtime.ShadowDoc} Return value of {@link MultidocManager#attachShadowDoc}
   */
  attachShadowDoc_(shadowRoot, doc) {
    if (this.hideSelector_) {
      const elements = doc.querySelectorAll(this.hideSelector_);
      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add('i-amphtml-next-page-hidden');
      }
    }

    // Drop any amp-analytics tags from the child doc. We want to reuse the
    // parent config instead.
    const analytics = doc.querySelectorAll('amp-analytics');
    for (let i = 0; i < analytics.length; i++) {
      const item = analytics[i];
      removeElement(item);
    }

    /** @type {!../../../src/runtime.ShadowDoc} */
    const amp = this.multidocManager_.attachShadowDoc(shadowRoot, doc, '', {
      visibilityState: VisibilityState_Enum.PRERENDER,
    });
    const ampdoc = devAssert(amp.ampdoc);
    installStylesForDoc(ampdoc, CSS, null, false, TAG);

    const body = ampdoc.getBody();
    body.classList.add('i-amphtml-next-page-document');

    return amp;
  }

  /**
   * Creates an invisible element used to measure the position of the documents
   * @return {!Element}
   */
  createMeasurer_() {
    const measurer = this.win_.document.createElement('div');
    measurer.classList.add('i-amphtml-next-page-measurer');
    return measurer;
  }

  /**
   * Creates a default hairline separator element to go between two documents.
   * @return {!Element}
   */
  createDefaultSeparator_() {
    const separator = this.win_.document.createElement('div');
    separator.classList.add('amp-next-page-default-separator');
    return separator;
  }

  /**
   * Append a new article if still possible.
   */
  appendNextArticle_() {
    if (this.nextArticle_ < this.config_.pages.length) {
      const next = this.config_.pages[this.nextArticle_];
      const documentRef = createDocumentRef(next.ampUrl);
      this.documentRefs_.push(documentRef);

      const container = this.win_.document.createElement('div');

      const measurer = this.createMeasurer_();
      container.appendChild(measurer);

      const separator = this.separator_.cloneNode(true);
      separator.removeAttribute('separator');
      container.appendChild(separator);

      const articleLinks = this.createArticleLinks_(this.nextArticle_);
      container.appendChild(articleLinks);
      documentRef.recUnit.el = articleLinks;

      const shadowRoot = this.win_.document.createElement('div');
      container.appendChild(shadowRoot);

      const page = this.nextArticle_;
      this.appendPageHandler_(container).then(() => {
        this.positionObserver_.observe(
          measurer,
          PositionObserverFidelity_Enum.LOW,
          (position) => this.positionUpdate_(page, position)
        );
        this.positionObserver_.observe(
          articleLinks,
          PositionObserverFidelity_Enum.LOW,
          (unused) => this.articleLinksPositionUpdate_(documentRef)
        );
      });

      // Don't fetch the next article if we've rendered the maximum on screen.
      // We just want the article links.
      if (this.nextArticle_ >= MAX_ARTICLES) {
        return;
      }

      this.nextArticle_++;
      this.xhr_
        .fetch(next.ampUrl, {ampCors: false})
        .then((response) => {
          // Update AMP URL in case we were redirected.
          documentRef.ampUrl = response.url;
          const url = this.urlService_.parse(response.url);
          userAssert(
            url.origin === this.origin_,
            'ampUrl resolved to a different origin from the origin of the ' +
              'current document'
          );
          return response.text();
        })
        .then((html) => {
          const doc = this.win_.document.implementation.createHTMLDocument('');
          doc.open();
          doc.write(html);
          doc.close();
          return doc;
        })
        .then(
          (doc) =>
            new Promise((resolve, reject) => {
              if (documentRef.cancelled) {
                // User has reached the end of the document already, don't render.
                resolve();
                return;
              }

              if (documentRef.recUnit.isObserving) {
                this.positionObserver_.unobserve(articleLinks);
                documentRef.recUnit.isObserving = true;
              }
              this.mutator_.mutateElement(container, () => {
                try {
                  documentRef.amp = this.attachShadowDoc_(shadowRoot, doc);

                  toggle(dev().assertElement(documentRef.recUnit.el), false);
                  this.documentQueued_ = false;
                  resolve();
                } catch (e) {
                  reject(e);
                }
              });
            }),
          (e) => user().error(TAG, 'failed to fetch %s', next.ampUrl, e)
        )
        .catch((e) =>
          dev().error(
            TAG,
            'failed to attach shadow document for %s',
            next.ampUrl,
            e
          )
        )
        // The new page may be short and the next may already need fetching.
        .then(() => this.scrollHandler_());
    }
  }

  /**
   * Creates a recommendation unit with links to articles, starting from a given
   * one.
   * @param {number} nextPage Index of the next unseen page to use as the first
   *     recommendation in the list.
   * @return {!Element} Container element for the recommendations.
   */
  createArticleLinks_(nextPage) {
    const doc = this.win_.document;
    const currentArticle = nextPage - 1;
    let article = nextPage;
    let currentAmpUrl = '';
    if (nextPage > 0) {
      currentAmpUrl = this.documentRefs_[currentArticle].ampUrl;
    }

    const element = doc.createElement('div');
    element.classList.add('amp-next-page-links');

    while (
      article < this.config_.pages.length &&
      article - nextPage < SEPARATOR_RECOS
    ) {
      const next = this.config_.pages[article];
      article++;

      const articleHolder = doc.createElement('a');
      articleHolder.href = next.ampUrl;
      articleHolder.classList.add(
        'i-amphtml-reco-holder-article',
        'amp-next-page-link'
      );
      articleHolder.addEventListener('click', (e) => {
        this.triggerAnalyticsEvent_(
          'amp-next-page-click',
          next.ampUrl,
          currentAmpUrl
        );
        const a2a = this.navigation_.navigateToAmpUrl(
          next.ampUrl,
          'content-discovery'
        );
        if (a2a) {
          // A2A is enabled, don't navigate the browser.
          e.preventDefault();
        }
      });

      const imageElement = doc.createElement('div');
      imageElement.classList.add(
        'i-amphtml-next-article-image',
        'amp-next-page-image'
      );
      setStyle(imageElement, 'background-image', `url(${next.image})`);
      articleHolder.appendChild(imageElement);

      const titleElement = doc.createElement('div');
      titleElement.classList.add(
        'i-amphtml-next-article-title',
        'amp-next-page-text'
      );

      titleElement.textContent = next.title;
      articleHolder.appendChild(titleElement);

      element.appendChild(articleHolder);
    }

    return element;
  }

  /**
   * Handles scroll events from the viewport and appends the next document when
   * the user comes within {@code PRERENDER_VIEWPORT_COUNT} viewports of the
   * end.
   * @private
   */
  scrollHandler_() {
    if (this.documentQueued_) {
      return;
    }

    const viewportSize = this.viewport_.getSize();
    const viewportBox = layoutRectLtwh(
      0,
      0,
      viewportSize.width,
      viewportSize.height
    );
    this.viewport_
      .getClientRectAsync(dev().assertElement(this.element_))
      .then((elementBox) => {
        if (this.documentQueued_) {
          return;
        }

        const prerenderHeight = PRERENDER_VIEWPORT_COUNT * viewportSize.height;
        if (elementBox.bottom - viewportBox.bottom < prerenderHeight) {
          this.documentQueued_ = true;
          this.appendNextArticle_();
        }
      });
  }

  /**
   * Handles updates from the {@code PositionObserver} indicating a change in
   * the position of a page separator in the viewport.
   * @param {number} i Index of the documentRef this recommendation unit is
   *     attached to.
   * @param {?../../../src/service/position-observer/position-observer-worker.PositionInViewportEntryDef} position
   *     Position of the current recommendation unit in the viewport.
   */
  positionUpdate_(i, position) {
    // We're only interested when the recommendations exit the viewport
    if (!position || position.positionRect !== null) {
      return;
    }

    let ref = this.documentRefs_[i];
    let analyticsEvent = '';

    switch (position.relativePos) {
      case 'top':
        ref = this.documentRefs_[i + 1];
        analyticsEvent = 'amp-next-page-scroll';
        break;
      case 'bottom':
        analyticsEvent = 'amp-next-page-scroll-back';
        break;
      default:
        break;
    }

    if (ref && ref.amp) {
      this.triggerAnalyticsEvent_(
        analyticsEvent,
        ref.ampUrl,
        this.activeDocumentRef_.ampUrl
      );
      this.setActiveDocument_(ref);
    }
  }

  /**
   * Handles updates from the {@code PositionObserver} indicating a change in
   * the position of the recommendation unit in the viewport. Used to indicate
   * when the recommendation unit has entered the viewport, and should not be
   * hidden from view automatically.
   * @param {!DocumentRef} documentRef Reference to the active document.
   */
  articleLinksPositionUpdate_(documentRef) {
    documentRef.cancelled = true;
    if (documentRef.recUnit.isObserving) {
      this.positionObserver_.unobserve(
        dev().assertElement(documentRef.recUnit.el)
      );
      documentRef.recUnit.isObserving = false;
    }
  }

  /**
   * Sets the specified document as active, updating the document title and URL.
   *
   * @param {!DocumentRef} ref Reference to the document to be activated
   * @private
   */
  setActiveDocument_(ref) {
    this.documentRefs_.forEach((docRef) => {
      const {amp} = docRef;
      // Update the title and history
      if (docRef === ref) {
        this.win_.document.title = amp.title || '';
        this.activeDocumentRef_ = docRef;
        this.setActiveDocumentInHistory_(docRef);
        // Show the active document
        this.setDocumentVisibility_(docRef, VisibilityState_Enum.VISIBLE);
      } else {
        // Hide other documents
        this.setDocumentVisibility_(docRef, VisibilityState_Enum.HIDDEN);
      }
    });

    // TODO(emarchiori): Consider updating position fixed elements.
  }

  /**
   * Manually overrides the document's visible state to the given state
   *
   * @param {!DocumentRef} ref Reference to the document to change
   * @param {!../../../src/core/constants/visibility-state.VisibilityState_Enum} visibilityState
   * @private
   */
  setDocumentVisibility_(ref, visibilityState) {
    // Prevent updating visibility of the host document
    if (ref === this.documentRefs_[0]) {
      return;
    }

    const ampDoc = ref.amp && ref.amp.ampdoc;

    // Prevent hiding of documents that are not shadow docs
    if (!ampDoc) {
      return;
    }

    // Prevent hiding of documents that are being pre-rendered
    if (
      !ampDoc.hasBeenVisible() &&
      visibilityState == VisibilityState_Enum.HIDDEN
    ) {
      return;
    }

    ref.amp.setVisibilityState(visibilityState);
  }

  /**
   * @param {!DocumentRef} documentRef
   * @private
   */
  setActiveDocumentInHistory_(documentRef) {
    const {canonicalUrl, title} = documentRef.amp;
    const {pathname, search} = this.urlService_.parse(documentRef.ampUrl);
    this.history_.replace({title, url: pathname + search, canonicalUrl});
  }

  /**
   * Wrapper around {@code triggerAnalyticsEvent}.
   * @param {string} eventType
   * @param {string} toURL The new url after the event.
   * @param {string=} fromURL The old URL before the event.
   */
  triggerAnalyticsEvent_(eventType, toURL, fromURL) {
    fromURL = fromURL || '';

    const vars = {
      'toURL': toURL,
      'fromURL': fromURL,
    };
    triggerAnalyticsEvent(dev().assertElement(this.element_), eventType, vars);
  }
}

/**
 * Creates a new {@link DocumentRef} for the specified URL.
 * @param {string} ampUrl AMP URL of the document.
 * @param {string=} title Document title, if known before loading.
 * @param {string=} canonicalUrl Canonical URL of the page, if known before
 *     loading.
 * @return {!DocumentRef} Ref object initialised with the given URL.
 */
function createDocumentRef(ampUrl, title, canonicalUrl) {
  const amp = title || canonicalUrl ? {title, canonicalUrl} : null;
  return {
    ampUrl,
    amp,
    recUnit: {
      el: null,
      isObserving: false,
    },
    cancelled: false,
  };
}
