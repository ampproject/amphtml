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

import {dev, user} from '../../../../src/log';
import {isExperimentOn} from '../../../../src/experiments';
import {setStyles} from '../../../../src/style';

export const Presets = {
  'parallax': {
    isFxTypeSupported(unusedWin) {
      return true;
    },
    userAsserts(element) {
      const factorValue = user().assert(
          element.getAttribute('data-parallax-factor'),
          'data-parallax-factor=<number> attribute must be provided for: %s',
          element);
      user().assert(parseFloat(factorValue) > 0,
          'data-parallax-factor must be a number and greater than 0 for: %s',
          element);
    },
    update(entry) {
      const fxElement = this;
      dev().assert(fxElement.adjustedViewportHeight_);
      // outside viewport
      if (!entry.positionRect ||
          entry.positionRect.top > fxElement.adjustedViewportHeight_) {
        return;
      }

      // User provided factor is 1-based for easier understanding.
      // Also negating number since we are using tranformY so negative = upward,
      // positive = downward.
      const adjustedFactor = -(parseFloat(fxElement.getFactor()) - 1);
      const top = entry.positionRect.top;
      // Offset is how much extra to move the element which is position within
      // viewport times adjusted factor.
      const offset = (fxElement.adjustedViewportHeight_ - top) * adjustedFactor;
      fxElement.setOffset(offset);

      if (fxElement.isMutateScheduled()) {
        return;
      }

      // If above the threshold of trigger-position
      fxElement.setIsMutateScheduled(true);
      fxElement.getResources().mutateElement(fxElement.getElement(),
          function() {
            fxElement.setIsMutateScheduled(false);
            // Translate the element offset pixels.
            setStyles(fxElement.getElement(),
                {transform:
                  `translateY(${fxElement.getOffset().toFixed(0)}px)`});
          });
    },
  },
  'fade-in': {
    isFxTypeSupported(win) {
      user().assert(isExperimentOn(win, 'amp-fx-fade-in'),
          'amp-fx-fade-in experiment is not turned on.');
    },
    userAsserts(element) {
      if (!element.hasAttribute('data-margin')) {
        return;
      }
      const margin = element.getAttribute('data-margin');
      user().assert(parseFloat(margin) >= 0 && parseFlogat(margin) < 1,
          'data-margin must be a number and be between 0 and 1 for: %s',
          element);
    },
    update(entry) {
      const fxElement = this;
      dev().assert(fxElement.adjustedViewportHeight_);
      // Outside viewport
      if (!entry.positionRect ||
          entry.positionRect.top >
            (1 - fxElement.getMargin()) * fxElement.adjustedViewportHeight_) {
        return;
      }

      if (fxElement.isMutateScheduled()) {
        return;
      }

      // If above the threshold of trigger-position
      fxElement.setIsMutateScheduled(true);
      fxElement.resources_.mutateElement(fxElement.getElement(), function() {
        fxElement.setIsMutateScheduled(false);
        // Translate the element offset pixels.
        setStyles(fxElement.getElement(), {
          'transition-duration': fxElement.getDuration(),
          'transition-timing-function': fxElement.getEasing(),
          'opacity': 1,
        });
      });
    },
  },
};
