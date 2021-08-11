import { resolvedPromise as _resolvedPromise } from "./core/data-structures/promise";

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
import { urls } from "./config";
import { CommonSignals } from "./core/constants/common-signals";
import { VisibilityState } from "./core/constants/visibility-state";
import { Deferred } from "./core/data-structures/promise";
import { Signals } from "./core/data-structures/signals";
import { isDocumentReady } from "./core/document-ready";
import { escapeHtml } from "./core/dom";
import { layoutRectLtwh, moveLayoutRect } from "./core/dom/layout/rect";
import { px, resetStyles, setImportantStyles, setStyle, setStyles } from "./core/dom/style";
import { rethrowAsync } from "./core/error";
import { toWin } from "./core/window";
import { loadPromise } from "./event-helper";
import { FIE_EMBED_PROP } from "./iframe-helper";
import { whenContentIniLoad } from "./ini-load";
import { dev, devAssert, userAssert } from "./log";
import { getMode } from "./mode";
import { install as installAbortController } from "./polyfills/abort-controller";
import { install as installCustomElements } from "./polyfills/custom-elements";
import { install as installDocContains } from "./polyfills/document-contains";
import { install as installDOMTokenList } from "./polyfills/domtokenlist";
import { installForChildWin as installIntersectionObserver } from "./polyfills/intersection-observer";
import { installForChildWin as installResizeObserver } from "./polyfills/resize-observer";
import { Services } from "./service";
import { disposeServicesForEmbed, getTopWindow, setParentWindow } from "./service-helpers";
import { installAmpdocServicesForEmbed } from "./service/core-services";
import { installTimerInEmbedWindow } from "./service/timer-impl";
import { installStylesForDoc } from "./style-installer";
import { cssText as ampSharedCss } from "../build/ampshared.css";

/**
 * Parameters used to create the new "friendly iframe" embed.
 * - html: The complete content of an AMP embed, which is itself an AMP
 *   document. Can include whatever is normally allowed in an AMP document,
 *   except for AMP `<script>` declarations. Those should be passed as an
 *   array of `extensions`.
 * - extensions: An optional array of AMP extension IDs/versions used in
 *   this embed.
 * - fonts: An optional array of fonts used in this embed.
 *
 *
 * @typedef {{
 *   host: (?AmpElement|undefined),
 *   url: string,
 *   html: ?string,
 *   extensions: (?Array<{extensionId: string, extensionVersion: string}>|undefined),
 *   fonts: (?Array<string>|undefined),
 *   skipHtmlMerge: (boolean|undefined),
 * }}
 */
export var FriendlyIframeSpec;

/**
 * @type {boolean|undefined}
 * @visibleForTesting
 */
var srcdocSupported;

/**
 * @param {boolean|undefined} val
 * @visibleForTesting
 */
export function setSrcdocSupportedForTesting(val) {
  srcdocSupported = val;
}

/**
 * @return {function(*): !Promise<*>}
 */
function getDelayPromiseProducer() {
  return function (val) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        return resolve(val);
      }, 1);
    });
  };
}

/**
 * Returns `true` if the Friendly Iframes are supported.
 * @return {boolean}
 */
export function isSrcdocSupported() {
  if (srcdocSupported === undefined) {
    srcdocSupported = 'srcdoc' in HTMLIFrameElement.prototype;
  }

  return srcdocSupported;
}

/**
 * Get trusted urls enabled for polyfills.
 * @return {string}
 */
export function getFieSafeScriptSrcs() {
  var cdnBase = getMode().localDev ? 'http://localhost:8000/dist' : urls.cdn;
  return cdnBase + "/lts/ " + cdnBase + "/rtv/ " + cdnBase + "/sw/";
}

/**
 * @param {!Window} win
 * @param {!Array<{extensionId: string, extensionVersion: string}>} extensions
 */
export function preloadFriendlyIframeEmbedExtensions(win, extensions) {
  var extensionsService = Services.extensionsFor(win);
  // Load any extensions; do not wait on their promises as this
  // is just to prefetch.
  extensions.forEach(function (_ref) {
    var extensionId = _ref.extensionId,
        extensionVersion = _ref.extensionVersion;
    return extensionsService.preloadExtension(extensionId, extensionVersion);
  });
}

/**
 * Creates the requested "friendly iframe" embed. Returns the promise that
 * will be resolved as soon as the embed is available. The actual
 * initialization of the embed will start as soon as the `iframe` is added
 * to the DOM.
 * @param {!HTMLIFrameElement} iframe
 * @param {!Element} container
 * @param {!FriendlyIframeSpec} spec
 * @param {function(!Window, ?./service/ampdoc-impl.AmpDoc=)=} opt_preinstallCallback
 * @return {!Promise<!FriendlyIframeEmbed>}
 */
export function installFriendlyIframeEmbed(iframe, container, spec, opt_preinstallCallback // TODO(#22733): remove "window" argument.
) {
  /** @const {!Window} */
  var win = getTopWindow(toWin(iframe.ownerDocument.defaultView));

  /** @const {!./service/extensions-impl.Extensions} */
  var extensionsService = Services.extensionsFor(win);

  /** @const {!./service/ampdoc-impl.AmpDocService} */
  var ampdocService = Services.ampdocServiceFor(win);
  setStyle(iframe, 'visibility', 'hidden');
  iframe.setAttribute('referrerpolicy', 'unsafe-url');
  iframe.setAttribute('marginheight', '0');
  iframe.setAttribute('marginwidth', '0');
  var extensions = spec.extensions || [];
  // Pre-load extensions.
  preloadFriendlyIframeEmbedExtensions(win, extensions);
  var html = spec.skipHtmlMerge ? spec.html : mergeHtml(spec);

  // Receive the signal when iframe is ready: it's document is formed.
  iframe.onload = function () {
    // Chrome does not reflect the iframe readystate.
    iframe.readyState = 'complete';
  };

  var registerViolationListener = function registerViolationListener() {
    iframe.contentWindow.addEventListener('securitypolicyviolation', function (violationEvent) {
      dev().warn('FIE', 'security policy violation', violationEvent);
    });
  };

  var loadedPromise;

  if (isSrcdocSupported()) {
    iframe.srcdoc = html;
    loadedPromise = loadPromise(iframe);
    container.appendChild(iframe);
    registerViolationListener();
  } else {
    iframe.src = 'about:blank';
    container.appendChild(iframe);
    var childDoc = iframe.contentWindow.document;
    registerViolationListener();
    childDoc.open();
    childDoc.write(devAssert(html));
    // With document.write, `iframe.onload` arrives almost immediately, thus
    // we need to wait for child's `window.onload`.
    loadedPromise = loadPromise(iframe.contentWindow);
    childDoc.close();
  }

  // Wait for document ready signal.
  // This is complicated due to crbug.com/649201 on Chrome and a similar issue
  // on Safari where newly created document's `readyState` immediately equals
  // `complete`, even though the document itself is not yet available. There's
  // no other reliable signal for `readyState` in a child window and thus
  // we have to fallback to polling.
  var readyPromise;

  if (isIframeReady(iframe)) {
    readyPromise = _resolvedPromise();
  } else {
    readyPromise = new Promise(function (resolve) {
      /** @const {number} */
      var interval = win.setInterval(function () {
        if (isIframeReady(iframe)) {
          resolve();
          win.clearInterval(interval);
        }
      },
      /* milliseconds */
      5);
      // For safety, make sure we definitely stop polling when child doc is
      // loaded.
      loadedPromise.catch(function (error) {
        rethrowAsync(error);
      }).then(function () {
        resolve();
        win.clearInterval(interval);
      });
    });
  }

  return readyPromise.then(function () {
    var childWin =
    /** @type {!Window} */
    iframe.contentWindow;
    var signals = spec.host && spec.host.signals();
    var ampdoc = ampdocService.installFieDoc(spec.url, childWin, {
      signals: signals
    });
    var embed = new FriendlyIframeEmbed(iframe, spec, loadedPromise, ampdoc);
    iframe[FIE_EMBED_PROP] = embed;

    // Window might have been destroyed.
    if (!childWin.frameElement) {
      return null;
    }

    // Add extensions.
    return Installers.installExtensionsInEmbed(embed, extensionsService, ampdoc, extensions, opt_preinstallCallback).then(function () {
      if (!childWin.frameElement) {
        return null;
      }

      return embed;
    });
  });
}

/**
 * Returns `true` when iframe is ready.
 * @param {!HTMLIFrameElement} iframe
 * @return {boolean}
 */
function isIframeReady(iframe) {
  // This is complicated due to crbug.com/649201 on Chrome and a similar issue
  // on Safari where newly created document's `readyState` immediately equals
  // `complete`, even though the document itself is not yet available. There's
  // no other reliable signal for `readyState` in a child window and thus
  // the best way to check is to see the contents of the body.
  var childDoc = iframe.contentWindow && iframe.contentWindow.document;
  return !!(childDoc && isDocumentReady(childDoc) && childDoc.body && childDoc.body.firstChild);
}

/**
 * Merges base and fonts into html document.
 * @param {!FriendlyIframeSpec} spec
 * @return {string}
 */
function mergeHtml(spec) {
  var originalHtml = spec.html;
  var originalHtmlUp = originalHtml.toUpperCase();
  // Find the insertion point.
  var ip = originalHtmlUp.indexOf('<HEAD');

  if (ip != -1) {
    ip = originalHtmlUp.indexOf('>', ip + 1) + 1;
  }

  if (ip == -1) {
    ip = originalHtmlUp.indexOf('<BODY');
  }

  if (ip == -1) {
    ip = originalHtmlUp.indexOf('<HTML');

    if (ip != -1) {
      ip = originalHtmlUp.indexOf('>', ip + 1) + 1;
    }
  }

  var result = [];

  // Preambule.
  if (ip > 0) {
    result.push(originalHtml.substring(0, ip));
  }

  // Add <BASE> tag.
  result.push("<base href=\"" + escapeHtml(spec.url) + "\">");

  // Load fonts.
  if (spec.fonts) {
    spec.fonts.forEach(function (font) {
      result.push("<link href=\"" + escapeHtml(font) + "\" rel=\"stylesheet\" type=\"text/css\">");
    });
  }

  var cspScriptSrc = getFieSafeScriptSrcs();
  // Load CSP
  result.push('<meta http-equiv=Content-Security-Policy ' + ("content=\"script-src " + cspScriptSrc + ";object-src 'none';child-src 'none'\">"));

  // Postambule.
  if (ip > 0) {
    result.push(originalHtml.substring(ip));
  } else {
    result.push(originalHtml);
  }

  return result.join('');
}

/**
 * Exposes `mergeHtml` for testing purposes.
 * @param {!FriendlyIframeSpec} spec
 * @return {string}
 * @visibleForTesting
 */
export function mergeHtmlForTesting(spec) {
  return mergeHtml(spec);
}

/**
 * A "friendly iframe" embed. This is the iframe that's fully accessible to
 * the AMP runtime. It's similar to Shadow DOM in many respects, but it also
 * provides iframe/viewport measurements and enables the use of `vh`, `vw` and
 * `@media` CSS.
 *
 * The friendly iframe is managed by the top-level AMP Runtime. When it's
 * destroyed, the `destroy` method must be called to free up the shared
 * resources.
 *
 * @visibleForTesting
 */
