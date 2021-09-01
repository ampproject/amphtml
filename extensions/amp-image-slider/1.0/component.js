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

import {createElementWithAttributes} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';
import {setStyle} from '#core/dom/style';
import {clamp} from '#core/math';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';

// import {Services} from '#service';

import {useStyles} from './component.jss';

import {listen} from '../../../src/event-helper';
import {Gestures} from '../../../src/gesture';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';

const VALID_IMAGE_TAGNAMES = new Set(['AMP-IMG', 'IMG']);

/**
 * @param {!ImageSliderDef.Props} props
 * @param {{current: ?ImageSliderDef.ImageSliderApi}} ref
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
  const gesturesRef = useRef(null);
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

  /** Unlisten Handlers for Mouse */
  const unlistenMouseUp = useRef(null);
  const unlistenMouseDown = useRef(null);
  const unlistenMouseMove = useRef(null);

  /** Unlisten Handlers for Keyboard */
  const unlistenKeyDown = useRef(null);

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

  const animateHideHint = useCallback(() => {
    leftHintBodyRef.current.classList.add('i-amphtml-image-slider-hint-hidden');
    rightHintBodyRef.current.classList.add(
      'i-amphtml-image-slider-hint-hidden'
    );
  }, []);

  const animateShowHint = useCallback(() => {
    //this.mutateElement(() => {
    leftHintBodyRef.current.classList.remove(
      'i-amphtml-image-slider-hint-hidden'
    );
    rightHintBodyRef.current.classList.remove(
      'i-amphtml-image-slider-hint-hidden'
    );
    //});
  }, []);

  /** Listen / Unlisten Handler */
  /**
   * Unlisten a listener and clear. If null, does nothing
   * @param {?UnlistenDef} unlistenHandle
   * @private
   */
  const unlisten = useCallback((unlistenHandle) => {
    if (unlistenHandle) {
      unlistenHandle();
      unlistenHandle = null;
    }
  }, []);

  const unregisterTouchGestures = useCallback(() => {
    if (gesturesRef.current == null) {
      return;
    }
    gesturesRef.current.cleanup();
    gesturesRef.current = null;
  }, []);

  /**
   * Unregister events
   * @private
   */
  const unregisterEvents = useCallback(() => {
    unlisten(unlistenMouseDown.current);
    unlisten(unlistenMouseMove.current);
    unlisten(unlistenMouseUp.current);
    unlisten(unlistenKeyDown.current);
    unregisterTouchGestures();
    isEventRegistered.current = false;
    unregisterTouchGestures();
  }, [
    unlistenMouseDown,
    unlistenMouseUp,
    unlistenMouseMove,
    unlistenKeyDown,
    isEventRegistered,
    unregisterTouchGestures,
    unlisten,
  ]);

  const pointerMoveX = useCallback((pointerX) => {
    // This is to address the "snap to leftmost" bug that occurs on
    // pointer down after scrolling away and back 3+ slides
    // layoutBox is not updated correctly when first landed on page

    const rect = containerRef.current./*OK*/ getBoundingClientRect();
    const {left, right, width} = rect;

    const newPos = clamp(pointerX, left, right);
    const newPercentage = (newPos - left) / width;
    console.log(newPercentage);
    //this.updatePositions_(newPercentage);
  }, []);

  const registerTouchGestures = useCallback(() => {
    if (gesturesRef.current) {
      return;
    }

    gesturesRef.current = Gestures.get(
      containerRef.current,
      /* shouldNotPreventDefault */ true
    );

    gesturesRef.current.onGesture(SwipeXRecognizer, (e) => {
      if (e.data.first) {
        // Disable hint reappearance timeout if needed
        animateHideHint();
      }
      pointerMoveX(e.data.startX + e.data.deltaX);
    });

    gesturesRef.current.onPointerDown((e) => {
      // Ensure touchstart changes slider position
      pointerMoveX(e.touches[0].pageX);
      animateHideHint();
    });
  }, [animateHideHint, pointerMoveX]);

  /**
   * Limit percentage between 0 and 1
   * @param {number} percentage
   * @private
   * @return {number}
   */
  const limitPercentage = useCallback((percentage) => {
    return clamp(percentage, 0, 1);
  }, []);

  /**
   * Set translateX of the element
   * Only used in updatePositions_, which should be wrapped in mutateElement
   * @param {Element} element
   * @param {number} percentage
   * @private
   */
  const updateTranslateX = useCallback((element, percentage) => {
    setStyle(element, 'transform', `translateX(${percentage * 100}%)`);
  }, []);

  /**
   * Get current slider's percentage to the left
   * Should be wrapped inside measureElement
   * @private
   * @return {number}
   */
  const getCurrentSliderPercentage = useCallback(() => {
    const {left: barLeft} = barRef.current./*OK*/ getBoundingClientRect();
    const {left: boxLeft, width: boxWidth} =
      containerRef.current./*OK*/ getBoundingClientRect();
    return (barLeft - boxLeft) / boxWidth;
  }, []);

  /**
   * Update element positions based on percentage
   * Should be wrapped inside mutateElement
   * @param {number} percentFromLeft
   * @private
   */
  const updatePositions = useCallback(
    (percentFromLeft) => {
      percentFromLeft = limitPercentage(percentFromLeft);

      updateTranslateX(barRef.current, percentFromLeft);
      updateTranslateX(rightMaskRef.current, percentFromLeft);
      updateTranslateX(rightImageRef.current, -percentFromLeft);
      const adjustedDeltaFromLeft = percentFromLeft - 0.5;
      updateTranslateX(leftHintBodyRef.current, adjustedDeltaFromLeft);
      updateTranslateX(rightHintBodyRef.current, adjustedDeltaFromLeft);
      if (rightLabelWrapperRef.current != null) {
        updateTranslateX(rightLabelWrapperRef.current, -percentFromLeft);
      }
    },
    [limitPercentage, updateTranslateX]
  );

  /**
   * One step left
   * @param {boolean=} opt_toEnd
   * @private
   */
  const stepLeft = useCallback(
    (opt_toEnd) => {
      // To the very end of left
      if (opt_toEnd === true) {
        //this.mutateElement(() => {
        updatePositions(0);
        //});
      } else {
        //this.measureMutateElement(
        //() => {
        const newPercentage = limitPercentage(
          getCurrentSliderPercentage() - stepSize
        );
        //},
        //() => {
        updatePositions(newPercentage);
        //}
        //);
      }
    },
    [getCurrentSliderPercentage, updatePositions, limitPercentage, stepSize]
  );

  /**
   * Step to the center
   * @private
   */
  const stepExactCenter = useCallback(() => {
    //this.mutateElement(() => {
    updatePositions(0.5);
    //});
  }, [updatePositions]);

  /**
   * One step right
   * @param {boolean=} opt_toEnd
   * @private
   */
  const stepRight = useCallback(
    (opt_toEnd) => {
      // To the very end of right
      if (opt_toEnd === true) {
        //this.mutateElement(() => {
        updatePositions(1);
        //});
      } else {
        //let newPercentage;
        //this.measureMutateElement(
        //() => {
        const newPercentage = limitPercentage(
          getCurrentSliderPercentage() + stepSize
        );
        //},
        //() => {
        updatePositions(newPercentage);
        //}
      }
    },
    [updatePositions, limitPercentage, getCurrentSliderPercentage, stepSize]
  );

  /**
   * Handler on key down
   * @param {Event} e
   * @private
   */
  const onKeyDown = useCallback(
    (e) => {
      // Check if current element has focus
      if (doc.current.activeElement !== containerRef?.current) {
        return;
      }

      animateHideHint();

      switch (e.key.toLowerCase()) {
        case 'left': // Edge non-standard, pre EdgeHTML 17
        case 'arrowleft':
          e.preventDefault();
          e.stopPropagation();
          stepLeft();
          break;
        case 'right': // Edge non-standard, pre EdgeHTML 17
        case 'arrowright':
          e.preventDefault();
          e.stopPropagation();
          stepRight();
          break;
        case 'pageup':
          // prevent scrolling the page
          e.preventDefault();
          e.stopPropagation();
          stepLeft(true);
          break;
        case 'pagedown':
          e.preventDefault();
          e.stopPropagation();
          stepRight(true);
          break;
        case 'home':
          e.preventDefault();
          e.stopPropagation();
          stepExactCenter();
          break;
      }
    },
    [animateHideHint, stepLeft, stepRight, stepExactCenter]
  );
  /**
   * Handler on mouse move
   * @param {Event} e
   * @private
   */
  const onMouseMove = useCallback(
    (e) => {
      e.preventDefault();
      pointerMoveX(e.pageX);
    },
    [pointerMoveX]
  );

  /**
   * Handler on mouse button up
   * @param {Event} e
   * @private
   */
  const onMouseUp = useCallback(
    (e) => {
      e.preventDefault();
      unlisten(unlistenMouseMove?.current);
      unlisten(unlistenMouseUp?.current);
    },
    [unlisten]
  );
  /**
   * Handler on mouse button down
   * @param {Event} e
   * @private
   */
  const onMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      pointerMoveX(e.pageX);

      // In case, clear up remnants
      // This is to prevent right mouse button down when left still down
      unlisten(unlistenMouseMove?.current);
      unlisten(unlistenMouseUp?.current);

      unlistenMouseMove.current = listen(win.current, 'mousemove', onMouseMove);
      unlistenMouseUp.current = listen(win.current, 'mouseup', onMouseUp);

      animateHideHint();
    },
    [
      animateHideHint,
      pointerMoveX,
      unlistenMouseMove,
      unlistenMouseUp,
      onMouseMove,
      onMouseUp,
      unlisten,
    ]
  );

  const registerEvents = useCallback(() => {
    if (isEventRegistered.current) {
      return;
    }
    unlistenMouseDown.current = listen(
      containerRef.current,
      'mousedown',
      onMouseDown
    );
    unlistenKeyDown.current = listen(
      containerRef.current,
      'keydown',
      onKeyDown
    );
    registerTouchGestures();
    //this.isEventRegistered = true;
  }, [
    registerTouchGestures,
    unlistenKeyDown,
    isEventRegistered,
    onMouseDown,
    onKeyDown,
  ]);

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

    //const {element} = containerRef.current;
    registerEvents();
  }, [images, labels, buildImageWrappers, buildBar, buildHint, registerEvents]);
  useLayoutEffect(() => {
    /* Do things */
  }, []);
  useMemo(() => {
    /* Do things */
  }, []);

  const testEventHandler = useCallback((e) => {
    console.log(e.key);
  }, []);

  return (
    <div
      ref={containerRef}
      class="i-amphtml-image-slider-container"
      layout
      size
      paint
      tabIndex="0"
      onKeyUp={testEventHandler}
      onMouseUp={testEventHandler}
      {...rest}
    ></div>
  );
}

const ImageSlider = forwardRef(ImageSliderWithRef);
ImageSlider.displayName = 'ImageSlider'; // Make findable for tests.
export {ImageSlider};
