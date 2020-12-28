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
import {Alignment, Axis, Orientation} from './dimensions';
import {Arrow} from './arrow';
import {CarouselContext} from './carousel-context';
import {ContainWrapper} from '../../../src/preact/component';
import {Scroller} from './scroller';
import {WithAmpContext} from '../../../src/preact/context';
import {forwardRef} from '../../../src/preact/compat';
import {isRTL} from '../../../src/dom';
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
  GENERIC: 0,
  FOCUS: 1,
  MOUSE: 2,
  TOUCH: 3,
  NONE: 4,
};

/**
 * @enum {string}
 */
const Direction = {
  LTR: 'ltr',
  RTL: 'rtl',
  AUTO: 'auto',
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
    defaultSlide = 0,
    dir = Direction.AUTO,
    loop,
    mixedLength = false,
    onFocus,
    onMouseEnter,
    onSlideChange,
    onTouchStart,
    orientation = Orientation.HORIZONTAL,
    outsetArrows,
    snap = true,
    snapAlign = Alignment.START,
    snapBy = 1,
    visibleCount = 1,
    _thumbnails = false,
    ...rest
  },
  ref
) {
  const childrenArray = useMemo(() => toChildArray(children), [children]);
  const {length} = childrenArray;
  const carouselContext = useContext(CarouselContext);
  const [currentSlideState, setCurrentSlideState] = useState(
    Math.min(Math.max(defaultSlide, 0), length)
  );
  const globalCurrentSlide = carouselContext.currentSlide ?? currentSlideState;
  const setGlobalCurrentSlide =
    carouselContext.setCurrentSlide ?? setCurrentSlideState;
  const currentSlide = _thumbnails ? currentSlideState : globalCurrentSlide;
  const setCurrentSlide = _thumbnails
    ? setCurrentSlideState
    : setGlobalCurrentSlide;
  const currentSlideRef = useRef(currentSlide);

  useLayoutEffect(() => {
    // noop if !_thumbnails || !carouselContext.
    setCurrentSlide(globalCurrentSlide);
  }, [globalCurrentSlide, setCurrentSlide]);

  const {slides, setSlides} = carouselContext;

  const scrollRef = useRef(null);
  const containRef = useRef(null);
  const contentRef = useRef(null);

  const autoAdvanceTimesRef = useRef(0);
  const autoAdvanceInterval = useMemo(
    () => Math.max(customAutoAdvanceInterval, MIN_AUTO_ADVANCE_INTERVAL),
    [customAutoAdvanceInterval]
  );

  const autoAdvance = useCallback(() => {
    if (
      autoAdvanceTimesRef.current + visibleCount / length >= autoAdvanceLoops ||
      interaction.current !== Interaction.NONE
    ) {
      return false;
    }
    if (loop || currentSlideRef.current + visibleCount < length) {
      scrollRef.current.advance(autoAdvanceCount); // Advance forward by specified count
      // Count autoadvance loops as proportions of the carousel we have advanced through.
      autoAdvanceTimesRef.current += autoAdvanceCount / length;
    } else {
      scrollRef.current.advance(-currentSlideRef.current); // Advance in reverse to first slide
      autoAdvanceTimesRef.current = Math.ceil(autoAdvanceTimesRef.current);
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
      if (length <= 0 || isNaN(index)) {
        return;
      }
      index = Math.min(Math.max(index, 0), length - 1);
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
        goToSlide: (index) => {
          interaction.current = Interaction.GENERIC;
          setRestingIndex(index);
        },
        next: () => {
          interaction.current = Interaction.GENERIC;
          next();
        },
        prev: () => {
          interaction.current = Interaction.GENERIC;
          prev();
        },
        root: containRef.current,
        node: contentRef.current,
      }),
    [next, prev, setRestingIndex]
  );

  useEffect(() => {
    // For now, do not update slides if they are the same length as before.
    // Otherwise this causes an infinite loop when updating the AMP Context.
    if (!_thumbnails && slides && slides.length !== childrenArray.length) {
      setSlides(childrenArray);
    }
  }, [_thumbnails, childrenArray, setSlides, slides]);

  const disableForDir = (dir) => {
    if (loop) {
      // Arrows always available when looping.
      return false;
    }
    if (currentSlide + dir < 0) {
      // Can no longer advance backwards.
      return true;
    }
    if (currentSlide + visibleCount + dir > length) {
      // Can no longer advance forwards.
      return true;
    }
    return false;
  };

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

  const [rtl, setRtl] = useState(dir === Direction.RTL);
  useLayoutEffect(() => {
    if (!containRef.current || dir !== Direction.AUTO) {
      return;
    }
    const doc = containRef.current.ownerDocument;
    if (!doc) {
      return;
    }
    setRtl(isRTL(doc));
  }, [dir, setRtl]);

  return (
    <ContainWrapper
      size={true}
      layout={true}
      paint={true}
      contentStyle={{
        display: 'flex',
        direction: rtl ? Direction.RTL : Direction.LTR,
      }}
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
          rtl={rtl}
        />
      )}
      <Scroller
        advanceCount={advanceCount}
        alignment={snapAlign}
        autoAdvanceCount={autoAdvanceCount}
        axis={orientation == Orientation.HORIZONTAL ? Axis.X : Axis.Y}
        loop={loop}
        mixedLength={mixedLength}
        restingIndex={currentSlide}
        setRestingIndex={setRestingIndex}
        snap={snap}
        snapBy={snapBy}
        ref={scrollRef}
        visibleCount={mixedLength ? 1 : visibleCount}
        _thumbnails={_thumbnails}
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
          rtl={rtl}
        />
      )}
    </ContainWrapper>
  );
}

const BaseCarousel = forwardRef(BaseCarouselWithRef);
BaseCarousel.displayName = 'BaseCarousel'; // Make findable for tests.
export {BaseCarousel};