export var FriendlyIframeEmbed = /*#__PURE__*/function () {
  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {!FriendlyIframeSpec} spec
   * @param {!Promise} loadedPromise
   * @param {?./service/ampdoc-impl.AmpDocFie} ampdoc
   */
  function FriendlyIframeEmbed(iframe, spec, loadedPromise, ampdoc) {
    var _this = this;

    _classCallCheck(this, FriendlyIframeEmbed);

    /** @const {!HTMLIFrameElement} */
    this.iframe = iframe;

    /** @const {!Window} */
    this.win =
    /** @type {!Window} */
    iframe.contentWindow;

    /** @const {?./service/ampdoc-impl.AmpDocFie} */
    this.ampdoc = ampdoc;

    /** @const {!FriendlyIframeSpec} */
    this.spec = spec;

    /** @const {?AmpElement} */
    this.host = spec.host || null;

    /** @const @private {time} */
    this.startTime_ = Date.now();

    /** @private @const */
    this.signals_ = this.ampdoc ? this.ampdoc.signals() : this.host ? this.host.signals() : new Signals();

    /** @private @const {!Deferred} */
    this.renderComplete_ = new Deferred();

    /** @private @const {!Promise} */
    this.winLoadedPromise_ = Promise.all([loadedPromise, this.whenRenderStarted()]);

    if (this.ampdoc) {
      this.whenRenderComplete().then(function () {
        return _this.ampdoc.setReady();
      });
    }

    this.win.addEventListener('resize', function () {
      return _this.handleResize_();
    });
  }

  /**
   * Ensures that all resources from this iframe have been released.
   */
  _createClass(FriendlyIframeEmbed, [{
    key: "destroy",
    value: function destroy() {
      disposeServicesForEmbed(this.win);

      if (this.ampdoc) {
        this.ampdoc.dispose();
      }
    }
    /**
     * @return {time}
     */

  }, {
    key: "getStartTime",
    value: function getStartTime() {
      return this.startTime_;
    }
    /**
     * Returns the base URL for the embedded document.
     * @return {string}
     */

  }, {
    key: "getUrl",
    value: function getUrl() {
      return this.spec.url;
    }
    /** @return {!Signals} */

  }, {
    key: "signals",
    value: function signals() {
      return this.signals_;
    }
    /**
     * Returns a promise that will resolve when the embed document is ready.
     * Notice that this signal coincides with the embed's `render-start`.
     * @return {!Promise}
     */

  }, {
    key: "whenRenderStarted",
    value: function whenRenderStarted() {
      return this.signals_.whenSignal(CommonSignals.RENDER_START);
    }
    /**
     * Returns a promise that will resolve when the child window's `onload` event
     * has been emitted. In friendly iframes this typically only includes font
     * loading.
     * @return {!Promise}
     */

  }, {
    key: "whenWindowLoaded",
    value: function whenWindowLoaded() {
      return this.winLoadedPromise_;
    }
    /**
     * Returns a promise that will resolve when the initial load  of the embed's
     * content has been completed.
     * @return {!Promise}
     */

  }, {
    key: "whenIniLoaded",
    value: function whenIniLoaded() {
      return this.signals_.whenSignal(CommonSignals.INI_LOAD);
    }
    /**
     * Returns a promise that will resolve when all elements have been
     * transferred into live embed DOM.
     * @return {!Promise}
     */

  }, {
    key: "whenRenderComplete",
    value: function whenRenderComplete() {
      return this.renderComplete_.promise;
    }
    /**
     * Signal that indicates that all DOM elements have been tranferred to live
     * embed DOM.
     */

  }, {
    key: "renderCompleted",
    value: function renderCompleted() {
      this.renderComplete_.resolve();
    }
    /**
     * Pause the embed.
     */

  }, {
    key: "pause",
    value: function pause() {
      if (this.ampdoc) {
        this.ampdoc.overrideVisibilityState(VisibilityState.PAUSED);
      }
    }
    /**
     * Resume the embed.
     */

  }, {
    key: "resume",
    value: function resume() {
      if (this.ampdoc) {
        this.ampdoc.overrideVisibilityState(VisibilityState.VISIBLE);
      }
    }
    /**
     * @private
     * @restricted
     */

  }, {
    key: "startRender_",
    value: function startRender_() {
      var _this2 = this;

      if (this.host) {
        this.host.renderStarted();
      } else {
        this.signals_.signal(CommonSignals.RENDER_START);
      }

      // TODO(ccordry): remove when no-signing launched.
      if (!this.spec.skipHtmlMerge) {
        // When not streaming renderStart signal is good enough.
        this.renderComplete_.resolve();
      }

      // Common signal RENDER_START indicates time to toggle visibility
      setStyle(this.iframe, 'visibility', '');

      if (this.win.document && this.win.document.body) {
        this.win.document.documentElement.classList.add('i-amphtml-fie');
        setStyles(dev().assertElement(this.win.document.body), {
          opacity: 1,
          visibility: 'visible',
          animation: 'none'
        });
      }

      // Initial load signal signal.
      var rect;

      if (this.host) {
        rect = this.host.getLayoutBox();
      } else {
        rect = layoutRectLtwh(0, 0, this.win.
        /*OK*/
        innerWidth, this.win.
        /*OK*/
        innerHeight);
      }

      Promise.all([this.whenRenderComplete(), whenContentIniLoad(this.ampdoc, this.win, rect)]).then(function () {
        _this2.signals_.signal(CommonSignals.INI_LOAD);
      });
    }
    /**
     * @return {!HTMLBodyElement}
     * @visibleForTesting
     */

  }, {
    key: "getBodyElement",
    value: function getBodyElement() {
      return (
        /** @type {!HTMLBodyElement} */
        (this.iframe.contentDocument || this.iframe.contentWindow.document).body
      );
    }
    /**
     * Force remeasure inside FIE doc when iframe is resized.
     * @private
     */

  }, {
    key: "handleResize_",
    value: function handleResize_() {
      this.getMutator_().mutateElement(this.win.document.documentElement, function () {} // NOOP.
      );
    }
    /**
     * @return {!./service/mutator-interface.MutatorInterface}
     * @private
     */

  }, {
    key: "getMutator_",
    value: function getMutator_() {
      return Services.mutatorForDoc(this.iframe);
    }
    /**
     * Runs a measure/mutate cycle ensuring that the iframe change is propagated
     * to the resource manager.
     * @param {{measure: (function()|undefined), mutate: function()}} task
     * @return {!Promise}
     * @private
     */

  }, {
    key: "measureMutate_",
    value: function measureMutate_(task) {
      return this.getMutator_().measureMutateElement(this.iframe, task.measure || null, task.mutate);
    }
    /**
     * @return {!Promise}
     */

  }, {
    key: "enterFullOverlayMode",
    value: function enterFullOverlayMode() {
      var _this3 = this;

      var ampAdParent = dev().assertElement(this.iframe.parentNode);
      // Security assertion. Otherwise any 3p frame could request lighbox mode.
      userAssert(ampAdParent.tagName.toLowerCase() == 'amp-ad', 'Only <amp-ad> is allowed to enter lightbox mode.');
      var bodyStyle;
      return this.measureMutate_({
        measure: function measure() {
          var rect = _this3.host ? _this3.host.getLayoutBox() : _this3.iframe.
          /*OK*/
          getBoundingClientRect();
          // Offset by scroll top as iframe will be position: fixed.
          var dy = -Services.viewportForDoc(_this3.iframe).getScrollTop();

          var _moveLayoutRect = moveLayoutRect(rect,
          /* dx */
          0, dy),
              height = _moveLayoutRect.height,
              left = _moveLayoutRect.left,
              top = _moveLayoutRect.top,
              width = _moveLayoutRect.width;

          // Offset body by header height to prevent visual jump.
          bodyStyle = {
            top: px(top),
            left: px(left),
            width: px(width),
            height: px(height)
          };
        },
        mutate: function mutate() {
          // !important to prevent abuse e.g. box @ ltwh = 0, 0, 0, 0
          setImportantStyles(_this3.iframe, {
            'position': 'fixed',
            'left': 0,
            'right': 0,
            'bottom': 0,
            'width': '100vw',
            'top': 0,
            'height': '100vh'
          });
          // We need to override runtime-level !important rules
          setImportantStyles(_this3.getBodyElement(), {
            'background': 'transparent',
            'position': 'absolute',
            'bottom': 'auto',
            'right': 'auto',
            // Read during vsync measure phase.
            'top': bodyStyle.top,
            'left': bodyStyle.left,
            'width': bodyStyle.width,
            'height': bodyStyle.height
          });
        }
      });
    }
    /**
     * @return {!Promise}
     */

  }, {
    key: "leaveFullOverlayMode",
    value: function leaveFullOverlayMode() {
      var _this4 = this;

      return this.measureMutate_({
        mutate: function mutate() {
          resetStyles(_this4.iframe, ['position', 'left', 'right', 'top', 'bottom', 'width', 'height']);
          // we're not resetting background here as we need to set it to
          // transparent permanently.
          resetStyles(_this4.getBodyElement(), ['position', 'top', 'left', 'width', 'height', 'bottom', 'right']);
        }
      });
    }
  }]);

  return FriendlyIframeEmbed;
}();

/**
 * Install polyfills in the child window (friendly iframe).
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
function installPolyfillsInChildWindow(parentWin, childWin) {
  if (!false) {
    installDocContains(childWin);
    installDOMTokenList(childWin);
  }

  // The anonymous class parameter allows us to detect native classes vs
  // transpiled classes.
  if (!false) {
    installCustomElements(childWin, /*#__PURE__*/function () {
      function _class() {
        _classCallCheck(this, _class);
      }

      return _class;
    }());
    installIntersectionObserver(parentWin, childWin);
    installResizeObserver(parentWin, childWin);
    installAbortController(childWin);
  }
}

/**
 * Static installers that can be easily stubbed for tests.
 * @visibleForTesting
 */
