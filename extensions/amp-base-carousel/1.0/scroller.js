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
import {debounce} from '../../../src/utils/rate-limit';
import {forwardRef} from '../../../src/preact/compat';
import {mod} from '../../../src/utils/math';
import {setStyle} from '../../../src/style';
import {
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from '../../../src/preact';
import {useStyles} from './base-carousel.jss';

/**
 * How long to wait prior to resetting the scrolling position after the last
 * scroll event. Ideally this should be low, so that once the user stops
 * scrolling, things are immediately centered again. Since there can be some
 * delay between scroll events, and we do not want to interrupt a scroll with a
 * render, it cannot be too small. 200ms seems to be around the lower limit for
 * this value on Android / iOS.
 */
const RESET_SCROLL_REFERENCE_POINT_WAIT_MS = 200;

/**
 * @param {!BaseCarouselDef.ScrollerProps} props
 * @param {{current: (T|null)}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function ScrollerWithRef(
  {children, loop, mixedLength, restingIndex, setRestingIndex, snap, ...rest},
  ref
) {
  // We still need our own ref that we can always rely on to be there.
  const containerRef = useRef(null);
  useImperativeHandle(ref, () => ({
    // Expose "advance" action for navigating between slides by the given quantity of slides.
    advance: (by) => {
      const container = containerRef.current;
      // Modify scrollLeft is preferred to enable smooth scroll.
      currentIndex.current = mod(currentIndex.current + by, children.length);
      setRestingIndex(currentIndex.current);
      if (loop) {
        container./* OK */ scrollLeft += container./* OK */ offsetWidth * by;
      } else {
        container./* OK */ scrollLeft =
          container.children[currentIndex.current].offsetLeft;
      }
    },
    canScroll: () => {
      const container = containerRef.current;
      return (
        container.scrollLeft + container.clientWidth < container.scrollWidth
      );
    },
  }));
  const classes = useStyles();

  /**
   * The number of slides we want to place before the
   * reference or resting index. Only needed if loop=true.
   */
  const pivotIndex = Math.floor(children.length / 2);

  /**
   * The dynamic position that the slide at the resting index
   * is with respect to its scrolling order. Only needed if loop=true.
   */
  const offsetRef = useRef(restingIndex);
  const ignoreProgrammaticScrollRef = useRef(true);
  const slides = renderSlides(
    {
      children,
      loop,
      offsetRef,
      pivotIndex,
      restingIndex,
    },
    classes
  );
  const currentIndex = useRef(restingIndex);
  const snapScroll = useRef(0);

  // useLayoutEffect needed to avoid FOUC while scrolling
  useLayoutEffect(() => {
    if (!containerRef.current || mixedLength === 'true') {
      return;
    }
    const container = containerRef.current;
    ignoreProgrammaticScrollRef.current = true;
    setStyle(container, 'scrollBehavior', 'auto');
    container./* OK */ scrollLeft =
      snap === 'false'
        ? snapScroll.current
        : loop
        ? container./* OK */ offsetWidth * pivotIndex
        : container./* OK */ offsetWidth * restingIndex;
    setStyle(container, 'scrollBehavior', 'smooth');
  }, [loop, mixedLength, restingIndex, pivotIndex, snap]);

  // Trigger render by setting the resting index to the current scroll state.
  const debouncedResetScrollReferencePoint = useMemo(
    () =>
      debounce(
        window,
        () => {
          // Check if the resting index we are centered around is the same as where
          // we stopped scrolling. If so, we do not need to move anything.
          if (
            currentIndex.current === null ||
            currentIndex.current === restingIndex
          ) {
            return;
          }
          ignoreProgrammaticScrollRef.current = true;
          setRestingIndex(currentIndex.current);
        },
        RESET_SCROLL_REFERENCE_POINT_WAIT_MS
      ),
    [restingIndex, setRestingIndex]
  );

  // Track current slide without forcing render.
  // This is necessary for smooth scrolling because
  // intermediary renders will interupt scroll and cause jank.
  const updateCurrentIndex = () => {
    const container = containerRef.current;
    if (mixedLength === 'true') {
      const acc = {index: 0, width: 0};
      container.children.forEach((x, i) => {
        if (container.scrollLeft >= acc.width) {
          acc.width += x.scrollWidth;
          acc.index = i;
        }
      });
      currentIndex.current = acc.index;
    } else {
      snapScroll.current =
        container./* OK */ scrollLeft -
        offsetRef.current * container./* OK */ offsetWidth;
      const slideOffset = Math.round(
        snapScroll.current / container./* OK */ offsetWidth
      );

      currentIndex.current = mod(slideOffset, children.length);
    }
  };

  const handleScroll = () => {
    if (ignoreProgrammaticScrollRef.current) {
      ignoreProgrammaticScrollRef.current = false;
      return;
    }
    updateCurrentIndex();
    debouncedResetScrollReferencePoint();
  };

  return (
    <div
      ref={containerRef}
      mixedLength={mixedLength}
      onScroll={handleScroll}
      class={`${classes.scrollContainer} ${classes.hideScrollbar} ${classes.horizontalScroll}`}
      snap={snap}
      tabindex={0}
      {...rest}
    >
      {slides}
    </div>
  );
}

