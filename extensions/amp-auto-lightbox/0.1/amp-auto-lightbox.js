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
import {closestBySelector} from '../../../src/dom';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {toArray} from '../../../src/types';
import {tryParseJson} from '../../../src/json';


const TAG = 'amp-auto-lightbox';

export const REQUIRED_EXTENSION = 'amp-lightbox-gallery';
export const LIGHTBOXABLE_ATTR = 'lightbox';

export const VISITED_ATTR = 'i-amphtml-auto-lightbox-visited';

export const ENABLED_SCHEMA_TYPES = [
  'Article',
  'NewsArticle',
  'BlogPosting',
  'LiveBlogPosting',
  'DiscussionForumPosting',
];

/** Factor of naturalArea vs renderArea to lightbox. */
export const RENDER_AREA_RATIO = 1.2;

/** Factor of renderArea vs viewportArea to lightbox. */
export const VIEWPORT_AREA_RATIO = 0.3;

const ACTIONABLE_ANCESTORS =
    'a[href], amp-selector [option], amp-script, amp-story, button';


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
    if (closestBySelector(element, ACTIONABLE_ANCESTORS)) {
      return false;
    }
    const actions = Services.actionServiceForDoc(element);
    return !actions.hasAction(element, 'tap');
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
   * @return {!Array<!Promise<?Element>>}
   */
  static getAllImages(doc) {
    const potentialImgsSelector =
        `amp-img:not([${LIGHTBOXABLE_ATTR}]):not(${VISITED_ATTR})`;

    const imgs = toArray(doc.querySelectorAll(potentialImgsSelector));

    // mark as visited so we don't rescan items on DOM_UPDATE
    return imgs.map(img => img.signals().whenSignal(CommonSignals.LOAD_END)
        .then(
            () =>
              Mutation.mutate(img, () => {
                img.setAttribute(VISITED_ATTR, '');
              }).then(() => img),
            () => null));
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


/** @visibleForTesting */
export class Schema {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {?string}
   */
  static getDocumentType(ampdoc) {
    const schemaTags = ampdoc.getHeadNode().querySelectorAll(
        'script[type="application/ld+json"]');

    if (schemaTags.length <= 0) {
      return null;
    }

    const {canonicalUrl} = Services.documentInfoForDoc(ampdoc);

    for (let i = 0; i < schemaTags.length; i++) {
      const schemaTag = schemaTags[i];
      const parsed = tryParseJson(schemaTag./*OK*/innerText);

      if (parsed &&
        'url' in parsed &&
        parsed['url'] == canonicalUrl) {

        return parsed['@type'];
      }
    }

    return null;
  }
}


/** @visibleForTesting */
export class Mutation {
  /**
   * @param {!Element} ampEl
   * @param {function()} mutator
   * @return {!Promise}
   */
  static mutate(ampEl, mutator) {
    return ampEl.getImpl().then(impl => impl.mutateElement(mutator));
  }
}


/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {boolean}
 */
function usesLightboxExplicitly(ampdoc) {
  const requiredExtensionSelector =
      `script[custom-element="${REQUIRED_EXTENSION}"]`;

  const currentScriptTag =
      ampdoc.getRootNode().querySelector(requiredExtensionSelector);

  const lightboxedElementsSelector = `[${LIGHTBOXABLE_ATTR}]`;

  return !!currentScriptTag &&
    !!ampdoc.getRootNode().querySelector(lightboxedElementsSelector);
}


/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {boolean}
 * @visibleForTesting
 */
export function isEnabledForDoc(ampdoc) {
  const {win} = ampdoc;
  const viewer = Services.viewerForDoc(ampdoc);
  if ((!viewer.isEmbedded() || !viewer.isTrustedViewer()) &&
      // allow `localDev` in lieu of viewer for manual testing, except in tests
      // where we need all checks.
      (!getMode(win).localDev || getMode(win).test)) {
    return false;
  }

  if (usesLightboxExplicitly(ampdoc)) {
    return false;
  }

  return ENABLED_SCHEMA_TYPES.includes(Schema.getDocumentType(ampdoc));
}


/** @private {number} */
let uid = 0;


/** @return {string} */
function generateLightboxUid() {
  return `i-amphtml-auto-lightbox-${uid++}`;
}


/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} img
 * @return {!Promise}
 */
function apply(ampdoc, img) {
  return Mutation.mutate(img, () => {
    img.setAttribute(LIGHTBOXABLE_ATTR, generateLightboxUid());
  }).then(() => {
    Services.extensionsFor(ampdoc.win)
        .installExtensionForDoc(ampdoc, REQUIRED_EXTENSION);
  });
}


/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Array<!Promise>}
 */
export function scanDoc(ampdoc) {
  if (!isEnabledForDoc(ampdoc)) {
    return [];
  }

  const maybeApplyAll = () => Scanner.getAllImages(ampdoc.win.document)
      .map(imgPromise => imgPromise.then(imgOrNull => {
        if (!imgOrNull) {
          return;
        }
        const img = dev().assertElement(imgOrNull);
        if (!Criteria.meetsAll(img)) {
          return;
        }
        return apply(ampdoc, img);
      }));

  // TODO(alanorozco): Notify `amp-lightbox-gallery`
  ampdoc.getRootNode().addEventListener(AmpEvents.DOM_UPDATE, maybeApplyAll);

  return maybeApplyAll();
}


AMP.extension(TAG, '0.1', ({ampdoc}) => {
  ampdoc.whenReady().then(() => {
    scanDoc(ampdoc);
  });
});
