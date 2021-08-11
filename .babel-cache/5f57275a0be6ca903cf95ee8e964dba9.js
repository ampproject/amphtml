import { resolvedPromise as _resolvedPromise2 } from "./core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { disposeServicesForDoc, getServicePromiseOrNullForDoc } from "./service-helpers";
import { parseExtensionUrl } from "./service/extension-script";
import { createShadowDomWriter, createShadowRoot, importShadowBody } from "./shadow-embed";
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
  function MultidocManager(win, ampdocService, extensions, timer) {
    _classCallCheck(this, MultidocManager);

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
   */
  _createClass(MultidocManager, [{
    key: "attachShadowDoc_",
    value: function attachShadowDoc_(hostElement, url, params, builder) {
      var _this = this;

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

      var _parseUrlDeprecated = parseUrlDeprecated(url),
          origin = _parseUrlDeprecated.origin;

      var ampdoc = this.ampdocService_.installShadowDoc(url, shadowRoot, {
        params: params
      });

      /** @const {!./service/ampdoc-impl.AmpDocShadow} */
      amp.ampdoc = ampdoc;
      dev().fine(TAG, 'Attach to shadow root:', shadowRoot, ampdoc);
      // Install runtime CSS.
      installStylesForDoc(ampdoc, AMP.combinedCss,
      /* callback */
      null,
      /* opt_isRuntimeCss */
      true);
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

      if (getMode().development) {
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
            /** @type {string} */
            state,
            /** @type {!JsonObject} */
            {});
          } else if (isObject(state) || isArray(state)) {
            return bind.setStateWithObject(
            /** @type {!JsonObject} */
            state);
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
     */

  }, {
    key: "attachShadowDoc",
    value: function attachShadowDoc(hostElement, doc, url, opt_initParams) {
      var _this2 = this;

      user().assertString(url);
      dev().fine(TAG, 'Attach shadow doc:', doc);
      // TODO(dvoytenko, #9490): once stable, port full document case to emulated
      // stream.
      return this.attachShadowDoc_(hostElement, url, opt_initParams, function (amp, shadowRoot, ampdoc) {
        // Install extensions.
        _this2.mergeShadowHead_(ampdoc, shadowRoot, doc);

        // Append body.
        if (doc.body) {
          var body = importShadowBody(shadowRoot, doc.body,
          /* deep */
          true);
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
     */

  }, {
    key: "attachShadowDocAsStream",
    value: function attachShadowDocAsStream(hostElement, url, opt_initParams) {
      var _this3 = this;

      user().assertString(url);
      dev().fine(TAG, 'Attach shadow doc as stream');
      return this.attachShadowDoc_(hostElement, url, opt_initParams, function (amp, shadowRoot, ampdoc) {
        // Start streaming.
        var renderStarted = false;
        var writer = createShadowDomWriter(_this3.win);
        amp['writer'] = writer;
        writer.onBody(function (doc) {
          // Install extensions.
          _this3.mergeShadowHead_(ampdoc, shadowRoot, doc);

          // Append shallow body.
          var body = importShadowBody(shadowRoot, dev().assertElement(doc.body),
          /* deep */
          false);
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
     */

  }, {
    key: "mergeShadowHead_",
    value: function mergeShadowHead_(ampdoc, shadowRoot, doc) {
      if (doc.head) {
        shadowRoot.AMP.head = doc.head;
        var parentLinks = {};
        var links = childElementsByTag(dev().assertElement(this.win.document.head), 'link');

        for (var i = 0; i < links.length; i++) {
          var href = links[i].getAttribute('href');

          if (href) {
            parentLinks[href] = true;
          }
        }

        for (var n = doc.head.firstElementChild; n; n = n.nextElementSibling) {
          var _n = n,
              tagName = _n.tagName;
          var name = n.getAttribute('name');
          var rel = n.getAttribute('rel');

          switch (tagName) {
            case 'TITLE':
              shadowRoot.AMP.title = n.textContent;
              dev().fine(TAG, '- set title: ', shadowRoot.AMP.title);
              break;

            case 'META':
              if (n.hasAttribute('charset')) {// Ignore.
              } else if (name == 'viewport') {// Ignore.
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
                  installStylesForDoc(ampdoc, "@import \"" + _href + "\"",
                  /* callback */
                  null,
                  /* isRuntimeCss */
                  false);
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
                installStylesForDoc(ampdoc, n.textContent,
                /* callback */
                null,
                /* isRuntimeCss */
                false, 'amp-custom');
                dev().fine(TAG, '- import style: ', n);
              } else if (n.hasAttribute('amp-keyframes')) {
                installStylesForDoc(ampdoc, n.textContent,
                /* callback */
                null,
                /* isRuntimeCss */
                false, 'amp-keyframes');
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
                  this.extensions_.installExtensionForDoc(ampdoc, extensionId, urlParts.extensionVersion);
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
              break;
          }
        }
      }

      ampdoc.setExtensionsKnown();
    }
    /**
     * @param {*} data
     * @param {!ShadowRoot} sender
     * @private
     */

  }, {
    key: "broadcast_",
    value: function broadcast_(data, sender) {
      var _this4 = this;

      this.purgeShadowRoots_();
      this.shadowRoots_.forEach(function (shadowRoot) {
        if (shadowRoot == sender) {
          // Don't broadcast to the sender.
          return;
        }

        // Broadcast message asynchronously.
        var viewer = Services.viewerForDoc(shadowRoot.AMP.ampdoc);

        _this4.timer_.delay(function () {
          viewer.receiveMessage('broadcast',
          /** @type {!JsonObject} */
          data,
          /* awaitResponse */
          false);
        }, 0);
      });
    }
    /**
     * @param {!ShadowRoot} shadowRoot
     * @return {Promise}
     * @private
     */

  }, {
    key: "closeShadowRoot_",
    value: function closeShadowRoot_(shadowRoot) {
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
      return this.timer_.timeoutPromise(15, // Delay for queued pass after visibility change is 10ms
      new this.win.Promise(function (resolve) {
        getServicePromiseOrNullForDoc(ampdoc, 'resources').then(function (resources) {
          if (resources) {
            resources.onNextPass(resolve);
          } else {
            resolve();
          }
        });
      }), 'Timeout reached waiting for visibility state change callback').catch(function (error) {
        user().info(TAG, error);
      });
    }
    /**
     * @param {!ShadowRoot} shadowRoot
     * @private
     */

  }, {
    key: "removeShadowRoot_",
    value: function removeShadowRoot_(shadowRoot) {
      var index = this.shadowRoots_.indexOf(shadowRoot);

      if (index != -1) {
        this.shadowRoots_.splice(index, 1);
      }
    }
    /**
     * @param {!ShadowRoot} shadowRoot
     * @private
     */

  }, {
    key: "closeShadowRootAsync_",
    value: function closeShadowRootAsync_(shadowRoot) {
      var _this5 = this;

      this.timer_.delay(function () {
        _this5.closeShadowRoot_(shadowRoot);
      }, 0);
    }
    /** @private */

  }, {
    key: "purgeShadowRoots_",
    value: function purgeShadowRoots_() {
      var _this6 = this;

      this.shadowRoots_.forEach(function (shadowRoot) {
        // The shadow root has been disconnected. Force it closed.
        if (!shadowRoot.host || !isConnectedNode(shadowRoot.host)) {
          user().warn(TAG, "Shadow doc wasn't previously closed");

          _this6.removeShadowRoot_(shadowRoot);

          _this6.closeShadowRootAsync_(shadowRoot);
        }
      });
    }
  }]);

  return MultidocManager;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm11bHRpZG9jLW1hbmFnZXIuanMiXSwibmFtZXMiOlsiQ29tbW9uU2lnbmFscyIsIlZpc2liaWxpdHlTdGF0ZSIsImlzQ29ubmVjdGVkTm9kZSIsImNoaWxkRWxlbWVudHNCeVRhZyIsInNldFN0eWxlIiwiaXNBcnJheSIsImlzT2JqZWN0IiwiZGV2IiwidXNlciIsImdldE1vZGUiLCJTZXJ2aWNlcyIsImRpc3Bvc2VTZXJ2aWNlc0ZvckRvYyIsImdldFNlcnZpY2VQcm9taXNlT3JOdWxsRm9yRG9jIiwicGFyc2VFeHRlbnNpb25VcmwiLCJjcmVhdGVTaGFkb3dEb21Xcml0ZXIiLCJjcmVhdGVTaGFkb3dSb290IiwiaW1wb3J0U2hhZG93Qm9keSIsImluc3RhbGxTdHlsZXNGb3JEb2MiLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJUQUciLCJNdWx0aWRvY01hbmFnZXIiLCJ3aW4iLCJhbXBkb2NTZXJ2aWNlIiwiZXh0ZW5zaW9ucyIsInRpbWVyIiwiYW1wZG9jU2VydmljZV8iLCJleHRlbnNpb25zXyIsInRpbWVyXyIsInNoYWRvd1Jvb3RzXyIsImhvc3RFbGVtZW50IiwidXJsIiwicGFyYW1zIiwiYnVpbGRlciIsIk9iamVjdCIsImNyZWF0ZSIsInB1cmdlU2hhZG93Um9vdHNfIiwic2hhZG93Um9vdCIsIkFNUCIsIndhcm4iLCJjbG9zZVNoYWRvd1Jvb3RfIiwiYW1wIiwib3JpZ2luIiwiYW1wZG9jIiwiaW5zdGFsbFNoYWRvd0RvYyIsImZpbmUiLCJjb21iaW5lZENzcyIsImluc3RhbGxBbXBkb2NTZXJ2aWNlcyIsInZpZXdlciIsInZpZXdlckZvckRvYyIsInN0YXRlIiwib3ZlcnJpZGVWaXNpYmlsaXR5U3RhdGUiLCJyZWNlaXZlTWVzc2FnZSIsImJpbmQiLCJvbk1lc3NhZ2UiLCJjYWxsYmFjayIsInNldE1lc3NhZ2VEZWxpdmVyZXIiLCJldmVudFR5cGUiLCJkYXRhIiwiYXdhaXRSZXNwb25zZSIsImJyb2FkY2FzdF8iLCJ1bmRlZmluZWQiLCJkZXZlbG9wbWVudCIsInRvZ2dsZVJ1bnRpbWUiLCJyZXNvdXJjZXMiLCJyZXNvdXJjZXNGb3JEb2MiLCJuYW1lIiwiYmluZEZvckRvY09yTnVsbCIsInRoZW4iLCJQcm9taXNlIiwicmVqZWN0IiwiZ2V0U3RhdGUiLCJzZXRTdGF0ZVdpdGhFeHByZXNzaW9uIiwic2V0U3RhdGVXaXRoT2JqZWN0Iiwic2V0UmVhZHkiLCJzaWduYWxzIiwic2lnbmFsIiwiUkVOREVSX1NUQVJUIiwiaW5jbHVkZXMiLCJwdXNoIiwiZG9jIiwib3B0X2luaXRQYXJhbXMiLCJhc3NlcnRTdHJpbmciLCJhdHRhY2hTaGFkb3dEb2NfIiwibWVyZ2VTaGFkb3dIZWFkXyIsImJvZHkiLCJjbGFzc0xpc3QiLCJhZGQiLCJzZXRCb2R5Iiwic2V0VGltZW91dCIsInJlbmRlclN0YXJ0ZWQiLCJ3cml0ZXIiLCJvbkJvZHkiLCJhc3NlcnRFbGVtZW50Iiwib25Cb2R5Q2h1bmsiLCJyZXNvbHZlIiwib25FbmQiLCJoZWFkIiwicGFyZW50TGlua3MiLCJsaW5rcyIsImRvY3VtZW50IiwiaSIsImxlbmd0aCIsImhyZWYiLCJnZXRBdHRyaWJ1dGUiLCJuIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJuZXh0RWxlbWVudFNpYmxpbmciLCJ0YWdOYW1lIiwicmVsIiwidGl0bGUiLCJ0ZXh0Q29udGVudCIsImhhc0F0dHJpYnV0ZSIsInNldE1ldGFCeU5hbWUiLCJjYW5vbmljYWxVcmwiLCJlbCIsImNyZWF0ZUVsZW1lbnQiLCJzZXRBdHRyaWJ1dGUiLCJhcHBlbmRDaGlsZCIsInNyYyIsInVybFBhcnRzIiwiY3VzdG9tRWxlbWVudCIsImN1c3RvbVRlbXBsYXRlIiwiZXh0ZW5zaW9uSWQiLCJpbnN0YWxsRXh0ZW5zaW9uRm9yRG9jIiwiZXh0ZW5zaW9uVmVyc2lvbiIsImVycm9yIiwidHlwZSIsImluZGV4T2YiLCJpbXBvcnROb2RlIiwic2V0RXh0ZW5zaW9uc0tub3duIiwic2VuZGVyIiwiZm9yRWFjaCIsImRlbGF5IiwicmVtb3ZlU2hhZG93Um9vdF8iLCJJTkFDVElWRSIsInRpbWVvdXRQcm9taXNlIiwib25OZXh0UGFzcyIsImNhdGNoIiwiaW5mbyIsImluZGV4Iiwic3BsaWNlIiwiaG9zdCIsImNsb3NlU2hhZG93Um9vdEFzeW5jXyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsYUFBUjtBQUNBLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxlQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsUUFBakI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLElBQWI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQ0VDLHFCQURGLEVBRUVDLDZCQUZGO0FBSUEsU0FBUUMsaUJBQVI7QUFDQSxTQUNFQyxxQkFERixFQUVFQyxnQkFGRixFQUdFQyxnQkFIRjtBQUtBLFNBQVFDLG1CQUFSO0FBQ0EsU0FBUUMsa0JBQVI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsa0JBQVo7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsZUFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFLDJCQUFZQyxHQUFaLEVBQWlCQyxhQUFqQixFQUFnQ0MsVUFBaEMsRUFBNENDLEtBQTVDLEVBQW1EO0FBQUE7O0FBQ2pEO0FBQ0EsU0FBS0gsR0FBTCxHQUFXQSxHQUFYOztBQUNBO0FBQ0EsU0FBS0ksY0FBTCxHQUFzQkgsYUFBdEI7O0FBQ0E7QUFDQSxTQUFLSSxXQUFMLEdBQW1CSCxVQUFuQjs7QUFDQTtBQUNBLFNBQUtJLE1BQUwsR0FBY0gsS0FBZDs7QUFFQTtBQUNBLFNBQUtJLFlBQUwsR0FBb0IsRUFBcEI7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTlCQTtBQUFBO0FBQUEsV0Er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S0FBekIsRUFBZ0MsQ0FBaEM7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBOWZBO0FBQUE7QUFBQSxXQStmRSwrQkFBc0J2RyxVQUF0QixFQUFrQztBQUFBOztBQUNoQyxXQUFLVCxNQUFMLENBQVl5RyxLQUFaLENBQWtCLFlBQU07QUFDdEIsUUFBQSxNQUFJLENBQUM3RixnQkFBTCxDQUFzQkgsVUFBdEI7QUFDRCxPQUZELEVBRUcsQ0FGSDtBQUdEO0FBRUQ7O0FBcmdCRjtBQUFBO0FBQUEsV0FzZ0JFLDZCQUFvQjtBQUFBOztBQUNsQixXQUFLUixZQUFMLENBQWtCdUcsT0FBbEIsQ0FBMEIsVUFBQy9GLFVBQUQsRUFBZ0I7QUFDeEM7QUFDQSxZQUFJLENBQUNBLFVBQVUsQ0FBQ3lHLElBQVosSUFBb0IsQ0FBQzNJLGVBQWUsQ0FBQ2tDLFVBQVUsQ0FBQ3lHLElBQVosQ0FBeEMsRUFBMkQ7QUFDekRySSxVQUFBQSxJQUFJLEdBQUc4QixJQUFQLENBQVluQixHQUFaLEVBQWlCLHFDQUFqQjs7QUFDQSxVQUFBLE1BQUksQ0FBQ2tILGlCQUFMLENBQXVCakcsVUFBdkI7O0FBQ0EsVUFBQSxNQUFJLENBQUMwRyxxQkFBTCxDQUEyQjFHLFVBQTNCO0FBQ0Q7QUFDRixPQVBEO0FBUUQ7QUEvZ0JIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtDb21tb25TaWduYWxzfSBmcm9tICcuL2NvcmUvY29uc3RhbnRzL2NvbW1vbi1zaWduYWxzJztcbmltcG9ydCB7VmlzaWJpbGl0eVN0YXRlfSBmcm9tICcuL2NvcmUvY29uc3RhbnRzL3Zpc2liaWxpdHktc3RhdGUnO1xuaW1wb3J0IHtpc0Nvbm5lY3RlZE5vZGV9IGZyb20gJy4vY29yZS9kb20nO1xuaW1wb3J0IHtjaGlsZEVsZW1lbnRzQnlUYWd9IGZyb20gJy4vY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtzZXRTdHlsZX0gZnJvbSAnLi9jb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2lzQXJyYXksIGlzT2JqZWN0fSBmcm9tICcuL2NvcmUvdHlwZXMnO1xuaW1wb3J0IHtkZXYsIHVzZXJ9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi9tb2RlJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5pbXBvcnQge1xuICBkaXNwb3NlU2VydmljZXNGb3JEb2MsXG4gIGdldFNlcnZpY2VQcm9taXNlT3JOdWxsRm9yRG9jLFxufSBmcm9tICcuL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge3BhcnNlRXh0ZW5zaW9uVXJsfSBmcm9tICcuL3NlcnZpY2UvZXh0ZW5zaW9uLXNjcmlwdCc7XG5pbXBvcnQge1xuICBjcmVhdGVTaGFkb3dEb21Xcml0ZXIsXG4gIGNyZWF0ZVNoYWRvd1Jvb3QsXG4gIGltcG9ydFNoYWRvd0JvZHksXG59IGZyb20gJy4vc2hhZG93LWVtYmVkJztcbmltcG9ydCB7aW5zdGFsbFN0eWxlc0ZvckRvY30gZnJvbSAnLi9zdHlsZS1pbnN0YWxsZXInO1xuaW1wb3J0IHtwYXJzZVVybERlcHJlY2F0ZWR9IGZyb20gJy4vdXJsJztcblxuLyoqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ211bHRpZG9jLW1hbmFnZXInO1xuXG4vKipcbiAqIEEgbWFuYWdlciBmb3IgZG9jdW1lbnRzIGluIHRoZSBtdWx0aS1kb2MgZW52aXJvbm1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNdWx0aWRvY01hbmFnZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY1NlcnZpY2V9IGFtcGRvY1NlcnZpY2VcbiAgICogQHBhcmFtIHshLi9zZXJ2aWNlL2V4dGVuc2lvbnMtaW1wbC5FeHRlbnNpb25zfSBleHRlbnNpb25zXG4gICAqIEBwYXJhbSB7IS4vc2VydmljZS90aW1lci1pbXBsLlRpbWVyfSB0aW1lclxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBhbXBkb2NTZXJ2aWNlLCBleHRlbnNpb25zLCB0aW1lcikge1xuICAgIC8qKiBAY29uc3QgKi9cbiAgICB0aGlzLndpbiA9IHdpbjtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5hbXBkb2NTZXJ2aWNlXyA9IGFtcGRvY1NlcnZpY2U7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMuZXh0ZW5zaW9uc18gPSBleHRlbnNpb25zO1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLnRpbWVyXyA9IHRpbWVyO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUFycmF5PCFTaGFkb3dSb290Pn0gKi9cbiAgICB0aGlzLnNoYWRvd1Jvb3RzXyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSBzaGFkb3cgcm9vdCBhbmQgY2FsbHMgdGhlIHN1cHBsaWVkIERPTSBidWlsZGVyLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBob3N0RWxlbWVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz58dW5kZWZpbmVkfSBwYXJhbXNcbiAgICogQHBhcmFtIHtmdW5jdGlvbighT2JqZWN0LCAhU2hhZG93Um9vdCxcbiAgICogIS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2NTaGFkb3cpOiFQcm9taXNlfSBidWlsZGVyXG4gICAqIEByZXR1cm4geyEuL3J1bnRpbWUuU2hhZG93RG9jfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYXR0YWNoU2hhZG93RG9jXyhob3N0RWxlbWVudCwgdXJsLCBwYXJhbXMsIGJ1aWxkZXIpIHtcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLnB1cmdlU2hhZG93Um9vdHNfKCk7XG5cbiAgICBzZXRTdHlsZShob3N0RWxlbWVudCwgJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgY29uc3Qgc2hhZG93Um9vdCA9IGNyZWF0ZVNoYWRvd1Jvb3QoaG9zdEVsZW1lbnQpO1xuXG4gICAgLy8gVE9ETzogY2xvc2VTaGFkb3dSb290XyBpcyBhc3luY2hyb25vdXMuIFdoaWxlIHRoaXMgc2FmZXR5IGNoZWNrIGlzIHdlbGxcbiAgICAvLyBpbnRlbnRpb25lZCwgaXQgbGVhZHMgdG8gYSByYWNlIGJldHdlZW4gdW5sYXlvdXQgYW5kIGxheW91dCBvZiBjdXN0b21cbiAgICAvLyBlbGVtZW50cy5cbiAgICBpZiAoc2hhZG93Um9vdC5BTVApIHtcbiAgICAgIHVzZXIoKS53YXJuKFRBRywgXCJTaGFkb3cgZG9jIHdhc24ndCBwcmV2aW91c2x5IGNsb3NlZFwiKTtcbiAgICAgIHRoaXMuY2xvc2VTaGFkb3dSb290XyhzaGFkb3dSb290KTtcbiAgICB9XG5cbiAgICBjb25zdCBhbXAgPSB7fTtcbiAgICBzaGFkb3dSb290LkFNUCA9IGFtcDtcbiAgICBhbXAudXJsID0gdXJsO1xuICAgIGNvbnN0IHtvcmlnaW59ID0gcGFyc2VVcmxEZXByZWNhdGVkKHVybCk7XG5cbiAgICBjb25zdCBhbXBkb2MgPSB0aGlzLmFtcGRvY1NlcnZpY2VfLmluc3RhbGxTaGFkb3dEb2ModXJsLCBzaGFkb3dSb290LCB7XG4gICAgICBwYXJhbXMsXG4gICAgfSk7XG4gICAgLyoqIEBjb25zdCB7IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2NTaGFkb3d9ICovXG4gICAgYW1wLmFtcGRvYyA9IGFtcGRvYztcbiAgICBkZXYoKS5maW5lKFRBRywgJ0F0dGFjaCB0byBzaGFkb3cgcm9vdDonLCBzaGFkb3dSb290LCBhbXBkb2MpO1xuXG4gICAgLy8gSW5zdGFsbCBydW50aW1lIENTUy5cbiAgICBpbnN0YWxsU3R5bGVzRm9yRG9jKFxuICAgICAgYW1wZG9jLFxuICAgICAgQU1QLmNvbWJpbmVkQ3NzLFxuICAgICAgLyogY2FsbGJhY2sgKi8gbnVsbCxcbiAgICAgIC8qIG9wdF9pc1J1bnRpbWVDc3MgKi8gdHJ1ZVxuICAgICk7XG4gICAgLy8gSW5zdGFsIGRvYyBzZXJ2aWNlcy5cbiAgICBBTVAuaW5zdGFsbEFtcGRvY1NlcnZpY2VzKGFtcGRvYyk7XG5cbiAgICBjb25zdCB2aWV3ZXIgPSBTZXJ2aWNlcy52aWV3ZXJGb3JEb2MoYW1wZG9jKTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGRvY3VtZW50J3MgdmlzaWJpbGl0eSBzdGF0ZS5cbiAgICAgKiBAcGFyYW0geyFWaXNpYmlsaXR5U3RhdGV9IHN0YXRlXG4gICAgICovXG4gICAgYW1wWydzZXRWaXNpYmlsaXR5U3RhdGUnXSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgYW1wZG9jLm92ZXJyaWRlVmlzaWJpbGl0eVN0YXRlKHN0YXRlKTtcbiAgICB9O1xuXG4gICAgLy8gTWVzc2FnaW5nIHBpcGUuXG4gICAgLyoqXG4gICAgICogUG9zdHMgbWVzc2FnZSB0byB0aGUgYW1wZG9jLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBkYXRhXG4gICAgICogQHBhcmFtIHtib29sZWFufSB1bnVzZWRBd2FpdFJlc3BvbnNlXG4gICAgICogQHJldHVybiB7KCFQcm9taXNlPCo+fHVuZGVmaW5lZCl9XG4gICAgICovXG4gICAgYW1wWydwb3N0TWVzc2FnZSddID0gdmlld2VyLnJlY2VpdmVNZXNzYWdlLmJpbmQodmlld2VyKTtcblxuICAgIC8qKiBAdHlwZSB7ZnVuY3Rpb24oc3RyaW5nLCAqLCBib29sZWFuKTooIVByb21pc2U8Kj58dW5kZWZpbmVkKX0gKi9cbiAgICBsZXQgb25NZXNzYWdlO1xuXG4gICAgLyoqXG4gICAgICogUHJvdmlkZXMgYSBtZXNzYWdlIGRlbGl2ZXJ5IG1lY2hhbmlzbSBieSB3aGljaCBBTVAgZG9jdW1lbnQgY2FuIHNlbmRcbiAgICAgKiBtZXNzYWdlcyB0byB0aGUgdmlld2VyLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nLCAqLCBib29sZWFuKTooIVByb21pc2U8Kj58dW5kZWZpbmVkKX0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBhbXBbJ29uTWVzc2FnZSddID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICBvbk1lc3NhZ2UgPSBjYWxsYmFjaztcbiAgICB9O1xuXG4gICAgdmlld2VyLnNldE1lc3NhZ2VEZWxpdmVyZXIoKGV2ZW50VHlwZSwgZGF0YSwgYXdhaXRSZXNwb25zZSkgPT4ge1xuICAgICAgLy8gU3BlY2lhbCBtZXNzYWdlcy5cbiAgICAgIGlmIChldmVudFR5cGUgPT0gJ2Jyb2FkY2FzdCcpIHtcbiAgICAgICAgdGhpcy5icm9hZGNhc3RfKGRhdGEsIHNoYWRvd1Jvb3QpO1xuICAgICAgICByZXR1cm4gYXdhaXRSZXNwb25zZSA/IFByb21pc2UucmVzb2x2ZSgpIDogdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICAvLyBBbGwgb3RoZXIgbWVzc2FnZXMuXG4gICAgICBpZiAob25NZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBvbk1lc3NhZ2UoZXZlbnRUeXBlLCBkYXRhLCBhd2FpdFJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICB9LCBvcmlnaW4pO1xuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSBkb2N1bWVudCwgcmVzb2x2aW5nIHdoZW4gdmlzaWJpbGl0eSBjaGFuZ2VzIGFuZCBzZXJ2aWNlcyBoYXZlXG4gICAgICogYmVlbiBjbGVhbmQgdXAuIFRoZSBkb2N1bWVudCBjYW4gbm8gbG9uZ2VyIGJlIGFjdGl2YXRlZCBhZ2Fpbi5cbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGFtcFsnY2xvc2UnXSA9ICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmNsb3NlU2hhZG93Um9vdF8oc2hhZG93Um9vdCk7XG4gICAgfTtcblxuICAgIGlmIChnZXRNb2RlKCkuZGV2ZWxvcG1lbnQpIHtcbiAgICAgIGFtcC50b2dnbGVSdW50aW1lID0gdmlld2VyLnRvZ2dsZVJ1bnRpbWUuYmluZCh2aWV3ZXIpO1xuICAgICAgYW1wLnJlc291cmNlcyA9IFNlcnZpY2VzLnJlc291cmNlc0ZvckRvYyhhbXBkb2MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSBhbXAtYmluZCBnZXRTdGF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzdGF0ZSBvciBkZWVwIHN0YXRlXG4gICAgICogQHJldHVybiB7UHJvbWlzZTwqPn0gLSBSZXNvbHZlcyB0byBhIGNvcHkgb2YgdGhlIHZhbHVlIG9mIGEgc3RhdGVcbiAgICAgKi9cbiAgICBhbXBbJ2dldFN0YXRlJ10gPSAobmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIFNlcnZpY2VzLmJpbmRGb3JEb2NPck51bGwoc2hhZG93Um9vdCkudGhlbigoYmluZCkgPT4ge1xuICAgICAgICBpZiAoIWJpbmQpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ2FtcC1iaW5kIGlzIG5vdCBhdmFpbGFibGUgaW4gdGhpcyBkb2N1bWVudCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiaW5kLmdldFN0YXRlKG5hbWUpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSBhbXAtYmluZCBzZXRTdGF0ZVxuICAgICAqIEBwYXJhbSB7KCFKc29uT2JqZWN0fHN0cmluZyl9IHN0YXRlIC0gU3RhdGUgdG8gYmUgc2V0XG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gLSBSZXNvbHZlcyBhZnRlciBzdGF0ZSBhbmQgaGlzdG9yeSBoYXZlIGJlZW4gdXBkYXRlZFxuICAgICAqL1xuICAgIGFtcFsnc2V0U3RhdGUnXSA9IChzdGF0ZSkgPT4ge1xuICAgICAgcmV0dXJuIFNlcnZpY2VzLmJpbmRGb3JEb2NPck51bGwoc2hhZG93Um9vdCkudGhlbigoYmluZCkgPT4ge1xuICAgICAgICBpZiAoIWJpbmQpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ2FtcC1iaW5kIGlzIG5vdCBhdmFpbGFibGUgaW4gdGhpcyBkb2N1bWVudCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuIGJpbmQuc2V0U3RhdGVXaXRoRXhwcmVzc2lvbihcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAoc3RhdGUpLFxuICAgICAgICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHt9KVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qoc3RhdGUpIHx8IGlzQXJyYXkoc3RhdGUpKSB7XG4gICAgICAgICAgcmV0dXJuIGJpbmQuc2V0U3RhdGVXaXRoT2JqZWN0KC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovIChzdGF0ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnSW52YWxpZCBzdGF0ZScpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFN0YXJ0IGJ1aWxkaW5nIHRoZSBzaGFkb3cgZG9jIERPTS5cbiAgICBidWlsZGVyKGFtcCwgc2hhZG93Um9vdCwgYW1wZG9jKS50aGVuKCgpID0+IHtcbiAgICAgIC8vIERvY3VtZW50IGlzIHJlYWR5LlxuICAgICAgYW1wZG9jLnNldFJlYWR5KCk7XG4gICAgICBhbXBkb2Muc2lnbmFscygpLnNpZ25hbChDb21tb25TaWduYWxzLlJFTkRFUl9TVEFSVCk7XG4gICAgICBzZXRTdHlsZShob3N0RWxlbWVudCwgJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgIH0pO1xuXG4gICAgLy8gU3RvcmUgcmVmZXJlbmNlLlxuICAgIGlmICghdGhpcy5zaGFkb3dSb290c18uaW5jbHVkZXMoc2hhZG93Um9vdCkpIHtcbiAgICAgIHRoaXMuc2hhZG93Um9vdHNfLnB1c2goc2hhZG93Um9vdCk7XG4gICAgfVxuXG4gICAgZGV2KCkuZmluZShUQUcsICdTaGFkb3cgcm9vdCBpbml0aWFsaXphdGlvbiBpcyBkb25lOicsIHNoYWRvd1Jvb3QsIGFtcGRvYyk7XG4gICAgcmV0dXJuIGFtcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBmb3IgYGF0dGFjaFNoYWRvd0RvY2AgZnVuY3Rpb24uIEF0dGFjaGVzIHRoZSBzaGFkb3cgZG9jIGFuZFxuICAgKiBjb25maWd1cmVzIGFtcGRvYyBmb3IgaXQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGhvc3RFbGVtZW50XG4gICAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2NcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+PX0gb3B0X2luaXRQYXJhbXNcbiAgICogQHJldHVybiB7IS4vcnVudGltZS5TaGFkb3dEb2N9XG4gICAqL1xuICBhdHRhY2hTaGFkb3dEb2MoaG9zdEVsZW1lbnQsIGRvYywgdXJsLCBvcHRfaW5pdFBhcmFtcykge1xuICAgIHVzZXIoKS5hc3NlcnRTdHJpbmcodXJsKTtcbiAgICBkZXYoKS5maW5lKFRBRywgJ0F0dGFjaCBzaGFkb3cgZG9jOicsIGRvYyk7XG4gICAgLy8gVE9ETyhkdm95dGVua28sICM5NDkwKTogb25jZSBzdGFibGUsIHBvcnQgZnVsbCBkb2N1bWVudCBjYXNlIHRvIGVtdWxhdGVkXG4gICAgLy8gc3RyZWFtLlxuICAgIHJldHVybiB0aGlzLmF0dGFjaFNoYWRvd0RvY18oXG4gICAgICBob3N0RWxlbWVudCxcbiAgICAgIHVybCxcbiAgICAgIG9wdF9pbml0UGFyYW1zLFxuICAgICAgKGFtcCwgc2hhZG93Um9vdCwgYW1wZG9jKSA9PiB7XG4gICAgICAgIC8vIEluc3RhbGwgZXh0ZW5zaW9ucy5cbiAgICAgICAgdGhpcy5tZXJnZVNoYWRvd0hlYWRfKGFtcGRvYywgc2hhZG93Um9vdCwgZG9jKTtcblxuICAgICAgICAvLyBBcHBlbmQgYm9keS5cbiAgICAgICAgaWYgKGRvYy5ib2R5KSB7XG4gICAgICAgICAgY29uc3QgYm9keSA9IGltcG9ydFNoYWRvd0JvZHkoc2hhZG93Um9vdCwgZG9jLmJvZHksIC8qIGRlZXAgKi8gdHJ1ZSk7XG4gICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdhbXAtc2hhZG93Jyk7XG4gICAgICAgICAgYW1wZG9jLnNldEJvZHkoYm9keSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPKGR2b3l0ZW5rbyk6IGZpbmQgYSBiZXR0ZXIgYW5kIG1vcmUgc3RhYmxlIHdheSB0byBtYWtlIGNvbnRlbnRcbiAgICAgICAgLy8gdmlzaWJsZS4gRS5nLiBpbnRlZ3JhdGUgd2l0aCBkeW5hbWljIGNsYXNzZXMuIEluIHNoYWRvdyBjYXNlXG4gICAgICAgIC8vIHNwZWNpZmljYWxseSwgd2UgaGF2ZSB0byB3YWl0IGZvciBzdHViYmluZyB0byBjb21wbGV0ZSwgd2hpY2ggbWF5XG4gICAgICAgIC8vIHRha2UgYXdoaWxlIGR1ZSB0byBpbXBvcnROb2RlLlxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBhbXBkb2Muc2lnbmFscygpLnNpZ25hbChDb21tb25TaWduYWxzLlJFTkRFUl9TVEFSVCk7XG4gICAgICAgICAgc2V0U3R5bGUoaG9zdEVsZW1lbnQsICd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgfSwgNTApO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIGZvciBgYXR0YWNoU2hhZG93RG9jQXNTdHJlYW1gIGZ1bmN0aW9uLiBBdHRhY2hlcyB0aGUgc2hhZG93XG4gICAqIGRvYyBhbmQgY29uZmlndXJlcyBhbXBkb2MgZm9yIGl0LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBob3N0RWxlbWVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz49fSBvcHRfaW5pdFBhcmFtc1xuICAgKiBAcmV0dXJuIHshT2JqZWN0fVxuICAgKi9cbiAgYXR0YWNoU2hhZG93RG9jQXNTdHJlYW0oaG9zdEVsZW1lbnQsIHVybCwgb3B0X2luaXRQYXJhbXMpIHtcbiAgICB1c2VyKCkuYXNzZXJ0U3RyaW5nKHVybCk7XG4gICAgZGV2KCkuZmluZShUQUcsICdBdHRhY2ggc2hhZG93IGRvYyBhcyBzdHJlYW0nKTtcbiAgICByZXR1cm4gdGhpcy5hdHRhY2hTaGFkb3dEb2NfKFxuICAgICAgaG9zdEVsZW1lbnQsXG4gICAgICB1cmwsXG4gICAgICBvcHRfaW5pdFBhcmFtcyxcbiAgICAgIChhbXAsIHNoYWRvd1Jvb3QsIGFtcGRvYykgPT4ge1xuICAgICAgICAvLyBTdGFydCBzdHJlYW1pbmcuXG4gICAgICAgIGxldCByZW5kZXJTdGFydGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHdyaXRlciA9IGNyZWF0ZVNoYWRvd0RvbVdyaXRlcih0aGlzLndpbik7XG4gICAgICAgIGFtcFsnd3JpdGVyJ10gPSB3cml0ZXI7XG4gICAgICAgIHdyaXRlci5vbkJvZHkoKGRvYykgPT4ge1xuICAgICAgICAgIC8vIEluc3RhbGwgZXh0ZW5zaW9ucy5cbiAgICAgICAgICB0aGlzLm1lcmdlU2hhZG93SGVhZF8oYW1wZG9jLCBzaGFkb3dSb290LCBkb2MpO1xuXG4gICAgICAgICAgLy8gQXBwZW5kIHNoYWxsb3cgYm9keS5cbiAgICAgICAgICBjb25zdCBib2R5ID0gaW1wb3J0U2hhZG93Qm9keShcbiAgICAgICAgICAgIHNoYWRvd1Jvb3QsXG4gICAgICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KGRvYy5ib2R5KSxcbiAgICAgICAgICAgIC8qIGRlZXAgKi8gZmFsc2VcbiAgICAgICAgICApO1xuICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgnYW1wLXNoYWRvdycpO1xuICAgICAgICAgIGFtcGRvYy5zZXRCb2R5KGJvZHkpO1xuICAgICAgICAgIHJldHVybiBib2R5O1xuICAgICAgICB9KTtcbiAgICAgICAgd3JpdGVyLm9uQm9keUNodW5rKCgpID0+IHtcbiAgICAgICAgICAvLyBUT0RPKGR2b3l0ZW5rbyk6IGZpbmQgYSBiZXR0ZXIgYW5kIG1vcmUgc3RhYmxlIHdheSB0byBtYWtlXG4gICAgICAgICAgLy8gY29udGVudCB2aXNpYmxlLiBFLmcuIGludGVncmF0ZSB3aXRoIGR5bmFtaWMgY2xhc3Nlcy4gSW4gc2hhZG93XG4gICAgICAgICAgLy8gY2FzZSBzcGVjaWZpY2FsbHksIHdlIGhhdmUgdG8gd2FpdCBmb3Igc3R1YmJpbmcgdG8gY29tcGxldGUsXG4gICAgICAgICAgLy8gd2hpY2ggbWF5IHRha2UgYXdoaWxlIGR1ZSB0byBub2RlIGltcG9ydGluZy5cbiAgICAgICAgICBpZiAoIXJlbmRlclN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHJlbmRlclN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGFtcGRvYy5zaWduYWxzKCkuc2lnbmFsKENvbW1vblNpZ25hbHMuUkVOREVSX1NUQVJUKTtcbiAgICAgICAgICAgICAgc2V0U3R5bGUoaG9zdEVsZW1lbnQsICd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICB3cml0ZXIub25FbmQoKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgYW1wLndyaXRlciA9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIHRoZSBjb250ZW50cyBvZiB0aGUgc2hhZG93IGRvY3VtZW50J3MgaGVhZC5cbiAgICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEBwYXJhbSB7IVNoYWRvd1Jvb3R9IHNoYWRvd1Jvb3RcbiAgICogQHBhcmFtIHshRG9jdW1lbnR9IGRvY1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWVyZ2VTaGFkb3dIZWFkXyhhbXBkb2MsIHNoYWRvd1Jvb3QsIGRvYykge1xuICAgIGlmIChkb2MuaGVhZCkge1xuICAgICAgc2hhZG93Um9vdC5BTVAuaGVhZCA9IGRvYy5oZWFkO1xuICAgICAgY29uc3QgcGFyZW50TGlua3MgPSB7fTtcbiAgICAgIGNvbnN0IGxpbmtzID0gY2hpbGRFbGVtZW50c0J5VGFnKFxuICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMud2luLmRvY3VtZW50LmhlYWQpLFxuICAgICAgICAnbGluaydcbiAgICAgICk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGhyZWYgPSBsaW5rc1tpXS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgaWYgKGhyZWYpIHtcbiAgICAgICAgICBwYXJlbnRMaW5rc1tocmVmXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgbiA9IGRvYy5oZWFkLmZpcnN0RWxlbWVudENoaWxkOyBuOyBuID0gbi5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgY29uc3Qge3RhZ05hbWV9ID0gbjtcbiAgICAgICAgY29uc3QgbmFtZSA9IG4uZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICAgIGNvbnN0IHJlbCA9IG4uZ2V0QXR0cmlidXRlKCdyZWwnKTtcbiAgICAgICAgc3dpdGNoICh0YWdOYW1lKSB7XG4gICAgICAgICAgY2FzZSAnVElUTEUnOlxuICAgICAgICAgICAgc2hhZG93Um9vdC5BTVAudGl0bGUgPSBuLnRleHRDb250ZW50O1xuICAgICAgICAgICAgZGV2KCkuZmluZShUQUcsICctIHNldCB0aXRsZTogJywgc2hhZG93Um9vdC5BTVAudGl0bGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnTUVUQSc6XG4gICAgICAgICAgICBpZiAobi5oYXNBdHRyaWJ1dGUoJ2NoYXJzZXQnKSkge1xuICAgICAgICAgICAgICAvLyBJZ25vcmUuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUgPT0gJ3ZpZXdwb3J0Jykge1xuICAgICAgICAgICAgICAvLyBJZ25vcmUuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgICAgLy8gU3RvcmUgbWV0YSBuYW1lL2NvbnRlbnQgcGFpcnMuXG4gICAgICAgICAgICAgIGFtcGRvYy5zZXRNZXRhQnlOYW1lKG5hbWUsIG4uZ2V0QXR0cmlidXRlKCdjb250ZW50JykgfHwgJycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVE9ETyhkdm95dGVua28pOiBjb3B5IG90aGVyIG1ldGEgdGFncy5cbiAgICAgICAgICAgICAgZGV2KCkud2FybihUQUcsICdtZXRhIGlnbm9yZWQ6ICcsIG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnTElOSyc6XG4gICAgICAgICAgICAvKiogQGNvbnN0IHtzdHJpbmd9ICovXG4gICAgICAgICAgICBjb25zdCBocmVmID0gbi5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgIGlmIChyZWwgPT0gJ2Nhbm9uaWNhbCcpIHtcbiAgICAgICAgICAgICAgc2hhZG93Um9vdC5BTVAuY2Fub25pY2FsVXJsID0gaHJlZjtcbiAgICAgICAgICAgICAgZGV2KCkuZmluZShUQUcsICctIHNldCBjYW5vbmljYWw6ICcsIHNoYWRvd1Jvb3QuQU1QLmNhbm9uaWNhbFVybCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlbCA9PSAnc3R5bGVzaGVldCcpIHtcbiAgICAgICAgICAgICAgLy8gTXVzdCBiZSBhIGZvbnQgZGVmaW5pdGlvbjogbm8gb3RoZXIgc3R5bGVzaGVldHMgYXJlIGFsbG93ZWQuXG4gICAgICAgICAgICAgIGlmIChwYXJlbnRMaW5rc1tocmVmXSkge1xuICAgICAgICAgICAgICAgIGRldigpLmZpbmUoVEFHLCAnLSBzdHlsZXNoZWV0IGFscmVhZHkgaW5jbHVkZWQ6ICcsIGhyZWYpO1xuICAgICAgICAgICAgICAgIC8vIFRvIGFjY29tb2RhdGUgaWNvbiBmb250cyB3aG9zZSBzdHlsZXNoZWV0cyBpbmNsdWRlXG4gICAgICAgICAgICAgICAgLy8gdGhlIGNsYXNzIGRlZmluaXRpb25zIGluIGFkZGl0aW9uIHRvIHRoZSBmb250IGRlZmluaXRpb24sXG4gICAgICAgICAgICAgICAgLy8gd2UgcmUtaW1wb3J0IHRoZSBzdHlsZXNoZWV0IGludG8gdGhlIHNoYWRvdyBkb2N1bWVudC5cbiAgICAgICAgICAgICAgICAvLyBOb3RlOiA8bGluaz4gaW4gc2hhZG93IG1vZGUgaXMgbm90IHlldCBmdWxseSBzdXBwb3J0ZWQgb25cbiAgICAgICAgICAgICAgICAvLyBhbGwgYnJvd3NlcnMsIHNvIHdlIHVzZSA8c3R5bGU+QGltcG9ydCBcInVybFwiPC9zdHlsZT4gaW5zdGVhZFxuICAgICAgICAgICAgICAgIGluc3RhbGxTdHlsZXNGb3JEb2MoXG4gICAgICAgICAgICAgICAgICBhbXBkb2MsXG4gICAgICAgICAgICAgICAgICBgQGltcG9ydCBcIiR7aHJlZn1cImAsXG4gICAgICAgICAgICAgICAgICAvKiBjYWxsYmFjayAqLyBudWxsLFxuICAgICAgICAgICAgICAgICAgLyogaXNSdW50aW1lQ3NzICovIGZhbHNlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJlbnRMaW5rc1tocmVmXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLndpbi5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdyZWwnLCAnc3R5bGVzaGVldCcpO1xuICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpO1xuICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgICAgICAgIHRoaXMud2luLmRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICAgICAgICAgIGRldigpLmZpbmUoVEFHLCAnLSBpbXBvcnQgZm9udCB0byBwYXJlbnQ6ICcsIGhyZWYsIGVsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGV2KCkuZmluZShUQUcsICctIGlnbm9yZSBsaW5rIHJlbD0nLCByZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnU1RZTEUnOlxuICAgICAgICAgICAgaWYgKG4uaGFzQXR0cmlidXRlKCdhbXAtYm9pbGVycGxhdGUnKSkge1xuICAgICAgICAgICAgICAvLyBJZ25vcmUuXG4gICAgICAgICAgICAgIGRldigpLmZpbmUoVEFHLCAnLSBpZ25vcmUgYm9pbGVycGxhdGUgc3R5bGU6ICcsIG4pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuLmhhc0F0dHJpYnV0ZSgnYW1wLWN1c3RvbScpKSB7XG4gICAgICAgICAgICAgIGluc3RhbGxTdHlsZXNGb3JEb2MoXG4gICAgICAgICAgICAgICAgYW1wZG9jLFxuICAgICAgICAgICAgICAgIG4udGV4dENvbnRlbnQsXG4gICAgICAgICAgICAgICAgLyogY2FsbGJhY2sgKi8gbnVsbCxcbiAgICAgICAgICAgICAgICAvKiBpc1J1bnRpbWVDc3MgKi8gZmFsc2UsXG4gICAgICAgICAgICAgICAgJ2FtcC1jdXN0b20nXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGRldigpLmZpbmUoVEFHLCAnLSBpbXBvcnQgc3R5bGU6ICcsIG4pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuLmhhc0F0dHJpYnV0ZSgnYW1wLWtleWZyYW1lcycpKSB7XG4gICAgICAgICAgICAgIGluc3RhbGxTdHlsZXNGb3JEb2MoXG4gICAgICAgICAgICAgICAgYW1wZG9jLFxuICAgICAgICAgICAgICAgIG4udGV4dENvbnRlbnQsXG4gICAgICAgICAgICAgICAgLyogY2FsbGJhY2sgKi8gbnVsbCxcbiAgICAgICAgICAgICAgICAvKiBpc1J1bnRpbWVDc3MgKi8gZmFsc2UsXG4gICAgICAgICAgICAgICAgJ2FtcC1rZXlmcmFtZXMnXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGRldigpLmZpbmUoVEFHLCAnLSBpbXBvcnQgc3R5bGU6ICcsIG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnU0NSSVBUJzpcbiAgICAgICAgICAgIGlmIChuLmhhc0F0dHJpYnV0ZSgnc3JjJykpIHtcbiAgICAgICAgICAgICAgZGV2KCkuZmluZShUQUcsICctIHNyYyBzY3JpcHQ6ICcsIG4pO1xuICAgICAgICAgICAgICBjb25zdCBzcmMgPSBuLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICAgICAgICAgIGNvbnN0IHVybFBhcnRzID0gcGFyc2VFeHRlbnNpb25Vcmwoc3JjKTtcbiAgICAgICAgICAgICAgLy8gTm90ZTogU29tZSBleHRlbnNpb25zIGRvbid0IGhhdmUgW2N1c3RvbS1lbGVtZW50XSBvclxuICAgICAgICAgICAgICAvLyBbY3VzdG9tLXRlbXBsYXRlXSBlLmcuIGFtcC12aWV3ZXItaW50ZWdyYXRpb24uXG4gICAgICAgICAgICAgIGNvbnN0IGN1c3RvbUVsZW1lbnQgPSBuLmdldEF0dHJpYnV0ZSgnY3VzdG9tLWVsZW1lbnQnKTtcbiAgICAgICAgICAgICAgY29uc3QgY3VzdG9tVGVtcGxhdGUgPSBuLmdldEF0dHJpYnV0ZSgnY3VzdG9tLXRlbXBsYXRlJyk7XG4gICAgICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbklkID0gY3VzdG9tRWxlbWVudCB8fCBjdXN0b21UZW1wbGF0ZTtcbiAgICAgICAgICAgICAgaWYgKCF1cmxQYXJ0cykge1xuICAgICAgICAgICAgICAgIGRldigpLmZpbmUoVEFHLCAnLSBpZ25vcmUgcnVudGltZSBzY3JpcHQ6ICcsIHNyYyk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXh0ZW5zaW9uSWQpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGFuIGV4dGVuc2lvbi5cbiAgICAgICAgICAgICAgICB0aGlzLmV4dGVuc2lvbnNfLmluc3RhbGxFeHRlbnNpb25Gb3JEb2MoXG4gICAgICAgICAgICAgICAgICBhbXBkb2MsXG4gICAgICAgICAgICAgICAgICBleHRlbnNpb25JZCxcbiAgICAgICAgICAgICAgICAgIHVybFBhcnRzLmV4dGVuc2lvblZlcnNpb25cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFuLmhhc0F0dHJpYnV0ZSgnZGF0YS1hbXAtcmVwb3J0LXRlc3QnKSkge1xuICAgICAgICAgICAgICAgIHVzZXIoKS5lcnJvcihUQUcsICctIHVua25vd24gc2NyaXB0OiAnLCBuLCBzcmMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBOb24tc3JjIHZlcnNpb24gb2Ygc2NyaXB0LlxuICAgICAgICAgICAgICBjb25zdCB0eXBlID0gbi5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSB8fCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc7XG4gICAgICAgICAgICAgIGlmICh0eXBlLmluZGV4T2YoJ2phdmFzY3JpcHQnKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQodGhpcy53aW4uZG9jdW1lbnQuaW1wb3J0Tm9kZShuLCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgZGV2KCkuZmluZShUQUcsICctIG5vbi1zcmMgc2NyaXB0OiAnLCBuKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghbi5oYXNBdHRyaWJ1dGUoJ2FtcC1vbmVycm9yJykpIHtcbiAgICAgICAgICAgICAgICAvLyBEb24ndCBlcnJvciBvbiBhbXAtb25lcnJvciBzY3JpcHQgKGh0dHBzOi8vZ2l0aHViLmNvbS9hbXBwcm9qZWN0L2FtcGh0bWwvaXNzdWVzLzMxOTY2KVxuICAgICAgICAgICAgICAgIHVzZXIoKS5lcnJvcihUQUcsICctIHVuYWxsb3dlZCBpbmxpbmUgamF2YXNjcmlwdDogJywgbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ05PU0NSSVBUJzpcbiAgICAgICAgICAgIC8vIElnbm9yZS5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB1c2VyKCkuZXJyb3IoVEFHLCAnLSBVTktOT1dOIGhlYWQgZWxlbWVudDonLCBuKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGFtcGRvYy5zZXRFeHRlbnNpb25zS25vd24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IGRhdGFcbiAgICogQHBhcmFtIHshU2hhZG93Um9vdH0gc2VuZGVyXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBicm9hZGNhc3RfKGRhdGEsIHNlbmRlcikge1xuICAgIHRoaXMucHVyZ2VTaGFkb3dSb290c18oKTtcbiAgICB0aGlzLnNoYWRvd1Jvb3RzXy5mb3JFYWNoKChzaGFkb3dSb290KSA9PiB7XG4gICAgICBpZiAoc2hhZG93Um9vdCA9PSBzZW5kZXIpIHtcbiAgICAgICAgLy8gRG9uJ3QgYnJvYWRjYXN0IHRvIHRoZSBzZW5kZXIuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIEJyb2FkY2FzdCBtZXNzYWdlIGFzeW5jaHJvbm91c2x5LlxuICAgICAgY29uc3Qgdmlld2VyID0gU2VydmljZXMudmlld2VyRm9yRG9jKHNoYWRvd1Jvb3QuQU1QLmFtcGRvYyk7XG4gICAgICB0aGlzLnRpbWVyXy5kZWxheSgoKSA9PiB7XG4gICAgICAgIHZpZXdlci5yZWNlaXZlTWVzc2FnZShcbiAgICAgICAgICAnYnJvYWRjYXN0JyxcbiAgICAgICAgICAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoZGF0YSksXG4gICAgICAgICAgLyogYXdhaXRSZXNwb25zZSAqLyBmYWxzZVxuICAgICAgICApO1xuICAgICAgfSwgMCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshU2hhZG93Um9vdH0gc2hhZG93Um9vdFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2xvc2VTaGFkb3dSb290XyhzaGFkb3dSb290KSB7XG4gICAgdGhpcy5yZW1vdmVTaGFkb3dSb290XyhzaGFkb3dSb290KTtcbiAgICBjb25zdCBhbXAgPSBzaGFkb3dSb290LkFNUDtcbiAgICBkZWxldGUgc2hhZG93Um9vdC5BTVA7XG4gICAgY29uc3Qge2FtcGRvY30gPSBhbXA7XG4gICAgYW1wZG9jLm92ZXJyaWRlVmlzaWJpbGl0eVN0YXRlKFZpc2liaWxpdHlTdGF0ZS5JTkFDVElWRSk7XG4gICAgZGlzcG9zZVNlcnZpY2VzRm9yRG9jKGFtcGRvYyk7XG5cbiAgICAvLyBUaGVyZSBpcyBhIHJhY2UgYmV0d2VlbiB0aGUgdmlzaWJpbGl0eSBzdGF0ZSBjaGFuZ2UgZmluaXNoaW5nIGFuZFxuICAgIC8vIHJlc291cmNlcy5vbk5leHRQYXNzIGZpcmluZywgYnV0IHRoaXMgaXMgaW50ZW50aW9uYWwuIGNsb3NlU2hhZG93Um9vdF9cbiAgICAvLyB3YXMgdHJhZGl0aW9uYWxseSBpbnRyb2R1Y2VkIGFzIGEgc3luY2hyb25vdXMgbWV0aG9kLCBzbyBQV0FzIGluIHRoZSB3aWxkXG4gICAgLy8gZG8gbm90IGV4cGVjdCB0byBoYXZlIHRvIHdhaXQgZm9yIGEgcHJvbWlzZSB0byByZXNvbHZlIGJlZm9yZSB0aGUgc2hhZG93XG4gICAgLy8gaXMgZGVlbWVkICdjbG9zZWQnLiBNb3ZpbmcgLm92ZXJyaWRlVmlzaWJpbGl0eVN0YXRlKCkgYW5kXG4gICAgLy8gZGlzcG9zZVNlcnZpY2VzRm9yRG9jIGluc2lkZSBhIHByb21pc2UgY291bGQgYWR2ZXJzZWx5IGFmZmVjdCBzaXRlcyB0aGF0XG4gICAgLy8gZGVwZW5kIG9uIGF0IGxlYXN0IHRoZSBzeW5jaHJvbm91cyBwb3J0aW9ucyBvZiB0aG9zZSBtZXRob2RzIGNvbXBsZXRpbmdcbiAgICAvLyBiZWZvcmUgcHJvY2VlZGluZy4gVGhlIHByb21pc2UgcmFjZSBpcyBkZXNpZ25lZCB0byBiZSB2ZXJ5IHF1aWNrIHNvIHRoYXRcbiAgICAvLyBldmVuIGlmIHRoZSBwYXNzIGNhbGxiYWNrIGNvbXBsZXRlcyBiZWZvcmUgcmVzb3VyY2VzLm9uTmV4dFBhc3MgaXMgY2FsbGVkXG4gICAgLy8gYmVsb3csIHdlIG9ubHkgZGVsYXkgcHJvbWlzZSByZXNvbHV0aW9uIGJ5IGEgZmV3IG1zLlxuICAgIHJldHVybiB0aGlzLnRpbWVyX1xuICAgICAgLnRpbWVvdXRQcm9taXNlKFxuICAgICAgICAxNSwgLy8gRGVsYXkgZm9yIHF1ZXVlZCBwYXNzIGFmdGVyIHZpc2liaWxpdHkgY2hhbmdlIGlzIDEwbXNcbiAgICAgICAgbmV3IHRoaXMud2luLlByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICBnZXRTZXJ2aWNlUHJvbWlzZU9yTnVsbEZvckRvYyhhbXBkb2MsICdyZXNvdXJjZXMnKS50aGVuKFxuICAgICAgICAgICAgKHJlc291cmNlcykgPT4ge1xuICAgICAgICAgICAgICBpZiAocmVzb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzLm9uTmV4dFBhc3MocmVzb2x2ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSksXG4gICAgICAgICdUaW1lb3V0IHJlYWNoZWQgd2FpdGluZyBmb3IgdmlzaWJpbGl0eSBzdGF0ZSBjaGFuZ2UgY2FsbGJhY2snXG4gICAgICApXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIHVzZXIoKS5pbmZvKFRBRywgZXJyb3IpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshU2hhZG93Um9vdH0gc2hhZG93Um9vdFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlU2hhZG93Um9vdF8oc2hhZG93Um9vdCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zaGFkb3dSb290c18uaW5kZXhPZihzaGFkb3dSb290KTtcbiAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgIHRoaXMuc2hhZG93Um9vdHNfLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVNoYWRvd1Jvb3R9IHNoYWRvd1Jvb3RcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNsb3NlU2hhZG93Um9vdEFzeW5jXyhzaGFkb3dSb290KSB7XG4gICAgdGhpcy50aW1lcl8uZGVsYXkoKCkgPT4ge1xuICAgICAgdGhpcy5jbG9zZVNoYWRvd1Jvb3RfKHNoYWRvd1Jvb3QpO1xuICAgIH0sIDApO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHB1cmdlU2hhZG93Um9vdHNfKCkge1xuICAgIHRoaXMuc2hhZG93Um9vdHNfLmZvckVhY2goKHNoYWRvd1Jvb3QpID0+IHtcbiAgICAgIC8vIFRoZSBzaGFkb3cgcm9vdCBoYXMgYmVlbiBkaXNjb25uZWN0ZWQuIEZvcmNlIGl0IGNsb3NlZC5cbiAgICAgIGlmICghc2hhZG93Um9vdC5ob3N0IHx8ICFpc0Nvbm5lY3RlZE5vZGUoc2hhZG93Um9vdC5ob3N0KSkge1xuICAgICAgICB1c2VyKCkud2FybihUQUcsIFwiU2hhZG93IGRvYyB3YXNuJ3QgcHJldmlvdXNseSBjbG9zZWRcIik7XG4gICAgICAgIHRoaXMucmVtb3ZlU2hhZG93Um9vdF8oc2hhZG93Um9vdCk7XG4gICAgICAgIHRoaXMuY2xvc2VTaGFkb3dSb290QXN5bmNfKHNoYWRvd1Jvb3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/multidoc-manager.js