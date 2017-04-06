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
import {Observable} from './observable';
import {Signals} from './utils/signals';
import {dev, rethrowAsync} from './log';
import {disposeServicesForEmbed, getTopWindow} from './service';
import {escapeHtml} from './dom';
import {extensionsFor} from './services';
import {isDocumentReady} from './document-ready';
import {layoutRectLtwh} from './layout-rect';
import {loadPromise} from './event-helper';
import {resourcesForDoc} from './services';
import {setStyle, setStyles} from './style';


/** @const {string} */
const EMBED_PROP = '__AMP_EMBED__';

/** @const {!Array<string>} */
const EXCLUDE_INI_LOAD = ['AMP-AD', 'AMP-ANALYTICS', 'AMP-PIXEL'];


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
 * @visiblefortesting
 */
let srcdocSupported;

/**
 * @param {boolean|undefined} val
 * @visiblefortesting
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
 * @restricted
 * TODO(dvoytenko): Re-evaluate and probably drop once layers are ready.
 */
export function setFriendlyIframeEmbedVisible(embed, visible) {
  embed.setVisible_(visible);
}


/**
 * Returns the embed created using `installFriendlyIframeEmbed` or `null`.
 * @param {!HTMLIFrameElement} iframe
 * @return {?FriendlyIframeEmbed}
 */
export function getFriendlyIframeEmbedOptional(iframe) {
  return /** @type {?FriendlyIframeEmbed} */ (iframe[EMBED_PROP]);
}


/**
 * Creates the requested "friendly iframe" embed. Returns the promise that
 * will be resolved as soon as the embed is available. The actual
 * initialization of the embed will start as soon as the `iframe` is added
 * to the DOM.
 * @param {!HTMLIFrameElement} iframe
 * @param {!Element} container
 * @param {!FriendlyIframeSpec} spec
 * @param {function(!Window)=} opt_preinstallCallback
 * @return {!Promise<!FriendlyIframeEmbed>}
 */
export function installFriendlyIframeEmbed(iframe, container, spec,
    opt_preinstallCallback) {
  /** @const {!Window} */
  const win = getTopWindow(iframe.ownerDocument.defaultView);
  /** @const {!./service/extensions-impl.Extensions} */
  const extensions = extensionsFor(win);

  setStyle(iframe, 'visibility', 'hidden');
  iframe.setAttribute('referrerpolicy', 'unsafe-url');

  // Pre-load extensions.
  if (spec.extensionIds) {
    spec.extensionIds.forEach(
        extensionId => extensions.loadExtension(extensionId));
  }

  const html = mergeHtml(spec);

  // Receive the signal when iframe is ready: it's document is formed.
  iframe.onload = () => {
    // Chrome does not reflect the iframe readystate.
    iframe.readyState = 'complete';
  };
  let loadedPromise;
  if (isSrcdocSupported()) {
    iframe.srcdoc = html;
    loadedPromise = loadPromise(iframe);
    container.appendChild(iframe);
  } else {
    iframe.src = 'about:blank';
    container.appendChild(iframe);
    const childDoc = iframe.contentWindow.document;
    childDoc.open();
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
      loadedPromise.catch(error => {
        rethrowAsync(error);
      }).then(() => {
        resolve();
        win.clearInterval(interval);
      });
    });
  }

  return readyPromise.then(() => {
    const embed = new FriendlyIframeEmbed(iframe, spec, loadedPromise);
    iframe[EMBED_PROP] = embed;

    const childWin = /** @type {!Window} */ (iframe.contentWindow);
    // Add extensions.
    extensions.installExtensionsInChildWindow(
        childWin, spec.extensionIds || [], opt_preinstallCallback);
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
  return !!(childDoc &&
      isDocumentReady(childDoc) &&
      childDoc.body &&
      childDoc.body.firstChild);
}


/**
 * Merges base and fonts into html document.
 * @param {!FriendlyIframeSpec} spec
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
          `<link href="${escapeHtml(font)}" rel="stylesheet" type="text/css">`);
    });
  }

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
 */
export class FriendlyIframeEmbed {

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {!FriendlyIframeSpec} spec
   * @param {!Promise} loadedPromise
   */
  constructor(iframe, spec, loadedPromise) {
    /** @const {!HTMLIFrameElement} */
    this.iframe = iframe;

    /** @const {!Window} */
    this.win = /** @type{!Window} */(iframe.contentWindow);

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
    this.signals_ = this.host ? this.host.signals() : new Signals();

    /** @private @const {!Promise} */
    this.winLoadedPromise_ = Promise.all([loadedPromise, this.whenReady()]);
  }

  /**
   * Ensures that all resources from this iframe have been released.
   */
  destroy() {
    resourcesForDoc(this.iframe).removeForChildWindow(this.win);
    disposeServicesForEmbed(this.win);
  }

  /**
   * @return {time}
   */
  getStartTime() {
    return this.startTime_;
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

  /** @private */
  startRender_() {
    if (this.host) {
      this.host.renderStarted();
    } else {
      this.signals_.signal(CommonSignals.RENDER_START);
    }
    setStyle(this.iframe, 'visibility', '');
    if (this.win.document && this.win.document.body) {
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
          0, 0,
          this.win./*OK*/innerWidth,
          this.win./*OK*/innerHeight);
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
   */
  setVisible_(visible) {
    if (this.visible_ != visible) {
      this.visible_ = visible;
      this.visibilityObservable_.fire(this.visible_);
    }
  }
}


/**
 * Returns the promise that will be resolved when all content elements
 * have been loaded in the initially visible set.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} context
 * @param {!Window} hostWin
 * @param {!./layout-rect.LayoutRectDef} rect
 * @return {!Promise}
 */
export function whenContentIniLoad(context, hostWin, rect) {
  return resourcesForDoc(context)
      .getResourcesInRect(hostWin, rect)
      .then(resources => {
        const promises = [];
        resources.forEach(r => {
          if (EXCLUDE_INI_LOAD.indexOf(r.element.tagName) == -1) {
            promises.push(r.loadedOnce());
          }
        });
        return Promise.all(promises);
      });
}
