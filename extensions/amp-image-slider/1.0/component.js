/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '#preact';
import {ContainWrapper} from '#preact/component';
import {Gestures} from '../../../src/gesture';
import {Services} from '#service';
import {forwardRef} from '#preact/compat';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {useStyles} from './component.jss';

/**
 * @param {!ImageSliderDef.Props} props
 * @param ref
 * @return {PreactDef.Renderable}
 */
export function ImageSliderWithRef(
  {children, initialPosition, shouldHintReappear, stepSize = 0.1, ...rest},
  ref
) {
  /** Common variables */
  const containsAmpImages = false;
  const gestures = useMemo(() => {
    return Gestures.get(ref.current);
  }, [ref]);
  const isEdge = useMemo(() => {
    const win = ref.current.ownerDocument.defaultView;
    Services.platformFor(win).isEdge();
  }, [ref]);
  const isEventRegistered = false;

  /** Container Reference */
  const containerRef = useRef(null);

  /** Image References */
  const leftImageRef = useRef(null);
  const rightImageRef = useRef(null);

  /** Label References */
  const leftLabelWrapperRef = useRef(null);
  const leftLabelRef = useRef(null);
  const rightLabelWrapperRef = useRef(null);
  const rightLabelRef = useRef(null);

  /** Mask References */
  const leftMakRef = useRef(null);
  const rightMaskRef = useRef(null);

  /** Bar Reference */
  const barRef = useRef(null);

  /** Arrow References */
  const leftHintArrowRef = useRef(null);
  const rightHintArrowRef = useRef(null);

  /** Hint Body References */
  const leftHintBodyRef = useRef(null);
  const rightHintBodyRef = useRef(null);

  const [exampleValue, setExampleValue] = useState(0);
  const styles = useStyles();

  useEffect(() => {
    /* Do things */
  }, []);
  useLayoutEffect(() => {
    /* Do things */
  }, []);
  useMemo(() => {
    /* Do things */
  }, []);

  return (
    <div
      ref={containerRef}
      class="i-amphtml-image-slider-container"
      layout
      size
      paint
      {...rest}
    >
      {/* Image Wrappers -------------------------------------------------------- */}
      <div ref={leftMakRef} class="i-amphtml-image-slider-left-mask">
        left mask
        <div
          ref={leftLabelWrapperRef}
          class="i-amphtml-image-slider-label-wrapper"
        >
          left label wrapper -- only add if leftLabel_ present
          <img ref={leftImageRef}></img>
          <label ref={leftLabelRef}></label>
        </div>
      </div>

      <div
        ref={rightMaskRef}
        class="i-amphtml-image-slider-right-mask i-amphtml-image-slider-push-right"
      >
        right mask
        <div
          ref={rightLabelWrapperRef}
          class="i-amphtml-image-slider-push-left"
        >
          right label wrapper -- only add if rightLabel_ present
          <img ref={rightImageRef}></img>
          <label ref={rightLabelRef}></label>
        </div>
      </div>
      {/* Bar ------------------------------------------------------------------- */}
      <div
        ref={barRef}
        class="i-amphtml-image-slider-bar i-amphtml-image-slider-push-right"
      >
        <div class="i-amphtml-image-slider-bar-stick i-amphtml-image-slider-push-left"></div>
      </div>

      {/* Hints ----------------------------------------------------------------- */}
      {/*
          // Switch to attach left and right hint separately
          // and translate each of the two independently.
          // This addresses:
          // 1. Safari glitch that causes flashing arrows when 2 arrows are placed
          //   in any kind of normal DOM flow (inline-block, flex, grid, etc.)
          // 2. Edge glitch that forgets to update second child position if its
          //   parent have updated its own transform
          // Notice: hints are attached after amp-img finished loading
     */}
      <div ref={leftHintBodyRef} class="i-amphtml-image-slider-hint">
        left hint body
        <div class="i-amphtml-image-slider-hint-left-wrapper">
          left hint wrapper
          <div ref={leftHintArrowRef} class="amp-image-slider-hint-left">
            left hint arrow
          </div>
        </div>
      </div>
      <div ref={rightHintBodyRef} class="i-amphtml-image-slider-hint">
        right hint body
        <div class="i-amphtml-image-slider-hint-right-wrapper">
          right hint wrapper
          <div ref={rightHintArrowRef} class="amp-image-slider-hint-right">
            right hint arrow
          </div>
        </div>
      </div>

      {/* checkARIA ------------------------------------------------------------- */}
    </div>
  );
}

const ImageSlider = forwardRef(ImageSliderWithRef);
ImageSlider.displayName = 'ImageSlider'; // Make findable for tests.
export {ImageSlider};
