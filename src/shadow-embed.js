import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {setInitialDisplay, setStyle} from '#core/dom/style';
import {
  ShadowDomVersion_Enum,
  getShadowDomSupportedVersion,
  isShadowCssSupported,
} from '#core/dom/web-components';
import {toArray} from '#core/types/array';
import {getWin} from '#core/window';

import {Services} from '#service';

import {dev, devAssert} from '#utils/log';

import * as ShadowCSS from '#third_party/webcomponentsjs/ShadowCSS';

import {installCssTransformer} from './style-installer';
import {DomWriterBulk, DomWriterStreamer} from './utils/dom-writer';

/** @const {!RegExp} */
const CSS_SELECTOR_BEG_REGEX = /[^\.\-\_0-9a-zA-Z]/;

/** @const {!RegExp} */
const CSS_SELECTOR_END_REGEX = /[^\-\_0-9a-zA-Z]/;

/**
 * @type {boolean|undefined}
 */
let shadowDomStreamingSupported;

/**
 * Creates a shadow root for the specified host and returns it. Polyfills
 * shadow root creation if necessary.
 * @param {!Element} hostElement
 * @return {!ShadowRoot}
 */
export function createShadowRoot(hostElement) {
  const win = getWin(hostElement);

  const existingRoot = hostElement.shadowRoot || hostElement.__AMP_SHADOW_ROOT;
  if (existingRoot) {
    if (self.trustedTypes && self.trustedTypes.createPolicy) {
      // Create Trusted Types policy that only returns the empty string as
      // TrustedHTML
      const policy = self.trustedTypes.createPolicy(
        'shadow-embed#createShadowRoot',
        {
          createHTML: function (unused) {
            return '';
          },
        }
      );
      existingRoot./*OK*/ innerHTML = policy.createHTML('');
    } else {
      existingRoot./*OK*/ innerHTML = '';
    }
    return existingRoot;
  }

  let shadowRoot;
  const shadowDomSupported = getShadowDomSupportedVersion();
  if (shadowDomSupported == ShadowDomVersion_Enum.V1) {
    shadowRoot = hostElement.attachShadow({mode: 'open'});
    if (!shadowRoot.styleSheets) {
      Object.defineProperty(shadowRoot, 'styleSheets', {
        get: function () {
          const items = [];
          shadowRoot.childNodes.forEach((child) => {
            if (child.tagName === 'STYLE') {
              items.push(child.sheet);
            }
          });
          return items;
        },
      });
    }
  } else if (shadowDomSupported == ShadowDomVersion_Enum.V0) {
    shadowRoot = hostElement.createShadowRoot();
  } else {
    shadowRoot = createShadowRootPolyfill(hostElement);
  }

  if (!isShadowCssSupported()) {
    const rootId = `i-amphtml-sd-${win.Math.floor(win.Math.random() * 10000)}`;
    shadowRoot['id'] = rootId;
    shadowRoot.host.classList.add(rootId);

    // CSS isolation.
    installCssTransformer(shadowRoot, (css) => {
      return transformShadowCss(shadowRoot, css);
    });
  }

  return shadowRoot;
}

/**
 * Shadow root polyfill.
 * @param {!Element} hostElement
 * @return {!ShadowRoot}
 */
function createShadowRootPolyfill(hostElement) {
  const doc = hostElement.ownerDocument;

  // Host CSS polyfill.
  hostElement.classList.add('i-amphtml-shadow-host-polyfill');
  const hostStyle = doc.createElement('style');
  hostStyle.textContent =
    '.i-amphtml-shadow-host-polyfill>:not(i-amphtml-shadow-root)' +
    '{display:none!important}';
  hostElement.appendChild(hostStyle);

  // Shadow root.
  const shadowRoot /** @type {!ShadowRoot} */ =
    // Cast to ShadowRoot even though it is an Element
    // TODO(@dvoytenko) Consider to switch to a type union instead.
    /** @type {?}  */ (doc.createElement('i-amphtml-shadow-root'));
  hostElement.appendChild(shadowRoot);
  hostElement.__AMP_SHADOW_ROOT = shadowRoot;
  Object.defineProperty(hostElement, 'shadowRoot', {
    enumerable: true,
    configurable: true,
    value: shadowRoot,
  });

  // API: https://www.w3.org/TR/shadow-dom/#the-shadowroot-interface

  shadowRoot.host = hostElement;

  // `getElementById` is resolved via `querySelector('#id')`.
  shadowRoot.getElementById = function (id) {
    const escapedId = escapeCssSelectorIdent(id);
    return /** @type {?HTMLElement} */ (
      shadowRoot./*OK*/ querySelector(`#${escapedId}`)
    );
  };

  // The styleSheets property should have a list of local styles.
  Object.defineProperty(shadowRoot, 'styleSheets', {
    get: () => {
      if (!doc.styleSheets) {
        return [];
      }
      return toArray(doc.styleSheets).filter((styleSheet) =>
        shadowRoot.contains(styleSheet.ownerNode)
      );
    },
  });

  return shadowRoot;
}

/**
 * Imports a body into a shadow root with the workaround for a polyfill case.
 * @param {!ShadowRoot} shadowRoot
 * @param {!Element} body
 * @param {boolean} deep
 * @return {!Element}
 */
