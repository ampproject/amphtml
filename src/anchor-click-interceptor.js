/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
  closestByTag,
} from './dom';
import {dev} from './log';
import {urlReplacementsForDoc} from './services';
import {ResponseMap} from './3p-analytics-common';

/** @private @const {string} */
const ORIG_HREF_ATTRIBUTE = 'data-a4a-orig-href';

/**
 * Registers a handler that performs URL replacement on the href
 * of an ad click.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Window} win
 */
export function installAnchorClickInterceptor(ampdoc, win) {
  win.document.documentElement.addEventListener('click',
      maybeExpandUrlParams.bind(null, ampdoc), /* capture */ true);
}

/**
 * Handle click on links and replace variables in the click URL.
 * The function changes the actual href value and stores the
 * template in the ORIGINAL_HREF_ATTRIBUTE attribute
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Event} e
 */
function maybeExpandUrlParams(ampdoc, e) {
  const target = closestByTag(dev().assertElement(e.target), 'A');
  if (!target || !target.href) {
    // Not a click on a link.
    return;
  }
  const hrefToExpand =
      target.getAttribute(ORIG_HREF_ATTRIBUTE) || target.getAttribute('href');
  if (!hrefToExpand) {
    return;
  }
  const vars = {
    'CLICK_X': () => {
      return e.pageX;
    },
    'CLICK_Y': () => {
      return e.pageY;
    },
    '3PANALYTICS': (frameType, key) => {
      const responses = ResponseMap.get(frameType, target.baseURI);
      if (responses && responses[key]) {
        return responses[key];
      }
      return '';
    },
  };
  const newHref = urlReplacementsForDoc(ampdoc).expandSync(
      hrefToExpand, vars, undefined, /* opt_whitelist */ {
        // For now we only allow to replace the click location vars
        // and nothing else.
        // NOTE: Addition to this whitelist requires additional review.
        'CLICK_X': true,
        'CLICK_Y': true,
        '3PANALYTICS': true,
      });
  if (newHref != hrefToExpand) {
    // Store original value so that later clicks can be processed with
    // freshest values.
    if (!target.getAttribute(ORIG_HREF_ATTRIBUTE)) {
      target.setAttribute(ORIG_HREF_ATTRIBUTE, hrefToExpand);
    }
    target.setAttribute('href', newHref);
  }
}

export function maybeExpandUrlParamsForTesting(ampdoc, e) {
  maybeExpandUrlParams(ampdoc, e);
}

