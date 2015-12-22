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

import {parseUrl} from '../../../src/url';
import {viewerFor} from '../../../src/viewer';
import {log} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';

/** @const */
const TAG = 'AmpDynamicCssClasses';

/** @const */
const EXPERIMENT = 'dynamic-css-classes';

/**
 * Returns an array of referrers which vary in level of subdomain specificity.
 *
 * @param {string} referrer
 * @return {!Array<string>}
 * @private Visible for testing only!
 */
export function referrers_(referrer) {
  referrer = parseUrl(referrer).hostname;
  const domains = referrer.split('.');
  let domainBase = '';

  return domains.reduceRight((referrers, domain) => {
    if (domainBase) {
      domain += '-' + domainBase;
    }
    domainBase = domain;
    referrers.push(domain);
    return referrers;
  }, []);
}

/**
 * Adds CSS classes onto the HTML element.
 * @param {!Window} win
 * @param {!Array<string>} classes
 */
function addDynamicCssClasses(win, classes) {
  const documentElement = win.document.documentElement;
  const classList = documentElement.classList;

  for (let i = 0; i < classes.length; i++) {
    classList.add(classes[i]);
  }
}


/**
 * Adds dynamic css classes based on the referrer, with a separate class for
 * each level of subdomain specificity.
 * @param {!Window} win
 */
function addReferrerClasses(win) {
  const classes = referrers_(win.document.referrer).map(referrer => {
    return `amp-referrer-${referrer}`;
  });
  addDynamicCssClasses(win, classes);
}


/**
 * Adds a dynamic css class `amp-viewer` if this document is inside a viewer.
 * @param {!Window} win
 */
function addViewerClass(win) {
  const viewer = viewerFor(win);
  if (viewer.isEmbedded()) {
    addDynamicCssClasses(win, ['amp-viewer']);
  }
}

/**
 * @param {!Window} win
 */
function addRuntimeClasses(win) {
  if (isExperimentOn(win, EXPERIMENT)) {
    addReferrerClasses(win);
    addViewerClass(win);
  } else {
    log.warn(TAG, `Experiment ${EXPERIMENT} disabled`);
  }
}

addRuntimeClasses(AMP.win);
