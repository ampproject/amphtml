/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import * as Preact from '../../../src/preact';
import {Arrow} from './arrow';
import {CarouselContext} from './carousel-context';
import {ContainWrapper} from '../../../src/preact/component';
import {Scroller} from './scroller';
import {WithAmpContext} from '../../../src/preact/context';
import {forwardRef} from '../../../src/preact/compat';
import {
  toChildArray,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';
import {toWin} from '../../../src/types';

/**
 * @enum {string}
 */
const Controls = {
  ALWAYS: 'always',
  NEVER: 'never',
  AUTO: 'auto',
};

/**
 * @enum {string}
 */
const Interaction = {
  FOCUS: 'focus',
  MOUSE: 'mouse',
  TOUCH: 'touch',
  NONE: 'none',
};

const MIN_AUTO_ADVANCE_INTERVAL = 1000;

/**
 * @param {!BaseCarouselDef.Props} props
 * @param {{current: (!BaseCarouselDef.CarouselApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function BaseCarouselWithRef(
  {
    advanceCount = 1,
    arrowPrev,
    arrowNext,
    autoAdvance: shouldAutoAdvance = false,
    autoAdvanceCount = 1,
    autoAdvanceInterval: customAutoAdvanceInterval = MIN_AUTO_ADVANCE_INTERVAL,
    autoAdvanceLoops = Number.POSITIVE_INFINITY,
    children,
    controls = Controls.AUTO,
    loop,
    mixedLength = false,
    onFocus,
    onMouseEnter,
    onSlideChange,
    onTouchStart,
    outsetArrows,
    snap = true,
    visibleCount = 1,
    ...rest
  },
  ref
) {
  const childrenArray = toChildArray(children);
  const {length} = childrenArray;
  const carouselContext = useContext(CarouselContext);
  const [currentSlideState, setCurrentSlideState] = useState(0);
  const currentSlide = carouselContext.currentSlide ?? currentSlideState;
  const currentSlideRef = useRef(currentSlide);
  const setCurrentSlide =
    carouselContext.setCurrentSlide ?? setCurrentSlideState;
  const {setSlideCount} = carouselContext;
  const scrollRef = useRef(null);
  const containRef = useRef(null);
  const contentRef = useRef(null);
  const autoAdvanceTimesRef = useRef(0);
  const autoAdvanceInterval = useMemo(
    () => Math.max(customAutoAdvanceInterval, MIN_AUTO_ADVANCE_INTERVAL),
    [customAutoAdvanceInterval]
  );

  const autoAdvance = useCallback(() => {
    // Count autoadvance loops as times we have reached the last visible slide.
    if (currentSlideRef.current >= length - visibleCount) {
      autoAdvanceTimesRef.current += 1;
    }
    if (
      autoAdvanceTimesRef.current == autoAdvanceLoops ||
      interaction.current !== Interaction.NONE
    ) {
      return false;
    }
    if (loop || currentSlideRef.current + visibleCount < length) {
      scrollRef.current.advance(autoAdvanceCount); // Advance forward by specified count
    } else {
      scrollRef.current.advance(-(length - 1)); // Advance in reverse to first slide
    }
    return true;
  }, [autoAdvanceCount, autoAdvanceLoops, length, loop, visibleCount]);
  const next = useCallback(() => scrollRef.current.next(), []);
  const prev = useCallback(() => scrollRef.current.prev(), []);

  useEffect(() => {
    if (!shouldAutoAdvance || !containRef.current) {
      return;
    }
    const win = toWin(containRef.current.ownerDocument.defaultView);
    const interval = win.setInterval(() => {
      const autoAdvanced = autoAdvance();
      if (!autoAdvanced) {
        win.clearInterval(interval);
      }
    }, autoAdvanceInterval);
    return () => win.clearInterval(interval);
  }, [autoAdvance, autoAdvanceInterval, shouldAutoAdvance]);

  const setRestingIndex = useCallback(
    (index) => {
      index = length > 0 ? Math.min(Math.max(index, 0), length - 1) : -1;
      if (index < 0) {
        return;
      }
      setCurrentSlide(index);
      currentSlideRef.current = index;
      if (onSlideChange) {
        onSlideChange(index);
      }
    },
    [length, setCurrentSlide, onSlideChange]
  );

  useImperativeHandle(
    ref,
    () =>
      /** @type {!BaseCarouselDef.CarouselApi} */ ({
        goToSlide: (index) => setRestingIndex(index),
        next,
        prev,
        root: containRef.current,
        node: contentRef.current,
      }),
    [next, prev, setRestingIndex]
  );

  useLayoutEffect(() => {
    setSlideCount(length);
  }, [setSlideCount, length]);

  const disableForDir = (dir) =>
    !loop &&
    (currentSlide + dir < 0 ||
      (!mixedLength && currentSlide + visibleCount + dir > length));

  const interaction = useRef(Interaction.NONE);
  const hideControls = useMemo(() => {
    if (controls === Controls.ALWAYS || outsetArrows) {
      return false;
    }
    if (controls === Controls.NEVER) {
      return true;
    }
    return interaction.current === Interaction.TOUCH;
  }, [controls, outsetArrows]);

  return (
    <ContainWrapper
      size={true}
      layout={true}
      paint={true}
      contentStyle={{display: 'flex'}}
      ref={containRef}
      contentRef={contentRef}
      onFocus={(e) => {
        if (onFocus) {
          onFocus(e);
        }
        interaction.current = Interaction.FOCUS;
      }}
      onMouseEnter={(e) => {
        if (onMouseEnter) {
          onMouseEnter(e);
        }
        interaction.current = Interaction.MOUSE;
      }}
      onTouchStart={(e) => {
        if (onTouchStart) {
          onTouchStart(e);
        }
        interaction.current = Interaction.TOUCH;
      }}
      tabIndex="0"
      {...rest}
    >
      {!hideControls && (
        <Arrow
          advance={prev}
          by={-advanceCount}
          customArrow={arrowPrev}
          disabled={disableForDir(-1)}
          outsetArrows={outsetArrows}
        />
      )}
      <Scroller
        advanceCount={advanceCount}
        autoAdvanceCount={autoAdvanceCount}
        loop={loop}
        mixedLength={mixedLength}
        restingIndex={currentSlide}
        setRestingIndex={setRestingIndex}
        snap={snap}
        ref={scrollRef}
        visibleCount={mixedLength ? 1 : visibleCount}
      >
        {/*
          TODO(#30283): TBD: this is an interesting concept. We could decide
          to render only N slides at a time and for others just output an empty
          placeholder. When a slide's slot is unrendered, the slide
          automatically gets unslotted and gets CanRender=false w/o any extra
          state management code.

          Note: We naively display all slides for mixedLength as multiple
          can be visible within the carousel viewport - eventually these can also
          be optimized to only display the minimum necessary for the current 
          and next viewport.
        */}
        {childrenArray.map((child, index) =>
          Math.abs(index - currentSlide) < visibleCount * 3 || mixedLength ? (
            <WithAmpContext
              key={index}
              renderable={index == currentSlide}
              playable={index == currentSlide}
            >
              {child}
            </WithAmpContext>
          ) : (
            <></>
          )
        )}
      </Scroller>
      {!hideControls && (
        <Arrow
          advance={next}
          by={advanceCount}
          customArrow={arrowNext}
          disabled={disableForDir(1)}
          outsetArrows={outsetArrows}
        />
      )}
    </ContainWrapper>
  );
}

const BaseCarousel = forwardRef(BaseCarouselWithRef);
BaseCarousel.displayName = 'BaseCarousel'; // Make findable for tests.
export {BaseCarousel};
