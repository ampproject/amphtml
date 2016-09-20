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

import {documentStateFor} from '../../../src/document-state';
import {getService} from '../../../src/service';
import {parseUrl} from '../../../src/url';
import {viewerFor} from '../../../src/viewer';
import {vsyncFor} from '../../../src/vsync';

/**
 * Strips everything but the domain from referrer string.
 * @param {!Window} win
 * @returns {string}
 */
function referrerDomain(win) {
  const referrer = viewerFor(win).getUnconfirmedReferrerUrl();
  if (referrer) {
    return parseUrl(referrer).hostname;
  }
  return '';
}

/**
 * Grabs the User Agent string.
 * @param {!Window} win
 * @returns {string}
 */
function userAgent(win) {
  return win.navigator.userAgent;
}

/**
 * Returns an array of referrers which vary in level of subdomain specificity.
 *
 * @param {string} referrer
 * @return {!Array<string>}
 * @private Visible for testing only!
 */
export function referrers_(referrer) {
  const domains = referrer.split('.');
  let domainBase = '';

  return domains.reduceRight((referrers, domain) => {
    if (domainBase) {
      domain += '.' + domainBase;
    }
    domainBase = domain;
    referrers.push(domain);
    return referrers;
  }, []);
}

/**
 * Normalizes certain referrers across devices.
 * @param {!Window} win
 * @returns {!Array<string>}
 */
function normalizedReferrers(win) {
  const referrer = referrerDomain(win);

  // Normalize t.co names to twitter.com
  if (referrer === 't.co') {
    return referrers_('twitter.com');
  }

  // Pinterest does not reliably set the referrer on Android
  // Instead, we inspect the User Agent string.
  if (!referrer && /Pinterest/.test(userAgent(win))) {
    return referrers_('www.pinterest.com');
  }

  return referrers_(referrer);
}


/**
 * Adds CSS classes onto the HTML element.
 * @param {!Window} win
 * @param {!Array<string>} classes
 */
function addDynamicCssClasses(win, classes) {
  const docState = documentStateFor(win);
  docState.onBodyAvailable(() => {
    const body = win.document.body;
    const classList = body.classList;

    for (let i = 0; i < classes.length; i++) {
      classList.add(classes[i]);
    }
  });
}


/**
 * Adds dynamic css classes based on the referrer, with a separate class for
 * each level of subdomain specificity.
 * @param {!Window} win
 */
function addReferrerClasses(win) {
  const referrers = normalizedReferrers(win);
  const classes = referrers.map(referrer => {
    return `amp-referrer-${referrer.replace(/\./g, '-')}`;
  });

  vsyncFor(win).mutate(() => {
    addDynamicCssClasses(win, classes);
  });
}


/**
 * Adds a dynamic css class `amp-viewer` if this document is inside a viewer.
 * @param {!Window} win
 */
function addViewerClass(win) {
  const viewer = viewerFor(win);
  if (viewer.isEmbedded()) {
    vsyncFor(win).mutate(() => {
      addDynamicCssClasses(win, ['amp-viewer']);
    });
  }
}


/**
 * @param {!Window} win
 * @private visible for testing
 */
function addRuntimeClasses(win) {
  addReferrerClasses(win);
  addViewerClass(win);
}

/**
 * @param {!Window} win
 * @return {!Object} All services need to return an object to "load".
 * @visibleForTesting
 */
export function installDynamicClassesService(win) {
  return getService(win, 'amp-dynamic-css-classes', () => {
    addRuntimeClasses(win);
    return {};
  });
};

installDynamicClassesService(AMP.win);
