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

import {closestAncestorElementBySelector} from '../../../src/dom';
import {exponentialFalloff} from './amp-inline-gallery-pagination';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setImportantStyles} from '../../../src/style.js';
import {userAssert} from '../../../src/log';

export class AmpInlineGalleryCaptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-inline-gallery-captions') ||
        'expected "amp-inline-gallery-captions" experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const {height} = this./*OK*/ getLayoutBox();
    const parentGallery = closestAncestorElementBySelector(
      this.element,
      'amp-inline-gallery'
    );

    setImportantStyles(parentGallery, {
      '--i-amphtml-caption-height': `${height}px`,
    });
  }

  /**
   * @param {number} unusedTotal
   * @param {number} index
   * @param {number} offset
   * @param {!Array<!Element>} slides
   */
  updateProgress(unusedTotal, index, offset, slides) {
    this.mutateElement(() => {
      this.updateCaptionOpacities_(slides, index, offset);
    });
  }

  /**
   * Updates the opacities of the captions, based on their distance from the
   * current slide.
   * @param {!Array<!Element>} slides
   * @param {number} index
   * @param {number} offset
   */
  updateCaptionOpacities_(slides, index, offset) {
    slides.forEach((slide, i) => {
      const indexDistance = Math.abs(index + offset - i);
      // Want to fall off to zero at the mid way point, the next/prev slide
      // will start fading in at the same time.
      const falloffDistance = Math.min(2 * indexDistance, 1);
      const opacity = exponentialFalloff(falloffDistance, 3);
      setImportantStyles(slide, {
        '--caption-opacity': opacity,
        // Need to prevent pointer events on all other slide's captions so
        // that the user can select the caption text, click on links, etc.
        'pointer-events': opacity == 0 ? 'none' : 'all',
      });
    });
  }
}
