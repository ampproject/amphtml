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

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Thumbnails({loop = true, children, ...rest}) {
  const childrenArray = toChildArray(children);
  const {setCurrentSlide} = useContext(CarouselContext);
  const pointerFine = window.matchMedia('(pointer: fine)');
  // Note: The carousel is aria-hidden since it just duplicates the
  // information of the original carousel.
  return (
    <BaseCarousel
      aria-hidden={true}
      mixedLength={true}
      snap={false}
      controls={pointerFine ? 'always' : 'never'}
      loop={loop}
      style={{width: '100%', height: '100%'}}
      {...rest}
    >
      {childrenArray.map((slide, i) =>
        cloneElement(slide, {
          onClick: () => setCurrentSlide(i),
        })
      )}
    </BaseCarousel>
  );
}
