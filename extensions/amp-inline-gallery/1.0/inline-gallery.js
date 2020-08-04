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
import {cloneElement, toChildArray, useState} from '../../../src/preact';

/**
 * @param {!InlineGalleryDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function InlineGallery({children, ...rest}) {
  const childrenArray = toChildArray(children);
  const carousel = childrenArray.filter((child) => !!child.props.children);
  if (carousel.length !== 1) {
    throw new Error(
      'Expected exactly 1 BaseCarousel but found: ',
      carousel.length
    );
  }
  const slides = carousel[0].props.children;
  const [index, setIndex] = useState(0);
  return (
    <div class="i-amphtml-inline-gallery" {...rest}>
      {childrenArray.map((child) => {
        if (child == carousel[0]) {
          const existingOnSlideChange = child.props.onSlideChange;
          return cloneElement(child, {
            onSlideChange: (i) => {
              if (existingOnSlideChange) {
                existingOnSlideChange(i);
              }
              setIndex(i);
            },
            slide: index,
          });
        } else {
          return cloneElement(child, {
            children: slides,
            current: index,
            goTo: setIndex,
          });
        }
      })}
    </div>
  );
}
