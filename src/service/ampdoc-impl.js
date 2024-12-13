import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {Observable} from '#core/data-structures/observable';
import {Deferred} from '#core/data-structures/promise';
import {Signals} from '#core/data-structures/signals';
import {isDocumentReady, whenDocumentReady} from '#core/document/ready';
import {
  addDocumentVisibilityChangeListener,
  getDocumentVisibilityState,
  removeDocumentVisibilityChangeListener,
} from '#core/document/visibility';
import {rootNodeFor, waitForBodyOpenPromise} from '#core/dom';
import {isEnumValue} from '#core/types';
import {map} from '#core/types/object';
import {parseQueryString} from '#core/types/string/url';
import {WindowInterface} from '#core/window/interface';

import {dev, devAssert} from '#utils/log';

import {
  disposeServicesForDoc,
  getParentWindowFrameElement,
  registerServiceBuilder,
} from '../service-helpers';

/** @const {string} */
const AMPDOC_PROP = '__AMPDOC';

/** @const {string} */
const PARAMS_SENTINEL = '__AMP__';

/**
 * @typedef {{
 *   params: (!{[key: string]: string}|undefined),
 *   signals: (?Signals|undefined),
 *   visibilityState: (?VisibilityState_Enum|undefined),
 * }}
 */
export let AmpDocOptions;

/**
 * Private ampdoc signals.
 * @enum {string}
 */
const AmpDocSignals_Enum = {
  // A complete preinstalled list of extensions is known.
  EXTENSIONS_KNOWN: '-ampdoc-ext-known',
  // Signals the document has become visible for the first time.
  FIRST_VISIBLE: '-ampdoc-first-visible',
  // Signals when the document becomes visible the next time.
  NEXT_VISIBLE: '-ampdoc-next-visible',
  // Signals the document has been previewed for the first time.
  FIRST_PREVIEWED: '-ampdoc-first-previewed',
};

/**
 * This service helps locate an ampdoc (`AmpDoc` instance) for any node,
 * either in the single-doc or shadow-doc environments.
 *
 * In the single-doc environment an ampdoc is equivalent to the
 * `window.document`. In the shadow-doc mode, any number of AMP documents
 * could be hosted in shadow roots in the same global `window.document`.
 *
 * @package
 */
export class AmpDocService {
  /**
   * @param {!Window} win
   * @param {boolean} isSingleDoc
   * @param {!{[key: string]: string}=} opt_initParams
   */
  constructor(win, isSingleDoc, opt_initParams) {
    /** @const {!Window} */
    this.win = win;

    /** @private {?AmpDoc} */
    this.singleDoc_ = null;
    if (isSingleDoc) {
      this.singleDoc_ = new AmpDocSingle(win, {
        params: extractSingleDocParams(win, opt_initParams),
      });
      win.document[AMPDOC_PROP] = this.singleDoc_;
    }
  }

  /**
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */
  isSingleDoc() {
    // TODO(#22733): remove when ampdoc-fie is launched.
    return !!this.singleDoc_;
  }

  /**
   * Returns the document in the single-doc mode. In a multi-doc mode, an
   * error will be thrown.
   * @return {!AmpDoc}
   */
  getSingleDoc() {
    // TODO(#22733): once docroot migration is done, this should be renamed
    // to `getTopDoc()` method.
    return devAssert(this.singleDoc_);
  }

  /**
   * If the node is an AMP custom element, retrieves the AmpDoc reference.
   * @param {!Node} node
   * @return {?AmpDoc} The AmpDoc reference, if one exists.
   */
  getCustomElementAmpDocReference_(node) {
    // We can only look up the AmpDoc from a custom element if it has been
    // attached at some point. If it is not a custom element, one or both of
    // these checks should fail.
    if (!node.everAttached || typeof node.getAmpDoc !== 'function') {
      return null;
    }

    return node.getAmpDoc();
  }

