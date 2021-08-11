function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { VisibilityState } from "../core/constants/visibility-state";
import { Observable } from "../core/data-structures/observable";
import { Deferred } from "../core/data-structures/promise";
import { Signals } from "../core/data-structures/signals";
import { isDocumentReady, whenDocumentReady } from "../core/document-ready";
import { addDocumentVisibilityChangeListener, getDocumentVisibilityState, removeDocumentVisibilityChangeListener } from "../core/document-visibility";
import { iterateCursor, rootNodeFor, waitForBodyOpenPromise } from "../core/dom";
import { isEnumValue } from "../core/types";
import { map } from "../core/types/object";
import { parseQueryString } from "../core/types/string/url";
import { WindowInterface } from "../core/window/interface";
import { dev, devAssert } from "../log";
import { disposeServicesForDoc, getParentWindowFrameElement, registerServiceBuilder } from "../service-helpers";

/** @const {string} */
var AMPDOC_PROP = '__AMPDOC';

/** @const {string} */
var PARAMS_SENTINEL = '__AMP__';

/**
 * @typedef {{
 *   params: (!Object<string, string>|undefined),
 *   signals: (?Signals|undefined),
 *   visibilityState: (?VisibilityState|undefined),
 * }}
 */
export var AmpDocOptions;

/**
 * Private ampdoc signals.
 * @enum {string}
 */
