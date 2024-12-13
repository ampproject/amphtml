import objstr from 'obj-str';

import {observeIntersections} from '#core/dom/layout/viewport-observer';
import {setStyle} from '#core/dom/style';
import {clamp} from '#core/math';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

import {installTimerService} from '#service/timer-impl';

import {listen} from '#utils/event-helper';
// eslint-disable-next-line
import {initLogConstructor} from '#utils/log';

import {useStyles} from './component.jss';

import {Gestures} from '../../../src/gesture';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';

/**
 * Using Gestures class throws console error for failed to call initLogConstructor
 * so we need to explicity call it.
 */
// eslint-disable-next-line
initLogConstructor();

/**
 * Required for Gestures.get otherwise throws:
 * "Uncaught Error: Expected service timer to be registered"
 */
installTimerService(global);

/**
 * Displays given component with supplied props.
 * @param {*} props
 * @param {{current: ?Element}} ref
 * @return {PreactDef.Renderable}
 */
function DisplayAsWithRef({as: Comp = 'div', containerClass, ...rest}, ref) {
  return (
    /** Need containerClass to add jss Styling to the component container */
    <div ref={ref} class={containerClass}>
      <Comp {...rest} />
    </div>
  );
}

const DisplayAs = forwardRef(DisplayAsWithRef);