  /**
   * Returns the instance of the ampdoc (`AmpDoc`) that contains the specified
   * node.
   *
   * @param {!Node} node
   * @return {?AmpDoc}
   */
  getAmpDocIfAvailable(node) {
    let n = node;
    while (n) {
      // A custom element may already have the reference. If we are looking
      // for the closest AmpDoc, the element might have a reference to the
      // global AmpDoc, which we do not want. This occurs when using
      // <amp-next-page>.

      const cachedAmpDoc = this.getCustomElementAmpDocReference_(node);
      if (cachedAmpDoc) {
        return cachedAmpDoc;
      }

      // Root note: it's either a document, or a shadow document.
      const rootNode = rootNodeFor(n);
      if (!rootNode) {
        break;
      }
      const ampdoc = rootNode[AMPDOC_PROP];
      if (ampdoc) {
        return ampdoc;
      }

      // Try to iterate to the host of the current root node.
      // First try the shadow root's host.
      if (rootNode.host) {
        n = rootNode.host;
      } else {
        // Then, traverse the boundary of a friendly iframe.
        n = getParentWindowFrameElement(rootNode, this.win);
      }
    }

    return null;
  }

  /**
   * Returns the instance of the ampdoc (`AmpDoc`) that contains the specified
   * node. If the runtime is in the single-doc mode, the one global `AmpDoc`
   * instance is returned, unless specfically looking for a closer `AmpDoc`.
   * Otherwise, this method locates the `AmpDoc` that contains the specified
   * node and, if necessary, initializes it.
   *
   * An Error is thrown in development if no `AmpDoc` is found.
   * @param {!Node} node
   * @return {!AmpDoc}
   */
  getAmpDoc(node) {
    const ampdoc = this.getAmpDocIfAvailable(node);
    if (!ampdoc) {
      throw dev().createError('No ampdoc found for', node);
    }
    return ampdoc;
  }

  /**
   * Creates and installs the ampdoc for the shadow root.
   * @param {string} url
   * @param {!ShadowRoot} shadowRoot
   * @param {!AmpDocOptions=} opt_options
   * @return {!AmpDocShadow}
   * @restricted
   */
  installShadowDoc(url, shadowRoot, opt_options) {
    devAssert(
      !shadowRoot[AMPDOC_PROP],
      'The shadow root already contains ampdoc'
    );
    const ampdoc = new AmpDocShadow(this.win, url, shadowRoot, opt_options);
    shadowRoot[AMPDOC_PROP] = ampdoc;
    return ampdoc;
  }

  /**
   * Creates and installs the ampdoc for the fie root.
   * @param {string} url
   * @param {!Window} childWin
   * @param {!AmpDocOptions=} opt_options
   * @return {!AmpDocFie}
   * @restricted
   */
  installFieDoc(url, childWin, opt_options) {
    const doc = childWin.document;
    devAssert(!doc[AMPDOC_PROP], 'The fie already contains ampdoc');
    const frameElement = devAssert(childWin.frameElement);
    const ampdoc = new AmpDocFie(
      childWin,
      url,
      this.getAmpDoc(frameElement),
      opt_options
    );
    doc[AMPDOC_PROP] = ampdoc;
    return ampdoc;
  }
}

/**
 * This class represents a single ampdoc. `AmpDocService` can contain only one
 * global ampdoc or multiple, depending on the runtime mode: single-doc or
 * shadow-doc.
 * @abstract
 * @package
 */
export class AmpDoc {
  /**
   * @param {!Window} win
   * @param {?AmpDoc} parent
   * @param {!AmpDocOptions=} opt_options
   */
  constructor(win, parent, opt_options) {
    /** @public @const {!Window} */
    this.win = win;

    /** @private {!{[key: ../enums.AMPDOC_SINGLETON_NAME_ENUM]: boolean}} */
    this.registeredSingleton_ = map();

    /** @public @const {?AmpDoc} */
    this.parent_ = parent;

    /** @private @const */
    this.signals_ = (opt_options && opt_options.signals) || new Signals();

    /** @private {!{[key: string]: string}} */
    this.params_ = (opt_options && opt_options.params) || map();

    /** @protected {?{[key: string]: string}} */
    this.meta_ = null;

    /** @private @const {!{[key: string]: string}} */
    this.declaredExtensions_ = {};

    const paramsVisibilityState = this.params_['visibilityState'];
    devAssert(
      !paramsVisibilityState ||
        isEnumValue(VisibilityState_Enum, paramsVisibilityState)
    );

    /** @private {?VisibilityState_Enum} */
    this.visibilityStateOverride_ =
      (opt_options && opt_options.visibilityState) ||
      paramsVisibilityState ||
      null;

    // Start with `null` to be updated by updateVisibilityState_ in the end
    // of the constructor to ensure the correct "update" logic and promise
    // resolution.
    /** @private {?VisibilityState_Enum} */
    this.visibilityState_ = null;

    /** @private @const {!Observable<!VisibilityState_Enum>} */
    this.visibilityStateHandlers_ = new Observable();

    /** @private {?time} */
    this.lastVisibleTime_ = null;

    /** @private @const {!Array<!UnlistenDef>} */
    this.unsubsribes_ = [];

    const boundUpdateVisibilityState = this.updateVisibilityState_.bind(this);
    if (this.parent_) {
      this.unsubsribes_.push(
        this.parent_.onVisibilityChanged(boundUpdateVisibilityState)
      );
    }
    addDocumentVisibilityChangeListener(
      this.win.document,
      boundUpdateVisibilityState
    );
    this.unsubsribes_.push(() =>
      removeDocumentVisibilityChangeListener(
        this.win.document,
        boundUpdateVisibilityState
      )
    );
    this.updateVisibilityState_();
  }

