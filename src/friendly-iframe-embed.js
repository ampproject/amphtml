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

import {CommonSignals} from './common-signals';
import {FIE_EMBED_PROP} from './iframe-helper';
import {LegacyInstaller} from './friendly-iframe-embed-legacy';
import {Services} from './services';
import {Signals} from './utils/signals';
import {cssText as ampSharedCss} from '../build/ampshared.css';
import {dev, devAssert, rethrowAsync, userAssert} from './log';
import {
  disposeServicesForEmbed,
  getTopWindow,
  setParentWindow,
} from './service';
import {escapeHtml} from './dom';
import {installAmpdocServices} from './service/core-services';
import {install as installCustomElements} from './polyfills/custom-elements';
import {install as installDOMTokenList} from './polyfills/domtokenlist';
import {install as installDocContains} from './polyfills/document-contains';
import {installForChildWin as installIntersectionObserver} from './polyfills/intersection-observer';
import {installStylesForDoc} from './style-installer';
import {installTimerInEmbedWindow} from './service/timer-impl';
import {isDocumentReady} from './document-ready';
import {isInAmpdocFieExperiment} from './ampdoc-fie';
import {layoutRectLtwh, moveLayoutRect} from './layout-rect';
import {loadPromise} from './event-helper';
import {
  px,
  resetStyles,
  setImportantStyles,
  setStyle,
  setStyles,
} from './style';
import {toWin} from './types';
import {whenContentIniLoad} from './ini-load';

/**
 * Parameters used to create the new "friendly iframe" embed.
 * - html: The complete content of an AMP embed, which is itself an AMP
 *   document. Can include whatever is normally allowed in an AMP document,
 *   except for AMP `<script>` declarations. Those should be passed as an
 *   array of `extensionIds`.
 * - extensionsIds: An optional array of AMP extension IDs used in this embed.
 * - fonts: An optional array of fonts used in this embed.
 *
 * @typedef {{
 *   host: (?AmpElement|undefined),
 *   url: string,
 *   html: ?string,
 *   extensionIds: (?Array<string>|undefined),
 *   fonts: (?Array<string>|undefined),
 *   skipHtmlMerge: (boolean|undefined),
 * }}
 */
export let FriendlyIframeSpec;

/**
 * @type {boolean|undefined}
 * @visibleForTesting
 */
