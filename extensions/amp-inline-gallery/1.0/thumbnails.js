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
import {BaseCarousel} from '../../amp-base-carousel/1.0/base-carousel';
import {CarouselContext} from '../../amp-base-carousel/1.0/carousel-context';
import {cloneElement, toChildArray, useContext} from '../../../src/preact';
import {px} from '../../../src/style';

/**
 * @param {!InlineGalleryDef.ThumbnailProps} props
 * @return {PreactDef.Renderable}
 */
export function Thumbnails({
  aspectRatio,
  loop = false,
  children,
  style,
  ...rest
}) {
  const childrenArray = toChildArray(children);
  const {setCurrentSlide} = useContext(CarouselContext);
  const pointerFine = window.matchMedia('(pointer: fine)');
  const slideHeight = style.height;
  // Note: The carousel is aria-hidden since it just duplicates the
  // information of the original carousel.
  return (
    <BaseCarousel
      aria-hidden={true}
      mixedLength={true}
      snap={false}
      controls={pointerFine ? 'always' : 'never'}
      loop={loop}
      style={style}
      _thumbnails={true}
      {...rest}
    >
      {childrenArray.map((slide, i) => {
        const {
          style,
          children,
        } = /** @type {InlineGalleryDef.SlideProps} */ (slide.props);
        const slideWidth = aspectRatio
          ? slideHeight * aspectRatio
          : (style.width / style.height) * slideHeight;
        return cloneElement(
          /** @type {!PreactDef.VNode} */ (slide),
          {
            style: {
              ...style,
              width: px(slideWidth),
              height: px(slideHeight),
            },
            onClick: () => setCurrentSlide(i),
          },
          children
        );
      })}
    </BaseCarousel>
  );
}
