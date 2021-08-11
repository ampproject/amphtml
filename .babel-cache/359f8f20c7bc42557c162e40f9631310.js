import { resolvedPromise as _resolvedPromise2 } from "./core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import { CommonSignals } from "./core/constants/common-signals";
import { VisibilityState } from "./core/constants/visibility-state";
import { isConnectedNode } from "./core/dom";
import { childElementsByTag } from "./core/dom/query";
import { setStyle } from "./core/dom/style";
import { isArray, isObject } from "./core/types";
import { dev, user } from "./log";
import { getMode } from "./mode";
import { Services } from "./service";
import {
disposeServicesForDoc,
getServicePromiseOrNullForDoc } from "./service-helpers";

import { parseExtensionUrl } from "./service/extension-script";
import {
createShadowDomWriter,
createShadowRoot,
importShadowBody } from "./shadow-embed";

import { installStylesForDoc } from "./style-installer";
import { parseUrlDeprecated } from "./url";

/** @const @private {string} */
var TAG = 'multidoc-manager';

/**
 * A manager for documents in the multi-doc environment.
 */
export var MultidocManager = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!./service/ampdoc-impl.AmpDocService} ampdocService
   * @param {!./service/extensions-impl.Extensions} extensions
   * @param {!./service/timer-impl.Timer} timer
   */
  function MultidocManager(win, ampdocService, extensions, timer) {_classCallCheck(this, MultidocManager);
    /** @const */
    this.win = win;
    /** @private @const */
    this.ampdocService_ = ampdocService;
    /** @private @const */
    this.extensions_ = extensions;
    /** @private @const */
    this.timer_ = timer;

    /** @private @const {!Array<!ShadowRoot>} */
    this.shadowRoots_ = [];
  }

  /**
   * Attaches the shadow root and calls the supplied DOM builder.
   * @param {!Element} hostElement
   * @param {string} url
   * @param {!Object<string, string>|undefined} params
   * @param {function(!Object, !ShadowRoot,
   * !./service/ampdoc-impl.AmpDocShadow):!Promise} builder
   * @return {!./runtime.ShadowDoc}
   * @private
   */_createClass(MultidocManager, [{ key: "attachShadowDoc_", value:
    function attachShadowDoc_(hostElement, url, params, builder) {var _this = this;
      params = params || Object.create(null);
      this.purgeShadowRoots_();

      setStyle(hostElement, 'visibility', 'hidden');
      var shadowRoot = createShadowRoot(hostElement);

      // TODO: closeShadowRoot_ is asynchronous. While this safety check is well
      // intentioned, it leads to a race between unlayout and layout of custom
      // elements.
      if (shadowRoot.AMP) {
        user().warn(TAG, "Shadow doc wasn't previously closed");
        this.closeShadowRoot_(shadowRoot);
      }

      var amp = {};
      shadowRoot.AMP = amp;
      amp.url = url;
      var _parseUrlDeprecated = parseUrlDeprecated(url),origin = _parseUrlDeprecated.origin;

      var ampdoc = this.ampdocService_.installShadowDoc(url, shadowRoot, {
        params: params });

      /** @const {!./service/ampdoc-impl.AmpDocShadow} */
      amp.ampdoc = ampdoc;
      dev().fine(TAG, 'Attach to shadow root:', shadowRoot, ampdoc);

      // Install runtime CSS.
      installStylesForDoc(
      ampdoc,
      AMP.combinedCss,
      /* callback */null,
      /* opt_isRuntimeCss */true);

      // Instal doc services.
      AMP.installAmpdocServices(ampdoc);

      var viewer = Services.viewerForDoc(ampdoc);

      /**
       * Sets the document's visibility state.
       * @param {!VisibilityState} state
       */
      amp['setVisibilityState'] = function (state) {
        ampdoc.overrideVisibilityState(state);
      };

      // Messaging pipe.
      /**
       * Posts message to the ampdoc.
       * @param {string} eventType
       * @param {!JsonObject} data
       * @param {boolean} unusedAwaitResponse
       * @return {(!Promise<*>|undefined)}
       */
      amp['postMessage'] = viewer.receiveMessage.bind(viewer);

      /** @type {function(string, *, boolean):(!Promise<*>|undefined)} */
      var onMessage;

      /**
       * Provides a message delivery mechanism by which AMP document can send
       * messages to the viewer.
       * @param {function(string, *, boolean):(!Promise<*>|undefined)} callback
       */
      amp['onMessage'] = function (callback) {
        onMessage = callback;
      };

      viewer.setMessageDeliverer(function (eventType, data, awaitResponse) {
        // Special messages.
        if (eventType == 'broadcast') {
          _this.broadcast_(data, shadowRoot);
          return awaitResponse ? _resolvedPromise() : undefined;
        }

        // All other messages.
        if (onMessage) {
          return onMessage(eventType, data, awaitResponse);
        }
      }, origin);

      /**
       * Closes the document, resolving when visibility changes and services have
       * been cleand up. The document can no longer be activated again.
       * @return {Promise}
       */
      amp['close'] = function () {
        return _this.closeShadowRoot_(shadowRoot);
      };

      if (false) {
        amp.toggleRuntime = viewer.toggleRuntime.bind(viewer);
        amp.resources = Services.resourcesForDoc(ampdoc);
      }

      /**
       * Expose amp-bind getState
       * @param {string} name - Name of state or deep state
       * @return {Promise<*>} - Resolves to a copy of the value of a state
       */
      amp['getState'] = function (name) {
        return Services.bindForDocOrNull(shadowRoot).then(function (bind) {
          if (!bind) {
            return Promise.reject('amp-bind is not available in this document');
          }
          return bind.getState(name);
        });
      };

      /**
       * Expose amp-bind setState
       * @param {(!JsonObject|string)} state - State to be set
       * @return {Promise} - Resolves after state and history have been updated
       */
      amp['setState'] = function (state) {
        return Services.bindForDocOrNull(shadowRoot).then(function (bind) {
          if (!bind) {
            return Promise.reject('amp-bind is not available in this document');
          }
          if (typeof state === 'string') {
            return bind.setStateWithExpression(
            /** @type {string} */(state),
            /** @type {!JsonObject} */({}));

          } else if (isObject(state) || isArray(state)) {
            return bind.setStateWithObject( /** @type {!JsonObject} */(state));
          }
          return Promise.reject('Invalid state');
        });
      };

      // Start building the shadow doc DOM.
      builder(amp, shadowRoot, ampdoc).then(function () {
        // Document is ready.
        ampdoc.setReady();
        ampdoc.signals().signal(CommonSignals.RENDER_START);
        setStyle(hostElement, 'visibility', 'visible');
      });

      // Store reference.
      if (!this.shadowRoots_.includes(shadowRoot)) {
        this.shadowRoots_.push(shadowRoot);
      }

      dev().fine(TAG, 'Shadow root initialization is done:', shadowRoot, ampdoc);
      return amp;
    }

    /**
     * Implementation for `attachShadowDoc` function. Attaches the shadow doc and
     * configures ampdoc for it.
     * @param {!Element} hostElement
     * @param {!Document} doc
     * @param {string} url
     * @param {!Object<string, string>=} opt_initParams
     * @return {!./runtime.ShadowDoc}
     */ }, { key: "attachShadowDoc", value:
    function attachShadowDoc(hostElement, doc, url, opt_initParams) {var _this2 = this;
      user().assertString(url);
      dev().fine(TAG, 'Attach shadow doc:', doc);
      // TODO(dvoytenko, #9490): once stable, port full document case to emulated
      // stream.
      return this.attachShadowDoc_(
      hostElement,
      url,
      opt_initParams,
      function (amp, shadowRoot, ampdoc) {
        // Install extensions.
        _this2.mergeShadowHead_(ampdoc, shadowRoot, doc);

        // Append body.
        if (doc.body) {
          var body = importShadowBody(shadowRoot, doc.body, /* deep */true);
          body.classList.add('amp-shadow');
          ampdoc.setBody(body);
        }

        // TODO(dvoytenko): find a better and more stable way to make content
        // visible. E.g. integrate with dynamic classes. In shadow case
        // specifically, we have to wait for stubbing to complete, which may
        // take awhile due to importNode.
        setTimeout(function () {
          ampdoc.signals().signal(CommonSignals.RENDER_START);
          setStyle(hostElement, 'visibility', 'visible');
        }, 50);

        return _resolvedPromise2();
      });

    }

    /**
     * Implementation for `attachShadowDocAsStream` function. Attaches the shadow
     * doc and configures ampdoc for it.
     * @param {!Element} hostElement
     * @param {string} url
     * @param {!Object<string, string>=} opt_initParams
     * @return {!Object}
     */ }, { key: "attachShadowDocAsStream", value:
    function attachShadowDocAsStream(hostElement, url, opt_initParams) {var _this3 = this;
      user().assertString(url);
      dev().fine(TAG, 'Attach shadow doc as stream');
      return this.attachShadowDoc_(
      hostElement,
      url,
      opt_initParams,
      function (amp, shadowRoot, ampdoc) {
        // Start streaming.
        var renderStarted = false;
        var writer = createShadowDomWriter(_this3.win);
        amp['writer'] = writer;
        writer.onBody(function (doc) {
          // Install extensions.
          _this3.mergeShadowHead_(ampdoc, shadowRoot, doc);

          // Append shallow body.
          var body = importShadowBody(
          shadowRoot, /** @type {!Element} */(
          doc.body),
          /* deep */false);

          body.classList.add('amp-shadow');
          ampdoc.setBody(body);
          return body;
        });
        writer.onBodyChunk(function () {
          // TODO(dvoytenko): find a better and more stable way to make
          // content visible. E.g. integrate with dynamic classes. In shadow
          // case specifically, we have to wait for stubbing to complete,
          // which may take awhile due to node importing.
          if (!renderStarted) {
            renderStarted = true;
            setTimeout(function () {
              ampdoc.signals().signal(CommonSignals.RENDER_START);
              setStyle(hostElement, 'visibility', 'visible');
            }, 50);
          }
        });
        return new Promise(function (resolve) {
          writer.onEnd(function () {
            resolve();
            amp.writer = null;
          });
        });
      });

    }

    /**
     * Processes the contents of the shadow document's head.
     * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
     * @param {!ShadowRoot} shadowRoot
     * @param {!Document} doc
     * @private
     */ }, { key: "mergeShadowHead_", value:
    function mergeShadowHead_(ampdoc, shadowRoot, doc) {
      if (doc.head) {
        shadowRoot.AMP.head = doc.head;
        var parentLinks = {};
        var links = childElementsByTag( /** @type {!Element} */(
        this.win.document.head),
        'link');

        for (var i = 0; i < links.length; i++) {
          var href = links[i].getAttribute('href');
          if (href) {
            parentLinks[href] = true;
          }
        }

        for (var n = doc.head.firstElementChild; n; n = n.nextElementSibling) {
          var _n = n,tagName = _n.tagName;
          var name = n.getAttribute('name');
          var rel = n.getAttribute('rel');
          switch (tagName) {
            case 'TITLE':
              shadowRoot.AMP.title = n.textContent;
              dev().fine(TAG, '- set title: ', shadowRoot.AMP.title);
              break;
            case 'META':
              if (n.hasAttribute('charset')) {
                // Ignore.
              } else if (name == 'viewport') {
                // Ignore.
              } else if (name) {
                // Store meta name/content pairs.
                ampdoc.setMetaByName(name, n.getAttribute('content') || '');
              } else {
                // TODO(dvoytenko): copy other meta tags.
                dev().warn(TAG, 'meta ignored: ', n);
              }
              break;
            case 'LINK':
              /** @const {string} */
              var _href = n.getAttribute('href');
              if (rel == 'canonical') {
                shadowRoot.AMP.canonicalUrl = _href;
                dev().fine(TAG, '- set canonical: ', shadowRoot.AMP.canonicalUrl);
              } else if (rel == 'stylesheet') {
                // Must be a font definition: no other stylesheets are allowed.
                if (parentLinks[_href]) {
                  dev().fine(TAG, '- stylesheet already included: ', _href);
                  // To accomodate icon fonts whose stylesheets include
                  // the class definitions in addition to the font definition,
                  // we re-import the stylesheet into the shadow document.
                  // Note: <link> in shadow mode is not yet fully supported on
                  // all browsers, so we use <style>@import "url"</style> instead
                  installStylesForDoc(
                  ampdoc, "@import \"".concat(
                  _href, "\""),
                  /* callback */null,
                  /* isRuntimeCss */false);

                } else {
                  parentLinks[_href] = true;
                  var el = this.win.document.createElement('link');
                  el.setAttribute('rel', 'stylesheet');
                  el.setAttribute('type', 'text/css');
                  el.setAttribute('href', _href);
                  this.win.document.head.appendChild(el);
                  dev().fine(TAG, '- import font to parent: ', _href, el);
                }
              } else {
                dev().fine(TAG, '- ignore link rel=', rel);
              }
              break;
            case 'STYLE':
              if (n.hasAttribute('amp-boilerplate')) {
                // Ignore.
                dev().fine(TAG, '- ignore boilerplate style: ', n);
              } else if (n.hasAttribute('amp-custom')) {
                installStylesForDoc(
                ampdoc,
                n.textContent,
                /* callback */null,
                /* isRuntimeCss */false,
                'amp-custom');

                dev().fine(TAG, '- import style: ', n);
              } else if (n.hasAttribute('amp-keyframes')) {
                installStylesForDoc(
                ampdoc,
                n.textContent,
                /* callback */null,
                /* isRuntimeCss */false,
                'amp-keyframes');

                dev().fine(TAG, '- import style: ', n);
              }
              break;
            case 'SCRIPT':
              if (n.hasAttribute('src')) {
                dev().fine(TAG, '- src script: ', n);
                var src = n.getAttribute('src');
                var urlParts = parseExtensionUrl(src);
                // Note: Some extensions don't have [custom-element] or
                // [custom-template] e.g. amp-viewer-integration.
                var customElement = n.getAttribute('custom-element');
                var customTemplate = n.getAttribute('custom-template');
                var extensionId = customElement || customTemplate;
                if (!urlParts) {
                  dev().fine(TAG, '- ignore runtime script: ', src);
                } else if (extensionId) {
                  // This is an extension.
                  this.extensions_.installExtensionForDoc(
                  ampdoc,
                  extensionId,
                  urlParts.extensionVersion);

                } else if (!n.hasAttribute('data-amp-report-test')) {
                  user().error(TAG, '- unknown script: ', n, src);
                }
              } else {
                // Non-src version of script.
                var type = n.getAttribute('type') || 'application/javascript';
                if (type.indexOf('javascript') == -1) {
                  shadowRoot.appendChild(this.win.document.importNode(n, true));
                  dev().fine(TAG, '- non-src script: ', n);
                } else if (!n.hasAttribute('amp-onerror')) {
                  // Don't error on amp-onerror script (https://github.com/ampproject/amphtml/issues/31966)
                  user().error(TAG, '- unallowed inline javascript: ', n);
                }
              }
              break;
            case 'NOSCRIPT':
              // Ignore.
              break;
            default:
              user().error(TAG, '- UNKNOWN head element:', n);
              break;}

        }
      }
      ampdoc.setExtensionsKnown();
    }

    /**
     * @param {*} data
     * @param {!ShadowRoot} sender
     * @private
     */ }, { key: "broadcast_", value:
    function broadcast_(data, sender) {var _this4 = this;
      this.purgeShadowRoots_();
      this.shadowRoots_.forEach(function (shadowRoot) {
        if (shadowRoot == sender) {
          // Don't broadcast to the sender.
          return;
        }
        // Broadcast message asynchronously.
        var viewer = Services.viewerForDoc(shadowRoot.AMP.ampdoc);
        _this4.timer_.delay(function () {
          viewer.receiveMessage(
          'broadcast',
          /** @type {!JsonObject} */(data),
          /* awaitResponse */false);

        }, 0);
      });
    }

    /**
     * @param {!ShadowRoot} shadowRoot
     * @return {Promise}
     * @private
     */ }, { key: "closeShadowRoot_", value:
    function closeShadowRoot_(shadowRoot) {
      this.removeShadowRoot_(shadowRoot);
      var amp = shadowRoot.AMP;
      delete shadowRoot.AMP;
      var ampdoc = amp.ampdoc;
      ampdoc.overrideVisibilityState(VisibilityState.INACTIVE);
      disposeServicesForDoc(ampdoc);

      // There is a race between the visibility state change finishing and
      // resources.onNextPass firing, but this is intentional. closeShadowRoot_
      // was traditionally introduced as a synchronous method, so PWAs in the wild
      // do not expect to have to wait for a promise to resolve before the shadow
      // is deemed 'closed'. Moving .overrideVisibilityState() and
      // disposeServicesForDoc inside a promise could adversely affect sites that
      // depend on at least the synchronous portions of those methods completing
      // before proceeding. The promise race is designed to be very quick so that
      // even if the pass callback completes before resources.onNextPass is called
      // below, we only delay promise resolution by a few ms.
      return this.timer_.
      timeoutPromise(
      15, // Delay for queued pass after visibility change is 10ms
      new this.win.Promise(function (resolve) {
        getServicePromiseOrNullForDoc(ampdoc, 'resources').then(
        function (resources) {
          if (resources) {
            resources.onNextPass(resolve);
          } else {
            resolve();
          }
        });

      }),
      'Timeout reached waiting for visibility state change callback').

      catch(function (error) {
        user().info(TAG, error);
      });
    }

    /**
     * @param {!ShadowRoot} shadowRoot
     * @private
     */ }, { key: "removeShadowRoot_", value:
    function removeShadowRoot_(shadowRoot) {
      var index = this.shadowRoots_.indexOf(shadowRoot);
      if (index != -1) {
        this.shadowRoots_.splice(index, 1);
      }
    }

    /**
     * @param {!ShadowRoot} shadowRoot
     * @private
     */ }, { key: "closeShadowRootAsync_", value:
    function closeShadowRootAsync_(shadowRoot) {var _this5 = this;
      this.timer_.delay(function () {
        _this5.closeShadowRoot_(shadowRoot);
      }, 0);
    }

    /** @private */ }, { key: "purgeShadowRoots_", value:
    function purgeShadowRoots_() {var _this6 = this;
      this.shadowRoots_.forEach(function (shadowRoot) {
        // The shadow root has been disconnected. Force it closed.
        if (!shadowRoot.host || !isConnectedNode(shadowRoot.host)) {
          user().warn(TAG, "Shadow doc wasn't previously closed");
          _this6.removeShadowRoot_(shadowRoot);
          _this6.closeShadowRootAsync_(shadowRoot);
        }
      });
    } }]);return MultidocManager;}();
// /Users/mszylkowski/src/amphtml/src/multidoc-manager.js