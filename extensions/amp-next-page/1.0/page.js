import {VisibilityState_Enum} from '#core/constants/visibility-state';

import {devAssert} from '#utils/log';

import {ViewportRelativePos} from './visibility-observer';

/** @enum {number} */
export const PageState = {
  QUEUED: 1,
  FETCHING: 2,
  LOADED: 3,
  FAILED: 4,
  INSERTED: 5,
  PAUSED: 6,
};

export const VISIBLE_DOC_CLASS = 'amp-next-page-visible';
export const HIDDEN_DOC_CLASS = 'amp-next-page-hidden';

/**
 * @typedef {{
 *   url: string,
 *   image: string,
 *   title: string,
 * }}
 */
export let PageMeta;

export class Page {
  /**
   * @param {!./service.NextPageService} manager
   * @param {!PageMeta} meta
   */
  constructor(manager, meta) {
    /** @private @const {!./service.NextPageService} */
    this.manager_ = manager;
    /** @private @const {string} */
    this.title_ = meta.title;
    /** @private {string} */
    this.url_ = meta.url;
    /** @private {string} */
    this.initialUrl_ = meta.url;
    /** @private @const {string} */
    this.image_ = meta.image;

    /** @private {?../../../src/runtime.ShadowDoc} */
    this.shadowDoc_ = null;
    /** @private {?Element} */
    this.container_ = null;
    /** @private {?Document} */
    this.content_ = null;
    /** @private {!PageState} */
    this.state_ = PageState.QUEUED;
    /** @private {!VisibilityState_Enum} */
    this.visibilityState_ = VisibilityState_Enum.PRERENDER;
    /** @private {!ViewportRelativePos} */
    this.relativePos_ = ViewportRelativePos.OUTSIDE_VIEWPORT;
  }

  /** @return {string} */
  get url() {
    return this.url_;
  }

  /**
   * @param {string} url
   */
  set url(url) {
    this.url_ = url;
  }

  /** @return {string} */
  get initialUrl() {
    return this.initialUrl_;
  }

  /** @return {string} */
  get image() {
    return this.image_;
  }

  /** @return {string} */
  get title() {
    return this.title_;
  }

  /** @return {!ViewportRelativePos} */
  get relativePos() {
    return this.relativePos_;
  }

  /** @return {!Document|!ShadowRoot|undefined} */
  get document() {
    if (!this.shadowDoc_) {
      return;
    }
    return this.shadowDoc_.ampdoc.getRootNode();
  }

  /** @return {?Element} */
  get container() {
    return this.container_;
  }

  /** @return {?../../../src/runtime.ShadowDoc} */
  get shadowDoc() {
    return this.shadowDoc_;
  }

  /** @param {!ViewportRelativePos} position */
  set relativePos(position) {
    this.relativePos_ = position;
  }

  /**
   * @param {!PageState} state
   * @return {boolean}
   */
  is(state) {
    return this.state_ === state;
  }

  /**
   * @return {boolean}
   */
  isLoaded() {
    return (
      this.state_ === PageState.LOADED ||
      this.state_ === PageState.INSERTED ||
      this.state_ === PageState.PAUSED
    );
  }

  /**
   * @return {boolean}
   */
  isVisible() {
    return (
      this.isLoaded() && this.visibilityState_ === VisibilityState_Enum.VISIBLE
    );
  }

  /**
   * @param {VisibilityState_Enum} visibilityState
   */
  setVisibility(visibilityState) {
    if (!this.isLoaded() || visibilityState == this.visibilityState_) {
      return;
    }

    //Reload the page if necessary
    if (
      this.is(PageState.PAUSED) &&
      visibilityState === VisibilityState_Enum.VISIBLE
    ) {
      this.resume();
    }

    // Update visibility internally and at the shadow doc level
    this.visibilityState_ = visibilityState;
    if (this.shadowDoc_) {
      this.shadowDoc_.setVisibilityState(visibilityState);
      this.shadowDoc_.ampdoc
        .getBody()
        .classList.toggle(VISIBLE_DOC_CLASS, this.isVisible());
      this.shadowDoc_.ampdoc
        .getBody()
        .classList.toggle(HIDDEN_DOC_CLASS, !this.isVisible());
    }
  }

  /**
   * Creates a placeholder in place of the original page and unloads
   * the shadow root from memory
   * @return {!Promise}
   */
  pause() {
    if (!this.shadowDoc_) {
      return Promise.resolve();
    }
    return this.shadowDoc_.close().then(() => {
      return this.manager_.closeDocument(this /** page */).then(() => {
        this.shadowDoc_ = null;
        this.visibilityState_ = VisibilityState_Enum.HIDDEN;
        this.state_ = PageState.PAUSED;
      });
    });
  }

  /**
   * Removes the placeholder and re-renders the page after its shadow
   * root has been removed
   * @return {!Promise}
   */
  resume() {
    return this.attach_();
  }

  /**
   * Asks the next-page manager to fetch the document's HTML
   * and inserts it
   * @return {!Promise}
   */
  fetch() {
    // TOOD(wassgha): Should we re-fetch on failure? or show a failed state?
    // or skip to the next available document? (currently breaks silently)
    if (
      this.state_ === PageState.INSERTED ||
      this.state_ === PageState.FETCHING ||
      this.state_ === PageState.LOADED ||
      this.state_ === PageState.FAILED
    ) {
      return Promise.resolve();
    }

    this.state_ = PageState.FETCHING;

    return this.manager_
      .fetchPageDocument(this)
      .then((content) => {
        this.state_ = PageState.LOADED;
        this.content_ = content;
        this.container_ = this.manager_.createDocumentContainerForPage(
          this /** page */
        );
        // TODO(wassgha): To further optimize, this should ideally
        // be parsed from the service worker instead of stored in memory
        return this.attach_();
      })
      .catch(() => {
        this.state_ = PageState.FAILED;
      });
  }

  /**
   * Inserts the fetched (or cached) HTML as the document's content
   * @return {!Promise}
   */
  attach_() {
    return this.manager_
      .attachDocumentToPage(
        this /** page */,
        /** @type {!Document} */ (devAssert(this.content_)),
        this.is(PageState.PAUSED) /** force */
      )
      .then((shadowDoc) => {
        if (!shadowDoc) {
          this.state_ = PageState.FAILED;
          return;
        }
        this.state_ = PageState.INSERTED;
        this.shadowDoc_ = shadowDoc;
        if (!this.is(PageState.PAUSED)) {
          this.manager_.setLastFetchedPage(this);
        }
      });
  }
}

export class HostPage extends Page {
  /**
   * @param {!./service.NextPageService} manager
   * @param {{ url: string, title: string, image: string }} meta
   * @param {!PageState} initState
   * @param {!VisibilityState_Enum} initVisibility
   * @param {!Document} doc
   */
  constructor(manager, meta, initState, initVisibility, doc) {
    super(manager, meta);
    /** @override */
    this.state_ = initState;
    /** @override */
    this.visibilityState_ = initVisibility;
    /** @private {!Document} */
    this.document_ = doc;
  }

  /** @override */
  get document() {
    return this.document_;
  }
}
