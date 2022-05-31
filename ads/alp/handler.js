import {closest} from '#core/dom/query';
import {parseQueryString} from '#core/types/string/url';

import {dev} from '#utils/log';

import * as urls from '../../src/config/urls';
import {openWindowDialog} from '../../src/open-window-dialog';
import {
  addParamToUrl,
  isLocalhostOrigin,
  isProxyOrigin,
  parseUrlDeprecated,
} from '../../src/url';

/**
 * Install a click listener that transforms navigation to the AMP cache
 * to a form that directly navigates to the doc and transmits the original
 * URL as a click logging info passed via a fragment param.
 * Expects to find a URL starting with "https://cdn.ampproject.org/c/"
 * to be available via a param call "adurl" (or defined by the
 * `data-url-param-name` attribute on the a tag.
 * @param {!Window} win
 */
export function installAlpClickHandler(win) {
  win.document.documentElement.addEventListener('click', handleClick);
  // Start loading destination doc when finger is down.
  // Needs experiment whether this is a good idea.
  win.document.documentElement.addEventListener('touchstart', warmupDynamic);
}

/**
 * Filter click event and then transform URL for direct AMP navigation
 * with impression logging.
 * @param {!Event} e
 * @param {function(string)=} opt_viewerNavigate
 * @visibleForTesting
 */
export function handleClick(e, opt_viewerNavigate) {
  if (e.defaultPrevented) {
    return;
  }
  // Only handle simple clicks with the left mouse button/touch and without
  // modifier keys.
  if (e.buttons != 0 && e.buttons != 1) {
    return;
  }
  if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
    return;
  }

  const link = getLinkInfo(e);
  if (!link || !link.eventualUrl) {
    return;
  }
  if (e.isTrusted === false) {
    return;
  }

  // Tag the original href with &amp=1 and make it a fragment param with
  // name click.
  const fragment =
    'click=' +
    encodeURIComponent(
      addParamToUrl(link.a.href, 'amp', '1', /* opt_addToFront */ true)
    );
  let destination = link.eventualUrl;
  if (link.eventualUrl.indexOf('#') == -1) {
    destination += '#' + fragment;
  } else {
    destination += '&' + fragment;
  }
  const win = link.a.ownerDocument.defaultView;
  const ancestors = win.location.ancestorOrigins;
  if (ancestors && ancestors[ancestors.length - 1] == 'http://localhost:8000') {
    destination = destination.replace(
      `${parseUrlDeprecated(link.eventualUrl).host}/c/`,
      'http://localhost:8000/max/'
    );
  }
  e.preventDefault();
  if (opt_viewerNavigate) {
    // TODO: viewer navigate only support navigating top level window to
    // destination. should we try to open a new window here with target=_blank
    // here instead of using viewer navigation.
    opt_viewerNavigate(destination);
  } else {
    navigateTo(win, link.a, destination);
  }
}

/**
 * For an event, see if there is an anchor tag in the target
 * ancestor chain and if yes, check whether we can figure
 * out an AMP target URL.
 * @param {!Event} e
 * @return {{
 *   eventualUrl: (string|undefined),
 *   a: !Element
 * }|undefined} A URL on the AMP Cache.
 */
function getLinkInfo(e) {
  const a = closest(dev().assertElement(e.target), (element) => {
    return element.tagName == 'A' && element.href;
  });
  if (!a) {
    return;
  }
  return {
    eventualUrl: getEventualUrl(a),
    a,
  };
}

/**
 * Given an anchor tag, figure out whether this goes to an AMP destination
 * via a redirect.
 * @param {!Element} a An anchor tag.
 * @return {string|undefined} A URL on the AMP Cache.
 */
function getEventualUrl(a) {
  const urlParamName = a.getAttribute('data-url-param-name') || 'adurl';
  const eventualUrl = parseQueryString(a.search)[urlParamName];
  if (!eventualUrl) {
    return;
  }
  if (
    !isProxyOrigin(eventualUrl) ||
    !parseUrlDeprecated(eventualUrl).pathname.startsWith('/c/')
  ) {
    return;
  }
  return eventualUrl;
}

