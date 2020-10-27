/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {BaseCarousel} from '../../amp-base-carousel/1.0/base-carousel';
import {setStyle} from '../../../src/style';
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';
import {useStyles} from './stream-gallery.jss';

const DEFAULT_MEASUREMENT = {
  visibleCount: 1,
  maxContainerWidth: Number.MAX_VALUE,
};
const OUTSET_ARROWS_WIDTH = 100;

/**
 * @param {!StreamGalleryDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function StreamGallery({
  arrowPrev: customArrowPrev,
  arrowNext: customArrowNext,
  children,
  className,
  extraSpace,
  insetArrowVisibility,
  loop,
  maxItemWidth = Number.MAX_VALUE,
  minItemWidth = 1,
  maxVisibleCount = Number.MAX_VALUE,
  minVisibleCount = 1,
  outsetArrows,
  peek = 0,
  snap,
  ...rest
}) {
  const classes = useStyles();
  const ref = useRef(null);
  const [measurements, setMeasurements] = useState(DEFAULT_MEASUREMENT);
  const arrowPrev = useMemo(
    () =>
      customArrowPrev ?? <DefaultArrow by={-1} outsetArrows={outsetArrows} />,
    [customArrowPrev, outsetArrows]
  );
  const arrowNext = useMemo(
    () =>
      customArrowNext ?? <DefaultArrow by={1} outsetArrows={outsetArrows} />,
    [customArrowNext, outsetArrows]
  );

  const measure = useCallback(
    (containerWidth) =>
      getVisibleCount(
        maxItemWidth,
        minItemWidth,
        maxVisibleCount,
        minVisibleCount,
        children.length,
        outsetArrows,
        peek,
        containerWidth,
        ref.current.node
      ),
    [
      maxItemWidth,
      minItemWidth,
      maxVisibleCount,
      minVisibleCount,
      children.length,
      outsetArrows,
      peek,
    ]
  );

  // Adjust visible slide count when container size or parameters change.
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    const node = ref.current.root;
    if (!node) {
      return;
    }
    // Use local window.
    const win = node.ownerDocument.defaultView;
    const observer = new win.ResizeObserver((entries) => {
      const last = entries[entries.length - 1];
      setMeasurements(measure(last.contentRect.width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <BaseCarousel
      advanceCount={Math.floor(measurements.visibleCount)}
      arrowPrev={arrowPrev}
      arrowNext={arrowNext}
      className={`${className ?? ''} ${classes.gallery} ${classes[extraSpace]}`}
      controls={insetArrowVisibility}
      loop={loop}
      outsetArrows={outsetArrows}
      snap={snap}
      ref={ref}
      visibleCount={measurements.visibleCount}
      {...rest}
    >
      {children}
    </BaseCarousel>
  );
}

/**
 * @param {!StreamGalleryDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow({advance, by, outsetArrows, ...rest}) {
  const classes = useStyles();
  return (
    <button
      onClick={() => advance(by)}
      className={`${classes.arrow} ${
        by < 0 ? classes.arrowPrev : classes.arrowNext
      } ${outsetArrows ? classes.outsetArrow : classes.insetArrow}`}
      aria-hidden="true"
      {...rest}
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d={by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6'}
          fill="none"
          stroke="#000"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>
    </button>
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
 * @param {boolean} outsetArrows
 * @param {number} peek
 * @param {(null|number)} containerWidth
 * @param {Element} container
 * @return {{visibleCount: number, maxContainerWidth: number}}
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
    return DEFAULT_MEASUREMENT;
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
  return {visibleCount, maxContainerWidth};
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
  return Math.max(1, wholeItems) + peek;
}
