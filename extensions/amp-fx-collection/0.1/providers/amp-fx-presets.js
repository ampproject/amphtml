/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {computedStyle, setStyles} from '../../../../src/style';
import {dev, user} from '../../../../src/log';

export const Presets = {
  'parallax': {
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
      dev().assert(fxElement.adjustedViewportHeight);
      const top = entry.positionRect ? entry.positionRect.top : null;
      // outside viewport
      if (!top || top > fxElement.adjustedViewportHeight) {
        return;
      }

      // User provided factor is 1-based for easier understanding.
      // Also negating number since we are using tranformY so negative = upward,
      // positive = downward.
      const adjustedFactor = -(parseFloat(fxElement.getFactor()) - 1);
      // Offset is how much extra to move the element which is position within
      // viewport times adjusted factor.
      const offset = (fxElement.adjustedViewportHeight - top) * adjustedFactor;
      fxElement.setOffset(offset);

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.getElement(),
          {transform:
            `translateY(${fxElement.getOffset().toFixed(0)}px)`});
    },
  },
  'fly-in-bottom': {
    userAsserts(element) {
      const marginStart = parseFloat(element.getAttribute('data-margin-start'));
      if (!marginStart) {
        return;
      }
      user().assert(marginStart >= 0 && marginStart <= 100,
          'data-margin-start must be a percentage value ' +
          'and be between 0% and 100% for: %s', element);
    },
    update(entry) {
      const fxElement = this;
      dev().assert(fxElement.viewportHeight);
      const top = entry.positionRect ? entry.positionRect.top : null;
      // Outside viewport
      if (!top || top - (fxElement.viewportHeight *
        fxElement.getFlyInDistance() / 100) >
          (1 - fxElement.getMarginStart()) *
            fxElement.viewportHeight) {
        return;
      }

      // only do this on the first element
      if (!fxElement.initialTrigger) {
        fxElement.getResources().mutateElement(
            fxElement.getElement(), function() {
              const style = computedStyle(fxElement.getAmpDoc().win,
                  fxElement.getElement());
              const topAsLength = style.top == 'auto' ? '0px' : style.top;
              setStyles(fxElement.getElement(), {
                'top': `calc(${topAsLength} +
                  ${fxElement.getFlyInDistance()}vh)`,
                'visibility': 'visible',
              });
              fxElement.initialTrigger = true;
            });
      }

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.getElement(), {
        'transition-duration': fxElement.getDuration(),
        'transition-timing-function': fxElement.getEasing(),
        'transform': `translateY(-${fxElement.getFlyInDistance()}vh)`,
      });
    },
  },
  'fly-in-left': {
    userAsserts(element) {
      const marginStart = parseFloat(element.getAttribute('data-margin-start'));
      if (!marginStart) {
        return;
      }
      user().assert(marginStart >= 0 && marginStart <= 100,
          'data-margin-start must be a percentage value ' +
          'and be between 0% and 100% for: %s', element);
    },
    update(entry) {
      const fxElement = this;
      dev().assert(fxElement.viewportHeight);
      const top = entry.positionRect ? entry.positionRect.top : null;
      // Outside viewport
      if (!top || top > (1 - fxElement.getMarginStart()) *
        fxElement.viewportHeight) {
        return;
      }

      // only do this on the first element
      if (!fxElement.initialTrigger) {
        fxElement.getResources().mutateElement(
            fxElement.getElement(), function() {
              const style = computedStyle(fxElement.getAmpDoc().win,
                  fxElement.getElement());
              const leftAsLength = style.left == 'auto' ? '0px' : style.left;
              setStyles(fxElement.getElement(), {
                'left':
                  `calc(${leftAsLength} - ${fxElement.getFlyInDistance()}vw)`,
                'visibility': 'visible',
              });
              fxElement.initialTrigger = true;
            });
      }

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.getElement(), {
        'transition-duration': fxElement.getDuration(),
        'transition-timing-function': fxElement.getEasing(),
        'transform': `translateX(${fxElement.getFlyInDistance()}vw)`,
      });
    },
  },
  'fly-in-right': {
    userAsserts(element) {
      const marginStart = parseFloat(element.getAttribute('data-margin-start'));
      if (!marginStart) {
        return;
      }
      user().assert(marginStart >= 0 && marginStart <= 100,
          'data-margin-start must be a percentage value ' +
          'and be between 0% and 100% for: %s', element);
    },
    update(entry) {
      const fxElement = this;
      dev().assert(fxElement.viewportHeight);
      const top = entry.positionRect ? entry.positionRect.top : null;
      // Outside viewport
      if (!top || top > (1 - fxElement.getMarginStart()) *
        fxElement.viewportHeight) {
        return;
      }

      // only do this on the first element
      if (!fxElement.initialTrigger) {
        fxElement.getResources().mutateElement(
            fxElement.getElement(), function() {
              const style = computedStyle(fxElement.getAmpDoc().win,
                  fxElement.getElement());
              const leftAsLength = style.left == 'auto' ? '0px' : style.left;
              setStyles(fxElement.getElement(), {
                'left':
                  `calc(${leftAsLength} + ${fxElement.getFlyInDistance()}vw)`,
                'visibility': 'visible',
              });
              fxElement.initialTrigger = true;
            });
      }

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.getElement(), {
        'transition-duration': fxElement.getDuration(),
        'transition-timing-function': fxElement.getEasing(),
        'transform': `translateX(-${fxElement.getFlyInDistance()}vw)`,
      });
    },
  },
  'fly-in-top': {
    userAsserts(element) {
      const marginStart = parseFloat(element.getAttribute('data-margin-start'));
      if (!marginStart) {
        return;
      }
      user().assert(marginStart >= 0 && marginStart <= 100,
          'data-margin-start must be a percentage value ' +
          'and be between 0% and 100% for: %s', element);
    },
    update(entry) {
      const fxElement = this;
      dev().assert(fxElement.viewportHeight);
      const top = entry.positionRect ? entry.positionRect.top : null;
      // Outside viewport
      if (!top || top + (fxElement.viewportHeight *
        fxElement.getFlyInDistance() / 100) >
          (1 - fxElement.getMarginStart()) *
            fxElement.viewportHeight) {
        return;
      }

      // only do this on the first element
      if (!fxElement.initialTrigger) {
        fxElement.getResources().mutateElement(
            fxElement.getElement(), function() {
              const style = computedStyle(fxElement.getAmpDoc().win,
                  fxElement.getElement());
              const topAsLength = style.top == 'auto' ? '0px' : style.top;
              setStyles(fxElement.getElement(), {
                'top': `calc(${topAsLength} -
                  ${fxElement.getFlyInDistance()}vh)`,
                'visibility': 'visible',
              });
              fxElement.initialTrigger = true;
            });
      }

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.getElement(), {
        'transition-duration': fxElement.getDuration(),
        'transition-timing-function': fxElement.getEasing(),
        'transform': `translateY(${fxElement.getFlyInDistance()}vh)`,
      });
    },
  },
  'fade-in': {
    userAsserts(element) {
      const marginStart = parseFloat(element.getAttribute('data-margin-start'));
      if (!marginStart) {
        return;
      }
      user().assert(marginStart >= 0 && marginStart <= 100,
          'data-margin-start must be a percentage value ' +
          'and be between 0% and 100% for: %s', element);
    },
    update(entry) {
      const fxElement = this;
      dev().assert(fxElement.viewportHeight);
      const top = entry.positionRect ? entry.positionRect.top : null;
      // Outside viewport
      if (!top || top > (1 - fxElement.getMarginStart()) *
        fxElement.viewportHeight) {
        return;
      }

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.getElement(), {
        'transition-duration': fxElement.getDuration(),
        'transition-timing-function': fxElement.getEasing(),
        'opacity': 1,
      });
    },
  },
  'fade-in-scroll': {
    userAsserts(element) {
      const marginStart = parseFloat(element.getAttribute('data-margin-start'));
      const marginEnd = parseFloat(element.getAttribute('data-margin-end'));

      if (!marginStart && !marginEnd) {
        return;
      }
      user().assert(marginStart >= 0 && marginStart <= 100,
          'data-margin-start must be a percentage value ' +
          'and be between 0% and 100% for: %s', element);
      user().assert(marginEnd >= 0 && marginEnd <= 100,
          'data-margin-end must be a percentage value ' +
          'and be between 0% and 100% for: %s', element);

      user().assert(marginEnd > marginStart,
          'data-margin-end must be greater than data-margin-start for: %s',
          element);
    },
    update(entry) {
      const fxElement = this;
      dev().assert(fxElement.adjustedViewportHeight);
      const top = entry.positionRect ? entry.positionRect.top : null;
      // Outside viewport or margins
      if (!top || (top > (1 - fxElement.getMarginStart()) *
        fxElement.adjustedViewportHeight)) {
        return;
      }

      // Early exit if the animation doesn't need to repeat and it is fully
      // opaque.
      if (!fxElement.hasRepeat() && fxElement.getOffset() >= 1) {
        return;
      }
      // Translate the element offset pixels.
      const marginDelta = fxElement.getMarginEnd() - fxElement.getMarginStart();
      // Offset is how much extra to move the element which is position within
      // viewport times adjusted factor.
      const offset = 1 * (fxElement.viewportHeight - top -
        (fxElement.getMarginStart() * fxElement.viewportHeight)) /
        (marginDelta * fxElement.viewportHeight);
      fxElement.setOffset(offset);

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.getElement(), {opacity: fxElement.getOffset()});
    },
  },
};
