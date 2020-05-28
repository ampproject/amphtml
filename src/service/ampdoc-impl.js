/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Deferred} from '../utils/promise';
import {Observable} from '../observable';
import {Signals} from '../utils/signals';
import {VisibilityState} from '../visibility-state';
import {
  addDocumentVisibilityChangeListener,
  getDocumentVisibilityState,
  removeDocumentVisibilityChangeListener,
} from '../utils/document-visibility';
import {dev, devAssert} from '../log';
import {getParentWindowFrameElement, registerServiceBuilder} from '../service';
import {getShadowRootNode} from '../shadow-embed';
import {isDocumentReady, whenDocumentReady} from '../document-ready';
import {isInAmpdocFieExperiment} from '../ampdoc-fie';
import {iterateCursor, rootNodeFor, waitForBodyOpenPromise} from '../dom';
import {map} from '../utils/object';
import {parseQueryString} from '../url';

/** @const {string} */
const AMPDOC_PROP = '__AMPDOC';

/** @const {string} */
const PARAMS_SENTINEL = '__AMP__';

/**
 * @typedef {{
 *   params: (!Object<string, string>|undefined),
 *   signals: (?Signals|undefined),
 *   visibilityState: (?VisibilityState|undefined),
 * }}
 */
export let AmpDocOptions;

/**
 * Private ampdoc signals.
 * @enum {string}
 */
