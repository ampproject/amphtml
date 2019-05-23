/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from './services';
import {dev, devAssert, rethrowAsync} from './log';
import {insertAfterOrAtStart, waitForBodyOpenPromise} from './dom';
import {map} from './utils/object';
import {setStyles} from './style';
import {waitForServices} from './render-delaying-services';

const TRANSFORMER_PROP = '__AMP_CSS_TR';
const STYLE_MAP_PROP = '__AMP_CSS_SM';

/**
 * Adds the given css text to the given ampdoc.
 *
 * The style tags will be at the beginning of the head before all author
 * styles. One element can be the main runtime CSS. This is guaranteed
 * to always be the first stylesheet in the doc.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc The ampdoc that should get the new styles.
 * @param {string} cssText
 * @param {?function(!Element)|undefined} cb Called when the new styles are available.
 *     Not using a promise, because this is synchronous when possible.
 *     for better performance.
 * @param {boolean=} opt_isRuntimeCss If true, this style tag will be inserted
 *     as the first element in head and all style elements will be positioned
 *     after.
 * @param {string=} opt_ext
 * @return {!Element}
 */
export function installStylesForDoc(
  ampdoc,
  cssText,
  cb,
  opt_isRuntimeCss,
  opt_ext
) {
  const cssRoot = ampdoc.getHeadNode();
  const style = insertStyleElement(
    cssRoot,
    maybeTransform(cssRoot, cssText),
    opt_isRuntimeCss || false,
    opt_ext || null
  );

  if (cb) {
    const rootNode = ampdoc.getRootNode();
    // Styles aren't always available synchronously. E.g. if there is a
    // pending style download, it will have to finish before the new
    // style is visible.
    // For this reason we poll until the style becomes available.
    // Sync case.
    if (styleLoaded(rootNode, style)) {
      cb(style);
      return style;
    }
    // Poll until styles are available.
    const interval = setInterval(() => {
      if (styleLoaded(rootNode, style)) {
        clearInterval(interval);
        cb(style);
      }
    }, 4);
  }
  return style;
}

/**
 * Adds the given css text to the given document.
 * TODO(dvoytenko, #10705): Remove this method once FIE/ampdoc migration is
 * done.
 *
 * @param {!Document} doc The document that should get the new styles.
 * @param {string} cssText
 * @param {?function(!Element)|undefined} cb Called when the new styles are
 *     available. Not using a promise, because this is synchronous when
 *     possible. for better performance.
 * @param {boolean=} opt_isRuntimeCss If true, this style tag will be inserted
 *     as the first element in head and all style elements will be positioned
 *     after.
 * @param {string=} opt_ext
 * @return {!Element}
 */
export function installStylesLegacy(
  doc,
  cssText,
  cb,
  opt_isRuntimeCss,
  opt_ext
) {
  const style = insertStyleElement(
    dev().assertElement(doc.head),
    cssText,
    opt_isRuntimeCss || false,
    opt_ext || null
  );

  if (cb) {
    // Styles aren't always available synchronously. E.g. if there is a
    // pending style download, it will have to finish before the new
    // style is visible.
    // For this reason we poll until the style becomes available.
    // Sync case.
    if (styleLoaded(doc, style)) {
      cb(style);
      return style;
    }
    // Poll until styles are available.
    const interval = setInterval(() => {
      if (styleLoaded(doc, style)) {
        clearInterval(interval);
        cb(style);
      }
    }, 4);
  }
  return style;
}

/**
 * Creates the properly configured style element.
 * @param {!Element|!ShadowRoot} cssRoot
 * @param {string} cssText
 * @param {boolean} isRuntimeCss
 * @param {?string} ext
 * @return {!Element}
 */
function insertStyleElement(cssRoot, cssText, isRuntimeCss, ext) {
  let styleMap = cssRoot[STYLE_MAP_PROP];
  if (!styleMap) {
    styleMap = cssRoot[STYLE_MAP_PROP] = map();
  }

  const isExtCss =
    !isRuntimeCss && (ext && ext != 'amp-custom' && ext != 'amp-keyframes');
  const key = isRuntimeCss
    ? 'amp-runtime'
    : isExtCss
    ? `amp-extension=${ext}`
    : null;

  // Check if it has already been created or discovered.
  if (key) {
    const existing = getExistingStyleElement(cssRoot, styleMap, key);
    if (existing) {
      if (existing.textContent !== cssText) {
        existing.textContent = cssText;
      }
      return existing;
    }
  }

  // Create the new style element and append to cssRoot.
  const doc = cssRoot.ownerDocument || cssRoot;
  const style = doc.createElement('style');
  style./*OK*/ textContent = cssText;
  let afterElement = null;
  // Make sure that we place style tags after the main runtime CSS. Otherwise
  // the order is random.
  if (isRuntimeCss) {
    style.setAttribute('amp-runtime', '');
  } else if (isExtCss) {
    style.setAttribute('amp-extension', ext || '');
    afterElement = dev().assertElement(
      getExistingStyleElement(cssRoot, styleMap, 'amp-runtime')
    );
  } else {
    if (ext) {
      style.setAttribute(ext, '');
    }
    afterElement = cssRoot.lastChild;
  }
  insertAfterOrAtStart(cssRoot, style, afterElement);
  if (key) {
    styleMap[key] = style;
  }
  return style;
}

