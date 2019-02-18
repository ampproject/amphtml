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
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {dev, devAssert} from '../../../src/log';
import {isAmpElement, iterateCursor} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {resolveFalse, resolveTrue} from './utils/promise';
import {toArray, toWin} from '../../../src/types';
import {tryResolve} from '../../../src/utils/promise';

const MAX_TRAVERSING_DEPTH = 8;
const MAX_TRAVERSING_BREADTH = 8;

const MIN_IMG_SLIDE_AREA_RATIO = 0.5;

/** @private @const {!Object<string, boolean>} */
const ADMISSIBLE_AMP_ELEMENTS = {
  'AMP-FIT-TEXT': true,
  'AMP-IMG': true,
  'AMP-LAYOUT': true,
};

/** @private @const {!Object<string, boolean>} */
const ADMISSIBLE_HTML_ELEMENTS = {
  'A': true,
  'ABBR': true,
  'ACRONYM': true,
  'B': true,
  'BDI': true,
  'BDO': true,
  'BIG': true,
  'BLOCKQUOTE': true,
  'BR': true,
  'CAPTION': true,
  'CENTER': true,
  'CITE': true,
  'DATA': true,
  'DATALIST': true,
  'DIV': true,
  'EM': true,
  'FIGCAPTION': true,
  'FIGURE': true,
  'H1': true,
  'H2': true,
  'H3': true,
  'H4': true,
  'H5': true,
  'H6': true,
  'HGROUP': true,
  'HR': true,
  'I': true,
  'IMG': true,
  'LABEL': true,
  'LEGEND': true,
  'NOBR': true,
  'NOSCRIPT': true,
  'O:P': true,
  'P': true,
  'PRE': true,
  'Q': true,
  'RP': true,
  'RT': true,
  'RTC': true,
  'RUBY': true,
  'S': true,
  'SCRIPT': true,
  'SECTION': true,
  'SMALL': true,
  'SPAN': true,
  'STRIKE': true,
  'STRONG': true,
  'SUB': true,
  'SUMMARY': true,
  'SUP': true,
  'TIME': true,
  'U': true,
  'VAR': true,
  'WBR': true,

  // The following could potentially be admissible but are either unlikely
  // to be used where auto-lightbox is desired, or are obsolete.
  // This list is kept but commented-out to keep track of possible elements to
  // consider.
  // 'ADDRESS': true,
  // 'ARTICLE': true,
  // 'ASIDE': true,
  // 'CODE': true,
  // 'DD': true,
  // 'DEL': true,
  // 'DFN': true,
  // 'DL': true,
  // 'DT': true,
  // 'FOOTER': true,
  // 'HEADER': true,
  // 'INS': true,
  // 'KBD': true,
  // 'LISTING': true,
  // 'MAIN': true,
  // 'MARK': true,
  // 'METER': true,
  // 'MULTICOL': true,
  // 'NAV': true,
  // 'NEXTID': true,
  // 'SAMP': true,
  // 'SPACER': true,
};

export class CarouselCriteria {
  /**
   * @param {!Element} element
   * @return {!Promise<boolean>}
   */
  static meetsAll(element) {
    const win = toWin(element.ownerDocument.defaultView);

    if (!isExperimentOn(win, 'amp-auto-lightbox-carousel')) {
      return resolveFalse();
    }

    const slides = element.querySelectorAll('.amp-carousel-slide');
    const images = element.querySelectorAll('amp-img');

    if (images.length < 1) {
      return resolveFalse();
    }

    if (slides.length != images.length) {
      return resolveFalse();
    }

    let promise = resolveTrue();

    iterateCursor(slides, slide => {
      promise = promise.then(previousWasAccepted => {
        if (!previousWasAccepted) {
          return false;
        }
        return SlideCriteria.meetsAll(slide);
      });
    });

    return promise;
  }
}

class SlideCriteria {

  /**
   * @param {!Element} element
   * @return {!Promise<boolean>}
   */
  static meetsAll(element) {
    if (element.tagName == 'AMP-IMG') {
      // Already traversed up the tree, we only need to check the immediate
      // action.
      const actionLookupStopAt = dev().assertElement(element.parentElement);
      const actions = Services.actionServiceForDoc(element);
      return tryResolve(() =>
        !actions.hasResolvableAction(element, 'tap', actionLookupStopAt));
    }

    const img = element.querySelector('amp-img');
    if (!img) {
      return resolveFalse();
    }

    const slideMeetsSizingPromise =
        SlideCriteria.meetsSizingCriteria(img, element);

    return slideMeetsSizingPromise.then(slideMeetsSizingCriteria => {
      if (!slideMeetsSizingCriteria) {
        return false;
      }
      return SlideCriteria.meetsAllSync(element, /* depth */ 0);
    });
  }

  /**
   * @param {!Element} element
   * @param {number} depth
   * @return {boolean}
   */
  static meetsAllSync(element, depth) {
    if (depth > MAX_TRAVERSING_DEPTH) {
      return false;
    }
    if (!isElementAdmissible(element)) {
      return false;
    }
    // Already traversed up the tree, we only need to check the immediate
    // action.
    const actionLookupStopAt = dev().assertElement(element.parentElement);
    const actions = Services.actionServiceForDoc(element);
    if (actions.hasResolvableAction(element, 'tap', actionLookupStopAt)) {
      return false;
    }
    if (!shouldElementBeTraversed(element)) {
      return true;
    }
    const {children} = element;
    if (children.length > MAX_TRAVERSING_BREADTH) {
      return false;
    }
    return toArray(children).every(child =>
      SlideCriteria.meetsAllSync(child, depth + 1));
  }

  /**
   * @param {!AmpElement} img
   * @param {!Element} slide
   * @return {!Promise<boolean>}
   */
  static meetsSizingCriteria(img, slide) {
    devAssert(img.tagName == 'AMP-IMG');

    return img.getImpl().then(impl => new Promise(resolve => {
      impl.measureElement(() => {
        const {
          width: imgWidth,
          height: imgHeight,
        } = img.getLayoutBox();

        const {
          width: slideWidth,
          height: slideHeight,
        } = slide./*OK*/getBoundingClientRect();

        const imgArea = imgWidth * imgHeight;
        const slideArea = slideWidth * slideHeight;

        resolve((imgArea / slideArea) >= MIN_IMG_SLIDE_AREA_RATIO);
      });
    }));
  }
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
function isElementAdmissible(element) {
  if (isAmpElement(element)) {
    return isAmpElementAdmissible(element);
  }
  const {tagName} = element;
  if (ADMISSIBLE_HTML_ELEMENTS[tagName]) {
    return (tagName != 'A' || !element.hasAttribute('href'));
  }
  return false;
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
function isAmpElementAdmissible(element) {
  const {tagName} = element;
  if (ADMISSIBLE_AMP_ELEMENTS[tagName]) {
    return true;
  }
  if (element.getAttribute('layout') == Layout.NODISPLAY) {
    return (tagName.indexOf('LIGHTBOX') < 0);
  }
  if (element.children.length == 1 &&
      element.firstElementChild.tagName == 'SCRIPT') {
    return true;
  }
  return false;
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
function shouldElementBeTraversed(element) {
  if (isAmpElement(element)) {
    return element.tagName == 'AMP-LAYOUT';
  }
  return true;
}