  /**
   * Dispose the document.
   */
  dispose() {
    disposeServicesForDoc(this);
    this.unsubsribes_.forEach((unsubsribe) => unsubsribe());
  }

  /**
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */
  isSingleDoc() {
    // TODO(#22733): remove when ampdoc-fie is launched.
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * @return {?AmpDoc}
   */
  getParent() {
    return this.parent_;
  }

  /** @return {!Signals} */
  signals() {
    return this.signals_;
  }

  /**
   * Returns the value of a ampdoc's startup parameter with the specified
   * name or `null` if the parameter wasn't defined at startup time.
   * @param {string} name
   * @return {?string}
   */
  getParam(name) {
    const v = this.params_[name];
    return v == null ? null : v;
  }

  /**
   * Initializes (if necessary) cached map of an ampdoc's meta name values to
   * their associated content values and returns the map.
   * @return {!{[key: string]: string}}
   */
  getMeta() {
    if (this.meta_) {
      return map(this.meta_);
    }

    this.meta_ = map();
    const metaEls = dev()
      .assertElement(this.win.document.head)
      .querySelectorAll('meta[name]');
    metaEls.forEach((metaEl) => {
      const name = metaEl.getAttribute('name');
      const content = metaEl.getAttribute('content');
      if (!name || content === null) {
        return;
      }

      // Retain only the first meta content value for a given name
      if (this.meta_[name] === undefined) {
        this.meta_[name] = content;
      }
    });
    return map(this.meta_);
  }

  /**
   * Returns the value of an ampdoc's meta tag content for a given name, or
   * `null` if the meta tag does not exist.
   * @param {string} name
   * @return {?string}
   */
  getMetaByName(name) {
    if (!name) {
      return null;
    }

    const content = this.getMeta()[name];
    return content !== undefined ? content : null;
  }

  /**
   * Stores the value of an ampdoc's meta tag content for a given name. To be
   * implemented by subclasses.
   * @param {string} unusedName
   * @param {string} unusedContent
   *
   * Avoid using this method in components. It is only meant to be used by the
   * runtime for AmpDoc subclasses where <meta> elements do not exist and name/
   * content pairs must be stored in this.meta_.
   */
  setMetaByName(unusedName, unusedContent) {
    devAssert(null, 'not implemented');
  }

  /**
   * Returns whether the specified extension has been declared on this ampdoc.
   * @param {string} extensionId
   * @param {string=} opt_version
   * @return {boolean}
   */
  declaresExtension(extensionId, opt_version) {
    const declared = this.declaredExtensions_[extensionId];
    if (!declared) {
      return false;
    }
    return !opt_version || declared === opt_version;
  }

  /**
   * Adds a declared extension to an ampdoc.
   * @param {string} extensionId
   * @param {string} version
   * @restricted
   */
  declareExtension(extensionId, version) {
    devAssert(
      !this.declaredExtensions_[extensionId] ||
        this.declaredExtensions_[extensionId] === version,
      'extension already declared %s',
      extensionId
    );
    this.declaredExtensions_[extensionId] = version;
  }

  /**
   * @param {string} extensionId
   * @return {?string}
   */
  getExtensionVersion(extensionId) {
    return this.declaredExtensions_[extensionId] || null;
  }

  /**
   * Signal that the initial document set of extensions is known.
   * @restricted
   */
  setExtensionsKnown() {
    this.signals_.signal(AmpDocSignals_Enum.EXTENSIONS_KNOWN);
  }

  /**
   * Resolved when the initial document set of extension is known.
   * @return {!Promise}
   */
  whenExtensionsKnown() {
    return this.signals_.whenSignal(AmpDocSignals_Enum.EXTENSIONS_KNOWN);
  }

  /**
   * Returns the root node for this ampdoc. It will either be a `Document` for
   * the single-doc runtime mode, or a `ShadowRoot` for shadow-doc mode. This
   * node can be used, among other things, to add ampdoc-wide event listeners.
   *
   * @return {!Document|!ShadowRoot}
   */
  getRootNode() {
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * Returns the head node. It's either an element or a shadow root.
   * @return {!Element|!ShadowRoot}
   * @abstract
   */
  getHeadNode() {}

  /**
   * Returns `true` if the ampdoc's body is available.
   *
   * @return {boolean}
   */
  isBodyAvailable() {
    return /** @type {?} */ (devAssert(false, 'not implemented'));
  }

  /**
   * Returns the ampdoc's body. Requires the body to already be available.
   *
   * See `isBodyAvailable` and `waitForBodyOpen`.
   *
   * @return {!Element}
   */
  getBody() {
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * Returns a promise that will be resolved when the ampdoc's body is
   * available.
   * @return {!Promise<!Element>}
   */
  waitForBodyOpen() {
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * Returns `true` if document is ready.
   *
   * See `whenReady`.
   *
   * @return {boolean}
   */
  isReady() {
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * Returns a promise that will be resolved when the ampdoc's DOM is fully
   * ready.
   * @return {!Promise}
   */
  whenReady() {
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * Returns the URL from which the document was loaded.
   * @return {string}
   */
  getUrl() {
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * Locates an element with the specified ID within the ampdoc. In the
   * shadow-doc mode, when multiple documents could be present, this method
   * localizes search only to the DOM subtree specific to this ampdoc.
   *
   * @param {string} id
   * @return {?Element}
   */
  getElementById(id) {
    return this.getRootNode().getElementById(id);
  }

  /**
   * Whether the node is currently contained in the DOM of the root.
   * @param {?Node} node
   * @return {boolean}
   */
  contains(node) {
    return this.getRootNode().contains(node);
  }

  /**
   * @param {!VisibilityState_Enum} visibilityState
   * @restricted
   */
  overrideVisibilityState(visibilityState) {
    if (this.visibilityStateOverride_ != visibilityState) {
      this.visibilityStateOverride_ = visibilityState;
      this.updateVisibilityState_();
    }
  }

  /** @private */
  updateVisibilityState_() {
    // Natural visibility state.
    const naturalVisibilityState = getDocumentVisibilityState(
      this.win.document
    );

    // Parent visibility: pick the first non-visible state.
    let parentVisibilityState = VisibilityState_Enum.VISIBLE;
    for (let p = this.parent_; p; p = p.getParent()) {
      if (p.getVisibilityState() != VisibilityState_Enum.VISIBLE) {
        parentVisibilityState = p.getVisibilityState();
        break;
      }
    }

    // Pick the most restricted visibility state.
    let visibilityState;
    const visibilityStateOverride =
      this.visibilityStateOverride_ || VisibilityState_Enum.VISIBLE;
    if (
      visibilityStateOverride == VisibilityState_Enum.VISIBLE &&
      parentVisibilityState == VisibilityState_Enum.VISIBLE &&
      naturalVisibilityState == VisibilityState_Enum.VISIBLE
    ) {
      visibilityState = VisibilityState_Enum.VISIBLE;
    } else if (
      naturalVisibilityState == VisibilityState_Enum.HIDDEN &&
      visibilityStateOverride == VisibilityState_Enum.PAUSED
    ) {
      // Hidden document state overrides "paused".
      visibilityState = naturalVisibilityState;
    } else if (
      visibilityStateOverride == VisibilityState_Enum.PAUSED ||
      visibilityStateOverride == VisibilityState_Enum.INACTIVE
    ) {
      visibilityState = visibilityStateOverride;
    } else if (
      parentVisibilityState == VisibilityState_Enum.PAUSED ||
      parentVisibilityState == VisibilityState_Enum.INACTIVE
    ) {
      visibilityState = parentVisibilityState;
    } else if (
      visibilityStateOverride == VisibilityState_Enum.PREVIEW ||
      naturalVisibilityState == VisibilityState_Enum.PREVIEW ||
      parentVisibilityState == VisibilityState_Enum.PREVIEW
    ) {
      visibilityState = VisibilityState_Enum.PREVIEW;
    } else if (
      visibilityStateOverride == VisibilityState_Enum.PRERENDER ||
      naturalVisibilityState == VisibilityState_Enum.PRERENDER ||
      parentVisibilityState == VisibilityState_Enum.PRERENDER
    ) {
      visibilityState = VisibilityState_Enum.PRERENDER;
    } else {
      visibilityState = VisibilityState_Enum.HIDDEN;
    }

    if (this.visibilityState_ != visibilityState) {
      if (visibilityState == VisibilityState_Enum.VISIBLE) {
        const {performance} = this.win;
        // We use the initial loading time of the document as the base
        // visibleTime. If we are initialized in visible mode, then this is
        // accounts for the time that user saw a blank page waiting for JS
        // execution.
        let visibleTime = Math.floor(
          performance.timeOrigin ?? performance.timing.navigationStart
        );
        if (this.visibilityState_ != null) {
          // We're transitioning into visible mode (instead of being
          // initialized in it). In this case, we want to adjust the
          // visibleTime to the current timestamp, because the user hasn't
          // actually been waiting for the page to load. Remember that
          // performance.now() is relative to the load time of the document, so
          // the current timestamp is actually load+now.
          visibleTime += Math.floor(performance.now());
        }
        this.lastVisibleTime_ = visibleTime;
        this.signals_.signal(AmpDocSignals_Enum.FIRST_VISIBLE, visibleTime);
        this.signals_.signal(AmpDocSignals_Enum.NEXT_VISIBLE, visibleTime);
      } else {
        this.signals_.reset(AmpDocSignals_Enum.NEXT_VISIBLE);
      }

      if (visibilityState == VisibilityState_Enum.PREVIEW) {
        this.signals_.signal(AmpDocSignals_Enum.FIRST_PREVIEWED);
      }

      this.visibilityState_ = visibilityState;
      this.visibilityStateHandlers_.fire();
    }
  }

  /**
   * Returns a Promise that only ever resolved when the current
   * AMP document first reaches the `PREVIEW` visibility state.
   * @return {!Promise}
   */
  whenFirstPreviewedOrVisible() {
    return Promise.race([this.whenFirstPreviewed(), this.whenFirstVisible()]);
  }

  /**
   * Returns a Promise that only ever resolved when the current
   * AMP document first reaches the `PREVIEW` visibility state.
   * @return {!Promise}
   */
  whenFirstPreviewed() {
    return this.signals_
      .whenSignal(AmpDocSignals_Enum.FIRST_PREVIEWED)
      .then(() => undefined);
  }

  /**
   * Returns a Promise that only ever resolved when the current
   * AMP document first becomes visible.
   * @return {!Promise}
   */
  whenFirstVisible() {
    return this.signals_
      .whenSignal(AmpDocSignals_Enum.FIRST_VISIBLE)
      .then(() => undefined);
  }

  /**
   * Returns a Promise that resolve when current doc becomes visible.
   * The promise resolves immediately if doc is already visible.
   * @return {!Promise}
   */
  whenNextVisible() {
    return this.signals_
      .whenSignal(AmpDocSignals_Enum.NEXT_VISIBLE)
      .then(() => undefined);
  }

  /**
   * Returns the time when the document has become visible for the first time.
   * If document has not yet become visible, the returned value is `null`.
   * @return {?time}
   */
  getFirstVisibleTime() {
    return /** @type {?number} */ (
      this.signals_.get(AmpDocSignals_Enum.FIRST_VISIBLE)
    );
  }

  /**
   * Returns the time when the document has become visible for the last time.
   * If document has not yet become visible, the returned value is `null`.
   * @return {?time}
   */
  getLastVisibleTime() {
    return this.lastVisibleTime_;
  }

  /**
   * Returns visibility state configured by the viewer.
   * See {@link isVisible}.
   * @return {!VisibilityState_Enum}
   */
  getVisibilityState() {
    return devAssert(this.visibilityState_);
  }

  /**
   * Whether the AMP document currently being previewed.
   * @return {boolean}
   */
  isPreview() {
    return this.visibilityState_ == VisibilityState_Enum.PREVIEW;
  }

  /**
   * Whether the AMP document currently visible. The reasons why it might not
   * be visible include user switching to another tab, browser running the
   * document in the prerender mode or viewer running the document in the
   * prerender mode.
   * @return {boolean}
   */
  isVisible() {
    return this.visibilityState_ == VisibilityState_Enum.VISIBLE;
  }

  /**
   * Whether the AMP document has been ever visible before. Since the visiblity
   * state of a document can be flipped back and forth we sometimes want to know
   * if a document has ever been visible.
   * @return {boolean}
   */
  hasBeenVisible() {
    return this.getLastVisibleTime() != null;
  }

  /**
   * Adds a "visibilitychange" event listener for viewer events. The
   * callback can check {@link isVisible} and {@link getPrefetchCount}
   * methods for more info.
   * @param {function(!VisibilityState_Enum)} handler
   * @return {!UnlistenDef}
   */
  onVisibilityChanged(handler) {
    return this.visibilityStateHandlers_.add(handler);
  }

  /**
   * Attempt to register a singleton for each ampdoc.
   * Caller need to handle user error when registration returns false.
   * @param {!../enums.AMPDOC_SINGLETON_NAME_ENUM} name
   * @return {boolean}
   */
  registerSingleton(name) {
    if (!this.registeredSingleton_[name]) {
      this.registeredSingleton_[name] = true;
      return true;
    }
    return false;
  }
}

/**
 * The version of `AmpDoc` in the single-doc mode that corresponds to the
 * global `window.document`.
 * @package @visibleForTesting
 */
export class AmpDocSingle extends AmpDoc {
  /**
   * @param {!Window} win
   * @param {!AmpDocOptions=} opt_options
   */
  constructor(win, opt_options) {
    super(win, /* parent */ null, opt_options);

    /** @private @const {!Promise<!Element>} */
    this.bodyPromise_ = this.win.document.body
      ? Promise.resolve(this.win.document.body)
      : waitForBodyOpenPromise(this.win.document).then(() => this.getBody());

    /** @private @const {!Promise} */
    this.readyPromise_ = whenDocumentReady(this.win.document);
  }

  /** @override */
  isSingleDoc() {
    return true;
  }

  /** @override */
  getRootNode() {
    return this.win.document;
  }

  /** @override */
  getUrl() {
    return WindowInterface.getLocation(this.win).href;
  }

  /** @override */
  getHeadNode() {
    return dev().assertElement(this.win.document.head);
  }

  /** @override */
  isBodyAvailable() {
    return !!this.win.document.body;
  }

  /** @override */
  getBody() {
    return dev().assertElement(this.win.document.body, 'body not available');
  }

  /** @override */
  waitForBodyOpen() {
    return this.bodyPromise_;
  }

  /** @override */
  isReady() {
    return isDocumentReady(this.win.document);
  }

  /** @override */
  whenReady() {
    return this.readyPromise_;
  }
}

/**
 * The version of `AmpDoc` in the shadow-doc mode that is allocated for each
 * ampdoc hosted within a shadow root.
 * @package @visibleForTesting
 */
export class AmpDocShadow extends AmpDoc {
  /**
   * @param {!Window} win
   * @param {string} url
   * @param {!ShadowRoot} shadowRoot
   * @param {!AmpDocOptions=} opt_options
   */
  constructor(win, url, shadowRoot, opt_options) {
    super(win, /* parent */ null, opt_options);
    /** @private @const {string} */
    this.url_ = url;
    /** @private @const {!ShadowRoot} */
    this.shadowRoot_ = shadowRoot;

    /** @private {?Element} */
    this.body_ = null;

    const bodyDeferred = new Deferred();

    /** @private {!Promise<!Element>} */
    this.bodyPromise_ = bodyDeferred.promise;

    /** @private {function(!Element)|undefined} */
    this.bodyResolver_ = bodyDeferred.resolve;

    /** @private {boolean} */
    this.ready_ = false;

    const readyDeferred = new Deferred();

    /** @private {!Promise} */
    this.readyPromise_ = readyDeferred.promise;

    /** @private {function()|undefined} */
    this.readyResolver_ = readyDeferred.resolve;
  }

  /** @override */
  isSingleDoc() {
    return false;
  }

  /** @override */
  getRootNode() {
    return this.shadowRoot_;
  }

  /** @override */
  getUrl() {
    return this.url_;
  }

  /** @override */
  getHeadNode() {
    return this.shadowRoot_;
  }

  /** @override */
  isBodyAvailable() {
    return !!this.body_;
  }

  /** @override */
  getBody() {
    return dev().assertElement(this.body_, 'body not available');
  }

  /**
   * Signals that the shadow doc has a body.
   * @param {!Element} body
   * @restricted
   */
  setBody(body) {
    devAssert(!this.body_, 'Duplicate body');
    this.body_ = body;
    this.bodyResolver_(body);
    this.bodyResolver_ = undefined;
  }

  /** @override */
  waitForBodyOpen() {
    return this.bodyPromise_;
  }

  /** @override */
  isReady() {
    return this.ready_;
  }

  /**
   * Signals that the shadow doc is ready.
   * @restricted
   */
  setReady() {
    devAssert(!this.ready_, 'Duplicate ready state');
    this.ready_ = true;
    this.readyResolver_();
    this.readyResolver_ = undefined;
  }

  /** @override */
  whenReady() {
    return this.readyPromise_;
  }

  /** @override */
  getMeta() {
    return /** @type {!{[key: string]: string}} */ (map(this.meta_));
  }

  /** @override */
  setMetaByName(name, content) {
    devAssert(name, 'Attempted to store invalid meta name/content pair');
    if (!this.meta_) {
      this.meta_ = map();
    }
    this.meta_[name] = content;
  }
}

/**
 * The version of `AmpDoc` for FIE embeds.
 * @package @visibleForTesting
 */
export class AmpDocFie extends AmpDoc {
  /**
   * @param {!Window} win
   * @param {string} url
   * @param {!AmpDoc} parent
   * @param {!AmpDocOptions=} opt_options
   */
  constructor(win, url, parent, opt_options) {
    super(win, parent, opt_options);

    /** @private @const {string} */
    this.url_ = url;

    /** @private @const {!Promise<!Element>} */
    this.bodyPromise_ = this.win.document.body
      ? Promise.resolve(this.win.document.body)
      : waitForBodyOpenPromise(this.win.document).then(() => this.getBody());

    /** @private {boolean} */
    this.ready_ = false;

    const readyDeferred = new Deferred();
    /** @private {!Promise} */
    this.readyPromise_ = readyDeferred.promise;
    /** @private {function()|undefined} */
    this.readyResolver_ = readyDeferred.resolve;
  }

  /** @override */
  isSingleDoc() {
    return false;
  }

  /** @override */
  getRootNode() {
    return this.win.document;
  }

  /** @override */
  getUrl() {
    return this.url_;
  }

  /** @override */
  getHeadNode() {
    return dev().assertElement(this.win.document.head);
  }

  /** @override */
  isBodyAvailable() {
    return !!this.win.document.body;
  }

  /** @override */
  getBody() {
    return dev().assertElement(this.win.document.body, 'body not available');
  }

  /** @override */
  waitForBodyOpen() {
    return this.bodyPromise_;
  }

  /** @override */
  isReady() {
    return this.ready_;
  }

  /** @override */
  whenReady() {
    return this.readyPromise_;
  }

  /**
   * Signals that the FIE doc is ready.
   * @restricted
   */
  setReady() {
    devAssert(!this.ready_, 'Duplicate ready state');
    this.ready_ = true;
    this.readyResolver_();
    this.readyResolver_ = undefined;
  }
}

/**
 * @param {!Window} win
 * @param {!{[key: string]: string}|undefined} initParams
 * @return {!{[key: string]: string}}
 */
function extractSingleDocParams(win, initParams) {
  const params = map();
  if (initParams) {
    // The initialization params take the highest precedence.
    Object.assign(params, initParams);
  } else {
    // Params can be passed via iframe hash/name with hash taking precedence.
    if (win.name && win.name.indexOf(PARAMS_SENTINEL) == 0) {
      Object.assign(
        params,
        parseQueryString(win.name.substring(PARAMS_SENTINEL.length))
      );
    }
    if (win.location && win.location.hash) {
      Object.assign(params, parseQueryString(win.location.hash));
    }
  }
  return params;
}

/**
 * Install the ampdoc service and immediately configure it for either a
 * single-doc or a shadow-doc mode. The mode cannot be changed after the
 * initial configuration.
 * @param {!Window} win
 * @param {boolean} isSingleDoc
 * @param {!{[key: string]: string}=} opt_initParams
 */
export function installDocService(win, isSingleDoc, opt_initParams) {
  registerServiceBuilder(win, 'ampdoc', function () {
    return new AmpDocService(win, isSingleDoc, opt_initParams);
  });
}
