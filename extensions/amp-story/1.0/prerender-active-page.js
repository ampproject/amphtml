import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {parseQueryString} from '#core/types/string/url';
import {getWin} from '#core/window';

/**
 * Retrieves the page that should be the prerender page.
 * @param {!Element} pageElement any element
 * @return {boolean} the prerendered active page
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
