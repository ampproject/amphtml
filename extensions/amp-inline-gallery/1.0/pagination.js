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
/**
 * @param {!BaseCarouselDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
import * as Preact from '../../../src/preact';
import * as styles from './pagination.css';

/**
 * @param {!InlineGalleryDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
export function Pagination({current, goTo, inset, children, ...rest}) {
  const Comp = children.length <= 8 ? Dots : Numbers;
  const indicator = (
    <div
      aria-hidden="true"
      class="i-amphtml-carousel-pagination-container"
      style={{
        ...styles.paginationContainer,
        ...(inset ? styles.insetPaginationContainer : {}),
        height: 20,
      }}
    >
      <Comp current={current} inset={inset} goTo={goTo}>
        {children}
      </Comp>
    </div>
  );
  return inset ? (
    indicator
  ) : (
    // Respect user provided dimensions with a default height of 20px.
    <div style={{height: '20px'}} {...rest}>
      {indicator}
    </div>
  );
}

/**
 * @param {!BaseCarouselDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
function Dots({current, goTo, inset, children}) {
  return (
    <div
      class="i-amphtml-carousel-pagination-dots"
      style={{
        ...styles.paginationDots,
        ...(inset ? styles.insetPaginationDots : {}),
      }}
    >
      {inset && insetBaseStyles}
      {children.map((_, i) => (
        <div
          class="i-amphtml-carousel-pagination-dot-container"
          style={styles.paginationDotContainer}
        >
          <div
            class="i-amphtml-carousel-pagination-dot"
            style={{
              ...styles.paginationDot,
              ...(inset ? styles.insetPaginationDot : {}),
            }}
          >
            <div
              onClick={() => goTo(i)}
              class="i-amphtml-carousel-pagination-dot-progress"
              style={{
                ...styles.paginationDotProgress,
                ...(inset ? styles.insetPaginationDotProgress : {}),
                opacity: i === current ? 1 : 0,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * @param {!BaseCarouselDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
function Numbers({current, inset, children}) {
  return (
    <div
      style={{
        ...styles.paginationNumbers,
        color: inset ? '#fff' : 'currentColor',
      }}
    >
      {inset && insetBaseStyles}
      <div style={{zIndex: 1}}>
        <span class="i-amphtml-carousel-pagination-index">{current + 1}</span>
        <span> / </span>
        <span class="i-amphtml-carousel-pagination-total">
          {children.length}
        </span>
      </div>
    </div>
  );
}

const insetBaseStyles = (
  <>
    <div style={{...styles.insetPaginationBaseStyle, ...styles.frosting}}></div>
    <div style={{...styles.insetPaginationBaseStyle, ...styles.backdrop}}></div>
    <div
      style={{
        ...styles.insetPaginationBaseStyle,
        ...styles.insetPaginationBackground,
      }}
    ></div>
  </>
);
