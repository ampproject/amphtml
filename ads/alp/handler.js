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

import {
  addParamToUrl,
  parseQueryString,
} from '../../src/url';
import {closest} from '../../src/dom';



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
 * @param {!MouseEvent} e
 * @visibleForTesting
 */
export function handleClick(e) {
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

  // Tag the original href with &amp=1 and make it a fragment param with
  // name click.
  const fragment = 'click=' + encodeURIComponent(
      addParamToUrl(link.a.href, 'amp', '1', /* opt_addToFront */ true));
  let destination = link.eventualUrl;
  if (link.eventualUrl.indexOf('#') == -1) {
    destination += '#' + fragment;
  } else {
    destination += '&' + fragment;
  }
  const win = link.a.ownerDocument.defaultView;
  const ancestors = win.location.ancestorOrigins;
  if (ancestors && ancestors[ancestors.length - 1] == 'http://localhost:8000') {
    destination = destination.replace('https://cdn.ampproject.org/c/',
        'http://localhost:8000/max/');
  }

  e.preventDefault();
  navigateTo(win, link.a, destination);
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
  const a = closest(e.target, element => {
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
  if (!eventualUrl.indexOf('https://cdn.ampproject.org/c/') == 0) {
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
  win.open(url, target);
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
  new win.Image().src = 'https://cdn.ampproject.org/preconnect.gif';
  // Preload the primary AMP JS that is render blocking.
  const linkRel = /*OK*/document.createElement('link');
  linkRel.rel = 'preload';
  linkRel.setAttribute('as', 'script');
  linkRel.href =
      'https://cdn.ampproject.org/rtv/01$internalRuntimeVersion$/v0.js';
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
  const linkRel = /*OK*/document.createElement('link');
  linkRel.rel = 'preload';
  linkRel.setAttribute('as', 'document');
  linkRel.href = link.eventualUrl;
  getHeadOrFallback(e.target.ownerDocument).appendChild(linkRel);
}

/**
 * Return <head> if present or just the document element.
 * @param {!Document} doc
 * @return {!Element}
 */
function getHeadOrFallback(doc) {
  return doc.head || doc.documentElement;
}