/**
 * @param {!BentoImageSliderDef.Props} props
 * @param {{current: ?BentoImageSliderDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoImageSliderWithRef(
  {
    displayHintOnce,
    firstImageAs,
    firstLabelAs,
    initialPosition,
    leftHintAs,
    rightHintAs,
    secondImageAs,
    secondLabelAs,
    stepSize = 0.1,
    ...rest
  },
  ref
) {
  /** Common variables */
  const gesturesRef = useRef(null);
  const isEventRegistered = false;
  const styles = useStyles();
  /** Common variables */
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

  /** Hint Wrapper References */
  const leftHintWrapper = useRef(null);
  const rightHintWrapper = useRef(null);

  /** Hint Body References */
  const leftHintBodyRef = useRef(null);
  const rightHintBodyRef = useRef(null);

  /** Unlisten Handlers for Mouse */
  const unlistenMouseUp = useRef(null);
  const unlistenMouseDown = useRef(null);
  const unlistenMouseMove = useRef(null);

  /** Unlisten Handlers for Keyboard */
  const unlistenKeyDown = useRef(null);

  /** Animate Hint Flag */
  const [hideHint, setHideHint] = useState(false);

  const animateHideHint = useCallback(() => {
    setHideHint(true);
  }, [setHideHint]);

  const animateShowHint = useCallback(() => {
    setHideHint(false);
  }, [setHideHint]);

  /** Listen / Unlisten Handler */
  /**
   * Unlisten a listener and clear. If null, does nothing
   * @param {?UnlistenDef} unlistenHandle
   * @private
   */
  const unlisten = useCallback((unlistenHandle) => {
    if (unlistenHandle?.current) {
      unlistenHandle.current?.();
      unlistenHandle.current = null;
    }
  }, []);

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

  const pointerMoveX = useCallback(
    (pointerX) => {
      // This is to address the "snap to leftmost" bug that occurs on
      // pointer down after scrolling away and back 3+ slides
      // layoutBox is not updated correctly when first landed on page

      const {left, right, width} =
        containerRef.current./*OK*/ getBoundingClientRect();

      const newPos = clamp(pointerX, left, right);
      const newPercentage = (newPos - left) / width;

      updatePositions(newPercentage);
    },
    [updatePositions]
  );

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
   * One step left
   * @param {boolean=} opt_toEnd
   * @private
   */
  const stepLeft = useCallback(
    (opt_toEnd) => {
      // To the very end of left
      if (opt_toEnd === true) {
        updatePositions(0);
      } else {
        const newPercentage = limitPercentage(
          getCurrentSliderPercentage() - stepSize
        );
        updatePositions(newPercentage);
      }
    },
    [getCurrentSliderPercentage, updatePositions, limitPercentage, stepSize]
  );

  /**
   * Step to the center
   * @private
   */
  const stepExactCenter = useCallback(() => {
    updatePositions(0.5);
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
        updatePositions(1);
      } else {
        const newPercentage = limitPercentage(
          getCurrentSliderPercentage() + stepSize
        );
        updatePositions(newPercentage);
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
      if (
        doc.current.activeElement !== containerRef?.current &&
        doc.current.activeElement !== containerRef?.current?./*OK*/ offsetParent
      ) {
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
      unlisten(unlistenMouseMove);
      unlisten(unlistenMouseUp);
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

      if (unlistenMouseMove.current === null) {
        unlistenMouseMove.current = listen(window, 'mousemove', onMouseMove);
      }
      if (unlistenMouseUp.current === null) {
        unlistenMouseUp.current = listen(window, 'mouseup', onMouseUp);
      }

      animateHideHint();
    },
    [
      animateHideHint,
      pointerMoveX,
      unlistenMouseMove,
      unlistenMouseUp,
      onMouseMove,
      onMouseUp,
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
  }, [
    unlistenKeyDown,
    isEventRegistered,
    onMouseDown,
    onKeyDown,
    registerTouchGestures,
  ]);

  const viewportCallback_ = useCallback(
    (isIntersecting) => {
      if (isIntersecting && !displayHintOnce) {
        animateShowHint();
      }
    },
    [animateShowHint, displayHintOnce]
  );

  useEffect(() => {
    if (!checkProps(firstImageAs, secondImageAs)) {
      return null;
    }
    doc.current = containerRef?.current?.ownerDocument;

    observeIntersections(containerRef.current, ({isIntersecting}) =>
      viewportCallback_(isIntersecting)
    );

    registerEvents();
    if (initialPosition) {
      if (isNaN(initialPosition)) {
        displayWarning('initialPosition must be a finite number');
        return null;
      } else {
        updatePositions(initialPosition);
      }
    }
  }, [
    registerEvents,
    initialPosition,
    updatePositions,
    firstImageAs,
    secondImageAs,
    viewportCallback_,
  ]);

  /** API Function */
  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoImageSliderDef.Api} */ ({
        seekTo: (percent = 50) => {
          updatePositions(percent);
        },
      }),
    [updatePositions]
  );

  if (isNaN(stepSize)) {
    displayWarning('stepSize must be a finite number');
    return null;
  }

  if (!checkProps(firstImageAs, secondImageAs)) {
    displayWarning('2 images must be provided for comparison');
    return null;
  }

  return (
    <ContainWrapper
      ref={containerRef}
      class={styles.imageSliderContainer}
      layout
      size
      paint
      tabindex="0"
      autoFocus="true"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      {...rest}
    >
      {/* Masks */}
      <div ref={leftMaskRef} class={styles.imageSliderLeftMask}>
        <div ref={leftLabelWrapperRef} class={styles.imageSliderLabelWrapper}>
          <DisplayAs
            as={firstLabelAs}
            class="image-slider-left-label"
            ref={leftLabelRef}
          />
        </div>
        <DisplayAs
          as={firstImageAs}
          class="image-slider-left-image"
          ref={leftImageRef}
        />
      </div>
      <div
        ref={rightMaskRef}
        class={objstr({
          [styles.imageSliderRightMask]: true,
          [styles.imageSliderPushRight]: true,
        })}
      >
        <div
          ref={rightLabelWrapperRef}
          class={objstr({
            [styles.imageSliderLabelWrapper]: true,
            [styles.imageSliderPushLeft]: true,
          })}
        >
          <DisplayAs
            ref={rightLabelRef}
            class="image-slider-right-label"
            as={secondLabelAs}
          />
        </div>
        <DisplayAs
          as={secondImageAs}
          ref={rightImageRef}
          class="image-slider-right-image"
          containerClass={objstr({
            [styles.imageSliderPushLeft]: true,
          })}
        />
      </div>

      {/* Bar */}
      <div
        class={objstr({
          [styles.imageSliderBar]: true,
          [styles.imageSliderPushRight]: true,
        })}
        ref={barRef}
      >
        <div
          class={objstr({
            [styles.imageSliderBarStick]: true,
            [styles.imageSliderPushLeft]: true,
          })}
        />
      </div>

      {/* Hint Body */}
      <div
        ref={leftHintBodyRef}
        class={objstr({
          [styles.imageSliderHint]: true,
          [styles.imageSliderHintHidden]: hideHint,
        })}
      >
        <div ref={leftHintWrapper} class={styles.imageSliderHintLeftWrapper}>
          <DisplayAs
            as={leftHintAs}
            ref={leftHintArrowRef}
            class={objstr({
              [styles.imageSliderHintLeft]: true,
              ['image-slider-left-hint']: true,
            })}
          />
        </div>
      </div>
      <div
        ref={rightHintBodyRef}
        class={objstr({
          [styles.imageSliderHint]: true,
          [styles.imageSliderHintHidden]: hideHint,
        })}
      >
        <div ref={rightHintWrapper} class={styles.imageSliderHintRightWrapper}>
          <DisplayAs
            as={rightHintAs}
            ref={rightHintArrowRef}
            class={objstr({
              [styles.imageSliderHintRight]: true,
              ['image-slider-right-hint']: true,
            })}
          />
        </div>
      </div>
    </ContainWrapper>
  );
}

/**
 * Verify required props and throw error if necessary.
 * @param {(function(*)|undefined} firstImageAs
 * @param {(function(*)|undefined} secondImageAs
 * @return {boolean} true on valid
 */
function checkProps(firstImageAs, secondImageAs) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  if (firstImageAs == undefined || secondImageAs === undefined) {
    return false;
  }
  return true;
}

/**
 * Display warning in browser console
 * @param {?string} message Warning to be displayed
 */
function displayWarning(message) {
  console /*OK*/
    .warn(message);
}

const BentoImageSlider = forwardRef(BentoImageSliderWithRef);
BentoImageSlider.displayName = 'BentoImageSlider'; // Make findable for tests.
export {BentoImageSlider};
