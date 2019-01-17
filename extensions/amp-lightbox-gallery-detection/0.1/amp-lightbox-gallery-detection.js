/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Detects <amp-img> elements to set the `lightbox` attribute
 * automatically.
 *
 * This extension is not meant to be included explicitly, e.g. as a script tag.
 * Instead, the runtime loads it when encountering an <amp-img>.
 */

import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {closest, iterateCursor, matches} from '../../../src/dom';
import {dev} from '../../../src/log';
import {toArray} from '../../../src/types';


const TAG = 'amp-lightbox-gallery-detection';

export const REQUIRED_EXTENSION = 'amp-lightbox-gallery';
export const LIGHTBOXABLE_ATTR = 'lightbox';

export const SHRUNK_AREA_DELTA_RATIO = 0.3;
export const VIEWPORT_AREA_RATIO = 0.4;

const ACTIONABLE_ANCESTORS = 'a[href], amp-selector, amp-script';
const TAP_ACTION_REGEX = /(;|\s|^)tap\:/;


/** @visibleForTesting */
export class Criteria {

  /**
   * @param {boolean} element
   * @return {!Element}
   */
  static meetsAll(element) {
    return Criteria.meetsPlaceholderCriteria(element) &&
      Criteria.meetsSizingCriteria(element) &&
      Criteria.meetsActionableCriteria(element);
  }

  /**
   * @param {boolean} element
   * @return {!Element}
   */
  static meetsSizingCriteria(element) {
    const viewport = Services.viewportForDoc(element);

    const {naturalWidth, naturalHeight} =
        dev().assertElement(element.querySelector('img'));
    const {width: renderWidth, height: renderHeight} = element.getLayoutBox();
    const {width: viewportWidth, height: viewportHeight} = viewport.getSize();

    const viewportArea = viewportWidth * viewportHeight;

    const naturalArea = naturalWidth * naturalHeight;
    const renderArea = renderWidth * renderHeight;

    const naturalAreaDelta = naturalArea - renderArea;
    const naturalAreaDeltaPerc = naturalAreaDelta / naturalArea;

    const isShrunk = naturalAreaDeltaPerc <= SHRUNK_AREA_DELTA_RATIO;

    const isCoveringSignificantArea =
        (naturalArea / viewportArea) >= VIEWPORT_AREA_RATIO;

    const isLargerThanViewport = naturalWidth > viewportWidth
      || naturalHeight > viewportHeight;

    return isShrunk || isLargerThanViewport || isCoveringSignificantArea;
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsPlaceholderCriteria(element) {
    return !element.hasAttribute('placeholder');
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsActionableCriteria(element) {
    return !closest(element, element =>
      matches(element, ACTIONABLE_ANCESTORS) ||
      TAP_ACTION_REGEX.test(element.getAttribute('on') || ''));
  }
}


/** @visibleForTesting */
export class Scanner {

  /**
   * @param {!Document} doc
   * @return {!Promise<!Element>}
   */
  static getAllImages(doc) {
    const imgs = toArray(doc.querySelectorAll('amp-img'));
    const promises = imgs.map(whenLoadedOrNull);

    return Promise.all(promises).then(imagesOrNull =>
      imagesOrNull.filter(i => !!i));
  }
}


/**
 * @param {!Element} element
 * @return {boolean}
 * @visibleForTesting
 */
export function meetsCriteria(element) {
  return Criteria.meetsAll(element);
}


/**
 * @param {!Element} el
 * @return {!Promise<?Element>}
 */
function whenLoadedOrNull(el) {
  return new Promise(resolve => {
    el.signals().whenSignal(CommonSignals.LOAD_END)
        .then(() => { resolve(el); })
        .catch(() => { resolve(null); });
  });
}


/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise}
 */
export function scanDoc(ampdoc) {
  const {win} = ampdoc;
  return Scanner.getAllImages(win.document).then(images => {
    const lightboxable = images.filter(meetsCriteria);

    if (lightboxable.length <= 0) {
      return;
    }

    iterateCursor(lightboxable, element => {
      element.setAttribute(LIGHTBOXABLE_ATTR, '');
    });

    Services.extensionsFor(win)
        .installExtensionForDoc(ampdoc, REQUIRED_EXTENSION);
  });
}


AMP.extension(TAG, '0.1', ({ampdoc}) => {
  scanDoc(ampdoc);
});