let srcdocSupported;

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
  return (val) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(val), 1);
    });
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
export function installFriendlyIframeEmbed(
  iframe,
  container,
  spec,
  opt_preinstallCallback // TODO(#22733): remove "window" argument.
) {
  /** @const {!Window} */
  const win = getTopWindow(toWin(iframe.ownerDocument.defaultView));
  /** @const {!./service/extensions-impl.Extensions} */
  const extensions = Services.extensionsFor(win);
  const ampdocFieExperimentOn = isInAmpdocFieExperiment(win);
  /** @const {?./service/ampdoc-impl.AmpDocService} */
  const ampdocService = ampdocFieExperimentOn
    ? Services.ampdocServiceFor(win)
    : null;

  setStyle(iframe, 'visibility', 'hidden');
  iframe.setAttribute('referrerpolicy', 'unsafe-url');
  iframe.setAttribute('marginheight', '0');
  iframe.setAttribute('marginwidth', '0');

  // Pre-load extensions.
  if (spec.extensionIds) {
    spec.extensionIds.forEach((extensionId) =>
      extensions.preloadExtension(extensionId)
    );
  }

  const html = spec.skipHtmlMerge ? spec.html : mergeHtml(spec);
  // Receive the signal when iframe is ready: it's document is formed.
  iframe.onload = () => {
    // Chrome does not reflect the iframe readystate.
    iframe.readyState = 'complete';
  };
  const registerViolationListener = () => {
    iframe.contentWindow.addEventListener(
      'securitypolicyviolation',
      (violationEvent) => {
        dev().warn('FIE', 'security policy violation', violationEvent);
      }
    );
  };
  let loadedPromise;
  if (isSrcdocSupported()) {
    iframe.srcdoc = html;
    loadedPromise = loadPromise(iframe);
    container.appendChild(iframe);
    registerViolationListener();
  } else {
    iframe.src = 'about:blank';
    container.appendChild(iframe);
    const childDoc = iframe.contentWindow.document;
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
  let readyPromise;
  if (isIframeReady(iframe)) {
    readyPromise = Promise.resolve();
  } else {
    readyPromise = new Promise((resolve) => {
      /** @const {number} */
      const interval = win.setInterval(() => {
        if (isIframeReady(iframe)) {
          resolve();
          win.clearInterval(interval);
        }
      }, /* milliseconds */ 5);

      // For safety, make sure we definitely stop polling when child doc is
      // loaded.
      loadedPromise
        .catch((error) => {
          rethrowAsync(error);
        })
        .then(() => {
          resolve();
          win.clearInterval(interval);
        });
    });
  }

  return readyPromise.then(() => {
    const childWin = /** @type {!Window} */ (iframe.contentWindow);
    const signals = spec.host && spec.host.signals();
    const ampdoc =
      ampdocFieExperimentOn && ampdocService
        ? ampdocService.installFieDoc(spec.url, childWin, {signals})
        : null;
    const embed = new FriendlyIframeEmbed(iframe, spec, loadedPromise, ampdoc);
    iframe[FIE_EMBED_PROP] = embed;

    // Window might have been destroyed.
    if (!childWin.frameElement) {
      return null;
    }

    // Add extensions.
    const extensionIds = spec.extensionIds || [];
    if (ampdoc && ampdocFieExperimentOn) {
      return installExtensionsInEmbed(
        embed,
        extensions,
        ampdoc,
        extensionIds,
        opt_preinstallCallback
      ).then(() => {
        if (!childWin.frameElement) {
          return null;
        }
        return embed;
      });
    } else {
      return LegacyInstaller.installExtensionsInChildWindow(
        extensions,
        childWin,
        extensionIds,
        opt_preinstallCallback,
        () => embed.startRender_()
      ).then(() => {
        if (!childWin.frameElement) {
          return null;
        }
        return embed;
      });
    }
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
  const childDoc = iframe.contentWindow && iframe.contentWindow.document;
  return !!(
    childDoc &&
    isDocumentReady(childDoc) &&
    childDoc.body &&
    childDoc.body.firstChild
  );
}

/**
 * Merges base and fonts into html document.
 * @param {!FriendlyIframeSpec} spec
 * @return {string}
 */
function mergeHtml(spec) {
  const originalHtml = spec.html;
  const originalHtmlUp = originalHtml.toUpperCase();

  // Find the insertion point.
  let ip = originalHtmlUp.indexOf('<HEAD');
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

  const result = [];

  // Preambule.
  if (ip > 0) {
    result.push(originalHtml.substring(0, ip));
  }

  // Add <BASE> tag.
  result.push(`<base href="${escapeHtml(spec.url)}">`);

  // Load fonts.
  if (spec.fonts) {
    spec.fonts.forEach((font) => {
      result.push(
        `<link href="${escapeHtml(font)}" rel="stylesheet" type="text/css">`
      );
    });
  }

  // Load CSP
  result.push(
    '<meta http-equiv=Content-Security-Policy ' +
      "content=\"script-src 'none';object-src 'none';child-src 'none'\">"
  );

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
export class FriendlyIframeEmbed {
  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {!FriendlyIframeSpec} spec
   * @param {!Promise} loadedPromise
   * @param {?./service/ampdoc-impl.AmpDocFie} ampdoc
   */
  constructor(iframe, spec, loadedPromise, ampdoc) {
    /** @const {!HTMLIFrameElement} */
    this.iframe = iframe;

    /** @const {!Window} */
    this.win = /** @type {!Window} */ (iframe.contentWindow);

    /** @const {?./service/ampdoc-impl.AmpDocFie} */
    this.ampdoc = ampdoc;

    /** @const {!FriendlyIframeSpec} */
    this.spec = spec;

    /** @const {?AmpElement} */
    this.host = spec.host || null;

    /** @const @private {time} */
    this.startTime_ = Date.now();

    /** @private @const */
    this.signals_ = this.ampdoc
      ? this.ampdoc.signals()
      : this.host
      ? this.host.signals()
      : new Signals();

    /** @private @const {!Promise} */
    this.winLoadedPromise_ = Promise.all([loadedPromise, this.whenReady()]);
    if (this.ampdoc) {
      this.whenReady().then(() => this.ampdoc.setReady());
    }

    this.win.addEventListener('resize', () => this.handleResize_());
  }

  /**
   * Ensures that all resources from this iframe have been released.
   */
  destroy() {
    this.removeResources_();
    disposeServicesForEmbed(this.win);
    if (this.ampdoc) {
      this.ampdoc.dispose();
    }
  }

  /**
   * @return {time}
   */
  getStartTime() {
    return this.startTime_;
  }

  /**
   * Returns the base URL for the embedded document.
   * @return {string}
   */
  getUrl() {
    return this.spec.url;
  }

  /** @return {!Signals} */
  signals() {
    return this.signals_;
  }

  /**
   * Returns a promise that will resolve when the embed document is ready.
   * Notice that this signal coincides with the embed's `render-start`.
   * @return {!Promise}
   */
  whenReady() {
    return this.signals_.whenSignal(CommonSignals.RENDER_START);
  }

  /**
   * Returns a promise that will resolve when the child window's `onload` event
   * has been emitted. In friendly iframes this typically only includes font
   * loading.
   * @return {!Promise}
   */
  whenWindowLoaded() {
    return this.winLoadedPromise_;
  }

  /**
   * Returns a promise that will resolve when the initial load  of the embed's
   * content has been completed.
   * @return {!Promise}
   */
  whenIniLoaded() {
    return this.signals_.whenSignal(CommonSignals.INI_LOAD);
  }

  /**
   * @private
   * @restricted
   */
  startRender_() {
    if (this.host) {
      this.host.renderStarted();
    } else {
      this.signals_.signal(CommonSignals.RENDER_START);
    }
    // Common signal RENDER_START indicates time to toggle visibility
    setStyle(this.iframe, 'visibility', '');
    if (this.win.document && this.win.document.body) {
      this.win.document.documentElement.classList.add('i-amphtml-fie');
      setStyles(dev().assertElement(this.win.document.body), {
        opacity: 1,
        visibility: 'visible',
        animation: 'none',
      });
    }

    // Initial load signal signal.
    let rect;
    if (this.host) {
      rect = this.host.getLayoutBox();
    } else {
      rect = layoutRectLtwh(
        0,
        0,
        this.win./*OK*/ innerWidth,
        this.win./*OK*/ innerHeight
      );
    }
    Promise.all([
      this.whenReady(),
      whenContentIniLoad(this.iframe, this.win, rect),
    ]).then(() => {
      this.signals_.signal(CommonSignals.INI_LOAD);
    });
  }

  /**
   * @return {!HTMLBodyElement}
   * @visibleForTesting
   */
  getBodyElement() {
    return /** @type {!HTMLBodyElement} */ ((
      this.iframe.contentDocument || this.iframe.contentWindow.document
    ).body);
  }

  /**
   * Force remeasure inside FIE doc when iframe is resized.
   * @private
   */
  handleResize_() {
    this.getMutator_().mutateElement(
      this.win.document.documentElement,
      () => {} // NOOP.
    );
  }

  /**
   * @return {!./service/resources-interface.ResourcesInterface}
   * @private
   */
  getResources_() {
    const host =
      this.host && !this.iframe.isConnected ? this.host : this.iframe;
    return Services.resourcesForDoc(host);
  }

  /**
   * @return {!./service/mutator-interface.MutatorInterface}
   * @private
   */
  getMutator_() {
    return Services.mutatorForDoc(this.iframe);
  }

  /**
   * Runs a measure/mutate cycle ensuring that the iframe change is propagated
   * to the resource manager.
   * @param {{measure: (function()|undefined), mutate: function()}} task
   * @return {!Promise}
   * @private
   */
  measureMutate_(task) {
    return this.getMutator_().measureMutateElement(
      this.iframe,
      task.measure || null,
      task.mutate
    );
  }

  /**
   * Removes all resources belonging to the FIE window.
   * @private
   */
  removeResources_() {
    const resources = this.getResources_();
    const toRemove = resources
      .get()
      .filter((resource) => resource.hostWin == this.win);
    toRemove.forEach((resource) => {
      resources.remove(resource.element);
      resource.disconnect();
    });
  }

  /**
   * @return {!Promise}
   */
  enterFullOverlayMode() {
    const ampAdParent = dev().assertElement(this.iframe.parentNode);

    // Security assertion. Otherwise any 3p frame could request lighbox mode.
    userAssert(
      ampAdParent.tagName.toLowerCase() == 'amp-ad',
      'Only <amp-ad> is allowed to enter lightbox mode.'
    );

    let bodyStyle;

    return this.measureMutate_({
      measure: () => {
        const rect = this.host
          ? this.host.getLayoutBox()
          : this.iframe./*OK*/ getBoundingClientRect();

        // Offset by scroll top as iframe will be position: fixed.
        const dy = -Services.viewportForDoc(this.iframe).getScrollTop();
        const {top, left, width, height} = moveLayoutRect(rect, /* dx */ 0, dy);

        // Offset body by header height to prevent visual jump.
        bodyStyle = {
          top: px(top),
          left: px(left),
          width: px(width),
          height: px(height),
        };
      },
      mutate: () => {
        // !important to prevent abuse e.g. box @ ltwh = 0, 0, 0, 0
        setImportantStyles(this.iframe, {
          'position': 'fixed',
          'left': 0,
          'right': 0,
          'bottom': 0,
          'width': '100vw',
          'top': 0,
          'height': '100vh',
        });

        // We need to override runtime-level !important rules
        setImportantStyles(this.getBodyElement(), {
          'background': 'transparent',
          'position': 'absolute',
          'bottom': 'auto',
          'right': 'auto',

          // Read during vsync measure phase.
          'top': bodyStyle.top,
          'left': bodyStyle.left,
          'width': bodyStyle.width,
          'height': bodyStyle.height,
        });
      },
    });
  }

  /**
   * @return {!Promise}
   */
  leaveFullOverlayMode() {
    return this.measureMutate_({
      mutate: () => {
        resetStyles(this.iframe, [
          'position',
          'left',
          'right',
          'top',
          'bottom',
          'width',
          'height',
        ]);

        // we're not resetting background here as we need to set it to
        // transparent permanently.
        resetStyles(this.getBodyElement(), [
          'position',
          'top',
          'left',
          'width',
          'height',
          'bottom',
          'right',
        ]);
      },
    });
  }
}

/**
 * Install extensions in the child window (friendly iframe). The pre-install
 * callback, if specified, is executed after polyfills have been configured
 * but before the first extension is installed.
 * @param {!FriendlyIframeEmbed} embed
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {!./service/ampdoc-impl.AmpDocFie} ampdoc
 * @param {!Array<string>} extensionIds
 * @param {function(!Window, ?./service/ampdoc-impl.AmpDoc=)|undefined} preinstallCallback
 * @param {function(!Promise)=} opt_installComplete
 * @return {!Promise}
 * @visibleForTesting
 */
export function installExtensionsInEmbed(
  embed,
  extensions,
  ampdoc,
  extensionIds,
  preinstallCallback,
  opt_installComplete
) {
  const childWin = ampdoc.win;
  const parentWin = toWin(childWin.frameElement.ownerDocument.defaultView);
  setParentWindow(childWin, parentWin);
  const getDelayPromise = getDelayPromiseProducer();

  return getDelayPromise(undefined)
    .then(() => {
      // Install necessary polyfills.
      installPolyfillsInChildWindow(parentWin, childWin);
    })
    .then(getDelayPromise)
    .then(() => {
      // Install runtime styles.
      installStylesForDoc(
        ampdoc,
        ampSharedCss,
        /* callback */ null,
        /* opt_isRuntimeCss */ true,
        /* opt_ext */ 'amp-runtime'
      );
    })
    .then(getDelayPromise)
    .then(() => {
      if (!childWin.frameElement) {
        return;
      }
      // Run pre-install callback.
      if (preinstallCallback) {
        preinstallCallback(ampdoc.win, ampdoc);
      }
    })
    .then(getDelayPromise)
    .then(() => {
      if (!childWin.frameElement) {
        return;
      }
      // Install embeddable standard services.
      Installers.installStandardServicesInEmbed(ampdoc);
    })
    .then(getDelayPromise)
    .then(() => {
      if (!childWin.frameElement) {
        return;
      }
      extensions.preinstallEmbed(ampdoc, extensionIds);
    })
    .then(getDelayPromise)
    .then(() => {
      if (!childWin.frameElement) {
        return;
      }
      // Ready to be shown.
      embed.startRender_();
    })
    .then(getDelayPromise)
    .then(() => {
      if (!childWin.frameElement) {
        return;
      }
      // Intentionally do not wait for the full installation to complete.
      // It's enough of initialization done to return the embed.
      const promise = extensions.installExtensionsInDoc(ampdoc, extensionIds);
      if (opt_installComplete) {
        opt_installComplete(promise);
      }
    });
}

/**
 * Install polyfills in the child window (friendly iframe).
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
function installPolyfillsInChildWindow(parentWin, childWin) {
  installDocContains(childWin);
  installDOMTokenList(childWin);
  // The anonymous class parameter allows us to detect native classes vs
  // transpiled classes.
  if(!IS_SXG){
    installCustomElements(childWin, class {});
  }
  installIntersectionObserver(parentWin, childWin);
}

/**
 * Static installers that can be easily stubbed for tests.
 * @visibleForTesting
 */
export class Installers {
  /**
   * Adopt predefined core services for the embedded ampdoc (friendly iframe).
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   */
  static installStandardServicesInEmbed(ampdoc) {
    installAmpdocServices(ampdoc);
    installTimerInEmbedWindow(ampdoc.win);
  }
}
