function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
import {
addDocumentVisibilityChangeListener,
getDocumentVisibilityState,
removeDocumentVisibilityChangeListener } from "../core/document-visibility";

import { iterateCursor, rootNodeFor, waitForBodyOpenPromise } from "../core/dom";
import { isEnumValue } from "../core/types";
import { map } from "../core/types/object";
import { parseQueryString } from "../core/types/string/url";
import { WindowInterface } from "../core/window/interface";

import { dev, devAssert } from "../log";
import {
disposeServicesForDoc,
getParentWindowFrameElement,
registerServiceBuilder } from "../service-helpers";


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
  NEXT_VISIBLE: '-ampdoc-next-visible' };


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
  function AmpDocService(win, isSingleDoc, opt_initParams) {_classCallCheck(this, AmpDocService);
    /** @const {!Window} */
    this.win = win;

    /** @private {?AmpDoc} */
    this.singleDoc_ = null;
    if (isSingleDoc) {
      this.singleDoc_ = new AmpDocSingle(win, {
        params: extractSingleDocParams(win, opt_initParams) });

      win.document[AMPDOC_PROP] = this.singleDoc_;
    }
  }

  /**
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */_createClass(AmpDocService, [{ key: "isSingleDoc", value:
    function isSingleDoc() {
      // TODO(#22733): remove when ampdoc-fie is launched.
      return !!this.singleDoc_;
    }

    /**
     * Returns the document in the single-doc mode. In a multi-doc mode, an
     * error will be thrown.
     * @return {!AmpDoc}
     */ }, { key: "getSingleDoc", value:
    function getSingleDoc() {
      // TODO(#22733): once docroot migration is done, this should be renamed
      // to `getTopDoc()` method.
      return devAssert(this.singleDoc_);
    }

    /**
     * If the node is an AMP custom element, retrieves the AmpDoc reference.
     * @param {!Node} node
     * @return {?AmpDoc} The AmpDoc reference, if one exists.
     */ }, { key: "getCustomElementAmpDocReference_", value:
    function getCustomElementAmpDocReference_(node) {
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
     */ }, { key: "getAmpDocIfAvailable", value:
    function getAmpDocIfAvailable(node) {
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
     */ }, { key: "getAmpDoc", value:
    function getAmpDoc(node) {
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
     */ }, { key: "installShadowDoc", value:
    function installShadowDoc(url, shadowRoot, opt_options) {
      devAssert(
      !shadowRoot[AMPDOC_PROP]);


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
     */ }, { key: "installFieDoc", value:
    function installFieDoc(url, childWin, opt_options) {
      var doc = childWin.document;
      devAssert(!doc[AMPDOC_PROP]);
      var frameElement = devAssert(childWin.frameElement);
      var ampdoc = new AmpDocFie(
      childWin,
      url,
      this.getAmpDoc(frameElement),
      opt_options);

      doc[AMPDOC_PROP] = ampdoc;
      return ampdoc;
    } }]);return AmpDocService;}();


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
  function AmpDoc(win, parent, opt_options) {var _this = this;_classCallCheck(this, AmpDoc);
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

    /** @private @const {!Object<string, string>} */
    this.declaredExtensions_ = {};

    var paramsVisibilityState = this.params_['visibilityState'];
    devAssert(
    !paramsVisibilityState ||
    isEnumValue(VisibilityState, paramsVisibilityState));


    /** @private {?VisibilityState} */
    this.visibilityStateOverride_ =
    (opt_options && opt_options.visibilityState) ||
    paramsVisibilityState ||
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

    var boundUpdateVisibilityState = this.updateVisibilityState_.bind(this);
    if (this.parent_) {
      this.unsubsribes_.push(
      this.parent_.onVisibilityChanged(boundUpdateVisibilityState));

    }
    addDocumentVisibilityChangeListener(
    this.win.document,
    boundUpdateVisibilityState);

    this.unsubsribes_.push(function () {return (
        removeDocumentVisibilityChangeListener(
        _this.win.document,
        boundUpdateVisibilityState));});


    this.updateVisibilityState_();
  }

  /**
   * Dispose the document.
   */_createClass(AmpDoc, [{ key: "dispose", value:
    function dispose() {
      disposeServicesForDoc(this);
      this.unsubsribes_.forEach(function (unsubsribe) {return unsubsribe();});
    }

    /**
     * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
     * mode that supports multiple documents per a single window.
     * @return {boolean}
     */ }, { key: "isSingleDoc", value:
    function isSingleDoc() {
      // TODO(#22733): remove when ampdoc-fie is launched.
      return (/** @type {?} */(devAssert(null)));
    }

    /**
     * @return {?AmpDoc}
     */ }, { key: "getParent", value:
    function getParent() {
      return this.parent_;
    }

    /**
     * DO NOT CALL. Retained for backward compat during rollout.
     * @return {!Window}
     * @deprecated Use `ampdoc.win` instead.
     */ }, { key: "getWin", value:
    function getWin() {
      return this.win;
    }

    /** @return {!Signals} */ }, { key: "signals", value:
    function signals() {
      return this.signals_;
    }

    /**
     * Returns the value of a ampdoc's startup parameter with the specified
     * name or `null` if the parameter wasn't defined at startup time.
     * @param {string} name
     * @return {?string}
     */ }, { key: "getParam", value:
    function getParam(name) {
      var v = this.params_[name];
      return v == null ? null : v;
    }

    /**
     * Initializes (if necessary) cached map of an ampdoc's meta name values to
     * their associated content values and returns the map.
     * @return {!Object<string, string>}
     */ }, { key: "getMeta", value:
    function getMeta() {var _this2 = this;
      if (this.meta_) {
        return map(this.meta_);
      }

      this.meta_ = map();
      var metaEls = /** @type {!Element} */(
      this.win.document.head).
      querySelectorAll('meta[name]');
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
     */ }, { key: "getMetaByName", value:
    function getMetaByName(name) {
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
     */ }, { key: "setMetaByName", value:
    function setMetaByName(unusedName, unusedContent) {
      devAssert(null);
    }

    /**
     * Returns whether the specified extension has been declared on this ampdoc.
     * @param {string} extensionId
     * @param {string=} opt_version
     * @return {boolean}
     */ }, { key: "declaresExtension", value:
    function declaresExtension(extensionId, opt_version) {
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
     */ }, { key: "declareExtension", value:
    function declareExtension(extensionId, version) {
      devAssert(
      !this.declaredExtensions_[extensionId] ||
      this.declaredExtensions_[extensionId] === version);



      this.declaredExtensions_[extensionId] = version;
    }

    /**
     * @param {string} extensionId
     * @return {?string}
     */ }, { key: "getExtensionVersion", value:
    function getExtensionVersion(extensionId) {
      return this.declaredExtensions_[extensionId] || null;
    }

    /**
     * Signal that the initial document set of extensions is known.
     * @restricted
     */ }, { key: "setExtensionsKnown", value:
    function setExtensionsKnown() {
      this.signals_.signal(AmpDocSignals.EXTENSIONS_KNOWN);
    }

    /**
     * Resolved when the initial document set of extension is known.
     * @return {!Promise}
     */ }, { key: "whenExtensionsKnown", value:
    function whenExtensionsKnown() {
      return this.signals_.whenSignal(AmpDocSignals.EXTENSIONS_KNOWN);
    }

    /**
     * Returns the root node for this ampdoc. It will either be a `Document` for
     * the single-doc runtime mode, or a `ShadowRoot` for shadow-doc mode. This
     * node can be used, among other things, to add ampdoc-wide event listeners.
     *
     * @return {!Document|!ShadowRoot}
     */ }, { key: "getRootNode", value:
    function getRootNode() {
      return (/** @type {?} */(devAssert(null)));
    }

    /**
     * Returns the head node. It's either an element or a shadow root.
     * @return {!Element|!ShadowRoot}
     * @abstract
     */ }, { key: "getHeadNode", value:
    function getHeadNode() {}

    /**
     * Returns `true` if the ampdoc's body is available.
     *
     * @return {boolean}
     */ }, { key: "isBodyAvailable", value:
    function isBodyAvailable() {
      return (/** @type {?} */(devAssert(false)));
    }

    /**
     * Returns the ampdoc's body. Requires the body to already be available.
     *
     * See `isBodyAvailable` and `waitForBodyOpen`.
     *
     * @return {!Element}
     */ }, { key: "getBody", value:
    function getBody() {
      return (/** @type {?} */(devAssert(null)));
    }

    /**
     * Returns a promise that will be resolved when the ampdoc's body is
     * available.
     * @return {!Promise<!Element>}
     */ }, { key: "waitForBodyOpen", value:
    function waitForBodyOpen() {
      return (/** @type {?} */(devAssert(null)));
    }

    /**
     * Returns `true` if document is ready.
     *
     * See `whenReady`.
     *
     * @return {boolean}
     */ }, { key: "isReady", value:
    function isReady() {
      return (/** @type {?} */(devAssert(null)));
    }

    /**
     * Returns a promise that will be resolved when the ampdoc's DOM is fully
     * ready.
     * @return {!Promise}
     */ }, { key: "whenReady", value:
    function whenReady() {
      return (/** @type {?} */(devAssert(null)));
    }

    /**
     * Returns the URL from which the document was loaded.
     * @return {string}
     */ }, { key: "getUrl", value:
    function getUrl() {
      return (/** @type {?} */(devAssert(null)));
    }

    /**
     * Locates an element with the specified ID within the ampdoc. In the
     * shadow-doc mode, when multiple documents could be present, this method
     * localizes search only to the DOM subtree specific to this ampdoc.
     *
     * @param {string} id
     * @return {?Element}
     */ }, { key: "getElementById", value:
    function getElementById(id) {
      return this.getRootNode().getElementById(id);
    }

    /**
     * Whether the node is currently contained in the DOM of the root.
     * @param {?Node} node
     * @return {boolean}
     */ }, { key: "contains", value:
    function contains(node) {
      return this.getRootNode().contains(node);
    }

    /**
     * @param {!VisibilityState} visibilityState
     * @restricted
     */ }, { key: "overrideVisibilityState", value:
    function overrideVisibilityState(visibilityState) {
      if (this.visibilityStateOverride_ != visibilityState) {
        this.visibilityStateOverride_ = visibilityState;
        this.updateVisibilityState_();
      }
    }

    /** @private */ }, { key: "updateVisibilityState_", value:
    function updateVisibilityState_() {
      // Natural visibility state.
      var naturalVisibilityState = getDocumentVisibilityState(
      this.win.document);


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
      var visibilityStateOverride =
      this.visibilityStateOverride_ || VisibilityState.VISIBLE;
      if (
      visibilityStateOverride == VisibilityState.VISIBLE &&
      parentVisibilityState == VisibilityState.VISIBLE &&
      naturalVisibilityState == VisibilityState.VISIBLE)
      {
        visibilityState = VisibilityState.VISIBLE;
      } else if (
      naturalVisibilityState == VisibilityState.HIDDEN &&
      visibilityStateOverride == VisibilityState.PAUSED)
      {
        // Hidden document state overrides "paused".
        visibilityState = naturalVisibilityState;
      } else if (
      visibilityStateOverride == VisibilityState.PAUSED ||
      visibilityStateOverride == VisibilityState.INACTIVE)
      {
        visibilityState = visibilityStateOverride;
      } else if (
      parentVisibilityState == VisibilityState.PAUSED ||
      parentVisibilityState == VisibilityState.INACTIVE)
      {
        visibilityState = parentVisibilityState;
      } else if (
      visibilityStateOverride == VisibilityState.PRERENDER ||
      naturalVisibilityState == VisibilityState.PRERENDER ||
      parentVisibilityState == VisibilityState.PRERENDER)
      {
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
     */ }, { key: "whenFirstVisible", value:
    function whenFirstVisible() {
      return this.signals_.
      whenSignal(AmpDocSignals.FIRST_VISIBLE).
      then(function () {return undefined;});
    }

    /**
     * Returns a Promise that resolve when current doc becomes visible.
     * The promise resolves immediately if doc is already visible.
     * @return {!Promise}
     */ }, { key: "whenNextVisible", value:
    function whenNextVisible() {
      return this.signals_.
      whenSignal(AmpDocSignals.NEXT_VISIBLE).
      then(function () {return undefined;});
    }

    /**
     * Returns the time when the document has become visible for the first time.
     * If document has not yet become visible, the returned value is `null`.
     * @return {?time}
     */ }, { key: "getFirstVisibleTime", value:
    function getFirstVisibleTime() {
      return (/** @type {?number} */(
        this.signals_.get(AmpDocSignals.FIRST_VISIBLE)));

    }

    /**
     * Returns the time when the document has become visible for the last time.
     * If document has not yet become visible, the returned value is `null`.
     * @return {?time}
     */ }, { key: "getLastVisibleTime", value:
    function getLastVisibleTime() {
      return this.lastVisibleTime_;
    }

    /**
     * Returns visibility state configured by the viewer.
     * See {@link isVisible}.
     * @return {!VisibilityState}
     */ }, { key: "getVisibilityState", value:
    function getVisibilityState() {
      return devAssert(this.visibilityState_);
    }

    /**
     * Whether the AMP document currently visible. The reasons why it might not
     * be visible include user switching to another tab, browser running the
     * document in the prerender mode or viewer running the document in the
     * prerender mode.
     * @return {boolean}
     */ }, { key: "isVisible", value:
    function isVisible() {
      return this.visibilityState_ == VisibilityState.VISIBLE;
    }

    /**
     * Whether the AMP document has been ever visible before. Since the visiblity
     * state of a document can be flipped back and forth we sometimes want to know
     * if a document has ever been visible.
     * @return {boolean}
     */ }, { key: "hasBeenVisible", value:
    function hasBeenVisible() {
      return this.getLastVisibleTime() != null;
    }

    /**
     * Adds a "visibilitychange" event listener for viewer events. The
     * callback can check {@link isVisible} and {@link getPrefetchCount}
     * methods for more info.
     * @param {function(!VisibilityState)} handler
     * @return {!UnlistenDef}
     */ }, { key: "onVisibilityChanged", value:
    function onVisibilityChanged(handler) {
      return this.visibilityStateHandlers_.add(handler);
    }

    /**
     * Attempt to register a singleton for each ampdoc.
     * Caller need to handle user error when registration returns false.
     * @param {!../enums.AMPDOC_SINGLETON_NAME} name
     * @return {boolean}
     */ }, { key: "registerSingleton", value:
    function registerSingleton(name) {
      if (!this.registeredSingleton_[name]) {
        this.registeredSingleton_[name] = true;
        return true;
      }
      return false;
    } }]);return AmpDoc;}();


/**
 * The version of `AmpDoc` in the single-doc mode that corresponds to the
 * global `window.document`.
 * @package @visibleForTesting
 */
export var AmpDocSingle = /*#__PURE__*/function (_AmpDoc) {_inherits(AmpDocSingle, _AmpDoc);var _super = _createSuper(AmpDocSingle);
  /**
   * @param {!Window} win
   * @param {!AmpDocOptions=} opt_options
   */
  function AmpDocSingle(win, opt_options) {var _this3;_classCallCheck(this, AmpDocSingle);
    _this3 = _super.call(this, win, /* parent */null, opt_options);

    /** @private @const {!Promise<!Element>} */
    _this3.bodyPromise_ = _this3.win.document.body ?
    Promise.resolve(_this3.win.document.body) :
    waitForBodyOpenPromise(_this3.win.document).then(function () {return _this3.getBody();});

    /** @private @const {!Promise} */
    _this3.readyPromise_ = whenDocumentReady(_this3.win.document);return _this3;
  }

  /** @override */_createClass(AmpDocSingle, [{ key: "isSingleDoc", value:
    function isSingleDoc() {
      return true;
    }

    /** @override */ }, { key: "getRootNode", value:
    function getRootNode() {
      return this.win.document;
    }

    /** @override */ }, { key: "getUrl", value:
    function getUrl() {
      return WindowInterface.getLocation(this.win).href;
    }

    /** @override */ }, { key: "getHeadNode", value:
    function getHeadNode() {
      return (/** @type {!Element} */(this.win.document.head));
    }

    /** @override */ }, { key: "isBodyAvailable", value:
    function isBodyAvailable() {
      return !!this.win.document.body;
    }

    /** @override */ }, { key: "getBody", value:
    function getBody() {
      return (/** @type {!Element} */(this.win.document.body));
    }

    /** @override */ }, { key: "waitForBodyOpen", value:
    function waitForBodyOpen() {
      return this.bodyPromise_;
    }

    /** @override */ }, { key: "isReady", value:
    function isReady() {
      return isDocumentReady(this.win.document);
    }

    /** @override */ }, { key: "whenReady", value:
    function whenReady() {
      return this.readyPromise_;
    } }]);return AmpDocSingle;}(AmpDoc);


/**
 * The version of `AmpDoc` in the shadow-doc mode that is allocated for each
 * ampdoc hosted within a shadow root.
 * @package @visibleForTesting
 */
export var AmpDocShadow = /*#__PURE__*/function (_AmpDoc2) {_inherits(AmpDocShadow, _AmpDoc2);var _super2 = _createSuper(AmpDocShadow);
  /**
   * @param {!Window} win
   * @param {string} url
   * @param {!ShadowRoot} shadowRoot
   * @param {!AmpDocOptions=} opt_options
   */
  function AmpDocShadow(win, url, shadowRoot, opt_options) {var _this4;_classCallCheck(this, AmpDocShadow);
    _this4 = _super2.call(this, win, /* parent */null, opt_options);
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
    _this4.readyResolver_ = readyDeferred.resolve;return _this4;
  }

  /** @override */_createClass(AmpDocShadow, [{ key: "isSingleDoc", value:
    function isSingleDoc() {
      return false;
    }

    /** @override */ }, { key: "getRootNode", value:
    function getRootNode() {
      return this.shadowRoot_;
    }

    /** @override */ }, { key: "getUrl", value:
    function getUrl() {
      return this.url_;
    }

    /** @override */ }, { key: "getHeadNode", value:
    function getHeadNode() {
      return this.shadowRoot_;
    }

    /** @override */ }, { key: "isBodyAvailable", value:
    function isBodyAvailable() {
      return !!this.body_;
    }

    /** @override */ }, { key: "getBody", value:
    function getBody() {
      return (/** @type {!Element} */(this.body_));
    }

    /**
     * Signals that the shadow doc has a body.
     * @param {!Element} body
     * @restricted
     */ }, { key: "setBody", value:
    function setBody(body) {
      devAssert(!this.body_);
      this.body_ = body;
      this.bodyResolver_(body);
      this.bodyResolver_ = undefined;
    }

    /** @override */ }, { key: "waitForBodyOpen", value:
    function waitForBodyOpen() {
      return this.bodyPromise_;
    }

    /** @override */ }, { key: "isReady", value:
    function isReady() {
      return this.ready_;
    }

    /**
     * Signals that the shadow doc is ready.
     * @restricted
     */ }, { key: "setReady", value:
    function setReady() {
      devAssert(!this.ready_);
      this.ready_ = true;
      this.readyResolver_();
      this.readyResolver_ = undefined;
    }

    /** @override */ }, { key: "whenReady", value:
    function whenReady() {
      return this.readyPromise_;
    }

    /** @override */ }, { key: "getMeta", value:
    function getMeta() {
      return (/** @type {!Object<string,string>} */(map(this.meta_)));
    }

    /** @override */ }, { key: "setMetaByName", value:
    function setMetaByName(name, content) {
      devAssert(name);
      if (!this.meta_) {
        this.meta_ = map();
      }
      this.meta_[name] = content;
    } }]);return AmpDocShadow;}(AmpDoc);


/**
 * The version of `AmpDoc` for FIE embeds.
 * @package @visibleForTesting
 */
export var AmpDocFie = /*#__PURE__*/function (_AmpDoc3) {_inherits(AmpDocFie, _AmpDoc3);var _super3 = _createSuper(AmpDocFie);
  /**
   * @param {!Window} win
   * @param {string} url
   * @param {!AmpDoc} parent
   * @param {!AmpDocOptions=} opt_options
   */
  function AmpDocFie(win, url, parent, opt_options) {var _this5;_classCallCheck(this, AmpDocFie);
    _this5 = _super3.call(this, win, parent, opt_options);

    /** @private @const {string} */
    _this5.url_ = url;

    /** @private @const {!Promise<!Element>} */
    _this5.bodyPromise_ = _this5.win.document.body ?
    Promise.resolve(_this5.win.document.body) :
    waitForBodyOpenPromise(_this5.win.document).then(function () {return _this5.getBody();});

    /** @private {boolean} */
    _this5.ready_ = false;

    var readyDeferred = new Deferred();
    /** @private {!Promise} */
    _this5.readyPromise_ = readyDeferred.promise;
    /** @private {function()|undefined} */
    _this5.readyResolver_ = readyDeferred.resolve;return _this5;
  }

  /** @override */_createClass(AmpDocFie, [{ key: "isSingleDoc", value:
    function isSingleDoc() {
      return false;
    }

    /** @override */ }, { key: "getRootNode", value:
    function getRootNode() {
      return this.win.document;
    }

    /** @override */ }, { key: "getUrl", value:
    function getUrl() {
      return this.url_;
    }

    /** @override */ }, { key: "getHeadNode", value:
    function getHeadNode() {
      return (/** @type {!Element} */(this.win.document.head));
    }

    /** @override */ }, { key: "isBodyAvailable", value:
    function isBodyAvailable() {
      return !!this.win.document.body;
    }

    /** @override */ }, { key: "getBody", value:
    function getBody() {
      return (/** @type {!Element} */(this.win.document.body));
    }

    /** @override */ }, { key: "waitForBodyOpen", value:
    function waitForBodyOpen() {
      return this.bodyPromise_;
    }

    /** @override */ }, { key: "isReady", value:
    function isReady() {
      return this.ready_;
    }

    /** @override */ }, { key: "whenReady", value:
    function whenReady() {
      return this.readyPromise_;
    }

    /**
     * Signals that the FIE doc is ready.
     * @restricted
     */ }, { key: "setReady", value:
    function setReady() {
      devAssert(!this.ready_);
      this.ready_ = true;
      this.readyResolver_();
      this.readyResolver_ = undefined;
    } }]);return AmpDocFie;}(AmpDoc);


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
      Object.assign(
      params,
      parseQueryString(win.name.substring(PARAMS_SENTINEL.length)));

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
// /Users/mszylkowski/src/amphtml/src/service/ampdoc-impl.js