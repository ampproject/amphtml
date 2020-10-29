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
import {cloneElement} from '../../../src/preact';
import {px} from '../../../src/style';

const DEFAULT_HEIGHT = 100;

/**
 * @param {!InlineGalleryDef.ThumbnailProps} props
 * @return {PreactDef.Renderable}
 */
export function Thumbnails({
  aspectRatio,
  children,
  loop = false,
  style,
  ...rest
}) {
  const pointerFine = window.matchMedia('(pointer: fine)');
  const slideHeight = (style && style.height) || DEFAULT_HEIGHT;
  // Note: The carousel is aria-hidden since it just duplicates the
  // information of the original carousel.
  return (
    <CarouselContext.Consumer>
      {({slides, setCurrentSlide}) => (
        <BaseCarousel
          aria-hidden={true}
          mixedLength={true}
          snap={false}
          controls={pointerFine ? 'always' : 'never'}
          loop={loop}
          style={{height: slideHeight, ...style}}
          _thumbnails={true}
          {...rest}
        >
          {(children || slides).map((slide, i) => {
            const {
              style = {},
              children,
            } = /** @type {InlineGalleryDef.SlideProps} */ (slide.props);
            const size = {
              height: px(slideHeight),
              width: aspectRatio
                ? px(slideHeight * aspectRatio)
                : style.width && style.height
                ? px((style.width / style.height) * slideHeight)
                : '',
            };
            return cloneElement(
              /** @type {!PreactDef.VNode} */ (slide),
              {
                style: {
                  ...style,
                  ...size,
                },
                onClick: () => setCurrentSlide(i),
              },
              children
            );
          })}
        </BaseCarousel>
      )}
    </CarouselContext.Consumer>
  );
}
