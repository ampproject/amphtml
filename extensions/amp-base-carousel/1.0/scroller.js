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
import {WithAmpContext} from '../../../src/preact/context';
import {useEffect, useLayoutEffect, useRef} from '../../../src/preact';

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Scroller(props) {
  const {children, onSlideChange, currentSlide, setCurrentSlide} = props;
  const slides = children || [];
  const containerRef = useRef();

  // Note: this has to be useLayoutEffect, not useEffect.
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const container = containerRef.current;
    container /* OK */.scrollLeft =
      container /* OK */.offsetWidth * currentSlide;
  }, [currentSlide]);

  // Event. Don't need to be render-blocking.
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange({currentSlide});
    }
  }, [currentSlide, onSlideChange]);

  /**
   *
   */
  function scrollHandler() {
    // TBD: Is this a good idea to manage currentSlide via state? Amount of
    // re-rendering is very small and mostly affects `scrollLeft`, which is
    // not renderable at all.
    // TBD: Ideally we need to wait for "scrollend" event, that's still WIP
    // in most of browsers.
    const container = containerRef.current;
    const slide = Math.round(
      container /* OK */.scrollLeft / container /* OK */.offsetWidth
    );
    setCurrentSlide(slide);
  }

  return (
    <div
      key="container"
      ref={containerRef}
      onScroll={scrollHandler}
      style={styles.scrollContainer}
    >
      {slides.map((child, index) => (
        <WithAmpContext
          key={`slide-${child.key || index}`}
          renderable={index == currentSlide}
          playable={index == currentSlide}
        >
          <div style={styles.slideElement}>{child}</div>
        </WithAmpContext>
      ))}
    </div>
  );
}
