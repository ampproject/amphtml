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

import {AmpEvents} from '../../../src/amp-events';
import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {
  closest,
  closestBySelector,
  iterateCursor,
  matches,
} from '../../../src/dom';
import {dev} from '../../../src/log';
import {toArray} from '../../../src/types';
import {tryParseJson} from '../../../src/json';


const TAG = 'amp-lightbox-gallery-detection';

export const REQUIRED_EXTENSION = 'amp-lightbox-gallery';
export const LIGHTBOXABLE_ATTR = 'lightbox';

/** Factor of naturalArea vs renderArea to lightbox. */
export const RENDER_AREA_RATIO = 1.2;

/** Factor of renderArea vs viewportArea to lightbox. */
export const VIEWPORT_AREA_RATIO = 0.4;

const ACTIONABLE_ANCESTORS = 'a[href], amp-selector, amp-script, amp-story';
const TAP_ACTION_REGEX = /(;|\s|^)tap\:/;


/** @visibleForTesting */
export class Criteria {

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsAll(element) {
    return Criteria.meetsPlaceholderCriteria(element) &&
      Criteria.meetsSizingCriteria(element) &&
      Criteria.meetsActionableCriteria(element);
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsSizingCriteria(element) {
    const {naturalWidth, naturalHeight} =
        dev().assertElement(element.querySelector('img'));

    const {width: renderWidth, height: renderHeight} = element.getLayoutBox();

    const viewport = Services.viewportForDoc(element);
    const {width: vw, height: vh} = viewport.getSize();

    return meetsSizingCriteria(
        renderWidth,
        renderHeight,
        naturalWidth,
        naturalHeight,
        vw,
        vh);
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsPlaceholderCriteria(element) {
    return !closestBySelector(element, '[placeholder]');
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


/**
 * @param {number} renderWidth
 * @param {number} renderHeight
 * @param {number} naturalWidth
 * @param {number} naturalHeight
 * @param {number} vw
 * @param {number} vh
 * @return {boolean}
 * @visibleForTesting
 */
export function meetsSizingCriteria(
  renderWidth,
  renderHeight,
  naturalWidth,
  naturalHeight,
  vw,
  vh) {

  const viewportArea = vw * vh;
  const naturalArea = naturalWidth * naturalHeight;
  const renderArea = renderWidth * renderHeight;

  const isShrunk =
    (naturalArea / renderArea) >= RENDER_AREA_RATIO;

  const isCoveringSignificantArea =
    (renderArea / viewportArea) >= VIEWPORT_AREA_RATIO;

  const isLargerThanViewport = naturalWidth > vw || naturalHeight > vh;

  return isShrunk || isLargerThanViewport || isCoveringSignificantArea;
}


/** @visibleForTesting */
export class Scanner {

  /**
   * @param {!Document} doc
   * @return {!Promise<!Array<!Element>>}
   */
  static getAllImages(doc) {
    const imgs = toArray(doc.querySelectorAll('amp-img'))
        .filter(img => !img.hasAttribute(LIGHTBOXABLE_ATTR));

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
 * @param {!IArrayLike<T>} haystack
 * @param {function(T):boolean} needleCb
 * @return {?T}
 * @template T
 */
function find(haystack, needleCb) {
  for (let i = 0; i < haystack.length; i++) {
    if (needleCb(haystack[i])) {
      return haystack[i];
    }
  }
  return null;
}


/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {boolean}
 * @visibleForTesting
 */
export function isEnabledForDoc(ampdoc) {
  if (!Services.viewerForDoc(ampdoc).isEmbedded()) {
    return false;
  }

  const scriptTags = ampdoc.getHeadNode().querySelectorAll('script');

  const schemaTag = find(scriptTags,
      t => t.getAttribute('type') == 'application/ld+json');

  const currentScriptTag = find(scriptTags,
      t => t.getAttribute('custom-element') == REQUIRED_EXTENSION);

  const lightboxedElementsSelector = `[${LIGHTBOXABLE_ATTR}]`;

  if (currentScriptTag &&
      ampdoc.getRootNode().querySelector(lightboxedElementsSelector)) {
    return false;
  }

  if (!schemaTag) {
    return false;
  }

  const parsed = tryParseJson(schemaTag./*OK*/innerText);

  if (!parsed) {
    return false;
  }

  return [
    'Article',
    'NewsArticle',
    'BlogPosting',
    'LiveBlogPosting',
    'DiscussionForumPosting',
  ].includes(parsed['@type']);
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
 * @param {!Array<!Element>} images
 */
function applyToScanned(ampdoc, images) {
  const lightboxable = images.filter(meetsCriteria);

  if (lightboxable.length <= 0) {
    return;
  }

  iterateCursor(lightboxable, element => {
    element.setAttribute(LIGHTBOXABLE_ATTR, '');
  });

  Services.extensionsFor(ampdoc.win)
      .installExtensionForDoc(ampdoc, REQUIRED_EXTENSION);
}


/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise}
 */
export function scanDoc(ampdoc) {
  if (!isEnabledForDoc(ampdoc)) {
    return Promise.resolve();
  }

  const maybeApply = () => Scanner.getAllImages(ampdoc.win.document)
      .then(images => {
        applyToScanned(ampdoc, images);
      });

  ampdoc.getRootNode().addEventListener(AmpEvents.DOM_UPDATE, maybeApply);

  return maybeApply();
}


AMP.extension(TAG, '0.1', ({ampdoc}) => {
  ampdoc.whenReady().then(() => {
    scanDoc(ampdoc);
  });
});
