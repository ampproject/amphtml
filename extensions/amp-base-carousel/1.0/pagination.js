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
import * as styles from './base-carousel.css';

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Pagination({current, goTo, height = 20, inset, children}) {
  return (
    <div
      aria-hidden="true"
      class="i-amphtml-carousel-pagination-container"
      style={{
        ...styles.paginationContainer,
        ...(inset ? styles.insetPaginationContainer : {}),
        height,
      }}
    >
      {children.length <= 8 ? (
        <Dots
          inset={inset}
          current={current}
          total={children.length}
          goTo={goTo}
        />
      ) : (
        <Numbers current={current} inset={inset} total={children.length} />
      )}
    </div>
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
function Dots({current, goTo, inset, total}) {
  return (
    <div
      class="i-amphtml-carousel-pagination-dots"
      style={{
        ...styles.paginationDots,
        ...(inset ? styles.insetPaginationDots : {}),
      }}
    >
      {inset && insetStylingBase}
      {Array.from({length: total}, (_, i) => (
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
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
function Numbers({current, inset, total}) {
  return (
    <div
      style={{
        ...styles.paginationNumbers,
        color: inset ? '#fff' : 'currentColor',
      }}
    >
      {inset && insetStylingBase}
      <div style={{zIndex: 1}}>
        <span class="i-amphtml-carousel-pagination-index">{current}</span>
        <span> / </span>
        <span class="i-amphtml-carousel-pagination-total">{total}</span>
      </div>
    </div>
  );
}

const insetStylingBase = (
  <>
    <div style={{...styles.insetPaginationBaseStyle, ...styles.frosting}}></div>
    <div style={{...styles.insetPaginationBaseStyle, ...styles.backdrop}}></div>
    <div style={styles.insetPaginationBackground}></div>
  </>
);
