import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {parseQueryString} from '#core/types/string/url';
import {getWin} from '#core/window';

/**
 * Returns true if the page should be prerendered (for being an active page or
 * first page).
 * @param {!AmpElement} pageElement
 * @return {boolean}
 */
export function isPrerenderActivePage(pageElement) {
  const win = getWin(pageElement);
  const hashId = parseQueryString(win.location.href)['page'];
  let selector = 'amp-story-page:first-of-type';
  if (hashId) {
    selector += `, amp-story-page#${escapeCssSelectorIdent(hashId)}`;
  }
  const selectorNodes = win.document.querySelectorAll(selector);
  return selectorNodes[selectorNodes.length - 1] === pageElement;
}