export function importShadowBody(shadowRoot, body, deep) {
  const doc = shadowRoot.ownerDocument;
  let resultBody;
  if (isShadowCssSupported()) {
    resultBody = dev().assertElement(doc.importNode(body, deep));
  } else {
    resultBody = doc.createElement('amp-body');
    setInitialDisplay(resultBody, 'block');
    for (let i = 0; i < body.attributes.length; i++) {
      resultBody.setAttribute(
        body.attributes[0].name,
        body.attributes[0].value
      );
    }
    if (deep) {
      for (let n = body.firstChild; !!n; n = n.nextSibling) {
        resultBody.appendChild(doc.importNode(n, true));
      }
    }
  }
  setStyle(resultBody, 'position', 'relative');
  const oldBody = shadowRoot['body'];
  if (oldBody) {
    shadowRoot.removeChild(oldBody);
  }
  shadowRoot.appendChild(resultBody);
  Object.defineProperty(shadowRoot, 'body', {
    configurable: true,
    value: resultBody,
  });
  return resultBody;
}

/**
 * If necessary, transforms CSS to isolate AMP CSS within the shaodw root and
 * reduce the possibility of high-level conflicts.
 * @param {!ShadowRoot} shadowRoot
 * @param {string} css
 * @return {string}
 */
export function transformShadowCss(shadowRoot, css) {
  return scopeShadowCss(shadowRoot, css);
}

/**
 * Transforms CSS to isolate AMP CSS within the shadow root and reduce the
 * possibility of high-level conflicts. There are two types of transformations:
 * 1. Root transformation: `body` -> `amp-body`, etc.
 * 2. Scoping: `a {}` -> `.i-amphtml-sd-123 a {}`.
 *
 * @param {!ShadowRoot} shadowRoot
 * @param {string} css
 * @return {string}
 * @visibleForTesting
 */
export function scopeShadowCss(shadowRoot, css) {
  const id = devAssert(shadowRoot['id']);
  const doc = shadowRoot.ownerDocument;
  let rules = null;
  // Try to use a separate document.
  try {
    rules = getStylesheetRules(doc.implementation.createHTMLDocument(''), css);
  } catch (e) {
    // Ignore.
  }
  // Try to use the current document.
  if (!rules) {
    try {
      rules = getStylesheetRules(doc, css);
    } catch (e) {
      // Ignore.
    }
  }

  // No rules could be parsed - return css as is.
  if (!rules) {
    return css;
  }

  // Patch selectors.
  return ShadowCSS.scopeRules(rules, `.${id}`, transformRootSelectors);
}

/**
 * Replaces top-level selectors such as `html` and `body` with their polyfill
 * counterparts: `amp-html` and `amp-body`.
 * @param {string} selector
 * @return {string}
 */
function transformRootSelectors(selector) {
  return selector.replace(/(html|body)/g, rootSelectorPrefixer);
}

/**
 * See `transformRootSelectors`.
 * @param {string} match
 * @param {string} name
 * @param {number} pos
 * @param {string} selector
 * @return {string}
 * @private
 */
function rootSelectorPrefixer(match, name, pos, selector) {
  const prev = selector.charAt(pos - 1);
  const next = selector.charAt(pos + match.length);
  if (
    (!prev || CSS_SELECTOR_BEG_REGEX.test(prev)) &&
    (!next || CSS_SELECTOR_END_REGEX.test(next))
  ) {
    return 'amp-' + match;
  }
  return match;
}

/**
 * @param {!Document} doc
 * @param {string} css
 * @return {?CSSRuleList}
 */
function getStylesheetRules(doc, css) {
  const style = /** @type {!HTMLStyleElement} */ (doc.createElement('style'));
  style./*OK*/ textContent = css;
  try {
    (doc.head || doc.documentElement).appendChild(style);
    if (style.sheet) {
      return /** @type {!CSSStyleSheet} */ (style.sheet).cssRules;
    }
    return null;
  } finally {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }
}

/**
 * @param {boolean|undefined} val
 * @visibleForTesting
 */
export function setShadowDomStreamingSupportedForTesting(val) {
  shadowDomStreamingSupported = val;
}

/**
 * Returns `true` if the Shadow DOM streaming is supported.
 * @param {!Window} win
 * @return {boolean}
 */
export function isShadowDomStreamingSupported(win) {
  if (shadowDomStreamingSupported === undefined) {
    shadowDomStreamingSupported = calcShadowDomStreamingSupported(win);
  }
  return shadowDomStreamingSupported;
}

/**
 * @param {!Window} win
 * @return {boolean}
 */
function calcShadowDomStreamingSupported(win) {
  // API must be supported.
  if (
    !win.document.implementation ||
    typeof win.document.implementation.createHTMLDocument != 'function'
  ) {
    return false;
  }
  // Firefox does not support DOM streaming.
  // See: https://bugzilla.mozilla.org/show_bug.cgi?id=867102
  if (Services.platformFor(win).isFirefox()) {
    return false;
  }
  // Assume full streaming support.
  return true;
}

/**
 * Creates the Shadow DOM writer available on this platform.
 * @param {!Window} win
 * @return {!./utils/dom-writer.DomWriter}
 */
export function createShadowDomWriter(win) {
  if (isShadowDomStreamingSupported(win)) {
    return new DomWriterStreamer(win);
  }
  return new DomWriterBulk(win);
}
