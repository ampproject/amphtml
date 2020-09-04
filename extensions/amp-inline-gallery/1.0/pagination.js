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
import {CarouselContext} from '../../amp-base-carousel/1.0/carousel-context';
import {useContext} from '../../../src/preact';
import {useStyles} from './pagination.jss';

/**
 * @param {!InlineGalleryDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
export function Pagination({inset, ...rest}) {
  const classes = useStyles();
  const {slideCount, currentSlide, setCurrentSlide} = useContext(
    CarouselContext
  );
  const Comp = slideCount <= 8 ? Dots : Numbers;
  const indicator = (
    <div
      aria-hidden="true"
      class={`${classes.container} ${inset ? classes.inset : ''}`}
      style={{
        // TODO: where does this belong?
        height: 20,
      }}
    >
      <div
        class={`${Comp == Dots ? classes.dots : classes.numbers} ${
          inset ? classes.inset : ''
        }`}
      >
        {inset && (
          <>
            <div
              class={`${classes.insetBaseStyle} ${classes.insetFrosting}`}
            ></div>
            <div
              class={`${classes.insetBaseStyle} ${classes.insetBackdrop}`}
            ></div>
            <div
              class={`${classes.insetBaseStyle} ${classes.insetBackground}`}
            ></div>
          </>
        )}
        <Comp
          currentSlide={currentSlide}
          inset={inset}
          goTo={(i) => setCurrentSlide(i)}
          slideCount={slideCount}
        />
      </div>
    </div>
  );
  return inset ? (
    indicator
  ) : (
    // Respect user provided dimensions with a default height of 20px.
    <div style={{height: 20}} {...rest}>
      {indicator}
    </div>
  );
}

/**
 * @param {!InlineGalleryDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
function Dots({currentSlide, goTo, inset, slideCount}) {
  const classes = useStyles();
  const dotList = [];
  for (let i = 0; i < slideCount; i++) {
    dotList.push(
      <div
        key={i}
        class={`${classes.dotWrapper} ${inset ? classes.inset : ''}`}
      >
        <div class={`${classes.dot} ${inset ? classes.inset : ''}`}>
          <div
            role="button"
            aria-selected={String(i === currentSlide)}
            onClick={() => goTo(i)}
            class={`${classes.dotProgress} ${inset ? classes.inset : ''}`}
            style={{opacity: i === currentSlide ? 1 : 0}}
          ></div>
        </div>
      </div>
    );
  }
  return <>{dotList}</>;
}

/**
 * @param {!InlineGalleryDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
function Numbers({currentSlide, inset, slideCount}) {
  const classes = useStyles();
  return (
    <div class={`${classes.numbersWrapper} ${inset ? classes.inset : ''}`}>
      <span>{currentSlide + 1}</span>
      <span> / </span>
      <span>{slideCount}</span>
    </div>
  );
}