var AmpDocSignals = {
  // A complete preinstalled list of extensions is known.
  EXTENSIONS_KNOWN: '-ampdoc-ext-known',
  // Signals the document has become visible for the first time.
  FIRST_VISIBLE: '-ampdoc-first-visible',
  // Signals when the document becomes visible the next time.
  NEXT_VISIBLE: '-ampdoc-next-visible'
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
export var AmpDocService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {boolean} isSingleDoc
   * @param {!Object<string, string>=} opt_initParams
   */
  function AmpDocService(win, isSingleDoc, opt_initParams) {
    _classCallCheck(this, AmpDocService);

    /** @const {!Window} */
    this.win = win;

    /** @private {?AmpDoc} */
    this.singleDoc_ = null;

    if (isSingleDoc) {
      this.singleDoc_ = new AmpDocSingle(win, {
        params: extractSingleDocParams(win, opt_initParams)
      });
      win.document[AMPDOC_PROP] = this.singleDoc_;
    }
  }

  /**
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */
  _createClass(AmpDocService, [{
    key: "isSingleDoc",
    value: function isSingleDoc() {
      // TODO(#22733): remove when ampdoc-fie is launched.
      return !!this.singleDoc_;
    }
    /**
     * Returns the document in the single-doc mode. In a multi-doc mode, an
     * error will be thrown.
     * @return {!AmpDoc}
     */

  }, {
    key: "getSingleDoc",
    value: function getSingleDoc() {
      // TODO(#22733): once docroot migration is done, this should be renamed
      // to `getTopDoc()` method.
      return devAssert(this.singleDoc_);
    }
    /**
     * If the node is an AMP custom element, retrieves the AmpDoc reference.
     * @param {!Node} node
     * @return {?AmpDoc} The AmpDoc reference, if one exists.
     */

  }, {
    key: "getCustomElementAmpDocReference_",
    value: function getCustomElementAmpDocReference_(node) {
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

  }, {
    key: "getAmpDocIfAvailable",
    value: function getAmpDocIfAvailable(node) {
      var n = node;

      while (n) {
        // A custom element may already have the reference. If we are looking
        // for the closest AmpDoc, the element might have a reference to the
        // global AmpDoc, which we do not want. This occurs when using
        // <amp-next-page>.
        var cachedAmpDoc = this.getCustomElementAmpDocReference_(node);

        if (cachedAmpDoc) {
          return cachedAmpDoc;
        }

        // Root note: it's either a document, or a shadow document.
        var rootNode = rootNodeFor(n);

        if (!rootNode) {
          break;
        }

        var ampdoc = rootNode[AMPDOC_PROP];

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

  }, {
    key: "getAmpDoc",
    value: function getAmpDoc(node) {
      var ampdoc = this.getAmpDocIfAvailable(node);

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

  }, {
    key: "installShadowDoc",
    value: function installShadowDoc(url, shadowRoot, opt_options) {
      devAssert(!shadowRoot[AMPDOC_PROP], 'The shadow root already contains ampdoc');
      var ampdoc = new AmpDocShadow(this.win, url, shadowRoot, opt_options);
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

  }, {
    key: "installFieDoc",
    value: function installFieDoc(url, childWin, opt_options) {
      var doc = childWin.document;
      devAssert(!doc[AMPDOC_PROP], 'The fie already contains ampdoc');
      var frameElement = devAssert(childWin.frameElement);
      var ampdoc = new AmpDocFie(childWin, url, this.getAmpDoc(frameElement), opt_options);
      doc[AMPDOC_PROP] = ampdoc;
      return ampdoc;
    }
  }]);

  return AmpDocService;
}();

/**
 * This class represents a single ampdoc. `AmpDocService` can contain only one
 * global ampdoc or multiple, depending on the runtime mode: single-doc or
 * shadow-doc.
 * @abstract
 * @package
 */
export var AmpDoc = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {?AmpDoc} parent
   * @param {!AmpDocOptions=} opt_options
   */
  function AmpDoc(win, parent, opt_options) {
    var _this = this;

    _classCallCheck(this, AmpDoc);

    /** @public @const {!Window} */
    this.win = win;

    /** @private {!Object<../enums.AMPDOC_SINGLETON_NAME, boolean>} */
    this.registeredSingleton_ = map();

    /** @public @const {?AmpDoc} */
    this.parent_ = parent;

    /** @private @const */
    this.signals_ = opt_options && opt_options.signals || new Signals();

    /** @private {!Object<string, string>} */
    this.params_ = opt_options && opt_options.params || map();

    /** @protected {?Object<string, string>} */
    this.meta_ = null;

    /** @private @const {!Object<string, string>} */
    this.declaredExtensions_ = {};
    var paramsVisibilityState = this.params_['visibilityState'];
    devAssert(!paramsVisibilityState || isEnumValue(VisibilityState, paramsVisibilityState));

    /** @private {?VisibilityState} */
    this.visibilityStateOverride_ = opt_options && opt_options.visibilityState || paramsVisibilityState || null;
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
    var boundUpdateVisibilityState = this.updateVisibilityState_.bind(this);

    if (this.parent_) {
      this.unsubsribes_.push(this.parent_.onVisibilityChanged(boundUpdateVisibilityState));
    }

    addDocumentVisibilityChangeListener(this.win.document, boundUpdateVisibilityState);
    this.unsubsribes_.push(function () {
      return removeDocumentVisibilityChangeListener(_this.win.document, boundUpdateVisibilityState);
    });
    this.updateVisibilityState_();
  }

  /**
   * Dispose the document.
   */
  _createClass(AmpDoc, [{
    key: "dispose",
    value: function dispose() {
      disposeServicesForDoc(this);
      this.unsubsribes_.forEach(function (unsubsribe) {
        return unsubsribe();
      });
    }
    /**
     * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
     * mode that supports multiple documents per a single window.
     * @return {boolean}
     */

  }, {
    key: "isSingleDoc",
    value: function isSingleDoc() {
      // TODO(#22733): remove when ampdoc-fie is launched.
      return (
        /** @type {?} */
        devAssert(null, 'not implemented')
      );
    }
    /**
     * @return {?AmpDoc}
     */

  }, {
    key: "getParent",
    value: function getParent() {
      return this.parent_;
    }
    /**
     * DO NOT CALL. Retained for backward compat during rollout.
     * @return {!Window}
     * @deprecated Use `ampdoc.win` instead.
     */

  }, {
    key: "getWin",
    value: function getWin() {
      return this.win;
    }
    /** @return {!Signals} */

  }, {
    key: "signals",
    value: function signals() {
      return this.signals_;
    }
    /**
     * Returns the value of a ampdoc's startup parameter with the specified
     * name or `null` if the parameter wasn't defined at startup time.
     * @param {string} name
     * @return {?string}
     */

  }, {
    key: "getParam",
    value: function getParam(name) {
      var v = this.params_[name];
      return v == null ? null : v;
    }
    /**
     * Initializes (if necessary) cached map of an ampdoc's meta name values to
     * their associated content values and returns the map.
     * @return {!Object<string, string>}
     */

  }, {
    key: "getMeta",
    value: function getMeta() {
      var _this2 = this;

      if (this.meta_) {
        return map(this.meta_);
      }

      this.meta_ = map();
      var metaEls = dev().assertElement(this.win.document.head).querySelectorAll('meta[name]');
      iterateCursor(metaEls, function (metaEl) {
        var name = metaEl.getAttribute('name');
        var content = metaEl.getAttribute('content');

        if (!name || content === null) {
          return;
        }

        // Retain only the first meta content value for a given name
        if (_this2.meta_[name] === undefined) {
          _this2.meta_[name] = content;
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

  }, {
    key: "getMetaByName",
    value: function getMetaByName(name) {
      if (!name) {
        return null;
      }

      var content = this.getMeta()[name];
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

  }, {
    key: "setMetaByName",
    value: function setMetaByName(unusedName, unusedContent) {
      devAssert(null, 'not implemented');
    }
    /**
     * Returns whether the specified extension has been declared on this ampdoc.
     * @param {string} extensionId
     * @param {string=} opt_version
     * @return {boolean}
     */

  }, {
    key: "declaresExtension",
    value: function declaresExtension(extensionId, opt_version) {
      var declared = this.declaredExtensions_[extensionId];

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

  }, {
    key: "declareExtension",
    value: function declareExtension(extensionId, version) {
      devAssert(!this.declaredExtensions_[extensionId] || this.declaredExtensions_[extensionId] === version, 'extension already declared %s', extensionId);
      this.declaredExtensions_[extensionId] = version;
    }
    /**
     * @param {string} extensionId
     * @return {?string}
     */

  }, {
    key: "getExtensionVersion",
    value: function getExtensionVersion(extensionId) {
      return this.declaredExtensions_[extensionId] || null;
    }
    /**
     * Signal that the initial document set of extensions is known.
     * @restricted
     */

  }, {
    key: "setExtensionsKnown",
    value: function setExtensionsKnown() {
      this.signals_.signal(AmpDocSignals.EXTENSIONS_KNOWN);
    }
    /**
     * Resolved when the initial document set of extension is known.
     * @return {!Promise}
     */

  }, {
    key: "whenExtensionsKnown",
    value: function whenExtensionsKnown() {
      return this.signals_.whenSignal(AmpDocSignals.EXTENSIONS_KNOWN);
    }
    /**
     * Returns the root node for this ampdoc. It will either be a `Document` for
     * the single-doc runtime mode, or a `ShadowRoot` for shadow-doc mode. This
     * node can be used, among other things, to add ampdoc-wide event listeners.
     *
     * @return {!Document|!ShadowRoot}
     */

  }, {
    key: "getRootNode",
    value: function getRootNode() {
      return (
        /** @type {?} */
        devAssert(null, 'not implemented')
      );
    }
    /**
     * Returns the head node. It's either an element or a shadow root.
     * @return {!Element|!ShadowRoot}
     * @abstract
     */

  }, {
    key: "getHeadNode",
    value: function getHeadNode() {}
    /**
     * Returns `true` if the ampdoc's body is available.
     *
     * @return {boolean}
     */

  }, {
    key: "isBodyAvailable",
    value: function isBodyAvailable() {
      return (
        /** @type {?} */
        devAssert(false, 'not implemented')
      );
    }
    /**
     * Returns the ampdoc's body. Requires the body to already be available.
     *
     * See `isBodyAvailable` and `waitForBodyOpen`.
     *
     * @return {!Element}
     */

  }, {
    key: "getBody",
    value: function getBody() {
      return (
        /** @type {?} */
        devAssert(null, 'not implemented')
      );
    }
    /**
     * Returns a promise that will be resolved when the ampdoc's body is
     * available.
     * @return {!Promise<!Element>}
     */

  }, {
    key: "waitForBodyOpen",
    value: function waitForBodyOpen() {
      return (
        /** @type {?} */
        devAssert(null, 'not implemented')
      );
    }
    /**
     * Returns `true` if document is ready.
     *
     * See `whenReady`.
     *
     * @return {boolean}
     */

  }, {
    key: "isReady",
    value: function isReady() {
      return (
        /** @type {?} */
        devAssert(null, 'not implemented')
      );
    }
    /**
     * Returns a promise that will be resolved when the ampdoc's DOM is fully
     * ready.
     * @return {!Promise}
     */

  }, {
    key: "whenReady",
    value: function whenReady() {
      return (
        /** @type {?} */
        devAssert(null, 'not implemented')
      );
    }
    /**
     * Returns the URL from which the document was loaded.
     * @return {string}
     */

  }, {
    key: "getUrl",
    value: function getUrl() {
      return (
        /** @type {?} */
        devAssert(null, 'not implemented')
      );
    }
    /**
     * Locates an element with the specified ID within the ampdoc. In the
     * shadow-doc mode, when multiple documents could be present, this method
     * localizes search only to the DOM subtree specific to this ampdoc.
     *
     * @param {string} id
     * @return {?Element}
     */

  }, {
    key: "getElementById",
    value: function getElementById(id) {
      return this.getRootNode().getElementById(id);
    }
    /**
     * Whether the node is currently contained in the DOM of the root.
     * @param {?Node} node
     * @return {boolean}
     */

  }, {
    key: "contains",
    value: function contains(node) {
      return this.getRootNode().contains(node);
    }
    /**
     * @param {!VisibilityState} visibilityState
     * @restricted
     */

  }, {
    key: "overrideVisibilityState",
    value: function overrideVisibilityState(visibilityState) {
      if (this.visibilityStateOverride_ != visibilityState) {
        this.visibilityStateOverride_ = visibilityState;
        this.updateVisibilityState_();
      }
    }
    /** @private */

  }, {
    key: "updateVisibilityState_",
    value: function updateVisibilityState_() {
      // Natural visibility state.
      var naturalVisibilityState = getDocumentVisibilityState(this.win.document);
      // Parent visibility: pick the first non-visible state.
      var parentVisibilityState = VisibilityState.VISIBLE;

      for (var p = this.parent_; p; p = p.getParent()) {
        if (p.getVisibilityState() != VisibilityState.VISIBLE) {
          parentVisibilityState = p.getVisibilityState();
          break;
        }
      }

      // Pick the most restricted visibility state.
      var visibilityState;
      var visibilityStateOverride = this.visibilityStateOverride_ || VisibilityState.VISIBLE;

      if (visibilityStateOverride == VisibilityState.VISIBLE && parentVisibilityState == VisibilityState.VISIBLE && naturalVisibilityState == VisibilityState.VISIBLE) {
        visibilityState = VisibilityState.VISIBLE;
      } else if (naturalVisibilityState == VisibilityState.HIDDEN && visibilityStateOverride == VisibilityState.PAUSED) {
        // Hidden document state overrides "paused".
        visibilityState = naturalVisibilityState;
      } else if (visibilityStateOverride == VisibilityState.PAUSED || visibilityStateOverride == VisibilityState.INACTIVE) {
        visibilityState = visibilityStateOverride;
      } else if (parentVisibilityState == VisibilityState.PAUSED || parentVisibilityState == VisibilityState.INACTIVE) {
        visibilityState = parentVisibilityState;
      } else if (visibilityStateOverride == VisibilityState.PRERENDER || naturalVisibilityState == VisibilityState.PRERENDER || parentVisibilityState == VisibilityState.PRERENDER) {
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

  }, {
    key: "whenFirstVisible",
    value: function whenFirstVisible() {
      return this.signals_.whenSignal(AmpDocSignals.FIRST_VISIBLE).then(function () {
        return undefined;
      });
    }
    /**
     * Returns a Promise that resolve when current doc becomes visible.
     * The promise resolves immediately if doc is already visible.
     * @return {!Promise}
     */

  }, {
    key: "whenNextVisible",
    value: function whenNextVisible() {
      return this.signals_.whenSignal(AmpDocSignals.NEXT_VISIBLE).then(function () {
        return undefined;
      });
    }
    /**
     * Returns the time when the document has become visible for the first time.
     * If document has not yet become visible, the returned value is `null`.
     * @return {?time}
     */

  }, {
    key: "getFirstVisibleTime",
    value: function getFirstVisibleTime() {
      return (
        /** @type {?number} */
        this.signals_.get(AmpDocSignals.FIRST_VISIBLE)
      );
    }
    /**
     * Returns the time when the document has become visible for the last time.
     * If document has not yet become visible, the returned value is `null`.
     * @return {?time}
     */

  }, {
    key: "getLastVisibleTime",
    value: function getLastVisibleTime() {
      return this.lastVisibleTime_;
    }
    /**
     * Returns visibility state configured by the viewer.
     * See {@link isVisible}.
     * @return {!VisibilityState}
     */

  }, {
    key: "getVisibilityState",
    value: function getVisibilityState() {
      return devAssert(this.visibilityState_);
    }
    /**
     * Whether the AMP document currently visible. The reasons why it might not
     * be visible include user switching to another tab, browser running the
     * document in the prerender mode or viewer running the document in the
     * prerender mode.
     * @return {boolean}
     */

  }, {
    key: "isVisible",
    value: function isVisible() {
      return this.visibilityState_ == VisibilityState.VISIBLE;
    }
    /**
     * Whether the AMP document has been ever visible before. Since the visiblity
     * state of a document can be flipped back and forth we sometimes want to know
     * if a document has ever been visible.
     * @return {boolean}
     */

  }, {
    key: "hasBeenVisible",
    value: function hasBeenVisible() {
      return this.getLastVisibleTime() != null;
    }
    /**
     * Adds a "visibilitychange" event listener for viewer events. The
     * callback can check {@link isVisible} and {@link getPrefetchCount}
     * methods for more info.
     * @param {function(!VisibilityState)} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onVisibilityChanged",
    value: function onVisibilityChanged(handler) {
      return this.visibilityStateHandlers_.add(handler);
    }
    /**
     * Attempt to register a singleton for each ampdoc.
     * Caller need to handle user error when registration returns false.
     * @param {!../enums.AMPDOC_SINGLETON_NAME} name
     * @return {boolean}
     */

  }, {
    key: "registerSingleton",
    value: function registerSingleton(name) {
      if (!this.registeredSingleton_[name]) {
        this.registeredSingleton_[name] = true;
        return true;
      }

      return false;
    }
  }]);

  return AmpDoc;
}();

/**
 * The version of `AmpDoc` in the single-doc mode that corresponds to the
 * global `window.document`.
 * @package @visibleForTesting
 */
export var AmpDocSingle = /*#__PURE__*/function (_AmpDoc) {
  _inherits(AmpDocSingle, _AmpDoc);

  var _super = _createSuper(AmpDocSingle);

  /**
   * @param {!Window} win
   * @param {!AmpDocOptions=} opt_options
   */
  function AmpDocSingle(win, opt_options) {
    var _this3;

    _classCallCheck(this, AmpDocSingle);

    _this3 = _super.call(this, win,
    /* parent */
    null, opt_options);

    /** @private @const {!Promise<!Element>} */
    _this3.bodyPromise_ = _this3.win.document.body ? Promise.resolve(_this3.win.document.body) : waitForBodyOpenPromise(_this3.win.document).then(function () {
      return _this3.getBody();
    });

    /** @private @const {!Promise} */
    _this3.readyPromise_ = whenDocumentReady(_this3.win.document);
    return _this3;
  }

  /** @override */
  _createClass(AmpDocSingle, [{
    key: "isSingleDoc",
    value: function isSingleDoc() {
      return true;
    }
    /** @override */

  }, {
    key: "getRootNode",
    value: function getRootNode() {
      return this.win.document;
    }
    /** @override */

  }, {
    key: "getUrl",
    value: function getUrl() {
      return WindowInterface.getLocation(this.win).href;
    }
    /** @override */

  }, {
    key: "getHeadNode",
    value: function getHeadNode() {
      return dev().assertElement(this.win.document.head);
    }
    /** @override */

  }, {
    key: "isBodyAvailable",
    value: function isBodyAvailable() {
      return !!this.win.document.body;
    }
    /** @override */

  }, {
    key: "getBody",
    value: function getBody() {
      return dev().assertElement(this.win.document.body, 'body not available');
    }
    /** @override */

  }, {
    key: "waitForBodyOpen",
    value: function waitForBodyOpen() {
      return this.bodyPromise_;
    }
    /** @override */

  }, {
    key: "isReady",
    value: function isReady() {
      return isDocumentReady(this.win.document);
    }
    /** @override */

  }, {
    key: "whenReady",
    value: function whenReady() {
      return this.readyPromise_;
    }
  }]);

  return AmpDocSingle;
}(AmpDoc);

/**
 * The version of `AmpDoc` in the shadow-doc mode that is allocated for each
 * ampdoc hosted within a shadow root.
 * @package @visibleForTesting
 */
export var AmpDocShadow = /*#__PURE__*/function (_AmpDoc2) {
  _inherits(AmpDocShadow, _AmpDoc2);

  var _super2 = _createSuper(AmpDocShadow);

  /**
   * @param {!Window} win
   * @param {string} url
   * @param {!ShadowRoot} shadowRoot
   * @param {!AmpDocOptions=} opt_options
   */
  function AmpDocShadow(win, url, shadowRoot, opt_options) {
    var _this4;

    _classCallCheck(this, AmpDocShadow);

    _this4 = _super2.call(this, win,
    /* parent */
    null, opt_options);

    /** @private @const {string} */
    _this4.url_ = url;

    /** @private @const {!ShadowRoot} */
    _this4.shadowRoot_ = shadowRoot;

    /** @private {?Element} */
    _this4.body_ = null;
    var bodyDeferred = new Deferred();

    /** @private {!Promise<!Element>} */
    _this4.bodyPromise_ = bodyDeferred.promise;

    /** @private {function(!Element)|undefined} */
    _this4.bodyResolver_ = bodyDeferred.resolve;

    /** @private {boolean} */
    _this4.ready_ = false;
    var readyDeferred = new Deferred();

    /** @private {!Promise} */
    _this4.readyPromise_ = readyDeferred.promise;

    /** @private {function()|undefined} */
    _this4.readyResolver_ = readyDeferred.resolve;
    return _this4;
  }

  /** @override */
  _createClass(AmpDocShadow, [{
    key: "isSingleDoc",
    value: function isSingleDoc() {
      return false;
    }
    /** @override */

  }, {
    key: "getRootNode",
    value: function getRootNode() {
      return this.shadowRoot_;
    }
    /** @override */

  }, {
    key: "getUrl",
    value: function getUrl() {
      return this.url_;
    }
    /** @override */

  }, {
    key: "getHeadNode",
    value: function getHeadNode() {
      return this.shadowRoot_;
    }
    /** @override */

  }, {
    key: "isBodyAvailable",
    value: function isBodyAvailable() {
      return !!this.body_;
    }
    /** @override */

  }, {
    key: "getBody",
    value: function getBody() {
      return dev().assertElement(this.body_, 'body not available');
    }
    /**
     * Signals that the shadow doc has a body.
     * @param {!Element} body
     * @restricted
     */

  }, {
    key: "setBody",
    value: function setBody(body) {
      devAssert(!this.body_, 'Duplicate body');
      this.body_ = body;
      this.bodyResolver_(body);
      this.bodyResolver_ = undefined;
    }
    /** @override */

  }, {
    key: "waitForBodyOpen",
    value: function waitForBodyOpen() {
      return this.bodyPromise_;
    }
    /** @override */

  }, {
    key: "isReady",
    value: function isReady() {
      return this.ready_;
    }
    /**
     * Signals that the shadow doc is ready.
     * @restricted
     */

  }, {
    key: "setReady",
    value: function setReady() {
      devAssert(!this.ready_, 'Duplicate ready state');
      this.ready_ = true;
      this.readyResolver_();
      this.readyResolver_ = undefined;
    }
    /** @override */

  }, {
    key: "whenReady",
    value: function whenReady() {
      return this.readyPromise_;
    }
    /** @override */

  }, {
    key: "getMeta",
    value: function getMeta() {
      return (
        /** @type {!Object<string,string>} */
        map(this.meta_)
      );
    }
    /** @override */

  }, {
    key: "setMetaByName",
    value: function setMetaByName(name, content) {
      devAssert(name, 'Attempted to store invalid meta name/content pair');

      if (!this.meta_) {
        this.meta_ = map();
      }

      this.meta_[name] = content;
    }
  }]);

  return AmpDocShadow;
}(AmpDoc);

/**
 * The version of `AmpDoc` for FIE embeds.
 * @package @visibleForTesting
 */
export var AmpDocFie = /*#__PURE__*/function (_AmpDoc3) {
  _inherits(AmpDocFie, _AmpDoc3);

  var _super3 = _createSuper(AmpDocFie);

  /**
   * @param {!Window} win
   * @param {string} url
   * @param {!AmpDoc} parent
   * @param {!AmpDocOptions=} opt_options
   */
  function AmpDocFie(win, url, parent, opt_options) {
    var _this5;

    _classCallCheck(this, AmpDocFie);

    _this5 = _super3.call(this, win, parent, opt_options);

    /** @private @const {string} */
    _this5.url_ = url;

    /** @private @const {!Promise<!Element>} */
    _this5.bodyPromise_ = _this5.win.document.body ? Promise.resolve(_this5.win.document.body) : waitForBodyOpenPromise(_this5.win.document).then(function () {
      return _this5.getBody();
    });

    /** @private {boolean} */
    _this5.ready_ = false;
    var readyDeferred = new Deferred();

    /** @private {!Promise} */
    _this5.readyPromise_ = readyDeferred.promise;

    /** @private {function()|undefined} */
    _this5.readyResolver_ = readyDeferred.resolve;
    return _this5;
  }

  /** @override */
  _createClass(AmpDocFie, [{
    key: "isSingleDoc",
    value: function isSingleDoc() {
      return false;
    }
    /** @override */

  }, {
    key: "getRootNode",
    value: function getRootNode() {
      return this.win.document;
    }
    /** @override */

  }, {
    key: "getUrl",
    value: function getUrl() {
      return this.url_;
    }
    /** @override */

  }, {
    key: "getHeadNode",
    value: function getHeadNode() {
      return dev().assertElement(this.win.document.head);
    }
    /** @override */

  }, {
    key: "isBodyAvailable",
    value: function isBodyAvailable() {
      return !!this.win.document.body;
    }
    /** @override */

  }, {
    key: "getBody",
    value: function getBody() {
      return dev().assertElement(this.win.document.body, 'body not available');
    }
    /** @override */

  }, {
    key: "waitForBodyOpen",
    value: function waitForBodyOpen() {
      return this.bodyPromise_;
    }
    /** @override */

  }, {
    key: "isReady",
    value: function isReady() {
      return this.ready_;
    }
    /** @override */

  }, {
    key: "whenReady",
    value: function whenReady() {
      return this.readyPromise_;
    }
    /**
     * Signals that the FIE doc is ready.
     * @restricted
     */

  }, {
    key: "setReady",
    value: function setReady() {
      devAssert(!this.ready_, 'Duplicate ready state');
      this.ready_ = true;
      this.readyResolver_();
      this.readyResolver_ = undefined;
    }
  }]);

  return AmpDocFie;
}(AmpDoc);

/**
 * @param {!Window} win
 * @param {!Object<string, string>|undefined} initParams
 * @return {!Object<string, string>}
 */
function extractSingleDocParams(win, initParams) {
  var params = map();

  if (initParams) {
    // The initialization params take the highest precedence.
    Object.assign(params, initParams);
  } else {
    // Params can be passed via iframe hash/name with hash taking precedence.
    if (win.name && win.name.indexOf(PARAMS_SENTINEL) == 0) {
      Object.assign(params, parseQueryString(win.name.substring(PARAMS_SENTINEL.length)));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcGRvYy1pbXBsLmpzIl0sIm5hbWVzIjpbIlZpc2liaWxpdHlTdGF0ZSIsIk9ic2VydmFibGUiLCJEZWZlcnJlZCIsIlNpZ25hbHMiLCJpc0RvY3VtZW50UmVhZHkiLCJ3aGVuRG9jdW1lbnRSZWFkeSIsImFkZERvY3VtZW50VmlzaWJpbGl0eUNoYW5nZUxpc3RlbmVyIiwiZ2V0RG9jdW1lbnRWaXNpYmlsaXR5U3RhdGUiLCJyZW1vdmVEb2N1bWVudFZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lciIsIml0ZXJhdGVDdXJzb3IiLCJyb290Tm9kZUZvciIsIndhaXRGb3JCb2R5T3BlblByb21pc2UiLCJpc0VudW1WYWx1ZSIsIm1hcCIsInBhcnNlUXVlcnlTdHJpbmciLCJXaW5kb3dJbnRlcmZhY2UiLCJkZXYiLCJkZXZBc3NlcnQiLCJkaXNwb3NlU2VydmljZXNGb3JEb2MiLCJnZXRQYXJlbnRXaW5kb3dGcmFtZUVsZW1lbnQiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyIiwiQU1QRE9DX1BST1AiLCJQQVJBTVNfU0VOVElORUwiLCJBbXBEb2NPcHRpb25zIiwiQW1wRG9jU2lnbmFscyIsIkVYVEVOU0lPTlNfS05PV04iLCJGSVJTVF9WSVNJQkxFIiwiTkVYVF9WSVNJQkxFIiwiQW1wRG9jU2VydmljZSIsIndpbiIsImlzU2luZ2xlRG9jIiwib3B0X2luaXRQYXJhbXMiLCJzaW5nbGVEb2NfIiwiQW1wRG9jU2luZ2xlIiwicGFyYW1zIiwiZXh0cmFjdFNpbmdsZURvY1BhcmFtcyIsImRvY3VtZW50Iiwibm9kZSIsImV2ZXJBdHRhY2hlZCIsImdldEFtcERvYyIsIm4iLCJjYWNoZWRBbXBEb2MiLCJnZXRDdXN0b21FbGVtZW50QW1wRG9jUmVmZXJlbmNlXyIsInJvb3ROb2RlIiwiYW1wZG9jIiwiaG9zdCIsImdldEFtcERvY0lmQXZhaWxhYmxlIiwiY3JlYXRlRXJyb3IiLCJ1cmwiLCJzaGFkb3dSb290Iiwib3B0X29wdGlvbnMiLCJBbXBEb2NTaGFkb3ciLCJjaGlsZFdpbiIsImRvYyIsImZyYW1lRWxlbWVudCIsIkFtcERvY0ZpZSIsIkFtcERvYyIsInBhcmVudCIsInJlZ2lzdGVyZWRTaW5nbGV0b25fIiwicGFyZW50XyIsInNpZ25hbHNfIiwic2lnbmFscyIsInBhcmFtc18iLCJtZXRhXyIsImRlY2xhcmVkRXh0ZW5zaW9uc18iLCJwYXJhbXNWaXNpYmlsaXR5U3RhdGUiLCJ2aXNpYmlsaXR5U3RhdGVPdmVycmlkZV8iLCJ2aXNpYmlsaXR5U3RhdGUiLCJ2aXNpYmlsaXR5U3RhdGVfIiwidmlzaWJpbGl0eVN0YXRlSGFuZGxlcnNfIiwibGFzdFZpc2libGVUaW1lXyIsInVuc3Vic3JpYmVzXyIsImJvdW5kVXBkYXRlVmlzaWJpbGl0eVN0YXRlIiwidXBkYXRlVmlzaWJpbGl0eVN0YXRlXyIsImJpbmQiLCJwdXNoIiwib25WaXNpYmlsaXR5Q2hhbmdlZCIsImZvckVhY2giLCJ1bnN1YnNyaWJlIiwibmFtZSIsInYiLCJtZXRhRWxzIiwiYXNzZXJ0RWxlbWVudCIsImhlYWQiLCJxdWVyeVNlbGVjdG9yQWxsIiwibWV0YUVsIiwiZ2V0QXR0cmlidXRlIiwiY29udGVudCIsInVuZGVmaW5lZCIsImdldE1ldGEiLCJ1bnVzZWROYW1lIiwidW51c2VkQ29udGVudCIsImV4dGVuc2lvbklkIiwib3B0X3ZlcnNpb24iLCJkZWNsYXJlZCIsInZlcnNpb24iLCJzaWduYWwiLCJ3aGVuU2lnbmFsIiwiaWQiLCJnZXRSb290Tm9kZSIsImdldEVsZW1lbnRCeUlkIiwiY29udGFpbnMiLCJuYXR1cmFsVmlzaWJpbGl0eVN0YXRlIiwicGFyZW50VmlzaWJpbGl0eVN0YXRlIiwiVklTSUJMRSIsInAiLCJnZXRQYXJlbnQiLCJnZXRWaXNpYmlsaXR5U3RhdGUiLCJ2aXNpYmlsaXR5U3RhdGVPdmVycmlkZSIsIkhJRERFTiIsIlBBVVNFRCIsIklOQUNUSVZFIiwiUFJFUkVOREVSIiwiRGF0ZSIsIm5vdyIsInJlc2V0IiwiZmlyZSIsInRoZW4iLCJnZXQiLCJnZXRMYXN0VmlzaWJsZVRpbWUiLCJoYW5kbGVyIiwiYWRkIiwiYm9keVByb21pc2VfIiwiYm9keSIsIlByb21pc2UiLCJyZXNvbHZlIiwiZ2V0Qm9keSIsInJlYWR5UHJvbWlzZV8iLCJnZXRMb2NhdGlvbiIsImhyZWYiLCJ1cmxfIiwic2hhZG93Um9vdF8iLCJib2R5XyIsImJvZHlEZWZlcnJlZCIsInByb21pc2UiLCJib2R5UmVzb2x2ZXJfIiwicmVhZHlfIiwicmVhZHlEZWZlcnJlZCIsInJlYWR5UmVzb2x2ZXJfIiwiaW5pdFBhcmFtcyIsIk9iamVjdCIsImFzc2lnbiIsImluZGV4T2YiLCJzdWJzdHJpbmciLCJsZW5ndGgiLCJsb2NhdGlvbiIsImhhc2giLCJpbnN0YWxsRG9jU2VydmljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxlQUFSO0FBQ0EsU0FBUUMsVUFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsZUFBUixFQUF5QkMsaUJBQXpCO0FBQ0EsU0FDRUMsbUNBREYsRUFFRUMsMEJBRkYsRUFHRUMsc0NBSEY7QUFLQSxTQUFRQyxhQUFSLEVBQXVCQyxXQUF2QixFQUFvQ0Msc0JBQXBDO0FBQ0EsU0FBUUMsV0FBUjtBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLGVBQVI7QUFFQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFDQSxTQUNFQyxxQkFERixFQUVFQywyQkFGRixFQUdFQyxzQkFIRjs7QUFNQTtBQUNBLElBQU1DLFdBQVcsR0FBRyxVQUFwQjs7QUFFQTtBQUNBLElBQU1DLGVBQWUsR0FBRyxTQUF4Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSUMsYUFBSjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLGFB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UUFBSixDQUFhQyxJQUFkLENBQXRDO0FBQ0Q7QUFDRjs7QUFDRCxTQUFPaEgsTUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNpSCxpQkFBVCxDQUEyQnRILEdBQTNCLEVBQWdDQyxXQUFoQyxFQUE2Q0MsY0FBN0MsRUFBNkQ7QUFDbEVYLEVBQUFBLHNCQUFzQixDQUFDUyxHQUFELEVBQU0sUUFBTixFQUFnQixZQUFZO0FBQ2hELFdBQU8sSUFBSUQsYUFBSixDQUFrQkMsR0FBbEIsRUFBdUJDLFdBQXZCLEVBQW9DQyxjQUFwQyxDQUFQO0FBQ0QsR0FGcUIsQ0FBdEI7QUFHRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1Zpc2liaWxpdHlTdGF0ZX0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL3Zpc2liaWxpdHktc3RhdGUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvb2JzZXJ2YWJsZSc7XG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge1NpZ25hbHN9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9zaWduYWxzJztcbmltcG9ydCB7aXNEb2N1bWVudFJlYWR5LCB3aGVuRG9jdW1lbnRSZWFkeX0gZnJvbSAnI2NvcmUvZG9jdW1lbnQtcmVhZHknO1xuaW1wb3J0IHtcbiAgYWRkRG9jdW1lbnRWaXNpYmlsaXR5Q2hhbmdlTGlzdGVuZXIsXG4gIGdldERvY3VtZW50VmlzaWJpbGl0eVN0YXRlLFxuICByZW1vdmVEb2N1bWVudFZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lcixcbn0gZnJvbSAnI2NvcmUvZG9jdW1lbnQtdmlzaWJpbGl0eSc7XG5pbXBvcnQge2l0ZXJhdGVDdXJzb3IsIHJvb3ROb2RlRm9yLCB3YWl0Rm9yQm9keU9wZW5Qcm9taXNlfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtpc0VudW1WYWx1ZX0gZnJvbSAnI2NvcmUvdHlwZXMnO1xuaW1wb3J0IHttYXB9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3BhcnNlUXVlcnlTdHJpbmd9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZy91cmwnO1xuaW1wb3J0IHtXaW5kb3dJbnRlcmZhY2V9IGZyb20gJyNjb3JlL3dpbmRvdy9pbnRlcmZhY2UnO1xuXG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuLi9sb2cnO1xuaW1wb3J0IHtcbiAgZGlzcG9zZVNlcnZpY2VzRm9yRG9jLFxuICBnZXRQYXJlbnRXaW5kb3dGcmFtZUVsZW1lbnQsXG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXIsXG59IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEFNUERPQ19QUk9QID0gJ19fQU1QRE9DJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgUEFSQU1TX1NFTlRJTkVMID0gJ19fQU1QX18nO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHBhcmFtczogKCFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+fHVuZGVmaW5lZCksXG4gKiAgIHNpZ25hbHM6ICg/U2lnbmFsc3x1bmRlZmluZWQpLFxuICogICB2aXNpYmlsaXR5U3RhdGU6ICg/VmlzaWJpbGl0eVN0YXRlfHVuZGVmaW5lZCksXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IEFtcERvY09wdGlvbnM7XG5cbi8qKlxuICogUHJpdmF0ZSBhbXBkb2Mgc2lnbmFscy5cbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmNvbnN0IEFtcERvY1NpZ25hbHMgPSB7XG4gIC8vIEEgY29tcGxldGUgcHJlaW5zdGFsbGVkIGxpc3Qgb2YgZXh0ZW5zaW9ucyBpcyBrbm93bi5cbiAgRVhURU5TSU9OU19LTk9XTjogJy1hbXBkb2MtZXh0LWtub3duJyxcbiAgLy8gU2lnbmFscyB0aGUgZG9jdW1lbnQgaGFzIGJlY29tZSB2aXNpYmxlIGZvciB0aGUgZmlyc3QgdGltZS5cbiAgRklSU1RfVklTSUJMRTogJy1hbXBkb2MtZmlyc3QtdmlzaWJsZScsXG4gIC8vIFNpZ25hbHMgd2hlbiB0aGUgZG9jdW1lbnQgYmVjb21lcyB2aXNpYmxlIHRoZSBuZXh0IHRpbWUuXG4gIE5FWFRfVklTSUJMRTogJy1hbXBkb2MtbmV4dC12aXNpYmxlJyxcbn07XG5cbi8qKlxuICogVGhpcyBzZXJ2aWNlIGhlbHBzIGxvY2F0ZSBhbiBhbXBkb2MgKGBBbXBEb2NgIGluc3RhbmNlKSBmb3IgYW55IG5vZGUsXG4gKiBlaXRoZXIgaW4gdGhlIHNpbmdsZS1kb2Mgb3Igc2hhZG93LWRvYyBlbnZpcm9ubWVudHMuXG4gKlxuICogSW4gdGhlIHNpbmdsZS1kb2MgZW52aXJvbm1lbnQgYW4gYW1wZG9jIGlzIGVxdWl2YWxlbnQgdG8gdGhlXG4gKiBgd2luZG93LmRvY3VtZW50YC4gSW4gdGhlIHNoYWRvdy1kb2MgbW9kZSwgYW55IG51bWJlciBvZiBBTVAgZG9jdW1lbnRzXG4gKiBjb3VsZCBiZSBob3N0ZWQgaW4gc2hhZG93IHJvb3RzIGluIHRoZSBzYW1lIGdsb2JhbCBgd2luZG93LmRvY3VtZW50YC5cbiAqXG4gKiBAcGFja2FnZVxuICovXG5leHBvcnQgY2xhc3MgQW1wRG9jU2VydmljZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzU2luZ2xlRG9jXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz49fSBvcHRfaW5pdFBhcmFtc1xuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBpc1NpbmdsZURvYywgb3B0X2luaXRQYXJhbXMpIHtcbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/QW1wRG9jfSAqL1xuICAgIHRoaXMuc2luZ2xlRG9jXyA9IG51bGw7XG4gICAgaWYgKGlzU2luZ2xlRG9jKSB7XG4gICAgICB0aGlzLnNpbmdsZURvY18gPSBuZXcgQW1wRG9jU2luZ2xlKHdpbiwge1xuICAgICAgICBwYXJhbXM6IGV4dHJhY3RTaW5nbGVEb2NQYXJhbXMod2luLCBvcHRfaW5pdFBhcmFtcyksXG4gICAgICB9KTtcbiAgICAgIHdpbi5kb2N1bWVudFtBTVBET0NfUFJPUF0gPSB0aGlzLnNpbmdsZURvY187XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHJ1bnRpbWUgaW4gdGhlIHNpbmdsZS1kb2MgbW9kZS4gQWx0ZXJuYXRpdmUgaXMgdGhlIHNoYWRvdy1kb2NcbiAgICogbW9kZSB0aGF0IHN1cHBvcnRzIG11bHRpcGxlIGRvY3VtZW50cyBwZXIgYSBzaW5nbGUgd2luZG93LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNTaW5nbGVEb2MoKSB7XG4gICAgLy8gVE9ETygjMjI3MzMpOiByZW1vdmUgd2hlbiBhbXBkb2MtZmllIGlzIGxhdW5jaGVkLlxuICAgIHJldHVybiAhIXRoaXMuc2luZ2xlRG9jXztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkb2N1bWVudCBpbiB0aGUgc2luZ2xlLWRvYyBtb2RlLiBJbiBhIG11bHRpLWRvYyBtb2RlLCBhblxuICAgKiBlcnJvciB3aWxsIGJlIHRocm93bi5cbiAgICogQHJldHVybiB7IUFtcERvY31cbiAgICovXG4gIGdldFNpbmdsZURvYygpIHtcbiAgICAvLyBUT0RPKCMyMjczMyk6IG9uY2UgZG9jcm9vdCBtaWdyYXRpb24gaXMgZG9uZSwgdGhpcyBzaG91bGQgYmUgcmVuYW1lZFxuICAgIC8vIHRvIGBnZXRUb3BEb2MoKWAgbWV0aG9kLlxuICAgIHJldHVybiBkZXZBc3NlcnQodGhpcy5zaW5nbGVEb2NfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgbm9kZSBpcyBhbiBBTVAgY3VzdG9tIGVsZW1lbnQsIHJldHJpZXZlcyB0aGUgQW1wRG9jIHJlZmVyZW5jZS5cbiAgICogQHBhcmFtIHshTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHs/QW1wRG9jfSBUaGUgQW1wRG9jIHJlZmVyZW5jZSwgaWYgb25lIGV4aXN0cy5cbiAgICovXG4gIGdldEN1c3RvbUVsZW1lbnRBbXBEb2NSZWZlcmVuY2VfKG5vZGUpIHtcbiAgICAvLyBXZSBjYW4gb25seSBsb29rIHVwIHRoZSBBbXBEb2MgZnJvbSBhIGN1c3RvbSBlbGVtZW50IGlmIGl0IGhhcyBiZWVuXG4gICAgLy8gYXR0YWNoZWQgYXQgc29tZSBwb2ludC4gSWYgaXQgaXMgbm90IGEgY3VzdG9tIGVsZW1lbnQsIG9uZSBvciBib3RoIG9mXG4gICAgLy8gdGhlc2UgY2hlY2tzIHNob3VsZCBmYWlsLlxuICAgIGlmICghbm9kZS5ldmVyQXR0YWNoZWQgfHwgdHlwZW9mIG5vZGUuZ2V0QW1wRG9jICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZS5nZXRBbXBEb2MoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbnN0YW5jZSBvZiB0aGUgYW1wZG9jIChgQW1wRG9jYCkgdGhhdCBjb250YWlucyB0aGUgc3BlY2lmaWVkXG4gICAqIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAgICogQHJldHVybiB7P0FtcERvY31cbiAgICovXG4gIGdldEFtcERvY0lmQXZhaWxhYmxlKG5vZGUpIHtcbiAgICBsZXQgbiA9IG5vZGU7XG4gICAgd2hpbGUgKG4pIHtcbiAgICAgIC8vIEEgY3VzdG9tIGVsZW1lbnQgbWF5IGFscmVhZHkgaGF2ZSB0aGUgcmVmZXJlbmNlLiBJZiB3ZSBhcmUgbG9va2luZ1xuICAgICAgLy8gZm9yIHRoZSBjbG9zZXN0IEFtcERvYywgdGhlIGVsZW1lbnQgbWlnaHQgaGF2ZSBhIHJlZmVyZW5jZSB0byB0aGVcbiAgICAgIC8vIGdsb2JhbCBBbXBEb2MsIHdoaWNoIHdlIGRvIG5vdCB3YW50LiBUaGlzIG9jY3VycyB3aGVuIHVzaW5nXG4gICAgICAvLyA8YW1wLW5leHQtcGFnZT4uXG5cbiAgICAgIGNvbnN0IGNhY2hlZEFtcERvYyA9IHRoaXMuZ2V0Q3VzdG9tRWxlbWVudEFtcERvY1JlZmVyZW5jZV8obm9kZSk7XG4gICAgICBpZiAoY2FjaGVkQW1wRG9jKSB7XG4gICAgICAgIHJldHVybiBjYWNoZWRBbXBEb2M7XG4gICAgICB9XG5cbiAgICAgIC8vIFJvb3Qgbm90ZTogaXQncyBlaXRoZXIgYSBkb2N1bWVudCwgb3IgYSBzaGFkb3cgZG9jdW1lbnQuXG4gICAgICBjb25zdCByb290Tm9kZSA9IHJvb3ROb2RlRm9yKG4pO1xuICAgICAgaWYgKCFyb290Tm9kZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFtcGRvYyA9IHJvb3ROb2RlW0FNUERPQ19QUk9QXTtcbiAgICAgIGlmIChhbXBkb2MpIHtcbiAgICAgICAgcmV0dXJuIGFtcGRvYztcbiAgICAgIH1cblxuICAgICAgLy8gVHJ5IHRvIGl0ZXJhdGUgdG8gdGhlIGhvc3Qgb2YgdGhlIGN1cnJlbnQgcm9vdCBub2RlLlxuICAgICAgLy8gRmlyc3QgdHJ5IHRoZSBzaGFkb3cgcm9vdCdzIGhvc3QuXG4gICAgICBpZiAocm9vdE5vZGUuaG9zdCkge1xuICAgICAgICBuID0gcm9vdE5vZGUuaG9zdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZW4sIHRyYXZlcnNlIHRoZSBib3VuZGFyeSBvZiBhIGZyaWVuZGx5IGlmcmFtZS5cbiAgICAgICAgbiA9IGdldFBhcmVudFdpbmRvd0ZyYW1lRWxlbWVudChyb290Tm9kZSwgdGhpcy53aW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluc3RhbmNlIG9mIHRoZSBhbXBkb2MgKGBBbXBEb2NgKSB0aGF0IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWRcbiAgICogbm9kZS4gSWYgdGhlIHJ1bnRpbWUgaXMgaW4gdGhlIHNpbmdsZS1kb2MgbW9kZSwgdGhlIG9uZSBnbG9iYWwgYEFtcERvY2BcbiAgICogaW5zdGFuY2UgaXMgcmV0dXJuZWQsIHVubGVzcyBzcGVjZmljYWxseSBsb29raW5nIGZvciBhIGNsb3NlciBgQW1wRG9jYC5cbiAgICogT3RoZXJ3aXNlLCB0aGlzIG1ldGhvZCBsb2NhdGVzIHRoZSBgQW1wRG9jYCB0aGF0IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWRcbiAgICogbm9kZSBhbmQsIGlmIG5lY2Vzc2FyeSwgaW5pdGlhbGl6ZXMgaXQuXG4gICAqXG4gICAqIEFuIEVycm9yIGlzIHRocm93biBpbiBkZXZlbG9wbWVudCBpZiBubyBgQW1wRG9jYCBpcyBmb3VuZC5cbiAgICogQHBhcmFtIHshTm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHshQW1wRG9jfVxuICAgKi9cbiAgZ2V0QW1wRG9jKG5vZGUpIHtcbiAgICBjb25zdCBhbXBkb2MgPSB0aGlzLmdldEFtcERvY0lmQXZhaWxhYmxlKG5vZGUpO1xuICAgIGlmICghYW1wZG9jKSB7XG4gICAgICB0aHJvdyBkZXYoKS5jcmVhdGVFcnJvcignTm8gYW1wZG9jIGZvdW5kIGZvcicsIG5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gYW1wZG9jO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIGluc3RhbGxzIHRoZSBhbXBkb2MgZm9yIHRoZSBzaGFkb3cgcm9vdC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0geyFTaGFkb3dSb290fSBzaGFkb3dSb290XG4gICAqIEBwYXJhbSB7IUFtcERvY09wdGlvbnM9fSBvcHRfb3B0aW9uc1xuICAgKiBAcmV0dXJuIHshQW1wRG9jU2hhZG93fVxuICAgKiBAcmVzdHJpY3RlZFxuICAgKi9cbiAgaW5zdGFsbFNoYWRvd0RvYyh1cmwsIHNoYWRvd1Jvb3QsIG9wdF9vcHRpb25zKSB7XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgIXNoYWRvd1Jvb3RbQU1QRE9DX1BST1BdLFxuICAgICAgJ1RoZSBzaGFkb3cgcm9vdCBhbHJlYWR5IGNvbnRhaW5zIGFtcGRvYydcbiAgICApO1xuICAgIGNvbnN0IGFtcGRvYyA9IG5ldyBBbXBEb2NTaGFkb3codGhpcy53aW4sIHVybCwgc2hhZG93Um9vdCwgb3B0X29wdGlvbnMpO1xuICAgIHNoYWRvd1Jvb3RbQU1QRE9DX1BST1BdID0gYW1wZG9jO1xuICAgIHJldHVybiBhbXBkb2M7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgaW5zdGFsbHMgdGhlIGFtcGRvYyBmb3IgdGhlIGZpZSByb290LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gY2hpbGRXaW5cbiAgICogQHBhcmFtIHshQW1wRG9jT3B0aW9ucz19IG9wdF9vcHRpb25zXG4gICAqIEByZXR1cm4geyFBbXBEb2NGaWV9XG4gICAqIEByZXN0cmljdGVkXG4gICAqL1xuICBpbnN0YWxsRmllRG9jKHVybCwgY2hpbGRXaW4sIG9wdF9vcHRpb25zKSB7XG4gICAgY29uc3QgZG9jID0gY2hpbGRXaW4uZG9jdW1lbnQ7XG4gICAgZGV2QXNzZXJ0KCFkb2NbQU1QRE9DX1BST1BdLCAnVGhlIGZpZSBhbHJlYWR5IGNvbnRhaW5zIGFtcGRvYycpO1xuICAgIGNvbnN0IGZyYW1lRWxlbWVudCA9IGRldkFzc2VydChjaGlsZFdpbi5mcmFtZUVsZW1lbnQpO1xuICAgIGNvbnN0IGFtcGRvYyA9IG5ldyBBbXBEb2NGaWUoXG4gICAgICBjaGlsZFdpbixcbiAgICAgIHVybCxcbiAgICAgIHRoaXMuZ2V0QW1wRG9jKGZyYW1lRWxlbWVudCksXG4gICAgICBvcHRfb3B0aW9uc1xuICAgICk7XG4gICAgZG9jW0FNUERPQ19QUk9QXSA9IGFtcGRvYztcbiAgICByZXR1cm4gYW1wZG9jO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgc2luZ2xlIGFtcGRvYy4gYEFtcERvY1NlcnZpY2VgIGNhbiBjb250YWluIG9ubHkgb25lXG4gKiBnbG9iYWwgYW1wZG9jIG9yIG11bHRpcGxlLCBkZXBlbmRpbmcgb24gdGhlIHJ1bnRpbWUgbW9kZTogc2luZ2xlLWRvYyBvclxuICogc2hhZG93LWRvYy5cbiAqIEBhYnN0cmFjdFxuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0IGNsYXNzIEFtcERvYyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0gez9BbXBEb2N9IHBhcmVudFxuICAgKiBAcGFyYW0geyFBbXBEb2NPcHRpb25zPX0gb3B0X29wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgcGFyZW50LCBvcHRfb3B0aW9ucykge1xuICAgIC8qKiBAcHVibGljIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbiA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9iamVjdDwuLi9lbnVtcy5BTVBET0NfU0lOR0xFVE9OX05BTUUsIGJvb2xlYW4+fSAqL1xuICAgIHRoaXMucmVnaXN0ZXJlZFNpbmdsZXRvbl8gPSBtYXAoKTtcblxuICAgIC8qKiBAcHVibGljIEBjb25zdCB7P0FtcERvY30gKi9cbiAgICB0aGlzLnBhcmVudF8gPSBwYXJlbnQ7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5zaWduYWxzXyA9IChvcHRfb3B0aW9ucyAmJiBvcHRfb3B0aW9ucy5zaWduYWxzKSB8fCBuZXcgU2lnbmFscygpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn0gKi9cbiAgICB0aGlzLnBhcmFtc18gPSAob3B0X29wdGlvbnMgJiYgb3B0X29wdGlvbnMucGFyYW1zKSB8fCBtYXAoKTtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/T2JqZWN0PHN0cmluZywgc3RyaW5nPn0gKi9cbiAgICB0aGlzLm1ldGFfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+fSAqL1xuICAgIHRoaXMuZGVjbGFyZWRFeHRlbnNpb25zXyA9IHt9O1xuXG4gICAgY29uc3QgcGFyYW1zVmlzaWJpbGl0eVN0YXRlID0gdGhpcy5wYXJhbXNfWyd2aXNpYmlsaXR5U3RhdGUnXTtcbiAgICBkZXZBc3NlcnQoXG4gICAgICAhcGFyYW1zVmlzaWJpbGl0eVN0YXRlIHx8XG4gICAgICAgIGlzRW51bVZhbHVlKFZpc2liaWxpdHlTdGF0ZSwgcGFyYW1zVmlzaWJpbGl0eVN0YXRlKVxuICAgICk7XG5cbiAgICAvKiogQHByaXZhdGUgez9WaXNpYmlsaXR5U3RhdGV9ICovXG4gICAgdGhpcy52aXNpYmlsaXR5U3RhdGVPdmVycmlkZV8gPVxuICAgICAgKG9wdF9vcHRpb25zICYmIG9wdF9vcHRpb25zLnZpc2liaWxpdHlTdGF0ZSkgfHxcbiAgICAgIHBhcmFtc1Zpc2liaWxpdHlTdGF0ZSB8fFxuICAgICAgbnVsbDtcblxuICAgIC8vIFN0YXJ0IHdpdGggYG51bGxgIHRvIGJlIHVwZGF0ZWQgYnkgdXBkYXRlVmlzaWJpbGl0eVN0YXRlXyBpbiB0aGUgZW5kXG4gICAgLy8gb2YgdGhlIGNvbnN0cnVjdG9yIHRvIGVuc3VyZSB0aGUgY29ycmVjdCBcInVwZGF0ZVwiIGxvZ2ljIGFuZCBwcm9taXNlXG4gICAgLy8gcmVzb2x1dGlvbi5cbiAgICAvKiogQHByaXZhdGUgez9WaXNpYmlsaXR5U3RhdGV9ICovXG4gICAgdGhpcy52aXNpYmlsaXR5U3RhdGVfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFPYnNlcnZhYmxlPCFWaXNpYmlsaXR5U3RhdGU+fSAqL1xuICAgIHRoaXMudmlzaWJpbGl0eVN0YXRlSGFuZGxlcnNfID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P3RpbWV9ICovXG4gICAgdGhpcy5sYXN0VmlzaWJsZVRpbWVfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTwhVW5saXN0ZW5EZWY+fSAqL1xuICAgIHRoaXMudW5zdWJzcmliZXNfID0gW107XG5cbiAgICBjb25zdCBib3VuZFVwZGF0ZVZpc2liaWxpdHlTdGF0ZSA9IHRoaXMudXBkYXRlVmlzaWJpbGl0eVN0YXRlXy5iaW5kKHRoaXMpO1xuICAgIGlmICh0aGlzLnBhcmVudF8pIHtcbiAgICAgIHRoaXMudW5zdWJzcmliZXNfLnB1c2goXG4gICAgICAgIHRoaXMucGFyZW50Xy5vblZpc2liaWxpdHlDaGFuZ2VkKGJvdW5kVXBkYXRlVmlzaWJpbGl0eVN0YXRlKVxuICAgICAgKTtcbiAgICB9XG4gICAgYWRkRG9jdW1lbnRWaXNpYmlsaXR5Q2hhbmdlTGlzdGVuZXIoXG4gICAgICB0aGlzLndpbi5kb2N1bWVudCxcbiAgICAgIGJvdW5kVXBkYXRlVmlzaWJpbGl0eVN0YXRlXG4gICAgKTtcbiAgICB0aGlzLnVuc3Vic3JpYmVzXy5wdXNoKCgpID0+XG4gICAgICByZW1vdmVEb2N1bWVudFZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lcihcbiAgICAgICAgdGhpcy53aW4uZG9jdW1lbnQsXG4gICAgICAgIGJvdW5kVXBkYXRlVmlzaWJpbGl0eVN0YXRlXG4gICAgICApXG4gICAgKTtcbiAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHlTdGF0ZV8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIHRoZSBkb2N1bWVudC5cbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgZGlzcG9zZVNlcnZpY2VzRm9yRG9jKHRoaXMpO1xuICAgIHRoaXMudW5zdWJzcmliZXNfLmZvckVhY2goKHVuc3Vic3JpYmUpID0+IHVuc3Vic3JpYmUoKSk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgcnVudGltZSBpbiB0aGUgc2luZ2xlLWRvYyBtb2RlLiBBbHRlcm5hdGl2ZSBpcyB0aGUgc2hhZG93LWRvY1xuICAgKiBtb2RlIHRoYXQgc3VwcG9ydHMgbXVsdGlwbGUgZG9jdW1lbnRzIHBlciBhIHNpbmdsZSB3aW5kb3cuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1NpbmdsZURvYygpIHtcbiAgICAvLyBUT0RPKCMyMjczMyk6IHJlbW92ZSB3aGVuIGFtcGRvYy1maWUgaXMgbGF1bmNoZWQuXG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7P30gKi8gKGRldkFzc2VydChudWxsLCAnbm90IGltcGxlbWVudGVkJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gez9BbXBEb2N9XG4gICAqL1xuICBnZXRQYXJlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50XztcbiAgfVxuXG4gIC8qKlxuICAgKiBETyBOT1QgQ0FMTC4gUmV0YWluZWQgZm9yIGJhY2t3YXJkIGNvbXBhdCBkdXJpbmcgcm9sbG91dC5cbiAgICogQHJldHVybiB7IVdpbmRvd31cbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBhbXBkb2Mud2luYCBpbnN0ZWFkLlxuICAgKi9cbiAgZ2V0V2luKCkge1xuICAgIHJldHVybiB0aGlzLndpbjtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHshU2lnbmFsc30gKi9cbiAgc2lnbmFscygpIHtcbiAgICByZXR1cm4gdGhpcy5zaWduYWxzXztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIGFtcGRvYydzIHN0YXJ0dXAgcGFyYW1ldGVyIHdpdGggdGhlIHNwZWNpZmllZFxuICAgKiBuYW1lIG9yIGBudWxsYCBpZiB0aGUgcGFyYW1ldGVyIHdhc24ndCBkZWZpbmVkIGF0IHN0YXJ0dXAgdGltZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7P3N0cmluZ31cbiAgICovXG4gIGdldFBhcmFtKG5hbWUpIHtcbiAgICBjb25zdCB2ID0gdGhpcy5wYXJhbXNfW25hbWVdO1xuICAgIHJldHVybiB2ID09IG51bGwgPyBudWxsIDogdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyAoaWYgbmVjZXNzYXJ5KSBjYWNoZWQgbWFwIG9mIGFuIGFtcGRvYydzIG1ldGEgbmFtZSB2YWx1ZXMgdG9cbiAgICogdGhlaXIgYXNzb2NpYXRlZCBjb250ZW50IHZhbHVlcyBhbmQgcmV0dXJucyB0aGUgbWFwLlxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn1cbiAgICovXG4gIGdldE1ldGEoKSB7XG4gICAgaWYgKHRoaXMubWV0YV8pIHtcbiAgICAgIHJldHVybiBtYXAodGhpcy5tZXRhXyk7XG4gICAgfVxuXG4gICAgdGhpcy5tZXRhXyA9IG1hcCgpO1xuICAgIGNvbnN0IG1ldGFFbHMgPSBkZXYoKVxuICAgICAgLmFzc2VydEVsZW1lbnQodGhpcy53aW4uZG9jdW1lbnQuaGVhZClcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhW25hbWVdJyk7XG4gICAgaXRlcmF0ZUN1cnNvcihtZXRhRWxzLCAobWV0YUVsKSA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gbWV0YUVsLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICAgICAgY29uc3QgY29udGVudCA9IG1ldGFFbC5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKTtcbiAgICAgIGlmICghbmFtZSB8fCBjb250ZW50ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0YWluIG9ubHkgdGhlIGZpcnN0IG1ldGEgY29udGVudCB2YWx1ZSBmb3IgYSBnaXZlbiBuYW1lXG4gICAgICBpZiAodGhpcy5tZXRhX1tuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMubWV0YV9bbmFtZV0gPSBjb250ZW50O1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXAodGhpcy5tZXRhXyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYW4gYW1wZG9jJ3MgbWV0YSB0YWcgY29udGVudCBmb3IgYSBnaXZlbiBuYW1lLCBvclxuICAgKiBgbnVsbGAgaWYgdGhlIG1ldGEgdGFnIGRvZXMgbm90IGV4aXN0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHs/c3RyaW5nfVxuICAgKi9cbiAgZ2V0TWV0YUJ5TmFtZShuYW1lKSB7XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy5nZXRNZXRhKClbbmFtZV07XG4gICAgcmV0dXJuIGNvbnRlbnQgIT09IHVuZGVmaW5lZCA/IGNvbnRlbnQgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3JlcyB0aGUgdmFsdWUgb2YgYW4gYW1wZG9jJ3MgbWV0YSB0YWcgY29udGVudCBmb3IgYSBnaXZlbiBuYW1lLiBUbyBiZVxuICAgKiBpbXBsZW1lbnRlZCBieSBzdWJjbGFzc2VzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkQ29udGVudFxuICAgKlxuICAgKiBBdm9pZCB1c2luZyB0aGlzIG1ldGhvZCBpbiBjb21wb25lbnRzLiBJdCBpcyBvbmx5IG1lYW50IHRvIGJlIHVzZWQgYnkgdGhlXG4gICAqIHJ1bnRpbWUgZm9yIEFtcERvYyBzdWJjbGFzc2VzIHdoZXJlIDxtZXRhPiBlbGVtZW50cyBkbyBub3QgZXhpc3QgYW5kIG5hbWUvXG4gICAqIGNvbnRlbnQgcGFpcnMgbXVzdCBiZSBzdG9yZWQgaW4gdGhpcy5tZXRhXy5cbiAgICovXG4gIHNldE1ldGFCeU5hbWUodW51c2VkTmFtZSwgdW51c2VkQ29udGVudCkge1xuICAgIGRldkFzc2VydChudWxsLCAnbm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgZXh0ZW5zaW9uIGhhcyBiZWVuIGRlY2xhcmVkIG9uIHRoaXMgYW1wZG9jLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXh0ZW5zaW9uSWRcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfdmVyc2lvblxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZGVjbGFyZXNFeHRlbnNpb24oZXh0ZW5zaW9uSWQsIG9wdF92ZXJzaW9uKSB7XG4gICAgY29uc3QgZGVjbGFyZWQgPSB0aGlzLmRlY2xhcmVkRXh0ZW5zaW9uc19bZXh0ZW5zaW9uSWRdO1xuICAgIGlmICghZGVjbGFyZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuICFvcHRfdmVyc2lvbiB8fCBkZWNsYXJlZCA9PT0gb3B0X3ZlcnNpb247XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGRlY2xhcmVkIGV4dGVuc2lvbiB0byBhbiBhbXBkb2MuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHRlbnNpb25JZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvblxuICAgKiBAcmVzdHJpY3RlZFxuICAgKi9cbiAgZGVjbGFyZUV4dGVuc2lvbihleHRlbnNpb25JZCwgdmVyc2lvbikge1xuICAgIGRldkFzc2VydChcbiAgICAgICF0aGlzLmRlY2xhcmVkRXh0ZW5zaW9uc19bZXh0ZW5zaW9uSWRdIHx8XG4gICAgICAgIHRoaXMuZGVjbGFyZWRFeHRlbnNpb25zX1tleHRlbnNpb25JZF0gPT09IHZlcnNpb24sXG4gICAgICAnZXh0ZW5zaW9uIGFscmVhZHkgZGVjbGFyZWQgJXMnLFxuICAgICAgZXh0ZW5zaW9uSWRcbiAgICApO1xuICAgIHRoaXMuZGVjbGFyZWRFeHRlbnNpb25zX1tleHRlbnNpb25JZF0gPSB2ZXJzaW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHRlbnNpb25JZFxuICAgKiBAcmV0dXJuIHs/c3RyaW5nfVxuICAgKi9cbiAgZ2V0RXh0ZW5zaW9uVmVyc2lvbihleHRlbnNpb25JZCkge1xuICAgIHJldHVybiB0aGlzLmRlY2xhcmVkRXh0ZW5zaW9uc19bZXh0ZW5zaW9uSWRdIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogU2lnbmFsIHRoYXQgdGhlIGluaXRpYWwgZG9jdW1lbnQgc2V0IG9mIGV4dGVuc2lvbnMgaXMga25vd24uXG4gICAqIEByZXN0cmljdGVkXG4gICAqL1xuICBzZXRFeHRlbnNpb25zS25vd24oKSB7XG4gICAgdGhpcy5zaWduYWxzXy5zaWduYWwoQW1wRG9jU2lnbmFscy5FWFRFTlNJT05TX0tOT1dOKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlZCB3aGVuIHRoZSBpbml0aWFsIGRvY3VtZW50IHNldCBvZiBleHRlbnNpb24gaXMga25vd24uXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgd2hlbkV4dGVuc2lvbnNLbm93bigpIHtcbiAgICByZXR1cm4gdGhpcy5zaWduYWxzXy53aGVuU2lnbmFsKEFtcERvY1NpZ25hbHMuRVhURU5TSU9OU19LTk9XTik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCBub2RlIGZvciB0aGlzIGFtcGRvYy4gSXQgd2lsbCBlaXRoZXIgYmUgYSBgRG9jdW1lbnRgIGZvclxuICAgKiB0aGUgc2luZ2xlLWRvYyBydW50aW1lIG1vZGUsIG9yIGEgYFNoYWRvd1Jvb3RgIGZvciBzaGFkb3ctZG9jIG1vZGUuIFRoaXNcbiAgICogbm9kZSBjYW4gYmUgdXNlZCwgYW1vbmcgb3RoZXIgdGhpbmdzLCB0byBhZGQgYW1wZG9jLXdpZGUgZXZlbnQgbGlzdGVuZXJzLlxuICAgKlxuICAgKiBAcmV0dXJuIHshRG9jdW1lbnR8IVNoYWRvd1Jvb3R9XG4gICAqL1xuICBnZXRSb290Tm9kZSgpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHs/fSAqLyAoZGV2QXNzZXJ0KG51bGwsICdub3QgaW1wbGVtZW50ZWQnKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaGVhZCBub2RlLiBJdCdzIGVpdGhlciBhbiBlbGVtZW50IG9yIGEgc2hhZG93IHJvb3QuXG4gICAqIEByZXR1cm4geyFFbGVtZW50fCFTaGFkb3dSb290fVxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIGdldEhlYWROb2RlKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFtcGRvYydzIGJvZHkgaXMgYXZhaWxhYmxlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNCb2R5QXZhaWxhYmxlKCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgez99ICovIChkZXZBc3NlcnQoZmFsc2UsICdub3QgaW1wbGVtZW50ZWQnKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYW1wZG9jJ3MgYm9keS4gUmVxdWlyZXMgdGhlIGJvZHkgdG8gYWxyZWFkeSBiZSBhdmFpbGFibGUuXG4gICAqXG4gICAqIFNlZSBgaXNCb2R5QXZhaWxhYmxlYCBhbmQgYHdhaXRGb3JCb2R5T3BlbmAuXG4gICAqXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKi9cbiAgZ2V0Qm9keSgpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHs/fSAqLyAoZGV2QXNzZXJ0KG51bGwsICdub3QgaW1wbGVtZW50ZWQnKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdoZW4gdGhlIGFtcGRvYydzIGJvZHkgaXNcbiAgICogYXZhaWxhYmxlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhRWxlbWVudD59XG4gICAqL1xuICB3YWl0Rm9yQm9keU9wZW4oKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7P30gKi8gKGRldkFzc2VydChudWxsLCAnbm90IGltcGxlbWVudGVkJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYHRydWVgIGlmIGRvY3VtZW50IGlzIHJlYWR5LlxuICAgKlxuICAgKiBTZWUgYHdoZW5SZWFkeWAuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1JlYWR5KCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgez99ICovIChkZXZBc3NlcnQobnVsbCwgJ25vdCBpbXBsZW1lbnRlZCcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2hlbiB0aGUgYW1wZG9jJ3MgRE9NIGlzIGZ1bGx5XG4gICAqIHJlYWR5LlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHdoZW5SZWFkeSgpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHs/fSAqLyAoZGV2QXNzZXJ0KG51bGwsICdub3QgaW1wbGVtZW50ZWQnKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgVVJMIGZyb20gd2hpY2ggdGhlIGRvY3VtZW50IHdhcyBsb2FkZWQuXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldFVybCgpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHs/fSAqLyAoZGV2QXNzZXJ0KG51bGwsICdub3QgaW1wbGVtZW50ZWQnKSk7XG4gIH1cblxuICAvKipcbiAgICogTG9jYXRlcyBhbiBlbGVtZW50IHdpdGggdGhlIHNwZWNpZmllZCBJRCB3aXRoaW4gdGhlIGFtcGRvYy4gSW4gdGhlXG4gICAqIHNoYWRvdy1kb2MgbW9kZSwgd2hlbiBtdWx0aXBsZSBkb2N1bWVudHMgY291bGQgYmUgcHJlc2VudCwgdGhpcyBtZXRob2RcbiAgICogbG9jYWxpemVzIHNlYXJjaCBvbmx5IHRvIHRoZSBET00gc3VidHJlZSBzcGVjaWZpYyB0byB0aGlzIGFtcGRvYy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKi9cbiAgZ2V0RWxlbWVudEJ5SWQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSb290Tm9kZSgpLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBub2RlIGlzIGN1cnJlbnRseSBjb250YWluZWQgaW4gdGhlIERPTSBvZiB0aGUgcm9vdC5cbiAgICogQHBhcmFtIHs/Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgY29udGFpbnMobm9kZSkge1xuICAgIHJldHVybiB0aGlzLmdldFJvb3ROb2RlKCkuY29udGFpbnMobm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshVmlzaWJpbGl0eVN0YXRlfSB2aXNpYmlsaXR5U3RhdGVcbiAgICogQHJlc3RyaWN0ZWRcbiAgICovXG4gIG92ZXJyaWRlVmlzaWJpbGl0eVN0YXRlKHZpc2liaWxpdHlTdGF0ZSkge1xuICAgIGlmICh0aGlzLnZpc2liaWxpdHlTdGF0ZU92ZXJyaWRlXyAhPSB2aXNpYmlsaXR5U3RhdGUpIHtcbiAgICAgIHRoaXMudmlzaWJpbGl0eVN0YXRlT3ZlcnJpZGVfID0gdmlzaWJpbGl0eVN0YXRlO1xuICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5U3RhdGVfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHVwZGF0ZVZpc2liaWxpdHlTdGF0ZV8oKSB7XG4gICAgLy8gTmF0dXJhbCB2aXNpYmlsaXR5IHN0YXRlLlxuICAgIGNvbnN0IG5hdHVyYWxWaXNpYmlsaXR5U3RhdGUgPSBnZXREb2N1bWVudFZpc2liaWxpdHlTdGF0ZShcbiAgICAgIHRoaXMud2luLmRvY3VtZW50XG4gICAgKTtcblxuICAgIC8vIFBhcmVudCB2aXNpYmlsaXR5OiBwaWNrIHRoZSBmaXJzdCBub24tdmlzaWJsZSBzdGF0ZS5cbiAgICBsZXQgcGFyZW50VmlzaWJpbGl0eVN0YXRlID0gVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEU7XG4gICAgZm9yIChsZXQgcCA9IHRoaXMucGFyZW50XzsgcDsgcCA9IHAuZ2V0UGFyZW50KCkpIHtcbiAgICAgIGlmIChwLmdldFZpc2liaWxpdHlTdGF0ZSgpICE9IFZpc2liaWxpdHlTdGF0ZS5WSVNJQkxFKSB7XG4gICAgICAgIHBhcmVudFZpc2liaWxpdHlTdGF0ZSA9IHAuZ2V0VmlzaWJpbGl0eVN0YXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFBpY2sgdGhlIG1vc3QgcmVzdHJpY3RlZCB2aXNpYmlsaXR5IHN0YXRlLlxuICAgIGxldCB2aXNpYmlsaXR5U3RhdGU7XG4gICAgY29uc3QgdmlzaWJpbGl0eVN0YXRlT3ZlcnJpZGUgPVxuICAgICAgdGhpcy52aXNpYmlsaXR5U3RhdGVPdmVycmlkZV8gfHwgVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEU7XG4gICAgaWYgKFxuICAgICAgdmlzaWJpbGl0eVN0YXRlT3ZlcnJpZGUgPT0gVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEUgJiZcbiAgICAgIHBhcmVudFZpc2liaWxpdHlTdGF0ZSA9PSBWaXNpYmlsaXR5U3RhdGUuVklTSUJMRSAmJlxuICAgICAgbmF0dXJhbFZpc2liaWxpdHlTdGF0ZSA9PSBWaXNpYmlsaXR5U3RhdGUuVklTSUJMRVxuICAgICkge1xuICAgICAgdmlzaWJpbGl0eVN0YXRlID0gVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEU7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIG5hdHVyYWxWaXNpYmlsaXR5U3RhdGUgPT0gVmlzaWJpbGl0eVN0YXRlLkhJRERFTiAmJlxuICAgICAgdmlzaWJpbGl0eVN0YXRlT3ZlcnJpZGUgPT0gVmlzaWJpbGl0eVN0YXRlLlBBVVNFRFxuICAgICkge1xuICAgICAgLy8gSGlkZGVuIGRvY3VtZW50IHN0YXRlIG92ZXJyaWRlcyBcInBhdXNlZFwiLlxuICAgICAgdmlzaWJpbGl0eVN0YXRlID0gbmF0dXJhbFZpc2liaWxpdHlTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdmlzaWJpbGl0eVN0YXRlT3ZlcnJpZGUgPT0gVmlzaWJpbGl0eVN0YXRlLlBBVVNFRCB8fFxuICAgICAgdmlzaWJpbGl0eVN0YXRlT3ZlcnJpZGUgPT0gVmlzaWJpbGl0eVN0YXRlLklOQUNUSVZFXG4gICAgKSB7XG4gICAgICB2aXNpYmlsaXR5U3RhdGUgPSB2aXNpYmlsaXR5U3RhdGVPdmVycmlkZTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcGFyZW50VmlzaWJpbGl0eVN0YXRlID09IFZpc2liaWxpdHlTdGF0ZS5QQVVTRUQgfHxcbiAgICAgIHBhcmVudFZpc2liaWxpdHlTdGF0ZSA9PSBWaXNpYmlsaXR5U3RhdGUuSU5BQ1RJVkVcbiAgICApIHtcbiAgICAgIHZpc2liaWxpdHlTdGF0ZSA9IHBhcmVudFZpc2liaWxpdHlTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdmlzaWJpbGl0eVN0YXRlT3ZlcnJpZGUgPT0gVmlzaWJpbGl0eVN0YXRlLlBSRVJFTkRFUiB8fFxuICAgICAgbmF0dXJhbFZpc2liaWxpdHlTdGF0ZSA9PSBWaXNpYmlsaXR5U3RhdGUuUFJFUkVOREVSIHx8XG4gICAgICBwYXJlbnRWaXNpYmlsaXR5U3RhdGUgPT0gVmlzaWJpbGl0eVN0YXRlLlBSRVJFTkRFUlxuICAgICkge1xuICAgICAgdmlzaWJpbGl0eVN0YXRlID0gVmlzaWJpbGl0eVN0YXRlLlBSRVJFTkRFUjtcbiAgICB9IGVsc2Uge1xuICAgICAgdmlzaWJpbGl0eVN0YXRlID0gVmlzaWJpbGl0eVN0YXRlLkhJRERFTjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy52aXNpYmlsaXR5U3RhdGVfICE9IHZpc2liaWxpdHlTdGF0ZSkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5U3RhdGVfID0gdmlzaWJpbGl0eVN0YXRlO1xuICAgICAgaWYgKHZpc2liaWxpdHlTdGF0ZSA9PSBWaXNpYmlsaXR5U3RhdGUuVklTSUJMRSkge1xuICAgICAgICB0aGlzLmxhc3RWaXNpYmxlVGltZV8gPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLnNpZ25hbHNfLnNpZ25hbChBbXBEb2NTaWduYWxzLkZJUlNUX1ZJU0lCTEUpO1xuICAgICAgICB0aGlzLnNpZ25hbHNfLnNpZ25hbChBbXBEb2NTaWduYWxzLk5FWFRfVklTSUJMRSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNpZ25hbHNfLnJlc2V0KEFtcERvY1NpZ25hbHMuTkVYVF9WSVNJQkxFKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmlzaWJpbGl0eVN0YXRlSGFuZGxlcnNfLmZpcmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFByb21pc2UgdGhhdCBvbmx5IGV2ZXIgcmVzb2x2ZWQgd2hlbiB0aGUgY3VycmVudFxuICAgKiBBTVAgZG9jdW1lbnQgZmlyc3QgYmVjb21lcyB2aXNpYmxlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHdoZW5GaXJzdFZpc2libGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2lnbmFsc19cbiAgICAgIC53aGVuU2lnbmFsKEFtcERvY1NpZ25hbHMuRklSU1RfVklTSUJMRSlcbiAgICAgIC50aGVuKCgpID0+IHVuZGVmaW5lZCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlIHdoZW4gY3VycmVudCBkb2MgYmVjb21lcyB2aXNpYmxlLlxuICAgKiBUaGUgcHJvbWlzZSByZXNvbHZlcyBpbW1lZGlhdGVseSBpZiBkb2MgaXMgYWxyZWFkeSB2aXNpYmxlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHdoZW5OZXh0VmlzaWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zaWduYWxzX1xuICAgICAgLndoZW5TaWduYWwoQW1wRG9jU2lnbmFscy5ORVhUX1ZJU0lCTEUpXG4gICAgICAudGhlbigoKSA9PiB1bmRlZmluZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRpbWUgd2hlbiB0aGUgZG9jdW1lbnQgaGFzIGJlY29tZSB2aXNpYmxlIGZvciB0aGUgZmlyc3QgdGltZS5cbiAgICogSWYgZG9jdW1lbnQgaGFzIG5vdCB5ZXQgYmVjb21lIHZpc2libGUsIHRoZSByZXR1cm5lZCB2YWx1ZSBpcyBgbnVsbGAuXG4gICAqIEByZXR1cm4gez90aW1lfVxuICAgKi9cbiAgZ2V0Rmlyc3RWaXNpYmxlVGltZSgpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHs/bnVtYmVyfSAqLyAoXG4gICAgICB0aGlzLnNpZ25hbHNfLmdldChBbXBEb2NTaWduYWxzLkZJUlNUX1ZJU0lCTEUpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0aW1lIHdoZW4gdGhlIGRvY3VtZW50IGhhcyBiZWNvbWUgdmlzaWJsZSBmb3IgdGhlIGxhc3QgdGltZS5cbiAgICogSWYgZG9jdW1lbnQgaGFzIG5vdCB5ZXQgYmVjb21lIHZpc2libGUsIHRoZSByZXR1cm5lZCB2YWx1ZSBpcyBgbnVsbGAuXG4gICAqIEByZXR1cm4gez90aW1lfVxuICAgKi9cbiAgZ2V0TGFzdFZpc2libGVUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLmxhc3RWaXNpYmxlVGltZV87XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB2aXNpYmlsaXR5IHN0YXRlIGNvbmZpZ3VyZWQgYnkgdGhlIHZpZXdlci5cbiAgICogU2VlIHtAbGluayBpc1Zpc2libGV9LlxuICAgKiBAcmV0dXJuIHshVmlzaWJpbGl0eVN0YXRlfVxuICAgKi9cbiAgZ2V0VmlzaWJpbGl0eVN0YXRlKCkge1xuICAgIHJldHVybiBkZXZBc3NlcnQodGhpcy52aXNpYmlsaXR5U3RhdGVfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBBTVAgZG9jdW1lbnQgY3VycmVudGx5IHZpc2libGUuIFRoZSByZWFzb25zIHdoeSBpdCBtaWdodCBub3RcbiAgICogYmUgdmlzaWJsZSBpbmNsdWRlIHVzZXIgc3dpdGNoaW5nIHRvIGFub3RoZXIgdGFiLCBicm93c2VyIHJ1bm5pbmcgdGhlXG4gICAqIGRvY3VtZW50IGluIHRoZSBwcmVyZW5kZXIgbW9kZSBvciB2aWV3ZXIgcnVubmluZyB0aGUgZG9jdW1lbnQgaW4gdGhlXG4gICAqIHByZXJlbmRlciBtb2RlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNWaXNpYmxlKCkge1xuICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlTdGF0ZV8gPT0gVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEU7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgQU1QIGRvY3VtZW50IGhhcyBiZWVuIGV2ZXIgdmlzaWJsZSBiZWZvcmUuIFNpbmNlIHRoZSB2aXNpYmxpdHlcbiAgICogc3RhdGUgb2YgYSBkb2N1bWVudCBjYW4gYmUgZmxpcHBlZCBiYWNrIGFuZCBmb3J0aCB3ZSBzb21ldGltZXMgd2FudCB0byBrbm93XG4gICAqIGlmIGEgZG9jdW1lbnQgaGFzIGV2ZXIgYmVlbiB2aXNpYmxlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaGFzQmVlblZpc2libGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGFzdFZpc2libGVUaW1lKCkgIT0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgXCJ2aXNpYmlsaXR5Y2hhbmdlXCIgZXZlbnQgbGlzdGVuZXIgZm9yIHZpZXdlciBldmVudHMuIFRoZVxuICAgKiBjYWxsYmFjayBjYW4gY2hlY2sge0BsaW5rIGlzVmlzaWJsZX0gYW5kIHtAbGluayBnZXRQcmVmZXRjaENvdW50fVxuICAgKiBtZXRob2RzIGZvciBtb3JlIGluZm8uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVZpc2liaWxpdHlTdGF0ZSl9IGhhbmRsZXJcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKi9cbiAgb25WaXNpYmlsaXR5Q2hhbmdlZChoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaWJpbGl0eVN0YXRlSGFuZGxlcnNfLmFkZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0IHRvIHJlZ2lzdGVyIGEgc2luZ2xldG9uIGZvciBlYWNoIGFtcGRvYy5cbiAgICogQ2FsbGVyIG5lZWQgdG8gaGFuZGxlIHVzZXIgZXJyb3Igd2hlbiByZWdpc3RyYXRpb24gcmV0dXJucyBmYWxzZS5cbiAgICogQHBhcmFtIHshLi4vZW51bXMuQU1QRE9DX1NJTkdMRVRPTl9OQU1FfSBuYW1lXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICByZWdpc3RlclNpbmdsZXRvbihuYW1lKSB7XG4gICAgaWYgKCF0aGlzLnJlZ2lzdGVyZWRTaW5nbGV0b25fW25hbWVdKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyZWRTaW5nbGV0b25fW25hbWVdID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiBgQW1wRG9jYCBpbiB0aGUgc2luZ2xlLWRvYyBtb2RlIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlXG4gKiBnbG9iYWwgYHdpbmRvdy5kb2N1bWVudGAuXG4gKiBAcGFja2FnZSBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIEFtcERvY1NpbmdsZSBleHRlbmRzIEFtcERvYyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFBbXBEb2NPcHRpb25zPX0gb3B0X29wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgb3B0X29wdGlvbnMpIHtcbiAgICBzdXBlcih3aW4sIC8qIHBhcmVudCAqLyBudWxsLCBvcHRfb3B0aW9ucyk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshUHJvbWlzZTwhRWxlbWVudD59ICovXG4gICAgdGhpcy5ib2R5UHJvbWlzZV8gPSB0aGlzLndpbi5kb2N1bWVudC5ib2R5XG4gICAgICA/IFByb21pc2UucmVzb2x2ZSh0aGlzLndpbi5kb2N1bWVudC5ib2R5KVxuICAgICAgOiB3YWl0Rm9yQm9keU9wZW5Qcm9taXNlKHRoaXMud2luLmRvY3VtZW50KS50aGVuKCgpID0+IHRoaXMuZ2V0Qm9keSgpKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFQcm9taXNlfSAqL1xuICAgIHRoaXMucmVhZHlQcm9taXNlXyA9IHdoZW5Eb2N1bWVudFJlYWR5KHRoaXMud2luLmRvY3VtZW50KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNTaW5nbGVEb2MoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFJvb3ROb2RlKCkge1xuICAgIHJldHVybiB0aGlzLndpbi5kb2N1bWVudDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0VXJsKCkge1xuICAgIHJldHVybiBXaW5kb3dJbnRlcmZhY2UuZ2V0TG9jYXRpb24odGhpcy53aW4pLmhyZWY7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEhlYWROb2RlKCkge1xuICAgIHJldHVybiBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMud2luLmRvY3VtZW50LmhlYWQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0JvZHlBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy53aW4uZG9jdW1lbnQuYm9keTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0Qm9keSgpIHtcbiAgICByZXR1cm4gZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLndpbi5kb2N1bWVudC5ib2R5LCAnYm9keSBub3QgYXZhaWxhYmxlJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHdhaXRGb3JCb2R5T3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5ib2R5UHJvbWlzZV87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzUmVhZHkoKSB7XG4gICAgcmV0dXJuIGlzRG9jdW1lbnRSZWFkeSh0aGlzLndpbi5kb2N1bWVudCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHdoZW5SZWFkeSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkeVByb21pc2VfO1xuICB9XG59XG5cbi8qKlxuICogVGhlIHZlcnNpb24gb2YgYEFtcERvY2AgaW4gdGhlIHNoYWRvdy1kb2MgbW9kZSB0aGF0IGlzIGFsbG9jYXRlZCBmb3IgZWFjaFxuICogYW1wZG9jIGhvc3RlZCB3aXRoaW4gYSBzaGFkb3cgcm9vdC5cbiAqIEBwYWNrYWdlIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY2xhc3MgQW1wRG9jU2hhZG93IGV4dGVuZHMgQW1wRG9jIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHshU2hhZG93Um9vdH0gc2hhZG93Um9vdFxuICAgKiBAcGFyYW0geyFBbXBEb2NPcHRpb25zPX0gb3B0X29wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgdXJsLCBzaGFkb3dSb290LCBvcHRfb3B0aW9ucykge1xuICAgIHN1cGVyKHdpbiwgLyogcGFyZW50ICovIG51bGwsIG9wdF9vcHRpb25zKTtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG4gICAgdGhpcy51cmxfID0gdXJsO1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFTaGFkb3dSb290fSAqL1xuICAgIHRoaXMuc2hhZG93Um9vdF8gPSBzaGFkb3dSb290O1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLmJvZHlfID0gbnVsbDtcblxuICAgIGNvbnN0IGJvZHlEZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshUHJvbWlzZTwhRWxlbWVudD59ICovXG4gICAgdGhpcy5ib2R5UHJvbWlzZV8gPSBib2R5RGVmZXJyZWQucHJvbWlzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7ZnVuY3Rpb24oIUVsZW1lbnQpfHVuZGVmaW5lZH0gKi9cbiAgICB0aGlzLmJvZHlSZXNvbHZlcl8gPSBib2R5RGVmZXJyZWQucmVzb2x2ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnJlYWR5XyA9IGZhbHNlO1xuXG4gICAgY29uc3QgcmVhZHlEZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshUHJvbWlzZX0gKi9cbiAgICB0aGlzLnJlYWR5UHJvbWlzZV8gPSByZWFkeURlZmVycmVkLnByb21pc2U7XG5cbiAgICAvKiogQHByaXZhdGUge2Z1bmN0aW9uKCl8dW5kZWZpbmVkfSAqL1xuICAgIHRoaXMucmVhZHlSZXNvbHZlcl8gPSByZWFkeURlZmVycmVkLnJlc29sdmU7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzU2luZ2xlRG9jKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0Um9vdE5vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdF87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFVybCgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRIZWFkTm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290XztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNCb2R5QXZhaWxhYmxlKCkge1xuICAgIHJldHVybiAhIXRoaXMuYm9keV87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEJvZHkoKSB7XG4gICAgcmV0dXJuIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5ib2R5XywgJ2JvZHkgbm90IGF2YWlsYWJsZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpZ25hbHMgdGhhdCB0aGUgc2hhZG93IGRvYyBoYXMgYSBib2R5LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBib2R5XG4gICAqIEByZXN0cmljdGVkXG4gICAqL1xuICBzZXRCb2R5KGJvZHkpIHtcbiAgICBkZXZBc3NlcnQoIXRoaXMuYm9keV8sICdEdXBsaWNhdGUgYm9keScpO1xuICAgIHRoaXMuYm9keV8gPSBib2R5O1xuICAgIHRoaXMuYm9keVJlc29sdmVyXyhib2R5KTtcbiAgICB0aGlzLmJvZHlSZXNvbHZlcl8gPSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHdhaXRGb3JCb2R5T3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5ib2R5UHJvbWlzZV87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzUmVhZHkoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVhZHlfO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpZ25hbHMgdGhhdCB0aGUgc2hhZG93IGRvYyBpcyByZWFkeS5cbiAgICogQHJlc3RyaWN0ZWRcbiAgICovXG4gIHNldFJlYWR5KCkge1xuICAgIGRldkFzc2VydCghdGhpcy5yZWFkeV8sICdEdXBsaWNhdGUgcmVhZHkgc3RhdGUnKTtcbiAgICB0aGlzLnJlYWR5XyA9IHRydWU7XG4gICAgdGhpcy5yZWFkeVJlc29sdmVyXygpO1xuICAgIHRoaXMucmVhZHlSZXNvbHZlcl8gPSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHdoZW5SZWFkeSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkeVByb21pc2VfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRNZXRhKCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFPYmplY3Q8c3RyaW5nLHN0cmluZz59ICovIChtYXAodGhpcy5tZXRhXykpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZXRNZXRhQnlOYW1lKG5hbWUsIGNvbnRlbnQpIHtcbiAgICBkZXZBc3NlcnQobmFtZSwgJ0F0dGVtcHRlZCB0byBzdG9yZSBpbnZhbGlkIG1ldGEgbmFtZS9jb250ZW50IHBhaXInKTtcbiAgICBpZiAoIXRoaXMubWV0YV8pIHtcbiAgICAgIHRoaXMubWV0YV8gPSBtYXAoKTtcbiAgICB9XG4gICAgdGhpcy5tZXRhX1tuYW1lXSA9IGNvbnRlbnQ7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiBgQW1wRG9jYCBmb3IgRklFIGVtYmVkcy5cbiAqIEBwYWNrYWdlIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY2xhc3MgQW1wRG9jRmllIGV4dGVuZHMgQW1wRG9jIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHshQW1wRG9jfSBwYXJlbnRcbiAgICogQHBhcmFtIHshQW1wRG9jT3B0aW9ucz19IG9wdF9vcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIHVybCwgcGFyZW50LCBvcHRfb3B0aW9ucykge1xuICAgIHN1cGVyKHdpbiwgcGFyZW50LCBvcHRfb3B0aW9ucyk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG4gICAgdGhpcy51cmxfID0gdXJsO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVByb21pc2U8IUVsZW1lbnQ+fSAqL1xuICAgIHRoaXMuYm9keVByb21pc2VfID0gdGhpcy53aW4uZG9jdW1lbnQuYm9keVxuICAgICAgPyBQcm9taXNlLnJlc29sdmUodGhpcy53aW4uZG9jdW1lbnQuYm9keSlcbiAgICAgIDogd2FpdEZvckJvZHlPcGVuUHJvbWlzZSh0aGlzLndpbi5kb2N1bWVudCkudGhlbigoKSA9PiB0aGlzLmdldEJvZHkoKSk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5yZWFkeV8gPSBmYWxzZTtcblxuICAgIGNvbnN0IHJlYWR5RGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcbiAgICAvKiogQHByaXZhdGUgeyFQcm9taXNlfSAqL1xuICAgIHRoaXMucmVhZHlQcm9taXNlXyA9IHJlYWR5RGVmZXJyZWQucHJvbWlzZTtcbiAgICAvKiogQHByaXZhdGUge2Z1bmN0aW9uKCl8dW5kZWZpbmVkfSAqL1xuICAgIHRoaXMucmVhZHlSZXNvbHZlcl8gPSByZWFkeURlZmVycmVkLnJlc29sdmU7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzU2luZ2xlRG9jKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0Um9vdE5vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMud2luLmRvY3VtZW50O1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRVcmwoKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0SGVhZE5vZGUoKSB7XG4gICAgcmV0dXJuIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy53aW4uZG9jdW1lbnQuaGVhZCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzQm9keUF2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gISF0aGlzLndpbi5kb2N1bWVudC5ib2R5O1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRCb2R5KCkge1xuICAgIHJldHVybiBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMud2luLmRvY3VtZW50LmJvZHksICdib2R5IG5vdCBhdmFpbGFibGUnKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgd2FpdEZvckJvZHlPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLmJvZHlQcm9taXNlXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkeV87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHdoZW5SZWFkeSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkeVByb21pc2VfO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpZ25hbHMgdGhhdCB0aGUgRklFIGRvYyBpcyByZWFkeS5cbiAgICogQHJlc3RyaWN0ZWRcbiAgICovXG4gIHNldFJlYWR5KCkge1xuICAgIGRldkFzc2VydCghdGhpcy5yZWFkeV8sICdEdXBsaWNhdGUgcmVhZHkgc3RhdGUnKTtcbiAgICB0aGlzLnJlYWR5XyA9IHRydWU7XG4gICAgdGhpcy5yZWFkeVJlc29sdmVyXygpO1xuICAgIHRoaXMucmVhZHlSZXNvbHZlcl8gPSB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPnx1bmRlZmluZWR9IGluaXRQYXJhbXNcbiAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+fVxuICovXG5mdW5jdGlvbiBleHRyYWN0U2luZ2xlRG9jUGFyYW1zKHdpbiwgaW5pdFBhcmFtcykge1xuICBjb25zdCBwYXJhbXMgPSBtYXAoKTtcbiAgaWYgKGluaXRQYXJhbXMpIHtcbiAgICAvLyBUaGUgaW5pdGlhbGl6YXRpb24gcGFyYW1zIHRha2UgdGhlIGhpZ2hlc3QgcHJlY2VkZW5jZS5cbiAgICBPYmplY3QuYXNzaWduKHBhcmFtcywgaW5pdFBhcmFtcyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gUGFyYW1zIGNhbiBiZSBwYXNzZWQgdmlhIGlmcmFtZSBoYXNoL25hbWUgd2l0aCBoYXNoIHRha2luZyBwcmVjZWRlbmNlLlxuICAgIGlmICh3aW4ubmFtZSAmJiB3aW4ubmFtZS5pbmRleE9mKFBBUkFNU19TRU5USU5FTCkgPT0gMCkge1xuICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBwYXJzZVF1ZXJ5U3RyaW5nKHdpbi5uYW1lLnN1YnN0cmluZyhQQVJBTVNfU0VOVElORUwubGVuZ3RoKSlcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh3aW4ubG9jYXRpb24gJiYgd2luLmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24ocGFyYW1zLCBwYXJzZVF1ZXJ5U3RyaW5nKHdpbi5sb2NhdGlvbi5oYXNoKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbi8qKlxuICogSW5zdGFsbCB0aGUgYW1wZG9jIHNlcnZpY2UgYW5kIGltbWVkaWF0ZWx5IGNvbmZpZ3VyZSBpdCBmb3IgZWl0aGVyIGFcbiAqIHNpbmdsZS1kb2Mgb3IgYSBzaGFkb3ctZG9jIG1vZGUuIFRoZSBtb2RlIGNhbm5vdCBiZSBjaGFuZ2VkIGFmdGVyIHRoZVxuICogaW5pdGlhbCBjb25maWd1cmF0aW9uLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNTaW5nbGVEb2NcbiAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz49fSBvcHRfaW5pdFBhcmFtc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbERvY1NlcnZpY2Uod2luLCBpc1NpbmdsZURvYywgb3B0X2luaXRQYXJhbXMpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW4sICdhbXBkb2MnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBBbXBEb2NTZXJ2aWNlKHdpbiwgaXNTaW5nbGVEb2MsIG9wdF9pbml0UGFyYW1zKTtcbiAgfSk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/ampdoc-impl.js