export var Installers = /*#__PURE__*/function () {
  function Installers() {
    _classCallCheck(this, Installers);
  }

  _createClass(Installers, null, [{
    key: "installExtensionsInEmbed",
    value:
    /**
     * Install extensions in the child window (friendly iframe). The pre-install
     * callback, if specified, is executed after polyfills have been configured
     * but before the first extension is installed.
     * @param {!FriendlyIframeEmbed} embed
     * @param {!./service/extensions-impl.Extensions} extensionsService
     * @param {!./service/ampdoc-impl.AmpDocFie} ampdoc
     * @param {!Array<{extensionId: string, extensionVersion: string}>} extensions
     * @param {function(!Window, ?./service/ampdoc-impl.AmpDoc=)|undefined} preinstallCallback
     * @param {function(!Promise)=} opt_installComplete
     * @return {!Promise}
     */
    function installExtensionsInEmbed(embed, extensionsService, ampdoc, extensions, preinstallCallback, opt_installComplete) {
      var childWin = ampdoc.win;
      var parentWin = toWin(childWin.frameElement.ownerDocument.defaultView);
      setParentWindow(childWin, parentWin);
      var getDelayPromise = getDelayPromiseProducer();
      return getDelayPromise(undefined).then(function () {
        // Install necessary polyfills.
        installPolyfillsInChildWindow(parentWin, childWin);
      }).then(getDelayPromise).then(function () {
        if (false) {
          // TODO: This is combined (ampdoc + shared), not just shared
          // const css = parentWin.document.querySelector('style[amp-runtime]')
          // .textContent;
          installStylesForDoc(ampdoc, ampSharedCss,
          /* callback */
          null,
          /* opt_isRuntimeCss */
          true,
          /* opt_ext */
          'amp-runtime');
        } else {
          // Install runtime styles.
          installStylesForDoc(ampdoc, ampSharedCss,
          /* callback */
          null,
          /* opt_isRuntimeCss */
          true,
          /* opt_ext */
          'amp-runtime');
        }
      }).then(getDelayPromise).then(function () {
        if (!childWin.frameElement) {
          return;
        }

        // Run pre-install callback.
        if (preinstallCallback) {
          preinstallCallback(ampdoc.win, ampdoc);
        }
      }).then(getDelayPromise).then(function () {
        if (!childWin.frameElement) {
          return;
        }

        // Install embeddable standard services.
        Installers.installStandardServicesInEmbed(ampdoc);
      }).then(getDelayPromise).then(function () {
        if (!childWin.frameElement) {
          return;
        }

        extensionsService.preinstallEmbed(ampdoc, extensions);
      }).then(getDelayPromise).then(function () {
        if (!childWin.frameElement) {
          return;
        }

        // Ready to be shown.
        embed.startRender_();
      }).then(getDelayPromise).then(function () {
        if (!childWin.frameElement) {
          return;
        }

        // Intentionally do not wait for the full installation to complete.
        // It's enough of initialization done to return the embed.
        var promise = extensionsService.installExtensionsInDoc(ampdoc, extensions);
        ampdoc.setExtensionsKnown();

        if (opt_installComplete) {
          opt_installComplete(promise);
        }
      });
    }
    /**
     * Adopt predefined core services for the embedded ampdoc (friendly iframe).
     * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
     */

  }, {
    key: "installStandardServicesInEmbed",
    value: function installStandardServicesInEmbed(ampdoc) {
      installTimerInEmbedWindow(ampdoc.win);
      installAmpdocServicesForEmbed(ampdoc);
    }
  }]);

  return Installers;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZyaWVuZGx5LWlmcmFtZS1lbWJlZC5qcyJdLCJuYW1lcyI6WyJ1cmxzIiwiQ29tbW9uU2lnbmFscyIsIlZpc2liaWxpdHlTdGF0ZSIsIkRlZmVycmVkIiwiU2lnbmFscyIsImlzRG9jdW1lbnRSZWFkeSIsImVzY2FwZUh0bWwiLCJsYXlvdXRSZWN0THR3aCIsIm1vdmVMYXlvdXRSZWN0IiwicHgiLCJyZXNldFN0eWxlcyIsInNldEltcG9ydGFudFN0eWxlcyIsInNldFN0eWxlIiwic2V0U3R5bGVzIiwicmV0aHJvd0FzeW5jIiwidG9XaW4iLCJsb2FkUHJvbWlzZSIsIkZJRV9FTUJFRF9QUk9QIiwid2hlbkNvbnRlbnRJbmlMb2FkIiwiZGV2IiwiZGV2QXNzZXJ0IiwidXNlckFzc2VydCIsImdldE1vZGUiLCJpbnN0YWxsIiwiaW5zdGFsbEFib3J0Q29udHJvbGxlciIsImluc3RhbGxDdXN0b21FbGVtZW50cyIsImluc3RhbGxEb2NDb250YWlucyIsImluc3RhbGxET01Ub2tlbkxpc3QiLCJpbnN0YWxsRm9yQ2hpbGRXaW4iLCJpbnN0YWxsSW50ZXJzZWN0aW9uT2JzZXJ2ZXIiLCJpbnN0YWxsUmVzaXplT2JzZXJ2ZXIiLCJTZXJ2aWNlcyIsImRpc3Bvc2VTZXJ2aWNlc0ZvckVtYmVkIiwiZ2V0VG9wV2luZG93Iiwic2V0UGFyZW50V2luZG93IiwiaW5zdGFsbEFtcGRvY1NlcnZpY2VzRm9yRW1iZWQiLCJpbnN0YWxsVGltZXJJbkVtYmVkV2luZG93IiwiaW5zdGFsbFN0eWxlc0ZvckRvYyIsImNzc1RleHQiLCJhbXBTaGFyZWRDc3MiLCJGcmllbmRseUlmcmFtZVNwZWMiLCJzcmNkb2NTdXBwb3J0ZWQiLCJzZXRTcmNkb2NTdXBwb3J0ZWRGb3JUZXN0aW5nIiwidmFsIiwiZ2V0RGVsYXlQcm9taXNlUHJvZHVjZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJpc1NyY2RvY1N1cHBvcnRlZCIsInVuZGVmaW5lZCIsIkhUTUxJRnJhbWVFbGVtZW50IiwicHJvdG90eXBlIiwiZ2V0RmllU2FmZVNjcmlwdFNyY3MiLCJjZG5CYXNlIiwibG9jYWxEZXYiLCJjZG4iLCJwcmVsb2FkRnJpZW5kbHlJZnJhbWVFbWJlZEV4dGVuc2lvbnMiLCJ3aW4iLCJleHRlbnNpb25zIiwiZXh0ZW5zaW9uc1NlcnZpY2UiLCJleHRlbnNpb25zRm9yIiwiZm9yRWFjaCIsImV4dGVuc2lvbklkIiwiZXh0ZW5zaW9uVmVyc2lvbiIsInByZWxvYWRFeHRlbnNpb24iLCJpbnN0YWxsRnJpZW5kbHlJZnJhbWVFbWJlZCIsImlmcmFtZSIsImNvbnRhaW5lciIsInNwZWMiLCJvcHRfcHJlaW5zdGFsbENhbGxiYWNrIiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3IiwiYW1wZG9jU2VydmljZSIsImFtcGRvY1NlcnZpY2VGb3IiLCJzZXRBdHRyaWJ1dGUiLCJodG1sIiwic2tpcEh0bWxNZXJnZSIsIm1lcmdlSHRtbCIsIm9ubG9hZCIsInJlYWR5U3RhdGUiLCJyZWdpc3RlclZpb2xhdGlvbkxpc3RlbmVyIiwiY29udGVudFdpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJ2aW9sYXRpb25FdmVudCIsIndhcm4iLCJsb2FkZWRQcm9taXNlIiwic3JjZG9jIiwiYXBwZW5kQ2hpbGQiLCJzcmMiLCJjaGlsZERvYyIsImRvY3VtZW50Iiwib3BlbiIsIndyaXRlIiwiY2xvc2UiLCJyZWFkeVByb21pc2UiLCJpc0lmcmFtZVJlYWR5IiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJjYXRjaCIsImVycm9yIiwidGhlbiIsImNoaWxkV2luIiwic2lnbmFscyIsImhvc3QiLCJhbXBkb2MiLCJpbnN0YWxsRmllRG9jIiwidXJsIiwiZW1iZWQiLCJGcmllbmRseUlmcmFtZUVtYmVkIiwiZnJhbWVFbGVtZW50IiwiSW5zdGFsbGVycyIsImluc3RhbGxFeHRlbnNpb25zSW5FbWJlZCIsImJvZHkiLCJmaXJzdENoaWxkIiwib3JpZ2luYWxIdG1sIiwib3JpZ2luYWxIdG1sVXAiLCJ0b1VwcGVyQ2FzZSIsImlwIiwiaW5kZXhPZiIsInJlc3VsdCIsInB1c2giLCJzdWJzdHJpbmciLCJmb250cyIsImZvbnQiLCJjc3BTY3JpcHRTcmMiLCJqb2luIiwibWVyZ2VIdG1sRm9yVGVzdGluZyIsInN0YXJ0VGltZV8iLCJEYXRlIiwibm93Iiwic2lnbmFsc18iLCJyZW5kZXJDb21wbGV0ZV8iLCJ3aW5Mb2FkZWRQcm9taXNlXyIsImFsbCIsIndoZW5SZW5kZXJTdGFydGVkIiwid2hlblJlbmRlckNvbXBsZXRlIiwic2V0UmVhZHkiLCJoYW5kbGVSZXNpemVfIiwiZGlzcG9zZSIsIndoZW5TaWduYWwiLCJSRU5ERVJfU1RBUlQiLCJJTklfTE9BRCIsInByb21pc2UiLCJvdmVycmlkZVZpc2liaWxpdHlTdGF0ZSIsIlBBVVNFRCIsIlZJU0lCTEUiLCJyZW5kZXJTdGFydGVkIiwic2lnbmFsIiwiZG9jdW1lbnRFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiYXNzZXJ0RWxlbWVudCIsIm9wYWNpdHkiLCJ2aXNpYmlsaXR5IiwiYW5pbWF0aW9uIiwicmVjdCIsImdldExheW91dEJveCIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsImNvbnRlbnREb2N1bWVudCIsImdldE11dGF0b3JfIiwibXV0YXRlRWxlbWVudCIsIm11dGF0b3JGb3JEb2MiLCJ0YXNrIiwibWVhc3VyZU11dGF0ZUVsZW1lbnQiLCJtZWFzdXJlIiwibXV0YXRlIiwiYW1wQWRQYXJlbnQiLCJwYXJlbnROb2RlIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiYm9keVN0eWxlIiwibWVhc3VyZU11dGF0ZV8iLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJkeSIsInZpZXdwb3J0Rm9yRG9jIiwiZ2V0U2Nyb2xsVG9wIiwiaGVpZ2h0IiwibGVmdCIsInRvcCIsIndpZHRoIiwiZ2V0Qm9keUVsZW1lbnQiLCJpbnN0YWxsUG9seWZpbGxzSW5DaGlsZFdpbmRvdyIsInBhcmVudFdpbiIsInByZWluc3RhbGxDYWxsYmFjayIsIm9wdF9pbnN0YWxsQ29tcGxldGUiLCJnZXREZWxheVByb21pc2UiLCJpbnN0YWxsU3RhbmRhcmRTZXJ2aWNlc0luRW1iZWQiLCJwcmVpbnN0YWxsRW1iZWQiLCJzdGFydFJlbmRlcl8iLCJpbnN0YWxsRXh0ZW5zaW9uc0luRG9jIiwic2V0RXh0ZW5zaW9uc0tub3duIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLElBQVI7QUFDQSxTQUFRQyxhQUFSO0FBQ0EsU0FBUUMsZUFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsZUFBUjtBQUNBLFNBQVFDLFVBQVI7QUFDQSxTQUFRQyxjQUFSLEVBQXdCQyxjQUF4QjtBQUNBLFNBQ0VDLEVBREYsRUFFRUMsV0FGRixFQUdFQyxrQkFIRixFQUlFQyxRQUpGLEVBS0VDLFNBTEY7QUFPQSxTQUFRQyxZQUFSO0FBQ0EsU0FBUUMsS0FBUjtBQUNBLFNBQVFDLFdBQVI7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWIsRUFBd0JDLFVBQXhCO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLE9BQU8sSUFBSUMsc0JBQW5CO0FBQ0EsU0FBUUQsT0FBTyxJQUFJRSxxQkFBbkI7QUFDQSxTQUFRRixPQUFPLElBQUlHLGtCQUFuQjtBQUNBLFNBQVFILE9BQU8sSUFBSUksbUJBQW5CO0FBQ0EsU0FBUUMsa0JBQWtCLElBQUlDLDJCQUE5QjtBQUNBLFNBQVFELGtCQUFrQixJQUFJRSxxQkFBOUI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FDRUMsdUJBREYsRUFFRUMsWUFGRixFQUdFQyxlQUhGO0FBS0EsU0FBUUMsNkJBQVI7QUFDQSxTQUFRQyx5QkFBUjtBQUNBLFNBQVFDLG1CQUFSO0FBRUEsU0FBUUMsT0FBTyxJQUFJ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QUEsaUJBQWlCLENBQUNrSSxlQUFsQixDQUFrQ3BGLE1BQWxDLEVBQTBDL0MsVUFBMUM7QUFDRCxPQXJESSxFQXNESjJDLElBdERJLENBc0RDc0YsZUF0REQsRUF1REp0RixJQXZESSxDQXVEQyxZQUFNO0FBQ1YsWUFBSSxDQUFDQyxRQUFRLENBQUNRLFlBQWQsRUFBNEI7QUFDMUI7QUFDRDs7QUFDRDtBQUNBRixRQUFBQSxLQUFLLENBQUNrRixZQUFOO0FBQ0QsT0E3REksRUE4REp6RixJQTlESSxDQThEQ3NGLGVBOURELEVBK0RKdEYsSUEvREksQ0ErREMsWUFBTTtBQUNWLFlBQUksQ0FBQ0MsUUFBUSxDQUFDUSxZQUFkLEVBQTRCO0FBQzFCO0FBQ0Q7O0FBQ0Q7QUFDQTtBQUNBLFlBQU1pQyxPQUFPLEdBQUdwRixpQkFBaUIsQ0FBQ29JLHNCQUFsQixDQUNkdEYsTUFEYyxFQUVkL0MsVUFGYyxDQUFoQjtBQUlBK0MsUUFBQUEsTUFBTSxDQUFDdUYsa0JBQVA7O0FBQ0EsWUFBSU4sbUJBQUosRUFBeUI7QUFDdkJBLFVBQUFBLG1CQUFtQixDQUFDM0MsT0FBRCxDQUFuQjtBQUNEO0FBQ0YsT0E3RUksQ0FBUDtBQThFRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTdHQTtBQUFBO0FBQUEsV0E4R0Usd0NBQXNDdEMsTUFBdEMsRUFBOEM7QUFDNUNyRSxNQUFBQSx5QkFBeUIsQ0FBQ3FFLE1BQU0sQ0FBQ2hELEdBQVIsQ0FBekI7QUFDQXRCLE1BQUFBLDZCQUE2QixDQUFDc0UsTUFBRCxDQUE3QjtBQUNEO0FBakhIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHt1cmxzfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0NvbW1vblNpZ25hbHN9IGZyb20gJy4vY29yZS9jb25zdGFudHMvY29tbW9uLXNpZ25hbHMnO1xuaW1wb3J0IHtWaXNpYmlsaXR5U3RhdGV9IGZyb20gJy4vY29yZS9jb25zdGFudHMvdmlzaWJpbGl0eS1zdGF0ZSc7XG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcuL2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuaW1wb3J0IHtTaWduYWxzfSBmcm9tICcuL2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3NpZ25hbHMnO1xuaW1wb3J0IHtpc0RvY3VtZW50UmVhZHl9IGZyb20gJy4vY29yZS9kb2N1bWVudC1yZWFkeSc7XG5pbXBvcnQge2VzY2FwZUh0bWx9IGZyb20gJy4vY29yZS9kb20nO1xuaW1wb3J0IHtsYXlvdXRSZWN0THR3aCwgbW92ZUxheW91dFJlY3R9IGZyb20gJy4vY29yZS9kb20vbGF5b3V0L3JlY3QnO1xuaW1wb3J0IHtcbiAgcHgsXG4gIHJlc2V0U3R5bGVzLFxuICBzZXRJbXBvcnRhbnRTdHlsZXMsXG4gIHNldFN0eWxlLFxuICBzZXRTdHlsZXMsXG59IGZyb20gJy4vY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHtyZXRocm93QXN5bmN9IGZyb20gJy4vY29yZS9lcnJvcic7XG5pbXBvcnQge3RvV2lufSBmcm9tICcuL2NvcmUvd2luZG93JztcbmltcG9ydCB7bG9hZFByb21pc2V9IGZyb20gJy4vZXZlbnQtaGVscGVyJztcbmltcG9ydCB7RklFX0VNQkVEX1BST1B9IGZyb20gJy4vaWZyYW1lLWhlbHBlcic7XG5pbXBvcnQge3doZW5Db250ZW50SW5pTG9hZH0gZnJvbSAnLi9pbmktbG9hZCc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0LCB1c2VyQXNzZXJ0fSBmcm9tICcuL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4vbW9kZSc7XG5pbXBvcnQge2luc3RhbGwgYXMgaW5zdGFsbEFib3J0Q29udHJvbGxlcn0gZnJvbSAnLi9wb2x5ZmlsbHMvYWJvcnQtY29udHJvbGxlcic7XG5pbXBvcnQge2luc3RhbGwgYXMgaW5zdGFsbEN1c3RvbUVsZW1lbnRzfSBmcm9tICcuL3BvbHlmaWxscy9jdXN0b20tZWxlbWVudHMnO1xuaW1wb3J0IHtpbnN0YWxsIGFzIGluc3RhbGxEb2NDb250YWluc30gZnJvbSAnLi9wb2x5ZmlsbHMvZG9jdW1lbnQtY29udGFpbnMnO1xuaW1wb3J0IHtpbnN0YWxsIGFzIGluc3RhbGxET01Ub2tlbkxpc3R9IGZyb20gJy4vcG9seWZpbGxzL2RvbXRva2VubGlzdCc7XG5pbXBvcnQge2luc3RhbGxGb3JDaGlsZFdpbiBhcyBpbnN0YWxsSW50ZXJzZWN0aW9uT2JzZXJ2ZXJ9IGZyb20gJy4vcG9seWZpbGxzL2ludGVyc2VjdGlvbi1vYnNlcnZlcic7XG5pbXBvcnQge2luc3RhbGxGb3JDaGlsZFdpbiBhcyBpbnN0YWxsUmVzaXplT2JzZXJ2ZXJ9IGZyb20gJy4vcG9seWZpbGxzL3Jlc2l6ZS1vYnNlcnZlcic7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcuL3NlcnZpY2UnO1xuaW1wb3J0IHtcbiAgZGlzcG9zZVNlcnZpY2VzRm9yRW1iZWQsXG4gIGdldFRvcFdpbmRvdyxcbiAgc2V0UGFyZW50V2luZG93LFxufSBmcm9tICcuL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge2luc3RhbGxBbXBkb2NTZXJ2aWNlc0ZvckVtYmVkfSBmcm9tICcuL3NlcnZpY2UvY29yZS1zZXJ2aWNlcyc7XG5pbXBvcnQge2luc3RhbGxUaW1lckluRW1iZWRXaW5kb3d9IGZyb20gJy4vc2VydmljZS90aW1lci1pbXBsJztcbmltcG9ydCB7aW5zdGFsbFN0eWxlc0ZvckRvY30gZnJvbSAnLi9zdHlsZS1pbnN0YWxsZXInO1xuXG5pbXBvcnQge2Nzc1RleHQgYXMgYW1wU2hhcmVkQ3NzfSBmcm9tICcuLi9idWlsZC9hbXBzaGFyZWQuY3NzJztcblxuLyoqXG4gKiBQYXJhbWV0ZXJzIHVzZWQgdG8gY3JlYXRlIHRoZSBuZXcgXCJmcmllbmRseSBpZnJhbWVcIiBlbWJlZC5cbiAqIC0gaHRtbDogVGhlIGNvbXBsZXRlIGNvbnRlbnQgb2YgYW4gQU1QIGVtYmVkLCB3aGljaCBpcyBpdHNlbGYgYW4gQU1QXG4gKiAgIGRvY3VtZW50LiBDYW4gaW5jbHVkZSB3aGF0ZXZlciBpcyBub3JtYWxseSBhbGxvd2VkIGluIGFuIEFNUCBkb2N1bWVudCxcbiAqICAgZXhjZXB0IGZvciBBTVAgYDxzY3JpcHQ+YCBkZWNsYXJhdGlvbnMuIFRob3NlIHNob3VsZCBiZSBwYXNzZWQgYXMgYW5cbiAqICAgYXJyYXkgb2YgYGV4dGVuc2lvbnNgLlxuICogLSBleHRlbnNpb25zOiBBbiBvcHRpb25hbCBhcnJheSBvZiBBTVAgZXh0ZW5zaW9uIElEcy92ZXJzaW9ucyB1c2VkIGluXG4gKiAgIHRoaXMgZW1iZWQuXG4gKiAtIGZvbnRzOiBBbiBvcHRpb25hbCBhcnJheSBvZiBmb250cyB1c2VkIGluIHRoaXMgZW1iZWQuXG4gKlxuICpcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGhvc3Q6ICg/QW1wRWxlbWVudHx1bmRlZmluZWQpLFxuICogICB1cmw6IHN0cmluZyxcbiAqICAgaHRtbDogP3N0cmluZyxcbiAqICAgZXh0ZW5zaW9uczogKD9BcnJheTx7ZXh0ZW5zaW9uSWQ6IHN0cmluZywgZXh0ZW5zaW9uVmVyc2lvbjogc3RyaW5nfT58dW5kZWZpbmVkKSxcbiAqICAgZm9udHM6ICg/QXJyYXk8c3RyaW5nPnx1bmRlZmluZWQpLFxuICogICBza2lwSHRtbE1lcmdlOiAoYm9vbGVhbnx1bmRlZmluZWQpLFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBGcmllbmRseUlmcmFtZVNwZWM7XG5cbi8qKlxuICogQHR5cGUge2Jvb2xlYW58dW5kZWZpbmVkfVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmxldCBzcmNkb2NTdXBwb3J0ZWQ7XG5cbi8qKlxuICogQHBhcmFtIHtib29sZWFufHVuZGVmaW5lZH0gdmFsXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFNyY2RvY1N1cHBvcnRlZEZvclRlc3RpbmcodmFsKSB7XG4gIHNyY2RvY1N1cHBvcnRlZCA9IHZhbDtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIHtmdW5jdGlvbigqKTogIVByb21pc2U8Kj59XG4gKi9cbmZ1bmN0aW9uIGdldERlbGF5UHJvbWlzZVByb2R1Y2VyKCkge1xuICByZXR1cm4gKHZhbCkgPT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKHZhbCksIDEpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBGcmllbmRseSBJZnJhbWVzIGFyZSBzdXBwb3J0ZWQuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTcmNkb2NTdXBwb3J0ZWQoKSB7XG4gIGlmIChzcmNkb2NTdXBwb3J0ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgIHNyY2RvY1N1cHBvcnRlZCA9ICdzcmNkb2MnIGluIEhUTUxJRnJhbWVFbGVtZW50LnByb3RvdHlwZTtcbiAgfVxuICByZXR1cm4gc3JjZG9jU3VwcG9ydGVkO1xufVxuXG4vKipcbiAqIEdldCB0cnVzdGVkIHVybHMgZW5hYmxlZCBmb3IgcG9seWZpbGxzLlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmllU2FmZVNjcmlwdFNyY3MoKSB7XG4gIGNvbnN0IGNkbkJhc2UgPSBnZXRNb2RlKCkubG9jYWxEZXYgPyAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL2Rpc3QnIDogdXJscy5jZG47XG4gIHJldHVybiBgJHtjZG5CYXNlfS9sdHMvICR7Y2RuQmFzZX0vcnR2LyAke2NkbkJhc2V9L3N3L2A7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IUFycmF5PHtleHRlbnNpb25JZDogc3RyaW5nLCBleHRlbnNpb25WZXJzaW9uOiBzdHJpbmd9Pn0gZXh0ZW5zaW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcHJlbG9hZEZyaWVuZGx5SWZyYW1lRW1iZWRFeHRlbnNpb25zKHdpbiwgZXh0ZW5zaW9ucykge1xuICBjb25zdCBleHRlbnNpb25zU2VydmljZSA9IFNlcnZpY2VzLmV4dGVuc2lvbnNGb3Iod2luKTtcblxuICAvLyBMb2FkIGFueSBleHRlbnNpb25zOyBkbyBub3Qgd2FpdCBvbiB0aGVpciBwcm9taXNlcyBhcyB0aGlzXG4gIC8vIGlzIGp1c3QgdG8gcHJlZmV0Y2guXG4gIGV4dGVuc2lvbnMuZm9yRWFjaCgoe2V4dGVuc2lvbklkLCBleHRlbnNpb25WZXJzaW9ufSkgPT5cbiAgICBleHRlbnNpb25zU2VydmljZS5wcmVsb2FkRXh0ZW5zaW9uKGV4dGVuc2lvbklkLCBleHRlbnNpb25WZXJzaW9uKVxuICApO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIHJlcXVlc3RlZCBcImZyaWVuZGx5IGlmcmFtZVwiIGVtYmVkLiBSZXR1cm5zIHRoZSBwcm9taXNlIHRoYXRcbiAqIHdpbGwgYmUgcmVzb2x2ZWQgYXMgc29vbiBhcyB0aGUgZW1iZWQgaXMgYXZhaWxhYmxlLiBUaGUgYWN0dWFsXG4gKiBpbml0aWFsaXphdGlvbiBvZiB0aGUgZW1iZWQgd2lsbCBzdGFydCBhcyBzb29uIGFzIHRoZSBgaWZyYW1lYCBpcyBhZGRlZFxuICogdG8gdGhlIERPTS5cbiAqIEBwYXJhbSB7IUhUTUxJRnJhbWVFbGVtZW50fSBpZnJhbWVcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGNvbnRhaW5lclxuICogQHBhcmFtIHshRnJpZW5kbHlJZnJhbWVTcGVjfSBzcGVjXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCFXaW5kb3csID8uL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jPSk9fSBvcHRfcHJlaW5zdGFsbENhbGxiYWNrXG4gKiBAcmV0dXJuIHshUHJvbWlzZTwhRnJpZW5kbHlJZnJhbWVFbWJlZD59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsRnJpZW5kbHlJZnJhbWVFbWJlZChcbiAgaWZyYW1lLFxuICBjb250YWluZXIsXG4gIHNwZWMsXG4gIG9wdF9wcmVpbnN0YWxsQ2FsbGJhY2sgLy8gVE9ETygjMjI3MzMpOiByZW1vdmUgXCJ3aW5kb3dcIiBhcmd1bWVudC5cbikge1xuICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICBjb25zdCB3aW4gPSBnZXRUb3BXaW5kb3codG9XaW4oaWZyYW1lLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpKTtcbiAgLyoqIEBjb25zdCB7IS4vc2VydmljZS9leHRlbnNpb25zLWltcGwuRXh0ZW5zaW9uc30gKi9cbiAgY29uc3QgZXh0ZW5zaW9uc1NlcnZpY2UgPSBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKHdpbik7XG4gIC8qKiBAY29uc3QgeyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jU2VydmljZX0gKi9cbiAgY29uc3QgYW1wZG9jU2VydmljZSA9IFNlcnZpY2VzLmFtcGRvY1NlcnZpY2VGb3Iod2luKTtcblxuICBzZXRTdHlsZShpZnJhbWUsICd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICBpZnJhbWUuc2V0QXR0cmlidXRlKCdyZWZlcnJlcnBvbGljeScsICd1bnNhZmUtdXJsJyk7XG4gIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ21hcmdpbmhlaWdodCcsICcwJyk7XG4gIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ21hcmdpbndpZHRoJywgJzAnKTtcblxuICBjb25zdCBleHRlbnNpb25zID0gc3BlYy5leHRlbnNpb25zIHx8IFtdO1xuXG4gIC8vIFByZS1sb2FkIGV4dGVuc2lvbnMuXG4gIHByZWxvYWRGcmllbmRseUlmcmFtZUVtYmVkRXh0ZW5zaW9ucyh3aW4sIGV4dGVuc2lvbnMpO1xuXG4gIGNvbnN0IGh0bWwgPSBzcGVjLnNraXBIdG1sTWVyZ2UgPyBzcGVjLmh0bWwgOiBtZXJnZUh0bWwoc3BlYyk7XG4gIC8vIFJlY2VpdmUgdGhlIHNpZ25hbCB3aGVuIGlmcmFtZSBpcyByZWFkeTogaXQncyBkb2N1bWVudCBpcyBmb3JtZWQuXG4gIGlmcmFtZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgLy8gQ2hyb21lIGRvZXMgbm90IHJlZmxlY3QgdGhlIGlmcmFtZSByZWFkeXN0YXRlLlxuICAgIGlmcmFtZS5yZWFkeVN0YXRlID0gJ2NvbXBsZXRlJztcbiAgfTtcbiAgY29uc3QgcmVnaXN0ZXJWaW9sYXRpb25MaXN0ZW5lciA9ICgpID0+IHtcbiAgICBpZnJhbWUuY29udGVudFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ3NlY3VyaXR5cG9saWN5dmlvbGF0aW9uJyxcbiAgICAgICh2aW9sYXRpb25FdmVudCkgPT4ge1xuICAgICAgICBkZXYoKS53YXJuKCdGSUUnLCAnc2VjdXJpdHkgcG9saWN5IHZpb2xhdGlvbicsIHZpb2xhdGlvbkV2ZW50KTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuICBsZXQgbG9hZGVkUHJvbWlzZTtcbiAgaWYgKGlzU3JjZG9jU3VwcG9ydGVkKCkpIHtcbiAgICBpZnJhbWUuc3JjZG9jID0gaHRtbDtcbiAgICBsb2FkZWRQcm9taXNlID0gbG9hZFByb21pc2UoaWZyYW1lKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICByZWdpc3RlclZpb2xhdGlvbkxpc3RlbmVyKCk7XG4gIH0gZWxzZSB7XG4gICAgaWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gICAgY29uc3QgY2hpbGREb2MgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgICByZWdpc3RlclZpb2xhdGlvbkxpc3RlbmVyKCk7XG4gICAgY2hpbGREb2Mub3BlbigpO1xuICAgIGNoaWxkRG9jLndyaXRlKGRldkFzc2VydChodG1sKSk7XG4gICAgLy8gV2l0aCBkb2N1bWVudC53cml0ZSwgYGlmcmFtZS5vbmxvYWRgIGFycml2ZXMgYWxtb3N0IGltbWVkaWF0ZWx5LCB0aHVzXG4gICAgLy8gd2UgbmVlZCB0byB3YWl0IGZvciBjaGlsZCdzIGB3aW5kb3cub25sb2FkYC5cbiAgICBsb2FkZWRQcm9taXNlID0gbG9hZFByb21pc2UoaWZyYW1lLmNvbnRlbnRXaW5kb3cpO1xuICAgIGNoaWxkRG9jLmNsb3NlKCk7XG4gIH1cblxuICAvLyBXYWl0IGZvciBkb2N1bWVudCByZWFkeSBzaWduYWwuXG4gIC8vIFRoaXMgaXMgY29tcGxpY2F0ZWQgZHVlIHRvIGNyYnVnLmNvbS82NDkyMDEgb24gQ2hyb21lIGFuZCBhIHNpbWlsYXIgaXNzdWVcbiAgLy8gb24gU2FmYXJpIHdoZXJlIG5ld2x5IGNyZWF0ZWQgZG9jdW1lbnQncyBgcmVhZHlTdGF0ZWAgaW1tZWRpYXRlbHkgZXF1YWxzXG4gIC8vIGBjb21wbGV0ZWAsIGV2ZW4gdGhvdWdoIHRoZSBkb2N1bWVudCBpdHNlbGYgaXMgbm90IHlldCBhdmFpbGFibGUuIFRoZXJlJ3NcbiAgLy8gbm8gb3RoZXIgcmVsaWFibGUgc2lnbmFsIGZvciBgcmVhZHlTdGF0ZWAgaW4gYSBjaGlsZCB3aW5kb3cgYW5kIHRodXNcbiAgLy8gd2UgaGF2ZSB0byBmYWxsYmFjayB0byBwb2xsaW5nLlxuICBsZXQgcmVhZHlQcm9taXNlO1xuICBpZiAoaXNJZnJhbWVSZWFkeShpZnJhbWUpKSB7XG4gICAgcmVhZHlQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH0gZWxzZSB7XG4gICAgcmVhZHlQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIC8qKiBAY29uc3Qge251bWJlcn0gKi9cbiAgICAgIGNvbnN0IGludGVydmFsID0gd2luLnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKGlzSWZyYW1lUmVhZHkoaWZyYW1lKSkge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB3aW4uY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0sIC8qIG1pbGxpc2Vjb25kcyAqLyA1KTtcblxuICAgICAgLy8gRm9yIHNhZmV0eSwgbWFrZSBzdXJlIHdlIGRlZmluaXRlbHkgc3RvcCBwb2xsaW5nIHdoZW4gY2hpbGQgZG9jIGlzXG4gICAgICAvLyBsb2FkZWQuXG4gICAgICBsb2FkZWRQcm9taXNlXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICByZXRocm93QXN5bmMoZXJyb3IpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHdpbi5jbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVhZHlQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgIGNvbnN0IGNoaWxkV2luID0gLyoqIEB0eXBlIHshV2luZG93fSAqLyAoaWZyYW1lLmNvbnRlbnRXaW5kb3cpO1xuICAgIGNvbnN0IHNpZ25hbHMgPSBzcGVjLmhvc3QgJiYgc3BlYy5ob3N0LnNpZ25hbHMoKTtcbiAgICBjb25zdCBhbXBkb2MgPSBhbXBkb2NTZXJ2aWNlLmluc3RhbGxGaWVEb2Moc3BlYy51cmwsIGNoaWxkV2luLCB7c2lnbmFsc30pO1xuICAgIGNvbnN0IGVtYmVkID0gbmV3IEZyaWVuZGx5SWZyYW1lRW1iZWQoaWZyYW1lLCBzcGVjLCBsb2FkZWRQcm9taXNlLCBhbXBkb2MpO1xuICAgIGlmcmFtZVtGSUVfRU1CRURfUFJPUF0gPSBlbWJlZDtcblxuICAgIC8vIFdpbmRvdyBtaWdodCBoYXZlIGJlZW4gZGVzdHJveWVkLlxuICAgIGlmICghY2hpbGRXaW4uZnJhbWVFbGVtZW50KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBBZGQgZXh0ZW5zaW9ucy5cbiAgICByZXR1cm4gSW5zdGFsbGVycy5pbnN0YWxsRXh0ZW5zaW9uc0luRW1iZWQoXG4gICAgICBlbWJlZCxcbiAgICAgIGV4dGVuc2lvbnNTZXJ2aWNlLFxuICAgICAgYW1wZG9jLFxuICAgICAgZXh0ZW5zaW9ucyxcbiAgICAgIG9wdF9wcmVpbnN0YWxsQ2FsbGJhY2tcbiAgICApLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKCFjaGlsZFdpbi5mcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gZW1iZWQ7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIHdoZW4gaWZyYW1lIGlzIHJlYWR5LlxuICogQHBhcmFtIHshSFRNTElGcmFtZUVsZW1lbnR9IGlmcmFtZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNJZnJhbWVSZWFkeShpZnJhbWUpIHtcbiAgLy8gVGhpcyBpcyBjb21wbGljYXRlZCBkdWUgdG8gY3JidWcuY29tLzY0OTIwMSBvbiBDaHJvbWUgYW5kIGEgc2ltaWxhciBpc3N1ZVxuICAvLyBvbiBTYWZhcmkgd2hlcmUgbmV3bHkgY3JlYXRlZCBkb2N1bWVudCdzIGByZWFkeVN0YXRlYCBpbW1lZGlhdGVseSBlcXVhbHNcbiAgLy8gYGNvbXBsZXRlYCwgZXZlbiB0aG91Z2ggdGhlIGRvY3VtZW50IGl0c2VsZiBpcyBub3QgeWV0IGF2YWlsYWJsZS4gVGhlcmUnc1xuICAvLyBubyBvdGhlciByZWxpYWJsZSBzaWduYWwgZm9yIGByZWFkeVN0YXRlYCBpbiBhIGNoaWxkIHdpbmRvdyBhbmQgdGh1c1xuICAvLyB0aGUgYmVzdCB3YXkgdG8gY2hlY2sgaXMgdG8gc2VlIHRoZSBjb250ZW50cyBvZiB0aGUgYm9keS5cbiAgY29uc3QgY2hpbGREb2MgPSBpZnJhbWUuY29udGVudFdpbmRvdyAmJiBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgcmV0dXJuICEhKFxuICAgIGNoaWxkRG9jICYmXG4gICAgaXNEb2N1bWVudFJlYWR5KGNoaWxkRG9jKSAmJlxuICAgIGNoaWxkRG9jLmJvZHkgJiZcbiAgICBjaGlsZERvYy5ib2R5LmZpcnN0Q2hpbGRcbiAgKTtcbn1cblxuLyoqXG4gKiBNZXJnZXMgYmFzZSBhbmQgZm9udHMgaW50byBodG1sIGRvY3VtZW50LlxuICogQHBhcmFtIHshRnJpZW5kbHlJZnJhbWVTcGVjfSBzcGVjXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIG1lcmdlSHRtbChzcGVjKSB7XG4gIGNvbnN0IG9yaWdpbmFsSHRtbCA9IHNwZWMuaHRtbDtcbiAgY29uc3Qgb3JpZ2luYWxIdG1sVXAgPSBvcmlnaW5hbEh0bWwudG9VcHBlckNhc2UoKTtcblxuICAvLyBGaW5kIHRoZSBpbnNlcnRpb24gcG9pbnQuXG4gIGxldCBpcCA9IG9yaWdpbmFsSHRtbFVwLmluZGV4T2YoJzxIRUFEJyk7XG4gIGlmIChpcCAhPSAtMSkge1xuICAgIGlwID0gb3JpZ2luYWxIdG1sVXAuaW5kZXhPZignPicsIGlwICsgMSkgKyAxO1xuICB9XG4gIGlmIChpcCA9PSAtMSkge1xuICAgIGlwID0gb3JpZ2luYWxIdG1sVXAuaW5kZXhPZignPEJPRFknKTtcbiAgfVxuICBpZiAoaXAgPT0gLTEpIHtcbiAgICBpcCA9IG9yaWdpbmFsSHRtbFVwLmluZGV4T2YoJzxIVE1MJyk7XG4gICAgaWYgKGlwICE9IC0xKSB7XG4gICAgICBpcCA9IG9yaWdpbmFsSHRtbFVwLmluZGV4T2YoJz4nLCBpcCArIDEpICsgMTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBbXTtcblxuICAvLyBQcmVhbWJ1bGUuXG4gIGlmIChpcCA+IDApIHtcbiAgICByZXN1bHQucHVzaChvcmlnaW5hbEh0bWwuc3Vic3RyaW5nKDAsIGlwKSk7XG4gIH1cblxuICAvLyBBZGQgPEJBU0U+IHRhZy5cbiAgcmVzdWx0LnB1c2goYDxiYXNlIGhyZWY9XCIke2VzY2FwZUh0bWwoc3BlYy51cmwpfVwiPmApO1xuXG4gIC8vIExvYWQgZm9udHMuXG4gIGlmIChzcGVjLmZvbnRzKSB7XG4gICAgc3BlYy5mb250cy5mb3JFYWNoKChmb250KSA9PiB7XG4gICAgICByZXN1bHQucHVzaChcbiAgICAgICAgYDxsaW5rIGhyZWY9XCIke2VzY2FwZUh0bWwoZm9udCl9XCIgcmVsPVwic3R5bGVzaGVldFwiIHR5cGU9XCJ0ZXh0L2Nzc1wiPmBcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBjc3BTY3JpcHRTcmMgPSBnZXRGaWVTYWZlU2NyaXB0U3JjcygpO1xuXG4gIC8vIExvYWQgQ1NQXG4gIHJlc3VsdC5wdXNoKFxuICAgICc8bWV0YSBodHRwLWVxdWl2PUNvbnRlbnQtU2VjdXJpdHktUG9saWN5ICcgK1xuICAgICAgYGNvbnRlbnQ9XCJzY3JpcHQtc3JjICR7Y3NwU2NyaXB0U3JjfTtvYmplY3Qtc3JjICdub25lJztjaGlsZC1zcmMgJ25vbmUnXCI+YFxuICApO1xuXG4gIC8vIFBvc3RhbWJ1bGUuXG4gIGlmIChpcCA+IDApIHtcbiAgICByZXN1bHQucHVzaChvcmlnaW5hbEh0bWwuc3Vic3RyaW5nKGlwKSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0LnB1c2gob3JpZ2luYWxIdG1sKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQuam9pbignJyk7XG59XG5cbi8qKlxuICogRXhwb3NlcyBgbWVyZ2VIdG1sYCBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cbiAqIEBwYXJhbSB7IUZyaWVuZGx5SWZyYW1lU3BlY30gc3BlY1xuICogQHJldHVybiB7c3RyaW5nfVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUh0bWxGb3JUZXN0aW5nKHNwZWMpIHtcbiAgcmV0dXJuIG1lcmdlSHRtbChzcGVjKTtcbn1cblxuLyoqXG4gKiBBIFwiZnJpZW5kbHkgaWZyYW1lXCIgZW1iZWQuIFRoaXMgaXMgdGhlIGlmcmFtZSB0aGF0J3MgZnVsbHkgYWNjZXNzaWJsZSB0b1xuICogdGhlIEFNUCBydW50aW1lLiBJdCdzIHNpbWlsYXIgdG8gU2hhZG93IERPTSBpbiBtYW55IHJlc3BlY3RzLCBidXQgaXQgYWxzb1xuICogcHJvdmlkZXMgaWZyYW1lL3ZpZXdwb3J0IG1lYXN1cmVtZW50cyBhbmQgZW5hYmxlcyB0aGUgdXNlIG9mIGB2aGAsIGB2d2AgYW5kXG4gKiBgQG1lZGlhYCBDU1MuXG4gKlxuICogVGhlIGZyaWVuZGx5IGlmcmFtZSBpcyBtYW5hZ2VkIGJ5IHRoZSB0b3AtbGV2ZWwgQU1QIFJ1bnRpbWUuIFdoZW4gaXQnc1xuICogZGVzdHJveWVkLCB0aGUgYGRlc3Ryb3lgIG1ldGhvZCBtdXN0IGJlIGNhbGxlZCB0byBmcmVlIHVwIHRoZSBzaGFyZWRcbiAqIHJlc291cmNlcy5cbiAqXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIEZyaWVuZGx5SWZyYW1lRW1iZWQge1xuICAvKipcbiAgICogQHBhcmFtIHshSFRNTElGcmFtZUVsZW1lbnR9IGlmcmFtZVxuICAgKiBAcGFyYW0geyFGcmllbmRseUlmcmFtZVNwZWN9IHNwZWNcbiAgICogQHBhcmFtIHshUHJvbWlzZX0gbG9hZGVkUHJvbWlzZVxuICAgKiBAcGFyYW0gez8uL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jRmllfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGlmcmFtZSwgc3BlYywgbG9hZGVkUHJvbWlzZSwgYW1wZG9jKSB7XG4gICAgLyoqIEBjb25zdCB7IUhUTUxJRnJhbWVFbGVtZW50fSAqL1xuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuXG4gICAgLyoqIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbiA9IC8qKiBAdHlwZSB7IVdpbmRvd30gKi8gKGlmcmFtZS5jb250ZW50V2luZG93KTtcblxuICAgIC8qKiBAY29uc3Qgez8uL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jRmllfSAqL1xuICAgIHRoaXMuYW1wZG9jID0gYW1wZG9jO1xuXG4gICAgLyoqIEBjb25zdCB7IUZyaWVuZGx5SWZyYW1lU3BlY30gKi9cbiAgICB0aGlzLnNwZWMgPSBzcGVjO1xuXG4gICAgLyoqIEBjb25zdCB7P0FtcEVsZW1lbnR9ICovXG4gICAgdGhpcy5ob3N0ID0gc3BlYy5ob3N0IHx8IG51bGw7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHt0aW1lfSAqL1xuICAgIHRoaXMuc3RhcnRUaW1lXyA9IERhdGUubm93KCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5zaWduYWxzXyA9IHRoaXMuYW1wZG9jXG4gICAgICA/IHRoaXMuYW1wZG9jLnNpZ25hbHMoKVxuICAgICAgOiB0aGlzLmhvc3RcbiAgICAgID8gdGhpcy5ob3N0LnNpZ25hbHMoKVxuICAgICAgOiBuZXcgU2lnbmFscygpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IURlZmVycmVkfSAqL1xuICAgIHRoaXMucmVuZGVyQ29tcGxldGVfID0gbmV3IERlZmVycmVkKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshUHJvbWlzZX0gKi9cbiAgICB0aGlzLndpbkxvYWRlZFByb21pc2VfID0gUHJvbWlzZS5hbGwoW1xuICAgICAgbG9hZGVkUHJvbWlzZSxcbiAgICAgIHRoaXMud2hlblJlbmRlclN0YXJ0ZWQoKSxcbiAgICBdKTtcbiAgICBpZiAodGhpcy5hbXBkb2MpIHtcbiAgICAgIHRoaXMud2hlblJlbmRlckNvbXBsZXRlKCkudGhlbigoKSA9PiB0aGlzLmFtcGRvYy5zZXRSZWFkeSgpKTtcbiAgICB9XG5cbiAgICB0aGlzLndpbi5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB0aGlzLmhhbmRsZVJlc2l6ZV8oKSk7XG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IGFsbCByZXNvdXJjZXMgZnJvbSB0aGlzIGlmcmFtZSBoYXZlIGJlZW4gcmVsZWFzZWQuXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIGRpc3Bvc2VTZXJ2aWNlc0ZvckVtYmVkKHRoaXMud2luKTtcbiAgICBpZiAodGhpcy5hbXBkb2MpIHtcbiAgICAgIHRoaXMuYW1wZG9jLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7dGltZX1cbiAgICovXG4gIGdldFN0YXJ0VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFydFRpbWVfO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJhc2UgVVJMIGZvciB0aGUgZW1iZWRkZWQgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldFVybCgpIHtcbiAgICByZXR1cm4gdGhpcy5zcGVjLnVybDtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHshU2lnbmFsc30gKi9cbiAgc2lnbmFscygpIHtcbiAgICByZXR1cm4gdGhpcy5zaWduYWxzXztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB3aGVuIHRoZSBlbWJlZCBkb2N1bWVudCBpcyByZWFkeS5cbiAgICogTm90aWNlIHRoYXQgdGhpcyBzaWduYWwgY29pbmNpZGVzIHdpdGggdGhlIGVtYmVkJ3MgYHJlbmRlci1zdGFydGAuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgd2hlblJlbmRlclN0YXJ0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2lnbmFsc18ud2hlblNpZ25hbChDb21tb25TaWduYWxzLlJFTkRFUl9TVEFSVCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2hlbiB0aGUgY2hpbGQgd2luZG93J3MgYG9ubG9hZGAgZXZlbnRcbiAgICogaGFzIGJlZW4gZW1pdHRlZC4gSW4gZnJpZW5kbHkgaWZyYW1lcyB0aGlzIHR5cGljYWxseSBvbmx5IGluY2x1ZGVzIGZvbnRcbiAgICogbG9hZGluZy5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICB3aGVuV2luZG93TG9hZGVkKCkge1xuICAgIHJldHVybiB0aGlzLndpbkxvYWRlZFByb21pc2VfO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdoZW4gdGhlIGluaXRpYWwgbG9hZCAgb2YgdGhlIGVtYmVkJ3NcbiAgICogY29udGVudCBoYXMgYmVlbiBjb21wbGV0ZWQuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgd2hlbkluaUxvYWRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zaWduYWxzXy53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuSU5JX0xPQUQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdoZW4gYWxsIGVsZW1lbnRzIGhhdmUgYmVlblxuICAgKiB0cmFuc2ZlcnJlZCBpbnRvIGxpdmUgZW1iZWQgRE9NLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHdoZW5SZW5kZXJDb21wbGV0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJDb21wbGV0ZV8ucHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWduYWwgdGhhdCBpbmRpY2F0ZXMgdGhhdCBhbGwgRE9NIGVsZW1lbnRzIGhhdmUgYmVlbiB0cmFuZmVycmVkIHRvIGxpdmVcbiAgICogZW1iZWQgRE9NLlxuICAgKi9cbiAgcmVuZGVyQ29tcGxldGVkKCkge1xuICAgIHRoaXMucmVuZGVyQ29tcGxldGVfLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZSB0aGUgZW1iZWQuXG4gICAqL1xuICBwYXVzZSgpIHtcbiAgICBpZiAodGhpcy5hbXBkb2MpIHtcbiAgICAgIHRoaXMuYW1wZG9jLm92ZXJyaWRlVmlzaWJpbGl0eVN0YXRlKFZpc2liaWxpdHlTdGF0ZS5QQVVTRUQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN1bWUgdGhlIGVtYmVkLlxuICAgKi9cbiAgcmVzdW1lKCkge1xuICAgIGlmICh0aGlzLmFtcGRvYykge1xuICAgICAgdGhpcy5hbXBkb2Mub3ZlcnJpZGVWaXNpYmlsaXR5U3RhdGUoVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmVzdHJpY3RlZFxuICAgKi9cbiAgc3RhcnRSZW5kZXJfKCkge1xuICAgIGlmICh0aGlzLmhvc3QpIHtcbiAgICAgIHRoaXMuaG9zdC5yZW5kZXJTdGFydGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2lnbmFsc18uc2lnbmFsKENvbW1vblNpZ25hbHMuUkVOREVSX1NUQVJUKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPKGNjb3JkcnkpOiByZW1vdmUgd2hlbiBuby1zaWduaW5nIGxhdW5jaGVkLlxuICAgIGlmICghdGhpcy5zcGVjLnNraXBIdG1sTWVyZ2UpIHtcbiAgICAgIC8vIFdoZW4gbm90IHN0cmVhbWluZyByZW5kZXJTdGFydCBzaWduYWwgaXMgZ29vZCBlbm91Z2guXG4gICAgICB0aGlzLnJlbmRlckNvbXBsZXRlXy5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgLy8gQ29tbW9uIHNpZ25hbCBSRU5ERVJfU1RBUlQgaW5kaWNhdGVzIHRpbWUgdG8gdG9nZ2xlIHZpc2liaWxpdHlcbiAgICBzZXRTdHlsZSh0aGlzLmlmcmFtZSwgJ3Zpc2liaWxpdHknLCAnJyk7XG4gICAgaWYgKHRoaXMud2luLmRvY3VtZW50ICYmIHRoaXMud2luLmRvY3VtZW50LmJvZHkpIHtcbiAgICAgIHRoaXMud2luLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtZmllJyk7XG4gICAgICBzZXRTdHlsZXMoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLndpbi5kb2N1bWVudC5ib2R5KSwge1xuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICB2aXNpYmlsaXR5OiAndmlzaWJsZScsXG4gICAgICAgIGFuaW1hdGlvbjogJ25vbmUnLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbCBsb2FkIHNpZ25hbCBzaWduYWwuXG4gICAgbGV0IHJlY3Q7XG4gICAgaWYgKHRoaXMuaG9zdCkge1xuICAgICAgcmVjdCA9IHRoaXMuaG9zdC5nZXRMYXlvdXRCb3goKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVjdCA9IGxheW91dFJlY3RMdHdoKFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICB0aGlzLndpbi4vKk9LKi8gaW5uZXJXaWR0aCxcbiAgICAgICAgdGhpcy53aW4uLypPSyovIGlubmVySGVpZ2h0XG4gICAgICApO1xuICAgIH1cbiAgICBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLndoZW5SZW5kZXJDb21wbGV0ZSgpLFxuICAgICAgd2hlbkNvbnRlbnRJbmlMb2FkKHRoaXMuYW1wZG9jLCB0aGlzLndpbiwgcmVjdCksXG4gICAgXSkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnNpZ25hbHNfLnNpZ25hbChDb21tb25TaWduYWxzLklOSV9MT0FEKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshSFRNTEJvZHlFbGVtZW50fVxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIGdldEJvZHlFbGVtZW50KCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFIVE1MQm9keUVsZW1lbnR9ICovIChcbiAgICAgICh0aGlzLmlmcmFtZS5jb250ZW50RG9jdW1lbnQgfHwgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudCkuYm9keVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2UgcmVtZWFzdXJlIGluc2lkZSBGSUUgZG9jIHdoZW4gaWZyYW1lIGlzIHJlc2l6ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVSZXNpemVfKCkge1xuICAgIHRoaXMuZ2V0TXV0YXRvcl8oKS5tdXRhdGVFbGVtZW50KFxuICAgICAgdGhpcy53aW4uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgICAgKCkgPT4ge30gLy8gTk9PUC5cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2UvbXV0YXRvci1pbnRlcmZhY2UuTXV0YXRvckludGVyZmFjZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldE11dGF0b3JfKCkge1xuICAgIHJldHVybiBTZXJ2aWNlcy5tdXRhdG9yRm9yRG9jKHRoaXMuaWZyYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIGEgbWVhc3VyZS9tdXRhdGUgY3ljbGUgZW5zdXJpbmcgdGhhdCB0aGUgaWZyYW1lIGNoYW5nZSBpcyBwcm9wYWdhdGVkXG4gICAqIHRvIHRoZSByZXNvdXJjZSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0ge3ttZWFzdXJlOiAoZnVuY3Rpb24oKXx1bmRlZmluZWQpLCBtdXRhdGU6IGZ1bmN0aW9uKCl9fSB0YXNrXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWVhc3VyZU11dGF0ZV8odGFzaykge1xuICAgIHJldHVybiB0aGlzLmdldE11dGF0b3JfKCkubWVhc3VyZU11dGF0ZUVsZW1lbnQoXG4gICAgICB0aGlzLmlmcmFtZSxcbiAgICAgIHRhc2subWVhc3VyZSB8fCBudWxsLFxuICAgICAgdGFzay5tdXRhdGVcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgZW50ZXJGdWxsT3ZlcmxheU1vZGUoKSB7XG4gICAgY29uc3QgYW1wQWRQYXJlbnQgPSBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuaWZyYW1lLnBhcmVudE5vZGUpO1xuXG4gICAgLy8gU2VjdXJpdHkgYXNzZXJ0aW9uLiBPdGhlcndpc2UgYW55IDNwIGZyYW1lIGNvdWxkIHJlcXVlc3QgbGlnaGJveCBtb2RlLlxuICAgIHVzZXJBc3NlcnQoXG4gICAgICBhbXBBZFBhcmVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ2FtcC1hZCcsXG4gICAgICAnT25seSA8YW1wLWFkPiBpcyBhbGxvd2VkIHRvIGVudGVyIGxpZ2h0Ym94IG1vZGUuJ1xuICAgICk7XG5cbiAgICBsZXQgYm9keVN0eWxlO1xuXG4gICAgcmV0dXJuIHRoaXMubWVhc3VyZU11dGF0ZV8oe1xuICAgICAgbWVhc3VyZTogKCkgPT4ge1xuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5ob3N0XG4gICAgICAgICAgPyB0aGlzLmhvc3QuZ2V0TGF5b3V0Qm94KClcbiAgICAgICAgICA6IHRoaXMuaWZyYW1lLi8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAvLyBPZmZzZXQgYnkgc2Nyb2xsIHRvcCBhcyBpZnJhbWUgd2lsbCBiZSBwb3NpdGlvbjogZml4ZWQuXG4gICAgICAgIGNvbnN0IGR5ID0gLVNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuaWZyYW1lKS5nZXRTY3JvbGxUb3AoKTtcbiAgICAgICAgY29uc3Qge2hlaWdodCwgbGVmdCwgdG9wLCB3aWR0aH0gPSBtb3ZlTGF5b3V0UmVjdChyZWN0LCAvKiBkeCAqLyAwLCBkeSk7XG5cbiAgICAgICAgLy8gT2Zmc2V0IGJvZHkgYnkgaGVhZGVyIGhlaWdodCB0byBwcmV2ZW50IHZpc3VhbCBqdW1wLlxuICAgICAgICBib2R5U3R5bGUgPSB7XG4gICAgICAgICAgdG9wOiBweCh0b3ApLFxuICAgICAgICAgIGxlZnQ6IHB4KGxlZnQpLFxuICAgICAgICAgIHdpZHRoOiBweCh3aWR0aCksXG4gICAgICAgICAgaGVpZ2h0OiBweChoZWlnaHQpLFxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIG11dGF0ZTogKCkgPT4ge1xuICAgICAgICAvLyAhaW1wb3J0YW50IHRvIHByZXZlbnQgYWJ1c2UgZS5nLiBib3ggQCBsdHdoID0gMCwgMCwgMCwgMFxuICAgICAgICBzZXRJbXBvcnRhbnRTdHlsZXModGhpcy5pZnJhbWUsIHtcbiAgICAgICAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxuICAgICAgICAgICdsZWZ0JzogMCxcbiAgICAgICAgICAncmlnaHQnOiAwLFxuICAgICAgICAgICdib3R0b20nOiAwLFxuICAgICAgICAgICd3aWR0aCc6ICcxMDB2dycsXG4gICAgICAgICAgJ3RvcCc6IDAsXG4gICAgICAgICAgJ2hlaWdodCc6ICcxMDB2aCcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gb3ZlcnJpZGUgcnVudGltZS1sZXZlbCAhaW1wb3J0YW50IHJ1bGVzXG4gICAgICAgIHNldEltcG9ydGFudFN0eWxlcyh0aGlzLmdldEJvZHlFbGVtZW50KCksIHtcbiAgICAgICAgICAnYmFja2dyb3VuZCc6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcbiAgICAgICAgICAnYm90dG9tJzogJ2F1dG8nLFxuICAgICAgICAgICdyaWdodCc6ICdhdXRvJyxcblxuICAgICAgICAgIC8vIFJlYWQgZHVyaW5nIHZzeW5jIG1lYXN1cmUgcGhhc2UuXG4gICAgICAgICAgJ3RvcCc6IGJvZHlTdHlsZS50b3AsXG4gICAgICAgICAgJ2xlZnQnOiBib2R5U3R5bGUubGVmdCxcbiAgICAgICAgICAnd2lkdGgnOiBib2R5U3R5bGUud2lkdGgsXG4gICAgICAgICAgJ2hlaWdodCc6IGJvZHlTdHlsZS5oZWlnaHQsXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGxlYXZlRnVsbE92ZXJsYXlNb2RlKCkge1xuICAgIHJldHVybiB0aGlzLm1lYXN1cmVNdXRhdGVfKHtcbiAgICAgIG11dGF0ZTogKCkgPT4ge1xuICAgICAgICByZXNldFN0eWxlcyh0aGlzLmlmcmFtZSwgW1xuICAgICAgICAgICdwb3NpdGlvbicsXG4gICAgICAgICAgJ2xlZnQnLFxuICAgICAgICAgICdyaWdodCcsXG4gICAgICAgICAgJ3RvcCcsXG4gICAgICAgICAgJ2JvdHRvbScsXG4gICAgICAgICAgJ3dpZHRoJyxcbiAgICAgICAgICAnaGVpZ2h0JyxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgLy8gd2UncmUgbm90IHJlc2V0dGluZyBiYWNrZ3JvdW5kIGhlcmUgYXMgd2UgbmVlZCB0byBzZXQgaXQgdG9cbiAgICAgICAgLy8gdHJhbnNwYXJlbnQgcGVybWFuZW50bHkuXG4gICAgICAgIHJlc2V0U3R5bGVzKHRoaXMuZ2V0Qm9keUVsZW1lbnQoKSwgW1xuICAgICAgICAgICdwb3NpdGlvbicsXG4gICAgICAgICAgJ3RvcCcsXG4gICAgICAgICAgJ2xlZnQnLFxuICAgICAgICAgICd3aWR0aCcsXG4gICAgICAgICAgJ2hlaWdodCcsXG4gICAgICAgICAgJ2JvdHRvbScsXG4gICAgICAgICAgJ3JpZ2h0JyxcbiAgICAgICAgXSk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogSW5zdGFsbCBwb2x5ZmlsbHMgaW4gdGhlIGNoaWxkIHdpbmRvdyAoZnJpZW5kbHkgaWZyYW1lKS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gcGFyZW50V2luXG4gKiBAcGFyYW0geyFXaW5kb3d9IGNoaWxkV2luXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxQb2x5ZmlsbHNJbkNoaWxkV2luZG93KHBhcmVudFdpbiwgY2hpbGRXaW4pIHtcbiAgaWYgKCFJU19FU00pIHtcbiAgICBpbnN0YWxsRG9jQ29udGFpbnMoY2hpbGRXaW4pO1xuICAgIGluc3RhbGxET01Ub2tlbkxpc3QoY2hpbGRXaW4pO1xuICB9XG4gIC8vIFRoZSBhbm9ueW1vdXMgY2xhc3MgcGFyYW1ldGVyIGFsbG93cyB1cyB0byBkZXRlY3QgbmF0aXZlIGNsYXNzZXMgdnNcbiAgLy8gdHJhbnNwaWxlZCBjbGFzc2VzLlxuICBpZiAoIUlTX1NYRykge1xuICAgIGluc3RhbGxDdXN0b21FbGVtZW50cyhjaGlsZFdpbiwgY2xhc3Mge30pO1xuICAgIGluc3RhbGxJbnRlcnNlY3Rpb25PYnNlcnZlcihwYXJlbnRXaW4sIGNoaWxkV2luKTtcbiAgICBpbnN0YWxsUmVzaXplT2JzZXJ2ZXIocGFyZW50V2luLCBjaGlsZFdpbik7XG4gICAgaW5zdGFsbEFib3J0Q29udHJvbGxlcihjaGlsZFdpbik7XG4gIH1cbn1cblxuLyoqXG4gKiBTdGF0aWMgaW5zdGFsbGVycyB0aGF0IGNhbiBiZSBlYXNpbHkgc3R1YmJlZCBmb3IgdGVzdHMuXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIEluc3RhbGxlcnMge1xuICAvKipcbiAgICogSW5zdGFsbCBleHRlbnNpb25zIGluIHRoZSBjaGlsZCB3aW5kb3cgKGZyaWVuZGx5IGlmcmFtZSkuIFRoZSBwcmUtaW5zdGFsbFxuICAgKiBjYWxsYmFjaywgaWYgc3BlY2lmaWVkLCBpcyBleGVjdXRlZCBhZnRlciBwb2x5ZmlsbHMgaGF2ZSBiZWVuIGNvbmZpZ3VyZWRcbiAgICogYnV0IGJlZm9yZSB0aGUgZmlyc3QgZXh0ZW5zaW9uIGlzIGluc3RhbGxlZC5cbiAgICogQHBhcmFtIHshRnJpZW5kbHlJZnJhbWVFbWJlZH0gZW1iZWRcbiAgICogQHBhcmFtIHshLi9zZXJ2aWNlL2V4dGVuc2lvbnMtaW1wbC5FeHRlbnNpb25zfSBleHRlbnNpb25zU2VydmljZVxuICAgKiBAcGFyYW0geyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jRmllfSBhbXBkb2NcbiAgICogQHBhcmFtIHshQXJyYXk8e2V4dGVuc2lvbklkOiBzdHJpbmcsIGV4dGVuc2lvblZlcnNpb246IHN0cmluZ30+fSBleHRlbnNpb25zXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVdpbmRvdywgPy4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2M9KXx1bmRlZmluZWR9IHByZWluc3RhbGxDYWxsYmFja1xuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFQcm9taXNlKT19IG9wdF9pbnN0YWxsQ29tcGxldGVcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBzdGF0aWMgaW5zdGFsbEV4dGVuc2lvbnNJbkVtYmVkKFxuICAgIGVtYmVkLFxuICAgIGV4dGVuc2lvbnNTZXJ2aWNlLFxuICAgIGFtcGRvYyxcbiAgICBleHRlbnNpb25zLFxuICAgIHByZWluc3RhbGxDYWxsYmFjayxcbiAgICBvcHRfaW5zdGFsbENvbXBsZXRlXG4gICkge1xuICAgIGNvbnN0IGNoaWxkV2luID0gYW1wZG9jLndpbjtcbiAgICBjb25zdCBwYXJlbnRXaW4gPSB0b1dpbihjaGlsZFdpbi5mcmFtZUVsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldyk7XG4gICAgc2V0UGFyZW50V2luZG93KGNoaWxkV2luLCBwYXJlbnRXaW4pO1xuICAgIGNvbnN0IGdldERlbGF5UHJvbWlzZSA9IGdldERlbGF5UHJvbWlzZVByb2R1Y2VyKCk7XG5cbiAgICByZXR1cm4gZ2V0RGVsYXlQcm9taXNlKHVuZGVmaW5lZClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gSW5zdGFsbCBuZWNlc3NhcnkgcG9seWZpbGxzLlxuICAgICAgICBpbnN0YWxsUG9seWZpbGxzSW5DaGlsZFdpbmRvdyhwYXJlbnRXaW4sIGNoaWxkV2luKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihnZXREZWxheVByb21pc2UpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGlmIChJU19FU00pIHtcbiAgICAgICAgICAvLyBUT0RPOiBUaGlzIGlzIGNvbWJpbmVkIChhbXBkb2MgKyBzaGFyZWQpLCBub3QganVzdCBzaGFyZWRcbiAgICAgICAgICAvLyBjb25zdCBjc3MgPSBwYXJlbnRXaW4uZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3R5bGVbYW1wLXJ1bnRpbWVdJylcbiAgICAgICAgICAvLyAudGV4dENvbnRlbnQ7XG4gICAgICAgICAgaW5zdGFsbFN0eWxlc0ZvckRvYyhcbiAgICAgICAgICAgIGFtcGRvYyxcbiAgICAgICAgICAgIGFtcFNoYXJlZENzcyxcbiAgICAgICAgICAgIC8qIGNhbGxiYWNrICovIG51bGwsXG4gICAgICAgICAgICAvKiBvcHRfaXNSdW50aW1lQ3NzICovIHRydWUsXG4gICAgICAgICAgICAvKiBvcHRfZXh0ICovICdhbXAtcnVudGltZSdcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEluc3RhbGwgcnVudGltZSBzdHlsZXMuXG4gICAgICAgICAgaW5zdGFsbFN0eWxlc0ZvckRvYyhcbiAgICAgICAgICAgIGFtcGRvYyxcbiAgICAgICAgICAgIGFtcFNoYXJlZENzcyxcbiAgICAgICAgICAgIC8qIGNhbGxiYWNrICovIG51bGwsXG4gICAgICAgICAgICAvKiBvcHRfaXNSdW50aW1lQ3NzICovIHRydWUsXG4gICAgICAgICAgICAvKiBvcHRfZXh0ICovICdhbXAtcnVudGltZSdcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oZ2V0RGVsYXlQcm9taXNlKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAoIWNoaWxkV2luLmZyYW1lRWxlbWVudCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBSdW4gcHJlLWluc3RhbGwgY2FsbGJhY2suXG4gICAgICAgIGlmIChwcmVpbnN0YWxsQ2FsbGJhY2spIHtcbiAgICAgICAgICBwcmVpbnN0YWxsQ2FsbGJhY2soYW1wZG9jLndpbiwgYW1wZG9jKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKGdldERlbGF5UHJvbWlzZSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKCFjaGlsZFdpbi5mcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gSW5zdGFsbCBlbWJlZGRhYmxlIHN0YW5kYXJkIHNlcnZpY2VzLlxuICAgICAgICBJbnN0YWxsZXJzLmluc3RhbGxTdGFuZGFyZFNlcnZpY2VzSW5FbWJlZChhbXBkb2MpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGdldERlbGF5UHJvbWlzZSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKCFjaGlsZFdpbi5mcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXh0ZW5zaW9uc1NlcnZpY2UucHJlaW5zdGFsbEVtYmVkKGFtcGRvYywgZXh0ZW5zaW9ucyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZ2V0RGVsYXlQcm9taXNlKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAoIWNoaWxkV2luLmZyYW1lRWxlbWVudCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZWFkeSB0byBiZSBzaG93bi5cbiAgICAgICAgZW1iZWQuc3RhcnRSZW5kZXJfKCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZ2V0RGVsYXlQcm9taXNlKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAoIWNoaWxkV2luLmZyYW1lRWxlbWVudCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBJbnRlbnRpb25hbGx5IGRvIG5vdCB3YWl0IGZvciB0aGUgZnVsbCBpbnN0YWxsYXRpb24gdG8gY29tcGxldGUuXG4gICAgICAgIC8vIEl0J3MgZW5vdWdoIG9mIGluaXRpYWxpemF0aW9uIGRvbmUgdG8gcmV0dXJuIHRoZSBlbWJlZC5cbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGV4dGVuc2lvbnNTZXJ2aWNlLmluc3RhbGxFeHRlbnNpb25zSW5Eb2MoXG4gICAgICAgICAgYW1wZG9jLFxuICAgICAgICAgIGV4dGVuc2lvbnNcbiAgICAgICAgKTtcbiAgICAgICAgYW1wZG9jLnNldEV4dGVuc2lvbnNLbm93bigpO1xuICAgICAgICBpZiAob3B0X2luc3RhbGxDb21wbGV0ZSkge1xuICAgICAgICAgIG9wdF9pbnN0YWxsQ29tcGxldGUocHJvbWlzZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkb3B0IHByZWRlZmluZWQgY29yZSBzZXJ2aWNlcyBmb3IgdGhlIGVtYmVkZGVkIGFtcGRvYyAoZnJpZW5kbHkgaWZyYW1lKS5cbiAgICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBzdGF0aWMgaW5zdGFsbFN0YW5kYXJkU2VydmljZXNJbkVtYmVkKGFtcGRvYykge1xuICAgIGluc3RhbGxUaW1lckluRW1iZWRXaW5kb3coYW1wZG9jLndpbik7XG4gICAgaW5zdGFsbEFtcGRvY1NlcnZpY2VzRm9yRW1iZWQoYW1wZG9jKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/friendly-iframe-embed.js