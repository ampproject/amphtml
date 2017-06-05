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
import {map} from './utils/object';

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

/**
 * A class for holding AMP Analytics third-party vendors responses to frames.
 * TODO: Move this somewhere else?
 */
export class ResponseMap {
  /**
   * Add a response
   * @param {!string} frameType The identifier for the third-party frame that
   * responded
   * @param {!string} creativeUrl The URL of the creative being responded to
   * @param {Object} response What the response was
   */
  static add(frameType, creativeUrl, response) {
    if (!AMP.responseMap_[frameType]) {
      AMP.responseMap_[frameType] = map();
    }
    AMP.responseMap_[frameType][creativeUrl] = response;
  }

  /**
   * Remove a response, for instance if a third-party frame is being destroyed
   * @param {!string} frameType The identifier for the third-party frame
   * whose responses are to be removed
   */
  static remove(frameType) {
    delete AMP.responseMap_[frameType];
  }

  /**
   * Gets the most recent response given by a certain frame to a certain
   * creative
   * @param {!string} frameType The identifier for the third-party frame
   * whose response is sought
   * @param {!string} creativeUrl The URL of the creative that the sought
   * response was about
   * @returns {?Object}
   */
  static get(frameType, creativeUrl) {
    if (AMP.responseMap_[frameType] &&
      AMP.responseMap_[frameType][creativeUrl]) {
      return AMP.responseMap_[frameType][creativeUrl];
    }
    return '';
  }
}
/** @private @const {Map} */
AMP.responseMap_ = AMP.responseMap_ || map();

