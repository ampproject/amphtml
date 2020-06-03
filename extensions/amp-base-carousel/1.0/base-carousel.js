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
import {Scroller} from './scroller';
import {useStateFromProp} from '../../../src/preact/utils';

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function BaseCarousel(props) {
  const {style, arrowPrev, arrowNext, children, currentSlide} = props;
  const {0: curSlide, 1: setCurSlide} = useStateFromProp(currentSlide || 0);

  return (
    <div style={style}>
      <Scroller currentSlide={curSlide} setCurrentSlide={setCurSlide}>
        {children}
      </Scroller>
      <Arrow
        dir={-1}
        currentSlide={curSlide}
        setCurrentSlide={setCurSlide}
        length={children.length}
        customArrow={arrowPrev}
      ></Arrow>
      <Arrow
        dir={1}
        currentSlide={curSlide}
        setCurrentSlide={setCurSlide}
        length={children.length}
        customArrow={arrowNext}
      ></Arrow>
    </div>
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Arrow(props) {
  const {dir, currentSlide, setCurrentSlide, length, customArrow} = props;
  const button = customArrow ? customArrow : DefaultArrow({dir});
  const nextSlide = currentSlide + dir;
  const {style = {}, children} = button.props;
  return Preact.cloneElement(
    button,
    {
      onClick: () => setCurrentSlide(currentSlide + dir),
      disabled: nextSlide < 0 || nextSlide >= length,
      style: style ? style : {},
    },
    children
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow(props) {
  const {dir} = props;
  return (
    <button
      style={{
        // Offset button from the edge.
        [dir < 0 ? 'left' : 'right']: '8px',
        ...styles.defaultArrowButton,
      }}
    >
      {props.dir < 0 ? '<<' : '>>'}
    </button>
  );
}
