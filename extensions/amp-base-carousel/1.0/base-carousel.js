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
import {Arrow} from './arrow';
import {Scroller} from './scroller';
import {useRef, useState} from '../../../src/preact';

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function BaseCarousel(props) {
  const {style, arrowPrev, arrowNext, children, currentSlide, loop} = props;
  const {0: curSlide, 1: setCurSlide} = useState(currentSlide || 0);
  const ignoreProgrammaticScroll = useRef(true);
  const setRestingIndex = (i) => {
    ignoreProgrammaticScroll.current = true;
    setCurSlide(i);
  };

  return (
    <div style={style}>
      <Scroller
        ignoreProgrammaticScroll={ignoreProgrammaticScroll}
        loop={loop}
        restingIndex={curSlide}
        setRestingIndex={setRestingIndex}
      >
        {children}
      </Scroller>
      <Arrow
        dir={-1}
        loop={loop}
        restingIndex={curSlide}
        setRestingIndex={setRestingIndex}
        length={children.length}
        customArrow={arrowPrev}
      ></Arrow>
      <Arrow
        dir={1}
        loop={loop}
        restingIndex={curSlide}
        setRestingIndex={setRestingIndex}
        length={children.length}
        customArrow={arrowNext}
      ></Arrow>
    </div>
  );
}
