import objstr from 'obj-str';

import {BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/component';

import {setStyle} from '#core/dom/style';
import {getWin} from '#core/window';

import * as Preact from '#preact';
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {propName} from '#preact/utils';

import {useStyles} from './component.jss';

const DEFAULT_VISIBLE_COUNT = 1;
const OUTSET_ARROWS_WIDTH = 100;

/**
 * @param {!BentoStreamGalleryDef.Props} props
 * @param {{current: (!BentoBaseCarouselDef.CarouselApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function BentoStreamGalleryWithRef(props, ref) {
  const {
    arrowNextAs = DefaultArrow,
    arrowPrevAs = DefaultArrow,
    children,
    extraSpace,
    maxItemWidth = Number.MAX_VALUE,
    maxVisibleCount = Number.MAX_VALUE,
    minItemWidth = 1,
    minVisibleCount = 1,
    outsetArrows,
    peek = 0,
    slideAlign = 'start',
    [propName('class')]: className,
    ...rest
  } = props;
  const classes = useStyles();
  const carouselRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);
  const length = Children.count(children);
  const measure = useCallback(
    (containerWidth) =>
      getVisibleCount(
        maxItemWidth,
        minItemWidth,
        maxVisibleCount,
        minVisibleCount,
        length,
        outsetArrows,
        peek,
        containerWidth,
        carouselRef.current.node
      ),
    [
      maxItemWidth,
      minItemWidth,
      maxVisibleCount,
      minVisibleCount,
      length,
      outsetArrows,
      peek,
    ]
  );

  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoBaseCarouselDef.CarouselApi} */ ({
        goToSlide: (index) => carouselRef.current.goToSlide(index),
        next: () => carouselRef.current.next(),
        prev: () => carouselRef.current.prev(),
      }),
    []
  );

  // Adjust visible slide count when container size or parameters change.
  useLayoutEffect(() => {
    if (!carouselRef.current) {
      return;
    }
    const node = carouselRef.current.root;
    if (!node) {
      return;
    }
    // Use local window.
    const win = getWin(node);
    if (!win) {
      return undefined;
    }
    const observer = new win.ResizeObserver((entries) => {
      const last = entries[entries.length - 1];
      setVisibleCount(measure(last.contentRect.width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <BentoBaseCarousel
      advanceCount={Math.floor(visibleCount)}
      arrowPrevAs={arrowPrevAs}
      arrowNextAs={arrowNextAs}
      class={objstr({
        [className]: !!className,
        [classes.gallery]: true,
        [classes.extraSpace]: extraSpace === 'around',
      })}
      outsetArrows={outsetArrows}
      snapAlign={slideAlign}
      ref={carouselRef}
      visibleCount={visibleCount}
      {...rest}
    >
      {children}
    </BentoBaseCarousel>
  );
}

const BentoStreamGallery = forwardRef(BentoStreamGalleryWithRef);
BentoStreamGallery.displayName = 'StreamGallery'; // Make findable for tests.
export {BentoStreamGallery};

/**
 * @param {!BentoStreamGalleryDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow({
  'aria-disabled': ariaDisabled,
  by,
  disabled,
  onClick,
  outsetArrows,
  [propName('class')]: className,
}) {
  const classes = useStyles();
  return (
    <div class={className}>
      <button
        aria-disabled={ariaDisabled}
        aria-hidden="true"
        class={objstr({
          [classes.arrow]: true,
          [classes.arrowPrev]: by < 0,
          [classes.arrowNext]: by > 0,
          [classes.outsetArrow]: outsetArrows,
          [classes.insetArrow]: !outsetArrows,
        })}
        disabled={disabled}
        onClick={onClick}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d={
              by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6'
            }
            fill="none"
            stroke="#000"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Updates the number of items visible for the internal carousel based on
 * the min/max item widths and how much space is available.
 * @param {number} maxItemWidth
 * @param {number} minItemWidth
 * @param {number} maxVisibleCount
 * @param {number} minVisibleCount
 * @param {number} slideCount
 * @param {boolean|undefined} outsetArrows
 * @param {number} peek
 * @param {(null|number)} containerWidth
 * @param {Element} container
 * @return {number}
 */
function getVisibleCount(
  maxItemWidth,
  minItemWidth,
  maxVisibleCount,
  minVisibleCount,
  slideCount,
  outsetArrows,
  peek,
  containerWidth,
  container
) {
  if (!containerWidth) {
    return DEFAULT_VISIBLE_COUNT;
  }
  const items = getItemsForWidth(containerWidth, minItemWidth, peek);
  const maxVisibleSlides = Math.min(slideCount, maxVisibleCount);
  const visibleCount = Math.min(
    Math.max(minVisibleCount, items),
    maxVisibleSlides
  );
  /*
   * When we are going to show more slides than we have, cap the width so
   * that we do not go over the max requested slide width. Otherwise,
   * cap the max width based on how many items are showing and the max
   * width for each item.
   */
  const maxContainerWidth =
    (items > maxVisibleSlides
      ? maxVisibleSlides * maxItemWidth
      : items * maxItemWidth) + (outsetArrows ? OUTSET_ARROWS_WIDTH : 0);
  const maxWidthValue =
    maxContainerWidth < Number.MAX_VALUE ? `${maxContainerWidth}px` : '';
  setStyle(container, 'max-width', maxWidthValue);
  return visibleCount;
}

/**
 * Determines how many whole items in addition to the current peek value can
 * fit for a given item width. This can be rounded up or down to satisfy a
 * max/min size constraint.
 * @param {number} containerWidth The width of the container element.
 * @param {number} itemWidth The width of each item.
 * @param {number} peek The amount of slides to show besides the current item.
 * @return {number} The number of items to show.
 */
function getItemsForWidth(containerWidth, itemWidth, peek) {
  const availableWidth = containerWidth - peek * itemWidth;
  const fractionalItems = availableWidth / itemWidth;
  const wholeItems = Math.floor(fractionalItems);
  // Always show at least 1 whole item.
  return Math.max(DEFAULT_VISIBLE_COUNT, wholeItems) + peek;
}
