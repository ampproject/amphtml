import {devAssert} from '#core/assert';
import {toWin} from '#core/window';

const SHADOW_CSS_CACHE = '__AMP_SHADOW_CSS';

/**
 * @param {ShadowRoot} shadowRoot
 * @param {string} name
 * @param {string} cssText
 */
export function installShadowStyle(shadowRoot, name, cssText) {
  const doc = shadowRoot.ownerDocument;
  const win = toWin(doc.defaultView);
  if (
    shadowRoot.adoptedStyleSheets !== undefined &&
    win.CSSStyleSheet.prototype.replaceSync !== undefined
  ) {
    const cache = win[SHADOW_CSS_CACHE] || (win[SHADOW_CSS_CACHE] = {});
    let styleSheet = cache[name];
    if (!styleSheet) {
      styleSheet = new win.CSSStyleSheet();
      devAssert(styleSheet.replaceSync);
      styleSheet.replaceSync(cssText);
      cache[name] = styleSheet;
    }
    shadowRoot.adoptedStyleSheets =
      shadowRoot.adoptedStyleSheets.concat(styleSheet);
  } else {
    const styleEl = doc.createElement('style');
    styleEl.setAttribute('data-name', name);
    styleEl.textContent = cssText;
    shadowRoot.appendChild(styleEl);
  }
}

/**
 * @param {!Window} win
 * @visibleForTesting
 */
export function resetShadowStyleCacheForTesting(win) {
  win[SHADOW_CSS_CACHE] = null;
}
