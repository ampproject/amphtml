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
import {devAssert} from '../../../src/log';
import {isActionableByTap} from '../../../src/auto-lightbox';
import {isExperimentOn} from '../../../src/experiments';
import {iterateCursor} from '../../../src/dom';
import {resolveFalse, resolveTrue} from './utils/promise';
import {toWin} from '../../../src/types';
import {tryResolve} from '../../../src/utils/promise';

const MIN_IMG_SLIDE_AREA_RATIO = 0.5;

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
      return tryResolve(() => !isActionableByTap(element));
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
      return !isActionableByTap(element);
    });
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
