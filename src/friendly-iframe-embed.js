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
import {LEGACY_ELEMENTS, stubLegacyElements} from './service/extensions-impl';
import {Observable} from './observable';
import {Services} from './services';
import {Signals} from './utils/signals';
import {cssText as ampDocCss} from '../build/ampdoc.css';
import {cssText as ampSharedCss} from '../build/ampshared.css';
import {
  copyElementToChildWindow,
  stubElementIfNotKnown,
  upgradeOrRegisterElement,
} from './service/custom-element-registry';
import {dev, rethrowAsync, userAssert} from './log';
import {
  disposeServicesForEmbed,
  getAmpdoc,
  getTopWindow,
  installServiceInEmbedIfEmbeddable,
  setParentWindow,
} from './service';
import {escapeHtml} from './dom';
import {getExperimentBranch, isExperimentOn} from './experiments';
import {getMode} from './mode';
import {installAmpdocServices} from './service/core-services';
import {install as installCustomElements} from './polyfills/custom-elements';
import {install as installDOMTokenListToggle} from './polyfills/domtokenlist-toggle';
import {install as installDocContains} from './polyfills/document-contains';
import {installCustomElements as installRegisterElement} from 'document-register-element/build/document-register-element.patched';
import {installStylesForDoc, installStylesLegacy} from './style-installer';
import {installTimerInEmbedWindow} from './service/timer-impl';
import {isDocumentReady} from './document-ready';
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

/** @const {!Array<string>} */
const EXCLUDE_INI_LOAD = [
  'AMP-AD',
  'AMP-ANALYTICS',
  'AMP-PIXEL',
  'AMP-AD-EXIT',
];

/**
 * @const {{experiment: string, control: string, branch: string}}
 */
export const FIE_CSS_CLEANUP_EXP = {
  branch: 'fie-css-cleanup',
  control: '21064213',
  experiment: '21064214',
};

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
 *   html: string,
 *   extensionIds: (?Array<string>|undefined),
 *   fonts: (?Array<string>|undefined),
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
 * Returns `true` if the Friendly Iframes are supported.
 * @return {boolean}
 */
function isSrcdocSupported() {
  if (srcdocSupported === undefined) {
    srcdocSupported = 'srcdoc' in HTMLIFrameElement.prototype;
  }
  return srcdocSupported;
}

/**
 * Sets whether the embed is currently visible. The interpretation of visibility
 * is up to the embed parent. However, most of typical cases would rely on
 * whether the embed is currently in the viewport.
 * @param {!FriendlyIframeEmbed} embed
 * @param {boolean} visible
 * TODO(dvoytenko): Re-evaluate and probably drop once layers are ready.
 */
