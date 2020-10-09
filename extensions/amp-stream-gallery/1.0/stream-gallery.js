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
import {
  BaseCarousel,
  Controls,
} from '../../amp-base-carousel/1.0/base-carousel';
import {CarouselContext} from '../../amp-base-carousel/1.0/carousel-context';
import {ContainWrapper} from '../../../src/preact/component';
import {useCallback, useMemo, useRef, useState} from '../../../src/preact';
import {useStyles} from './stream-gallery.jss';

/**
 * @param {!StreamGalleryDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function StreamGallery({
  arrowPrev: customArrowPrev,
  arrowNext: customArrowNext,
  children,
  extraSpace,
  insetArrowVisibility,
  loop,
  maxItemWidth = Number.MAX_VALUE,
  minItemWidth = 1,
  maxVisibleCount = Number.MAX_VALUE,
  minVisibleCount = 1,
  outsetArrows,
  peek = 0,
  slideAlign,
  snap,
  style,
  ...rest
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(null);
  const carouselContext = useMemo(
    () => ({currentSlide, setCurrentSlide, slideCount, setSlideCount}),
    [currentSlide, slideCount]
  );
  const galleryRef = useRef(null);
  const carouselRef = useRef(null);
  const advance = useCallback((by) => carouselRef.current.advance(by), []);
  const {visibleCount, maxContainerWidth} = getVisibleCount(
    maxItemWidth,
    minItemWidth,
    maxVisibleCount,
    minVisibleCount,
    children.length,
    peek,
    galleryRef
  );
  const arrowPrev = customArrowPrev || (
    <DefaultArrow
      advance={advance}
      by={-visibleCount}
      outsetArrows={outsetArrows}
      setCurrentSlide={setCurrentSlide}
    />
  );
  const arrowNext = customArrowNext || (
    <DefaultArrow
      advance={advance}
      by={visibleCount}
      outsetArrows={outsetArrows}
      setCurrentSlide={setCurrentSlide}
    />
  );

  return (
    <ContainWrapper
      layout={true}
      size={true}
      contentStyle={style}
      contentRef={galleryRef}
      {...rest}
    >
      <CarouselContext.Provider value={carouselContext}>
        {outsetArrows && arrowPrev}
        <BaseCarousel
          ref={carouselRef}
          advanceCount={Math.floor(visibleCount)}
          arrowPrev={arrowPrev}
          arrowNext={arrowNext}
          controls={outsetArrows ? Controls.NEVER : insetArrowVisibility}
          loop={loop}
          outsetArrows={outsetArrows}
          snap={snap}
          snapAlign={slideAlign}
          style={{
            flexGrow: 1,
            maxWidth: maxContainerWidth,
            justifyContent: extraSpace === 'around' ? 'center' : 'initial',
          }}
          visibleCount={visibleCount}
        >
          {children}
        </BaseCarousel>
        {outsetArrows && arrowNext}
      </CarouselContext.Provider>
    </ContainWrapper>
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
      {by < 0 ? (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14,7.4 L9.4,12 L14,16.6"
            fill="none"
            stroke="#000"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10,7.4 L14.6,12 L10,16.6"
            fill="none"
            stroke="#000"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </svg>
      )}
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
 * @param {number} peek
 * @param {{current: Element}} galleryRef
 * @return {{visibleCount: number, maxContainerWidth: number}}
 */
function getVisibleCount(
  maxItemWidth,
  minItemWidth,
  maxVisibleCount,
  minVisibleCount,
  slideCount,
  peek,
  galleryRef
) {
  if (!galleryRef.current) {
    return {visibleCount: 1, maxContainerWidth: Number.MAX_VALUE};
  }
  const width = galleryRef.current./* OK */ offsetWidth;
  const items = getItemsForWidth(width, minItemWidth, peek);
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
    items > maxVisibleSlides
      ? maxVisibleSlides * maxItemWidth
      : items * maxItemWidth;
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
