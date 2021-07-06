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
import * as Preact from '#preact';
import {
  Alignment,
  Axis,
  Orientation,
  getDimension,
  getOffsetPosition,
  getScrollEnd,
} from './dimensions';
import {Arrow} from './arrow';
import {CarouselContext} from './carousel-context';
import {ContainWrapper} from '#preact/component';
import {Scroller} from './scroller';
import {WithAmpContext} from '#preact/context';
import {forwardRef, toChildArray} from '#preact/compat';
import {isRTL} from '#core/dom';
import {sequentialIdGenerator} from '#core/data-structures/id-generator';
import {toWin} from '#core/window';
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {useStyles} from './component.jss';

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

const generateCarouselKey = sequentialIdGenerator();

/**
 * @param {!BaseCarouselDef.Props} props
 * @param {{current: ?BaseCarouselDef.CarouselApi}} ref
 * @return {PreactDef.Renderable}
 */
function BaseCarouselWithRef(
  {
    advanceCount = 1,
    arrowPrevAs,
    arrowNextAs,
    autoAdvance: shouldAutoAdvance = false,
    autoAdvanceCount = 1,
    autoAdvanceInterval: customAutoAdvanceInterval = MIN_AUTO_ADVANCE_INTERVAL,
    autoAdvanceLoops = Number.POSITIVE_INFINITY,
    children,
    controls = Controls.AUTO,
    defaultSlide = 0,
    dir = Direction.AUTO,
    lightbox = false,
    loop,
    mixedLength = false,
    onClick,
    onFocus,
    onMouseEnter,
    onSlideChange,
    onTouchStart,
    orientation = Orientation.HORIZONTAL,
    outsetArrows = false,
    snap = true,
    snapAlign = Alignment.START,
    snapBy = 1,
    visibleCount = 1,
    _thumbnails = false,
    ...rest
  },
  ref
) {
  const classes = useStyles();
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
  const axis = orientation == Orientation.HORIZONTAL ? Axis.X : Axis.Y;
  const [id] = useState(generateCarouselKey);

  useLayoutEffect(() => {
    // noop if !_thumbnails || !carouselContext.
    setCurrentSlide(globalCurrentSlide);
  }, [globalCurrentSlide, setCurrentSlide]);

  const {setSlides, slides} = carouselContext;

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
      if (currentSlideRef.current !== index) {
        currentSlideRef.current = index;
        if (onSlideChange) {
          onSlideChange(index);
        }
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
        get root() {
          return containRef.current;
        },
        get node() {
          return contentRef.current;
        },
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
    if (mixedLength && dir > 0) {
      // Measure container to see if we have reached the end.
      if (!scrollRef.current) {
        return false;
      }
      const container = scrollRef.current.node;
      if (!container || !container.children.length) {
        return false;
      }
      const scrollEnd = getScrollEnd(axis, container);
      const scrollStart = getOffsetPosition(
        axis,
        container.children[currentSlide]
      );
      const {length} = getDimension(axis, container);
      if (length !== scrollEnd && length + scrollStart >= scrollEnd) {
        // Can no longer scroll forwards.
        return true;
      }
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
      wrapperClassName={classes.carousel}
      contentRef={contentRef}
      {...rest}
    >
      {!hideControls && (
        <Arrow
          advance={prev}
          as={arrowPrevAs}
          by={-advanceCount}
          disabled={disableForDir(-1)}
          outsetArrows={outsetArrows}
          rtl={rtl}
        />
      )}
      <Scroller
        advanceCount={advanceCount}
        alignment={snapAlign}
        axis={axis}
        lightboxGroup={lightbox && 'carousel' + id}
        loop={loop}
        mixedLength={mixedLength}
        onClick={onClick}
        restingIndex={currentSlide}
        setRestingIndex={setRestingIndex}
        snap={snap}
        snapBy={snapBy}
        ref={scrollRef}
        visibleCount={mixedLength ? 1 : visibleCount}
        _thumbnails={_thumbnails}
      >
        {childrenArray.map((child, index) => (
          <WithAmpContext
            key={index}
            renderable={index == currentSlide}
            playable={index == currentSlide}
          >
            {child}
          </WithAmpContext>
        ))}
      </Scroller>
      {!hideControls && (
        <Arrow
          advance={next}
          by={advanceCount}
          as={arrowNextAs}
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
