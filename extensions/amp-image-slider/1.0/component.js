import objstr from 'obj-str';

import {setStyle} from '#core/dom/style';
import {clamp} from '#core/math';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';

import {useStyles} from './component.jss';

import {listen} from '../../../src/event-helper';
import {Gestures} from '../../../src/gesture';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';

const VALID_IMAGE_TAGNAMES = new Set(['AMP-IMG', 'IMG']);

/**
 * Displays given component with supplied props.
 * @param {*} props
 * @param {{current: ?Element}} ref
 * @return {PreactDef.Renderable}
 */
function DisplayAsWithRef({as: Comp = 'div', ...rest}, ref) {
  return (
    <div ref={ref}>
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
    labels,
    secondImageAs,
    secondLabelAs,
    stepSize = 0.1,
    ...rest
  },
  ref
) {
  /** Common variables */
  let containsAmpImages;
  const gesturesRef = useRef(null);
  const [isEdge, setIsEdge] = useState();
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
    console /*OK*/
      .log(barLeft);
    console /*OK*/
      .log(boxLeft);
    console /*OK*/
      .log((barLeft - boxLeft) / boxWidth);
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
      updateTranslateX(rightMaskRef.current, percentFromLeft * 2);
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
    //registerTouchGestures();
    //this.isEventRegistered = true;
  }, [unlistenKeyDown, isEventRegistered, onMouseDown, onKeyDown]);

  useEffect(() => {
    /** Common variables */
    win.current = containerRef.current.ownerDocument.defaultView;
    doc.current = containerRef.current.ownerDocument;
    //setIsEdge(Services.platformFor(win).isEdge());

    // TODO (@AnuragVasanwala): Assert Error - Should not contain more than 2 images.
    // TODO (@AnuragVasanwala): Assert error if images != 2
    // TODO (@AnuragVasanwala): Assert Error - Should not contain div rather than first and second

    // Notice: hints are attached after amp-img finished loading
    // buildHint();
    // checkARIA();
    registerEvents();
  }, [registerEvents]);
  useLayoutEffect(() => {
    /* Do things */
  }, []);
  useMemo(() => {
    /* Do things */
  }, []);

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

  return (
    <div
      ref={containerRef}
      class={styles.imageSliderContainer}
      layout
      size
      paint
      tabIndex="0"
      autoFocus="true"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      {...rest}
    >
      {/* Masks */}
      <div ref={leftMaskRef} class={styles.imageSliderLeftMask}>
        <div ref={leftLabelWrapperRef} class={styles.imageSliderLabelWrapper}>
          <div ref={leftLabelRef}>
            <DisplayAs as={firstLabelAs} />
          </div>
          <DisplayAs as={firstImageAs} ref={leftImageRef} />
          {/* <img
            src="https://amp.dev/static/samples/img/canoe_900x600.jpg"
            ref={leftImageRef}
            style={{width: 600, height: 300}}
          /> */}
        </div>
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
          <div ref={rightLabelRef}>
            <DisplayAs as={secondLabelAs} />
          </div>
          <DisplayAs as={secondImageAs} ref={rightImageRef} />
          {/* <img
            src="https://amp.dev/static/samples/img/canoe_900x600_blur.jpg"
            ref={rightImageRef}
            style={{width: 600, height: 300}}
          /> */}
        </div>
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
          <div ref={leftHintArrowRef} class={styles.imageSliderHintLeft} />
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
          <div ref={rightHintArrowRef} class={styles.imageSliderHintRight} />
        </div>
      </div>

      {/* Bar */}
      <div ref={barRef}>
        <div
          class={objstr({
            [styles.imageSliderBar]: true,
            [styles.imageSliderPushRight]: true,
          })}
        >
          <div
            class={objstr({
              [styles.imageSliderBarStick]: true,
              [styles.imageSliderPushLeft]: true,
            })}
          />
        </div>
      </div>
    </div>
  );
}

const BentoImageSlider = forwardRef(BentoImageSliderWithRef);
BentoImageSlider.displayName = 'BentoImageSlider'; // Make findable for tests.
export {BentoImageSlider};