/**
 * @param {!Element|!ShadowRoot} cssRoot
 * @param {!Object<string, !Element>} styleMap
 * @param {string} key
 * @return {?Element}
 */
function getExistingStyleElement(cssRoot, styleMap, key) {
  // Already cached.
  if (styleMap[key]) {
    return styleMap[key];
  }
  // Check if the style has already been added by the server layout.
  const existing = cssRoot./*OK*/ querySelector(`style[${key}]`);
  if (existing) {
    styleMap[key] = existing;
    return existing;
  }
  // Nothing found.
  return null;
}

/**
 * Applies a transformer to the CSS text if it has been registered.
 * @param {!Element|!ShadowRoot} cssRoot
 * @param {function(string):string} transformer
 */
export function installCssTransformer(cssRoot, transformer) {
  cssRoot[TRANSFORMER_PROP] = transformer;
}

/**
 * Applies a transformer to the CSS text if it has been registered.
 * @param {!Element|!ShadowRoot} cssRoot
 * @param {string} cssText
 * @return {string}
 */
function maybeTransform(cssRoot, cssText) {
  const transformer = cssRoot[TRANSFORMER_PROP];
  return transformer ? transformer(cssText) : cssText;
}

/** @private {boolean} */
let bodyMadeVisible = false;

/**
 * @param {boolean} value
 * @visibleForTesting
 */
export function setBodyMadeVisibleForTesting(value) {
  bodyMadeVisible = value;
}

/**
 * Sets the document's body opacity to 1.
 * If the body is not yet available (because our script was loaded
 * synchronously), polls until it is.
 * @param {!Document} doc The document who's body we should make visible.
 */
export function makeBodyVisible(doc) {
  devAssert(doc.defaultView, 'Passed in document must have a defaultView');
  const win = /** @type {!Window} */ (doc.defaultView);
  const set = () => {
    bodyMadeVisible = true;
    setBodyVisibleStyles(doc);
    renderStartedNoInline(doc);
  };

  waitForBodyOpenPromise(doc)
    .then(() => {
      return waitForServices(win);
    })
    .catch(reason => {
      rethrowAsync(reason);
      return [];
    })
    .then(services => {
      set();
      if (services.length > 0) {
        const resources = Services.resourcesForDoc(doc.documentElement);
        resources./*OK*/ schedulePass(1, /* relayoutAll */ true);
      }
      try {
        const perf = Services.performanceFor(win);
        perf.tick('mbv');
        perf.flush();
      } catch (e) {}
    });
}

/**
 * Set the document's body opacity to 1. Called in error cases.
 * @param {!Document} doc The document who's body we should make visible.
 */
export function makeBodyVisibleRecovery(doc) {
  devAssert(doc.defaultView, 'Passed in document must have a defaultView');
  if (bodyMadeVisible) {
    return;
  }
  bodyMadeVisible = true;
  setBodyVisibleStyles(doc);
}

/**
 * Make sure that body exists, and make it visible.
 * @param {!Document} doc
 */
function setBodyVisibleStyles(doc) {
  setStyles(dev().assertElement(doc.body), {
    opacity: 1,
    visibility: 'visible',
    'animation': 'none',
  });
}

/**
 * @param {!Document} doc
 */
function renderStartedNoInline(doc) {
  try {
    Services.resourcesForDoc(doc.documentElement).renderStarted();
  } catch (e) {
    // `makeBodyVisible` is called in the error-processing cycle and thus
    // could be triggered when runtime's initialization is incomplete which
    // would cause unrelated errors to be thrown here.
  }
}

/**
 * Indicates that the body is always visible. For instance, in case of PWA.
 * This check is on a module level variable, and could be problematic if you are
 * relying on this function across different binaries.
 * @param {!Window} unusedWin
 */
export function bodyAlwaysVisible(unusedWin) {
  bodyMadeVisible = true;
}

/**
 * Checks whether a style element was registered in the DOM.
 * @param {!Document|!ShadowRoot} doc
 * @param {!Element} style
 * @return {boolean}
 */
function styleLoaded(doc, style) {
  const sheets = doc.styleSheets;
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    if (sheet.ownerNode == style) {
      return true;
    }
  }
  return false;
}
