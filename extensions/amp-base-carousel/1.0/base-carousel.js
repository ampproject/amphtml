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
import {ArrowNext, ArrowPrev} from './arrow';
import {CarouselContext} from './carousel-context';
import {ContainWrapper} from '../../../src/preact/component';
import {Scroller} from './scroller';
import {
  toChildArray,
  useContext,
  useEffect,
  useRef,
  useState,
} from '../../../src/preact';
import {useMountEffect} from '../../../src/preact/utils';

/**
 * @param {!BaseCarouselDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function BaseCarousel({
  arrowPrev,
  arrowNext,
  children,
  loop,
  onSlideChange,
  setAdvance,
  ...rest
}) {
  const childrenArray = toChildArray(children);
  const {length} = childrenArray;
  const carouselContext = useContext(CarouselContext);
  const [currentSlideState, setCurrentSlideState] = useState(0);
  const currentSlide = carouselContext.currentSlide ?? currentSlideState;
  const setCurrentSlide =
    carouselContext.setCurrentSlide ?? setCurrentSlideState;
  const {setSlideCount} = carouselContext;
  const scrollRef = useRef(null);
  const advance = (by) => scrollRef.current.advance(by);
  useMountEffect(() => {
    if (setAdvance) {
      setAdvance(advance);
    }
  });
  useEffect(() => {
    setSlideCount(length);
  }, [setSlideCount, length]);
  const setRestingIndex = (i) => {
    setCurrentSlide(i);
    if (onSlideChange) {
      onSlideChange(i);
    }
  };
  const disableForDir = (dir) =>
    !loop && (currentSlide + dir < 0 || currentSlide + dir >= length);
  return (
    <ContainWrapper size={true} layout={true} paint={true} {...rest}>
      <Scroller
        loop={loop}
        restingIndex={currentSlide}
        setRestingIndex={setRestingIndex}
        ref={scrollRef}
      >
        {childrenArray}
      </Scroller>
      <ArrowPrev
        customArrow={arrowPrev}
        disabled={disableForDir(-1)}
        advance={advance}
      />
      <ArrowNext
        customArrow={arrowNext}
        disabled={disableForDir(1)}
        advance={advance}
      />
    </ContainWrapper>
  );
}
