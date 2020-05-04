/**
 * @license
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
 * limitations under the license.
 */
const globals = {};
globals.amphtmlRegex = new RegExp('(^\\s*)amphtml(\\s*$)');
globals.ampCaches = [
  {
    'getAmpHref': function() {
      if (window.location.pathname.startsWith('/a/s') ||
          window.location.pathname.startsWith('/c/s') ||
          window.location.pathname.startsWith('/v/s')) {
        return 'https://' + window.location.pathname.slice(5);
      } else if (window.location.pathname.startsWith('/c')) {
        return 'http://' + window.location.pathname.slice(3);
      } else {
        return '';
      }
    },
    'isAmpCache': function() {
      return window.location.hostname.endsWith('cdn.ampproject.org'); // lgtm [js/incomplete-url-substring-sanitization]
    },
  },
];

/**
 * Returns the AMP page href from an AMP Cache. Otherwise returns empty string.
 *
 * @return {string}
 * @private
 */
function getAmpCacheHref() {
  for (const index in globals.ampCaches) {
    const ampCache = globals.ampCaches[index];
    if (ampCache.isAmpCache()) {
      return ampCache.getAmpHref();
    }
  }
  return '';
}

/**
 * Determine if <link rel="amphtml" href="..."> exists in the page and
 * return the href's value if it does. Otherwise returns empty string.
 *
 * @return {string}
 * @private
 */
function getAmpHtmlLinkHref() {
  let ampHtmlLinkHref = '';
  const headLinks = document.head.getElementsByTagName('link');
  if (headLinks.length > 0) {
    for (const index in headLinks) {
      const link = headLinks[index];
      if (link instanceof HTMLLinkElement &&
          link.hasAttribute('rel') &&
          globals.amphtmlRegex.test(link.getAttribute('rel')) &&
          link.hasAttribute('href')) {
        ampHtmlLinkHref = link.getAttribute('href');
        break;
      }
    }
  }
  return ampHtmlLinkHref;
}

/**
 * Determine if the page is from an AMP Cache.
 *
 * @return {boolean}
 * @private
 */
function isAmpCache() {
  for (const index in globals.ampCaches) {
    const ampCache = globals.ampCaches[index];
    if (ampCache.isAmpCache()) {
      return true;
    }
  }
  return false;
}

/**
 * Determine if the page is an AMP page.
 *
 * @return {boolean}
 * @private
 */
function isAmpDocument() {
  return (document.documentElement.hasAttribute('amp') ||
      document.documentElement.hasAttribute('⚡'));
}

/**
 * Listener for requests from the extension.
 *
 * Requests for getAmpDetails. Return to the extension:
 * - isAmp: Is the page marked as an AMP page.
 * - fromAmpCache: Is the page from an AMP Cache.
 * - ampHref: the href to an AMP page if the page is not an AMP page but there
 *   is an <link rel="amphtml"> or if the page is from an AMP Cache.
 * - userAgent: Tab's current userAgent, which may have been modified by
 *   device emulation.
 *
 * Requests for loadAmp and has ampHref, then redirects the browser to ampHref.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.getAmpDetails) {
    const isAmp = isAmpDocument();
    const fromAmpCache = isAmpCache();
    let ampHref = '';
    if (!isAmp) {ampHref = getAmpHtmlLinkHref();}
    if (fromAmpCache) {ampHref = getAmpCacheHref();}
    sendResponse({
      'isAmp': isAmp, 'fromAmpCache': fromAmpCache, 'ampHref': ampHref,
      'userAgent': navigator.userAgent,
    });
  }
  if (request.loadAmp && request.ampHref) {
    window.location = request.ampHref;
  }
});
