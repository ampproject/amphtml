import {sequentialIdGenerator} from '#core/data-structures/id-generator';
import {isRTL} from '#core/dom';
import {mod} from '#core/math';
import {getWin} from '#core/window';

import * as Preact from '#preact';
import {
  cloneElement,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {WithAmpContext} from '#preact/context';

import {Arrow} from './arrow';
import {CarouselContext} from './carousel-context';
import {useStyles} from './component.jss';
import {
  Alignment,
  Axis,
  Orientation,
  getDimension,
  getOffsetPosition,
  getScrollEnd,
} from './dimensions';
import {Scroller} from './scroller';

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
function BentoBaseCarouselWithRef(
  {
    _thumbnails = false,
    advanceCount = 1,
    arrowNextAs,
    arrowPrevAs,
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
    ...rest
  },
  ref
) {
  const classes = useStyles();
  const childrenArray = useMemo(() => Children.toArray(children), [children]);
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
    const win = getWin(containRef.current);
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
      index = loop
        ? mod(index, length)
        : Math.min(Math.max(index, 0), length - 1);
      setCurrentSlide(index);
      if (currentSlideRef.current !== index) {
        currentSlideRef.current = index;
        if (onSlideChange) {
          onSlideChange(index);
        }
      }
    },
    [length, loop, setCurrentSlide, onSlideChange]
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
      tabindex="0"
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
        {childrenArray.map((child, index) => {
          const {alt, 'aria-label': ariaLabel} = child.props;
          return (
            <WithAmpContext
              caption={alt || ariaLabel}
              key={index}
              renderable={index == currentSlide}
              playable={index == currentSlide}
            >
              {cloneElement(child, {...child.props, thumbnailSrc: undefined})}
            </WithAmpContext>
          );
        })}
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

const BentoBaseCarousel = forwardRef(BentoBaseCarouselWithRef);
BentoBaseCarousel.displayName = 'BentoBaseCarousel'; // Make findable for tests.
export {BentoBaseCarousel};