/**
 * Navigate to the given URL. Infers the target from the given anchor
 * tag.
 * @param {!Window} win
 * @param {!Element} a Anchor element
 * @param {string} url
 */
function navigateTo(win, a, url) {
  const target = (a.target || '_top').toLowerCase();
  const a2aAncestor = getA2AAncestor(win);
  if (a2aAncestor) {
    a2aAncestor.win./*OK*/ postMessage(
      'a2a;' +
        JSON.stringify({
          'url': url,
        }),
      a2aAncestor.origin
    );
    return;
  }
  openWindowDialog(win, url, target);
}

/**
 * Establishes a connection to the AMP Cache and makes sure
 * the AMP JS is cached.
 * @param {!Window} win
 */
export function warmupStatic(win) {
  // Preconnect using an image, because that works on all browsers.
  // The image has a 1 minute cache time to avoid duplicate
  // preconnects.
  new win.Image().src = `${urls.cdn}/preconnect.gif`;
  // Preload the primary AMP JS that is render blocking.
  const linkRel = /*OK*/ document.createElement('link');
  linkRel.rel = 'preload';
  linkRel.setAttribute('as', 'script');
  linkRel.href = `${urls.cdn}/v0.js`;
  getHeadOrFallback(win.document).appendChild(linkRel);
}

/**
 * For events (such as touch events) that point to an eligible URL, preload
 * that URL.
 * @param {!Event} e
 * @visibleForTesting
 */
export function warmupDynamic(e) {
  const link = getLinkInfo(e);
  if (!link || !link.eventualUrl) {
    return;
  }
  // Preloading with empty as and newly specced value `fetch` meaning the same
  // thing. `document` would be the right value, but this is not yet supported
  // in browsers.
  const linkRel0 = /*OK*/ document.createElement('link');
  linkRel0.rel = 'preload';
  linkRel0.href = link.eventualUrl;
  const linkRel1 = /*OK*/ document.createElement('link');
  linkRel1.rel = 'preload';
  linkRel1.as = 'fetch';
  linkRel1.href = link.eventualUrl;
  const head = getHeadOrFallback(e.target.ownerDocument);
  head.appendChild(linkRel0);
  head.appendChild(linkRel1);
}

/**
 * Return <head> if present or just the document element.
 * @param {!Document} doc
 * @return {!Element}
 */
function getHeadOrFallback(doc) {
  return doc.head || doc.documentElement;
}

/**
 * Returns info about an ancestor that can perform A2A navigations
 * or null if none is present.
 * @param {!Window} win
 * @return {?{
 *   win: !Window,
 *   origin: string,
 * }}
 */
export function getA2AAncestor(win) {
  if (!win.location.ancestorOrigins) {
    return null;
  }
  const origins = win.location.ancestorOrigins;
  // We expect top, amp cache, ad (can be nested).
  if (origins.length < 2) {
    return null;
  }
  const top = origins[origins.length - 1];
  // Not a security property. We just check whether the
  // viewer might support A2A. More domains can be added to allowlist
  // as needed.
  if (top.indexOf('.google.') == -1) {
    return null;
  }
  const amp = origins[origins.length - 2];
  if (!isProxyOrigin(amp) && !isLocalhostOrigin(amp)) {
    return null;
  }
  return {
    win: getNthParentWindow(win, origins.length - 1),
    origin: amp,
  };
}

/**
 * Returns the Nth parent of the given window.
 * @param {!Window} win
 * @param {number} distance frames above us.
 * @return {!Window}
 */
function getNthParentWindow(win, distance) {
  let parent = win;
  for (let i = 0; i < distance; i++) {
    parent = parent.parent;
  }
  return parent;
}