const Scroller = forwardRef(ScrollerWithRef);
Scroller.displayName = 'Scroller'; // Make findable for tests.
export {Scroller};

/**
 * How the slides are ordered when looping:
 *
 * We want to make sure that the user can scroll all the way to the opposite
 * end (either forwards or backwards) of the carousel, but no further (no
 * looping back past where you started). We render elements dynamically
 * for a desirable scrolling order to allow the browser to scroll as well as
 * providing targets for the browser to snap on. This is important as these
 * targets need to be present before the scroll starts for things to work
 * correctly.
 *
 * The elements are ordered depending on the reference point, called
 * the restingIndex to allow full movement forwards and backwards. You can
 * imagine the DOM structure looks like the following if you have 5 slides:
 *
 * [1][2][3][4][5]
 *
 * When the restingIndex is the first index, we should translate slides as follows:
 *
 * [4][5][1][2][3]
 *
 * This ensures that if you move left or right, there is a slide to show.
 *
 * When the user stops scrolling, we update the restingIndex and show/hide the
 * appropriate spacers. For example, if the user started at slide '1' and moved
 * left to slide '4', the UI would eventually stop because there is
 * nothing more to the left of slide '4'.
 *
 * [4][5][1][2][3]
 *
 * Once scrolling stops, however, the reference point would be reset and this would
 * update to the following with the next render:
 *
 * [2][3][4][5][1]
 *
 * Ordering slides:
 *
 * Slides are ordered to be before or after the current slide and do not rearrange
 * dynamically as the user scrolls. Only once the scrolling has ended do they rearrange.
 * Currently, half the slides are ordered before and half the slides are ordered after.
 * This could be a bit smarter and only place as many as are necessary on either side of
 * the reference point to have a sufficient amount of buffer.
 *
 * Initial index:
 *
 * The initial index can be specified, which will make the carousel scroll to
 * the desired index when it first renders.
 *
 * @param {!BaseCarouselDef.SlideProps} props
 * @param {!Object} classes
 * @return {PreactDef.Renderable}
 */
function renderSlides(
  {children, restingIndex, offsetRef, pivotIndex, loop},
  classes
) {
  const {length} = children;

  const slides = children.map((child, index) => {
    const key = `slide-${child.key || index}`;
    return (
      <div
        key={key}
        data-slide={index}
        class={`${classes.slideSizing} ${classes.slideElement}`}
      >
        {child}
      </div>
    );
  });

  if (!loop) {
    return slides;
  }

  const before = [];
  const after = [];
  const shift = mod(length - restingIndex + pivotIndex, length);
  if (restingIndex <= pivotIndex) {
    for (let i = 0; i < shift; i++) {
      before.unshift(slides.pop());
    }
  } else {
    for (let i = 0; i < length - shift; i++) {
      after.push(slides.shift());
    }
  }

  offsetRef.current = before.length ? before.length : -after.length;
  return (
    <>
      {before}
      {slides}
      {after}
    </>
  );
}