const AmpDocSignals = {
  // Signals the document has become visible for the first time.
  FIRST_VISIBLE: '-ampdoc-first-visible',
  // Signals when the document becomes visible the next time.
  NEXT_VISIBLE: '-ampdoc-next-visible',
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
   * @param {!Object<string, string>=} opt_initParams
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

    /** @private {boolean} */
    this.ampdocFieExperimentOn_ = isInAmpdocFieExperiment(win);

    /** @private {boolean} */
    this.mightHaveShadowRoots_ = !isSingleDoc;
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
   * node. If the runtime is in the single-doc mode, the one global `AmpDoc`
   * instance is returned, unless specfically looking for a closer `AmpDoc`.
   * Otherwise, this method locates the `AmpDoc` that contains the specified
   * node and, if necessary, initializes it.
   *
   * TODO(#22733): rewrite docs once the ampdoc-fie is launched.
   *
   * @param {!Node} node
   * @return {?AmpDoc}
   */
  getAmpDocIfAvailable(node) {
    if (this.ampdocFieExperimentOn_) {
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

    // Otherwise discover and possibly create the ampdoc.
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

      // Traverse the boundary of a friendly iframe.
      const frameElement = getParentWindowFrameElement(n, this.win);
      if (frameElement) {
        n = frameElement;
        continue;
      }

      if (!this.mightHaveShadowRoots_) {
        break;
      }

      // Shadow doc.
      const shadowRoot =
        n.nodeType == /* DOCUMENT */ 9 ? n : getShadowRootNode(n);
      if (!shadowRoot) {
        break;
      }

      const ampdoc = shadowRoot[AMPDOC_PROP];
      if (ampdoc) {
        return ampdoc;
      }
      n = shadowRoot.host;
    }

    // If we were looking for the closest AmpDoc, then fall back to the single
    // doc if there is no other AmpDoc that is closer.
    return this.singleDoc_;
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
    // Ensure that node is attached if specified. This check uses a new and
    // fast `isConnected` API and thus only checked on platforms that have it.
    // See https://www.chromestatus.com/feature/5676110549352448.
    devAssert(
      node['isConnected'] === undefined || node['isConnected'] === true,
      'The node must be attached to request ampdoc.'
    );

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
    this.mightHaveShadowRoots_ = true;
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

    /** @private {!Object<../enums.AMPDOC_SINGLETON_NAME, boolean>} */
    this.registeredSingleton_ = map();

    /** @public @const {?AmpDoc} */
    this.parent_ = parent;

    /** @private @const */
    this.signals_ = (opt_options && opt_options.signals) || new Signals();

    /** @private {!Object<string, string>} */
    this.params_ = (opt_options && opt_options.params) || map();

    /** @protected {?Object<string, string>} */
    this.meta_ = null;

    /** @private @const {!Array<string>} */
    this.declaredExtensions_ = [];

    /** @private {?VisibilityState} */
    this.visibilityStateOverride_ =
      (opt_options && opt_options.visibilityState) ||
      (this.params_['visibilityState'] &&
        dev().assertEnumValue(
          VisibilityState,
          this.params_['visibilityState'],
          'VisibilityState'
        )) ||
      null;

    // Start with `null` to be updated by updateVisibilityState_ in the end
    // of the constructor to ensure the correct "update" logic and promise
    // resolution.
    /** @private {?VisibilityState} */
    this.visibilityState_ = null;

    /** @private @const {!Observable<!VisibilityState>} */
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

  /**
   * DO NOT CALL. Retained for backward compat during rollout.
   * @return {!Window}
   * @deprecated Use `ampdoc.win` instead.
   */
  getWin() {
    return this.win;
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
   * @return {!Object<string, string>}
   */
  getMeta() {
    if (this.meta_) {
      return map(this.meta_);
    }

    this.meta_ = map();
    const metaEls = dev()
      .assertElement(this.win.document.head)
      .querySelectorAll('meta[name]');
    iterateCursor(metaEls, (metaEl) => {
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
   * @return {boolean}
   */
  declaresExtension(extensionId) {
    return this.declaredExtensions_.indexOf(extensionId) != -1;
  }

  /**
   * Adds a declared extension to an ampdoc.
   * @param {string} extensionId
   * @restricted
   */
  declareExtension(extensionId) {
    if (!this.declaresExtension(extensionId)) {
      this.declaredExtensions_.push(extensionId);
    }
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
   * @param {!VisibilityState} visibilityState
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
    let parentVisibilityState = VisibilityState.VISIBLE;
    for (let p = this.parent_; p; p = p.getParent()) {
      if (p.getVisibilityState() != VisibilityState.VISIBLE) {
        parentVisibilityState = p.getVisibilityState();
        break;
      }
    }

    // Pick the most restricted visibility state.
    let visibilityState;
    const visibilityStateOverride =
      this.visibilityStateOverride_ || VisibilityState.VISIBLE;
    if (
      visibilityStateOverride == VisibilityState.VISIBLE &&
      parentVisibilityState == VisibilityState.VISIBLE &&
      naturalVisibilityState == VisibilityState.VISIBLE
    ) {
      visibilityState = VisibilityState.VISIBLE;
    } else if (
      naturalVisibilityState == VisibilityState.HIDDEN &&
      visibilityStateOverride == VisibilityState.PAUSED
    ) {
      // Hidden document state overrides "paused".
      visibilityState = naturalVisibilityState;
    } else if (
      visibilityStateOverride == VisibilityState.PAUSED ||
      visibilityStateOverride == VisibilityState.INACTIVE
    ) {
      visibilityState = visibilityStateOverride;
    } else if (
      parentVisibilityState == VisibilityState.PAUSED ||
      parentVisibilityState == VisibilityState.INACTIVE
    ) {
      visibilityState = parentVisibilityState;
    } else if (
      visibilityStateOverride == VisibilityState.PRERENDER ||
      naturalVisibilityState == VisibilityState.PRERENDER ||
      parentVisibilityState == VisibilityState.PRERENDER
    ) {
      visibilityState = VisibilityState.PRERENDER;
    } else {
      visibilityState = VisibilityState.HIDDEN;
    }

    if (this.visibilityState_ != visibilityState) {
      this.visibilityState_ = visibilityState;
      if (visibilityState == VisibilityState.VISIBLE) {
        this.lastVisibleTime_ = Date.now();
        this.signals_.signal(AmpDocSignals.FIRST_VISIBLE);
        this.signals_.signal(AmpDocSignals.NEXT_VISIBLE);
      } else {
        this.signals_.reset(AmpDocSignals.NEXT_VISIBLE);
      }
      this.visibilityStateHandlers_.fire();
    }
  }

  /**
   * Returns a Promise that only ever resolved when the current
   * AMP document first becomes visible.
   * @return {!Promise}
   */
  whenFirstVisible() {
    return this.signals_
      .whenSignal(AmpDocSignals.FIRST_VISIBLE)
      .then(() => undefined);
  }

  /**
   * Returns a Promise that resolve when current doc becomes visible.
   * The promise resolves immediately if doc is already visible.
   * @return {!Promise}
   */
  whenNextVisible() {
    return this.signals_
      .whenSignal(AmpDocSignals.NEXT_VISIBLE)
      .then(() => undefined);
  }

  /**
   * Returns the time when the document has become visible for the first time.
   * If document has not yet become visible, the returned value is `null`.
   * @return {?time}
   */
  getFirstVisibleTime() {
    return /** @type {?number} */ (this.signals_.get(
      AmpDocSignals.FIRST_VISIBLE
    ));
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
   * @return {!VisibilityState}
   */
  getVisibilityState() {
    return devAssert(this.visibilityState_);
  }

  /**
   * Whether the AMP document currently visible. The reasons why it might not
   * be visible include user switching to another tab, browser running the
   * document in the prerender mode or viewer running the document in the
   * prerender mode.
   * @return {boolean}
   */
  isVisible() {
    return this.visibilityState_ == VisibilityState.VISIBLE;
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
   * @param {function(!VisibilityState)} handler
   * @return {!UnlistenDef}
   */
  onVisibilityChanged(handler) {
    return this.visibilityStateHandlers_.add(handler);
  }

  /**
   * Attempt to register a singleton for each ampdoc.
   * Caller need to handle user error when registration returns false.
   * @param {!../enums.AMPDOC_SINGLETON_NAME} name
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
    return this.win.location.href;
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
    return /** @type {!Object<string,string>} */ (map(this.meta_));
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
 * @param {!Object<string, string>|undefined} initParams
 * @return {!Object<string, string>}
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
 * @param {!Object<string, string>=} opt_initParams
 */
export function installDocService(win, isSingleDoc, opt_initParams) {
  registerServiceBuilder(win, 'ampdoc', function () {
    return new AmpDocService(win, isSingleDoc, opt_initParams);
  });
}

/**
 * @param {AmpDocService} ampdocService
 * @param {boolean} value
 * @visibleForTesting
 */
export function updateFieModeForTesting(ampdocService, value) {
  // TODO(#22733): remove this method once ampdoc-fie is launched.
  ampdocService.ampdocFieExperimentOn_ = value;
}