export function setFriendlyIframeEmbedVisible(embed, visible) {
  embed.setVisible_(visible);
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
  const ampdocFieExperimentOn = isExperimentOn(win, 'ampdoc-fie');
  /** @const {?./service/ampdoc-impl.AmpDocService} */
  const ampdocService = ampdocFieExperimentOn
    ? Services.ampdocServiceFor(win)
    : null;

  setStyle(iframe, 'visibility', 'hidden');
  iframe.setAttribute('referrerpolicy', 'unsafe-url');

  // Pre-load extensions.
  if (spec.extensionIds) {
    spec.extensionIds.forEach(extensionId =>
      extensions.preloadExtension(extensionId)
    );
  }

  const html = mergeHtml(spec);

  // Receive the signal when iframe is ready: it's document is formed.
  iframe.onload = () => {
    // Chrome does not reflect the iframe readystate.
    iframe.readyState = 'complete';
  };
  const registerViolationListener = () => {
    iframe.contentWindow.addEventListener(
      'securitypolicyviolation',
      violationEvent => {
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
    childDoc.open();
    registerViolationListener();
    childDoc.write(html);
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
    readyPromise = new Promise(resolve => {
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
        .catch(error => {
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

    // Add extensions.
    if (ampdoc && ampdocFieExperimentOn) {
      embed.installExtensionsInFie(
        extensions,
        ampdoc,
        spec.extensionIds || [],
        opt_preinstallCallback
      );
    } else {
      embed.installExtensionsInChildWindow(
        extensions,
        childWin,
        spec.extensionIds || [],
        opt_preinstallCallback
      );
    }
    // Ready to be shown.
    embed.startRender_();
    return embed;
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
    spec.fonts.forEach(font => {
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

    /**
     * Starts out as invisible. The interpretation of this flag is up to
     * the emded parent.
     * @private {boolean}
     */
    this.visible_ = false;

    /** @private {!Observable<boolean>} */
    this.visibilityObservable_ = new Observable();

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
  }

  /**
   * Ensures that all resources from this iframe have been released.
   */
  destroy() {
    Services.resourcesForDoc(this.iframe).removeForChildWindow(this.win);
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
   * Whether the embed is currently visible. The interpretation of visibility
   * is up to the embed parent. However, most of typical cases would rely on
   * whether the embed is currently in the viewport.
   * @return {boolean}
   * TODO(dvoytenko): Re-evaluate and probably drop once layers are ready.
   */
  isVisible() {
    return this.visible_;
  }

  /**
   * See `isVisible` for more info.
   * @param {function(boolean)} handler
   * @return {!UnlistenDef}
   */
  onVisibilityChanged(handler) {
    return this.visibilityObservable_.add(handler);
  }

  /**
   * @param {boolean} visible
   * @private
   * @restricted
   */
  setVisible_(visible) {
    if (this.visible_ != visible) {
      this.visible_ = visible;
      this.visibilityObservable_.fire(this.visible_);
    }
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
   * @return {!./service/resources-impl.ResourcesDef}
   * @private
   */
  getResources_() {
    return Services.resourcesForDoc(this.iframe);
  }

  /**
   * Runs a measure/mutate cycle ensuring that the iframe change is propagated
   * to the resource manager.
   * @param {{measure: (function()|undefined), mutate: function()}} task
   * @return {!Promise}
   * @private
   */
  measureMutate_(task) {
    return this.getResources_().measureMutateElement(
      this.iframe,
      task.measure || null,
      task.mutate
    );
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

  /**
   * Install extensions in the child window (friendly iframe). The pre-install
   * callback, if specified, is executed after polyfills have been configured
   * but before the first extension is installed.
   * @param {!./service/extensions-impl.Extensions} extensions
   * @param {!./service/ampdoc-impl.AmpDocFie} ampdoc
   * @param {!Array<string>} extensionIds
   * @param {function(!Window, ?./service/ampdoc-impl.AmpDoc=)=} opt_preinstallCallback
   * @return {!Promise}
   * @visibleForTesting
   */
  installExtensionsInFie(
    extensions,
    ampdoc,
    extensionIds,
    opt_preinstallCallback
  ) {
    const topWin = extensions.win;
    const childWin = ampdoc.win;
    const parentWin = toWin(childWin.frameElement.ownerDocument.defaultView);
    setParentWindow(childWin, parentWin);

    // Install necessary polyfills.
    installPolyfillsInChildWindow(parentWin, childWin);

    // Install runtime styles.
    installStylesForDoc(
      ampdoc,
      getExperimentBranch(this.win, FIE_CSS_CLEANUP_EXP.branch) ===
        FIE_CSS_CLEANUP_EXP.experiment
        ? ampSharedCss
        : ampDocCss + ampSharedCss,
      /* callback */ null,
      /* opt_isRuntimeCss */ true,
      /* opt_ext */ 'amp-runtime'
    );

    // Run pre-install callback.
    if (opt_preinstallCallback) {
      opt_preinstallCallback(ampdoc.win, ampdoc);
    }

    // Install embeddable standard services.
    installStandardServicesInEmbeddedDoc(ampdoc);

    // Install built-ins and legacy elements.
    copyBuiltinElementsToChildWindow(topWin, childWin);
    stubLegacyElements(childWin);

    return Promise.all(
      extensionIds.map(extensionId => {
        // This will extend automatic upgrade of custom elements from top
        // window to the child window.
        if (!LEGACY_ELEMENTS.includes(extensionId)) {
          stubElementIfNotKnown(childWin, extensionId);
        }
        return extensions.installExtensionInDoc(ampdoc, extensionId);
      })
    );
  }

  /**
   * Install extensions in the child window (friendly iframe). The pre-install
   * callback, if specified, is executed after polyfills have been configured
   * but before the first extension is installed.
   * @param {!./service/extensions-impl.Extensions} extensions
   * @param {!Window} childWin
   * @param {!Array<string>} extensionIds
   * @param {function(!Window, ?./service/ampdoc-impl.AmpDoc=)=} opt_preinstallCallback
   * @return {!Promise}
   * @visibleForTesting
   */
  installExtensionsInChildWindow(
    extensions,
    childWin,
    extensionIds,
    opt_preinstallCallback
  ) {
    const topWin = extensions.win;
    const parentWin = toWin(childWin.frameElement.ownerDocument.defaultView);
    setParentWindow(childWin, parentWin);

    // Install necessary polyfills.
    installPolyfillsInChildWindow(parentWin, childWin);

    // Install runtime styles.
    installStylesLegacy(
      childWin.document,
      getExperimentBranch(this.win, FIE_CSS_CLEANUP_EXP.branch) ===
        FIE_CSS_CLEANUP_EXP.experiment
        ? ampSharedCss
        : ampDocCss + ampSharedCss,
      /* callback */ null,
      /* opt_isRuntimeCss */ true,
      /* opt_ext */ 'amp-runtime'
    );

    // Run pre-install callback.
    if (opt_preinstallCallback) {
      opt_preinstallCallback(childWin);
    }

    // Install embeddable standard services.
    installStandardServicesInEmbed(childWin);

    // Install built-ins and legacy elements.
    copyBuiltinElementsToChildWindow(topWin, childWin);
    stubLegacyElements(childWin);

    const promises = [];
    extensionIds.forEach(extensionId => {
      // This will extend automatic upgrade of custom elements from top
      // window to the child window.
      if (!LEGACY_ELEMENTS.includes(extensionId)) {
        stubElementIfNotKnown(childWin, extensionId);
      }

      // Install CSS.
      const promise = extensions
        .preloadExtension(extensionId)
        .then(extension => {
          // Adopt embeddable extension services.
          extension.services.forEach(service => {
            installServiceInEmbedIfEmbeddable(childWin, service.serviceClass);
          });

          // Adopt the custom elements.
          let elementPromises = null;
          for (const elementName in extension.elements) {
            const elementDef = extension.elements[elementName];
            const elementPromise = new Promise(resolve => {
              if (elementDef.css) {
                installStylesLegacy(
                  childWin.document,
                  elementDef.css,
                  /* completeCallback */ resolve,
                  /* isRuntime */ false,
                  extensionId
                );
              } else {
                resolve();
              }
            }).then(() => {
              upgradeOrRegisterElement(
                childWin,
                elementName,
                elementDef.implementationClass
              );
            });
            if (elementPromises) {
              elementPromises.push(elementPromise);
            } else {
              elementPromises = [elementPromise];
            }
          }
          if (elementPromises) {
            return Promise.all(elementPromises).then(() => extension);
          }
          return extension;
        });
      promises.push(promise);
    });
    return Promise.all(promises);
  }
}

/**
 * Returns the promise that will be resolved when all content elements
 * have been loaded in the initially visible set.
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {!Window} hostWin
 * @param {!./layout-rect.LayoutRectDef} rect
 * @return {!Promise}
 */
export function whenContentIniLoad(elementOrAmpDoc, hostWin, rect) {
  return Services.resourcesForDoc(elementOrAmpDoc)
    .getResourcesInRect(hostWin, rect)
    .then(resources => {
      const promises = [];
      resources.forEach(r => {
        if (!EXCLUDE_INI_LOAD.includes(r.element.tagName)) {
          promises.push(r.loadedOnce());
        }
      });
      return Promise.all(promises);
    });
}

/**
 * Install polyfills in the child window (friendly iframe).
 * @param {!Window} parentWin
 * @param {!Window} childWin
 * @suppress {suspiciousCode}
 */
function installPolyfillsInChildWindow(parentWin, childWin) {
  installDocContains(childWin);
  installDOMTokenListToggle(childWin);
  // TODO(jridgewell): Ship custom-elements-v1. For now, we use this hack so it
  // is DCE'd from production builds. Note: When the hack is removed, remove the
  // @suppress {suspiciousCode} annotation at the top of this function.
  if (
    (false && isExperimentOn(parentWin, 'custom-elements-v1')) ||
    getMode().test
  ) {
    installCustomElements(childWin);
  } else {
    installRegisterElement(childWin, 'auto');
  }
}

/**
 * Copy builtins to a child window.
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
function copyBuiltinElementsToChildWindow(parentWin, childWin) {
  copyElementToChildWindow(parentWin, childWin, 'amp-img');
  copyElementToChildWindow(parentWin, childWin, 'amp-pixel');
}

/**
 * Adopt predefined core services for the embedded ampdoc (friendly iframe).
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
function installStandardServicesInEmbeddedDoc(ampdoc) {
  installAmpdocServices(ampdoc);
  installTimerInEmbedWindow(ampdoc.win);
}

/**
 * Adopt predefined core services for the child window (friendly iframe).
 * @param {!Window} childWin
 * @visibleForTesting
 */
export function installStandardServicesInEmbed(childWin) {
  // TODO(#22733): remove when ampdoc-fie is launched.
  const frameElement = dev().assertElement(
    childWin.frameElement,
    'frameElement not found for embed'
  );
  const standardServices = [
    // The order of service adoptations is important.
    Services.urlForDoc(frameElement),
    Services.actionServiceForDoc(frameElement),
    Services.standardActionsForDoc(frameElement),
    Services.navigationForDoc(frameElement),
  ];
  const ampdoc = getAmpdoc(frameElement);
  standardServices.forEach(service => {
    // Static functions must be invoked on the class, not the instance.
    service.constructor.installInEmbedWindow(childWin, ampdoc);
  });
  installTimerInEmbedWindow(childWin);
}
