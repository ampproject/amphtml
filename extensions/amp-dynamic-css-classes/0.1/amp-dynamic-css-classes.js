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

import {Services} from '../../../src/services';

/**
 * Strips everything but the domain from referrer string.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {string}
 */
function referrerDomain(ampdoc) {
  const referrer = Services.viewerForDoc(ampdoc).getUnconfirmedReferrerUrl();
  if (!referrer) {
    return '';
  }
  const {hostname} = Services.urlForDoc(ampdoc.getHeadNode()).parse(referrer);
  return hostname;
}

/**
 * Grabs the User Agent string.
 * @param {!Window} win
 * @return {string}
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
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Array<string>}
 */
function normalizedReferrers(ampdoc) {
  const referrer = referrerDomain(ampdoc);

  // Normalize t.co names to twitter.com
  if (referrer === 't.co') {
    return referrers_('twitter.com');
  }

  // Pinterest does not reliably set the referrer on Android
  // Instead, we inspect the User Agent string.
  if (!referrer && /Pinterest/.test(userAgent(ampdoc.win))) {
    return referrers_('www.pinterest.com');
  }

  return referrers_(referrer);
}

/**
 * Adds CSS classes onto the HTML element.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Array<string>} classes
 */
function addDynamicCssClasses(ampdoc, classes) {
  if (ampdoc.isBodyAvailable()) {
    addCssClassesToBody(ampdoc.getBody(), classes);
  } else {
    ampdoc.waitForBodyOpen().then(body => addCssClassesToBody(body, classes));
  }
}

/**
 * @param {!Element} body
 * @param {!Array<string>} classes
 */
function addCssClassesToBody(body, classes) {
  const {classList} = body;
  for (let i = 0; i < classes.length; i++) {
    classList.add(classes[i]);
  }
}

/**
 * Adds dynamic css classes based on the referrer, with a separate class for
 * each level of subdomain specificity.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
function addReferrerClasses(ampdoc) {
  const referrers = normalizedReferrers(ampdoc);
  const classes = referrers.map(referrer => {
    return `amp-referrer-${referrer.replace(/\./g, '-')}`;
  });

  Services.vsyncFor(ampdoc.win).mutate(() => {
    addDynamicCssClasses(ampdoc, classes);
  });
}

/**
 * Adds a dynamic css class `amp-viewer` if this document is inside a viewer.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
function addViewerClass(ampdoc) {
  const viewer = Services.viewerForDoc(ampdoc);
  if (viewer.isEmbedded()) {
    Services.vsyncFor(ampdoc.win).mutate(() => {
      addDynamicCssClasses(ampdoc, ['amp-viewer']);
    });
  }
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
function addRuntimeClasses(ampdoc) {
  addReferrerClasses(ampdoc);
  addViewerClass(ampdoc);
}

/** @implements {../../../src/render-delaying-services.RenderDelayingService} */
class AmpDynamicCssClasses {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    addRuntimeClasses(ampdoc);
  }

  /**
   * Function to return a promise for when
   * it is finished delaying render, and is ready.
   * Implemented from RenderDelayingService
   * @return {!Promise}
   */
  whenReady() {
    return Promise.resolve();
  }
}

// Register doc-service factory.
AMP.extension('amp-dynamic-css-classes', '0.1', AMP => {
  AMP.registerServiceForDoc('amp-dynamic-css-classes', AmpDynamicCssClasses);
});
