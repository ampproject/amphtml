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
import {ContainWrapper} from '../../../src/preact/component';
import {useMemo, useState} from '../../../src/preact';

const InlineGalleryContext = Preact.createContext(
  /** @type {InlineGalleryDef.ContextProps} */ ({})
);
export {InlineGalleryContext};

/**
 * @param {!InlineGalleryDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function InlineGallery({children, ...rest}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(null);
  const carouselContext = useMemo(
    () => ({currentSlide, setCurrentSlide, slideCount, setSlideCount}),
    [currentSlide, slideCount]
  );
  return (
    <ContainWrapper size={false} layout={true} paint={true} {...rest}>
      <InlineGalleryContext.Provider value={carouselContext}>
        <div class="i-amphtml-inline-gallery" {...rest}>
          {children}
        </div>
      </InlineGalleryContext.Provider>
    </ContainWrapper>
  );
}
