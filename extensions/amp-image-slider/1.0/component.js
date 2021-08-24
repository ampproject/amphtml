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

import {createElementWithAttributes} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';
import {useStyles} from './component.jss';

const VALID_IMAGE_TAGNAMES = new Set(['AMP-IMG', 'IMG']);

/**
 * @param {!ImageSliderDef.Props} props
 * @param ref
 * @return {PreactDef.Renderable}
 */
export function ImageSliderWithRef(
  {
    images,
    initialPosition,
    labels,
    shouldHintReappear,
    stepSize = 0.1,
    ...rest
  },
  ref
) {
  /** Common variables */
  let containsAmpImages;
  const gestures = useRef(null);
  const {isEdge, setIsEdge} = useState();
  const isEventRegistered = false;
  const styles = useStyles();

  /** Common variables */
  const win = useRef(null);
  const doc = useRef(null);

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
  const leftMaskRef = useRef(null);
  const rightMaskRef = useRef(null);

  /** Bar Reference */
  const barRef = useRef(null);

  /** Arrow References */
  const leftHintArrowRef = useRef(null);
  const rightHintArrowRef = useRef(null);

  /** Hint Body References */
  const leftHintBodyRef = useRef(null);
  const rightHintBodyRef = useRef(null);

  const buildImageWrappers = useCallback(() => {
    leftMaskRef.current = createElementWithAttributes(doc.current, 'div');
    rightMaskRef.current = createElementWithAttributes(doc.current, 'div');
    containerRef.current.appendChild(leftMaskRef.current);
    containerRef.current.appendChild(rightMaskRef.current);

    leftMaskRef.current.classList.add('i-amphtml-image-slider-left-mask');

    if (leftLabelRef.current != undefined) {
      leftLabelWrapperRef.current = createElementWithAttributes(
        doc.current,
        'div'
      );
      leftLabelWrapperRef.current.classList.add(
        'i-amphtml-image-slider-label-wrapper'
      );
      leftLabelWrapperRef.current.appendChild(leftLabelRef.current);
      leftMaskRef.current.appendChild(leftLabelWrapperRef.current);
    }

    rightMaskRef.current.classList.add('i-amphtml-image-slider-right-mask');
    rightMaskRef.current.classList.add('i-amphtml-image-slider-push-right');
    rightImageRef.current.classList.add('i-amphtml-image-slider-push-left');
    if (rightLabelRef.current != undefined) {
      rightLabelWrapperRef.current = createElementWithAttributes(
        doc.current,
        'div'
      );
      rightLabelWrapperRef.current.classList.add(
        'i-amphtml-image-slider-label-wrapper'
      );

      rightLabelWrapperRef.current.classList.add(
        'i-amphtml-image-slider-push-left'
      );
      rightLabelWrapperRef.current.appendChild(rightLabelRef.current);
      rightMaskRef.current.appendChild(rightLabelWrapperRef.current);
    }
  }, []);

  const buildBar = useCallback(() => {
    barRef.current = htmlFor(
      doc.current
    )`<div class='i-amphtml-image-slider-bar i-amphtml-image-slider-push-right'>
      <div class='i-amphtml-image-slider-bar-stick i-amphtml-image-slider-push-left'></div>
    </div>`;

    containerRef.current.appendChild(barRef.current);
  }, []);

  const buildHint = useCallback(() => {
    // Switch to attach left and right hint separately
    // and translate each of the two independently.
    // This addresses:
    // 1. Safari glitch that causes flashing arrows when 2 arrows are placed
    //   in any kind of normal DOM flow (inline-block, flex, grid, etc.)
    // 2. Edge glitch that forgets to update second child position if its
    //   parent have updated its own transform
    leftHintBodyRef.current = createElementWithAttributes(doc.current, 'div');
    leftHintBodyRef.current.classList.add('i-amphtml-image-slider-hint');
    rightHintBodyRef.current = createElementWithAttributes(doc.current, 'div');
    rightHintBodyRef.current.classList.add('i-amphtml-image-slider-hint');

    const leftHintWrapper = createElementWithAttributes(doc.current, 'div');
    leftHintWrapper.classList.add('i-amphtml-image-slider-hint-left-wrapper');
    const rightHintWrapper = createElementWithAttributes(doc.current, 'div');
    rightHintWrapper.classList.add('i-amphtml-image-slider-hint-right-wrapper');

    leftHintArrowRef.current = createElementWithAttributes(doc.current, 'div');
    leftHintArrowRef.current.classList.add('amp-image-slider-hint-left');
    rightHintArrowRef.current = createElementWithAttributes(doc.current, 'div');
    rightHintArrowRef.current.classList.add('amp-image-slider-hint-right');

    leftHintWrapper.appendChild(leftHintArrowRef.current);
    rightHintWrapper.appendChild(rightHintArrowRef.current);
    leftHintBodyRef.current.appendChild(leftHintWrapper);
    rightHintBodyRef.current.appendChild(rightHintWrapper);
    // Notice: hints are attached after amp-img finished loading
  }, []);

  // /**
  //  * Check if aria attributes are correctly set
  //  * If not, apply default and warn user in console
  //  * @private
  //  */
  // const checkARIA = useCallback(() => {
  //   if (!this.containsAmpImages_) {
  //     return;
  //   }

  //   // Only if there are AMP-IMG Elements in use should this pathway execute.
  //   const leftAmpImage = dev().assertElement(this.leftImage_);
  //   const rightAmpImage = dev().assertElement(this.rightImage_);
  //   leftAmpImage
  //     .signals()
  //     .whenSignal(CommonSignals.LOAD_END)
  //     .then(() => {
  //       if (leftAmpImage.childElementCount > 0) {
  //         const img = leftAmpImage.querySelector('img');
  //         let newAltText;
  //         this.measureMutateElement(
  //           () => {
  //             const ariaSuffix =
  //               leftAmpImage.getAttribute('data-left-image-aria-suffix') ||
  //               'left image';
  //             if (leftAmpImage.hasAttribute('alt')) {
  //               newAltText = `${leftAmpImage.getAttribute(
  //                 'alt'
  //               )}, ${ariaSuffix}`;
  //             } else {
  //               newAltText = ariaSuffix;
  //             }
  //           },
  //           () => {
  //             img.setAttribute('alt', newAltText);
  //           }
  //         );
  //       }
  //     });
  //   rightAmpImage
  //     .signals()
  //     .whenSignal(CommonSignals.LOAD_END)
  //     .then(() => {
  //       if (rightAmpImage.childElementCount > 0) {
  //         const img = rightAmpImage.querySelector('img');
  //         let newAltText;
  //         this.measureMutateElement(
  //           () => {
  //             const ariaSuffix =
  //               rightAmpImage.getAttribute('data-right-image-aria-suffix') ||
  //               'right image';
  //             if (rightAmpImage.hasAttribute('alt')) {
  //               newAltText = `${rightAmpImage.getAttribute(
  //                 'alt'
  //               )}, ${ariaSuffix}`;
  //             } else {
  //               newAltText = ariaSuffix;
  //             }
  //           },
  //           () => {
  //             img.setAttribute('alt', newAltText);
  //           }
  //         );
  //       }
  //     });
  // }, []);

  useEffect(() => {
    /** Common variables */
    win.current = containerRef.current.ownerDocument.defaultView;
    doc.current = containerRef.current.ownerDocument;
    //setIsEdge(Services.platformFor(win).isEdge());

    /** Retrive Images */
    images.forEach((child) => {
      console.log(child);
      if (VALID_IMAGE_TAGNAMES.has(child.type.toUpperCase())) {
        if (leftImageRef.current == null) {
          // First encountered = left image
          leftImageRef.current = createElementWithAttributes(
            doc.current,
            child.type,
            child.props
          );
        } else if (rightImageRef.current == null) {
          // Second encountered = right image
          rightImageRef.current = createElementWithAttributes(
            doc.current,
            child.type,
            child.props
          );
        } else {
          // TODO (@AnuragVasanwala): Assert Error - Should not contain more than 2 images.
        }
      }
    });

    // TODO (@AnuragVasanwala): Assert error if images != 2

    /** Retrive Lables */
    labels.forEach((child) => {
      if (child.type.toUpperCase() === 'DIV') {
        if (child.props.first !== undefined) {
          // Fetch first(left) Image Lable
          leftLabelRef.current = createElementWithAttributes(
            doc.current,
            child.type,
            child.props
          );
          leftLabelRef.current./*OK*/ innerHTML = child.key./*OK*/ innerHTML;
        } else if (child.props.second !== undefined) {
          // Fetch second(right) Image Lable
          rightLabelRef.current = createElementWithAttributes(
            doc.current,
            child.type,
            child.props
          );
          rightLabelRef.current./*OK*/ innerHTML = child.key./*OK*/ innerHTML;
        } else {
          // TODO (@AnuragVasanwala): Assert Error - Should not contain div rather than first and second
        }
      }
    });

    buildImageWrappers();
    buildBar();
    // Notice: hints are attached after amp-img finished loading
    buildHint();
    // checkARIA();

    leftMaskRef.current.appendChild(leftImageRef.current);
    rightMaskRef.current.appendChild(rightImageRef.current);
  }, [images, labels, buildImageWrappers, buildBar, buildHint]);
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
    ></div>
  );
}

const ImageSlider = forwardRef(ImageSliderWithRef);
ImageSlider.displayName = 'ImageSlider'; // Make findable for tests.
export {ImageSlider};
