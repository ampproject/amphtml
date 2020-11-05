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

import * as Preact from '../../../../src/preact';
import {BaseCarousel} from '../base-carousel';
import {boolean, number, select, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

const CONTROLS = ['auto', 'always', 'never'];

export default {
  title: 'BaseCarousel',
  component: BaseCarousel,
  decorators: [withA11y, withKnobs],
};

/**
 * @param {!Object} props
 * @return {*}
 */
function CarouselWithActions(props) {
  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <section>
      <BaseCarousel ref={ref} {...props} />
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current.goToSlide(3)}>goToSlide(3)</button>
        <button onClick={() => ref.current.next()}>next</button>
        <button onClick={() => ref.current.prev()}>prev</button>
      </div>
    </section>
  );
}

export const _default = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  const slideCount = number('slide count', 5, {min: 0, max: 99});
  const snap = boolean('snap', true);
  const loop = boolean('loop', true);
  const advanceCount = number('advance count', 1, {min: 1});
  const visibleCount = number('visible count', 2, {min: 1});
  const outsetArrows = boolean('outset arrows', false);
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  const controls = select('show controls', CONTROLS);
  return (
    <CarouselWithActions
      advanceCount={advanceCount}
      controls={controls}
      loop={loop}
      outsetArrows={outsetArrows}
      snap={snap}
      style={{width, height}}
      visibleCount={visibleCount}
    >
      {Array.from({length: slideCount}, (x, i) => {
        const v = colorIncrement * (i + 1);
        return (
          <div
            style={{
              backgroundColor: `rgb(${v}, 100, 100)`,
              width,
              height,
              textAlign: 'center',
              fontSize: '48pt',
              lineHeight: height + 'px',
            }}
          >
            {i}
          </div>
        );
      })}
    </CarouselWithActions>
  );
};

export const mixedLength = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  const slideCount = 15;
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  const loop = boolean('loop', true);
  const snap = boolean('snap', true);
  const mixedLength = boolean('mixed length', true);
  const controls = select('show controls', ['auto', 'always', 'never']);
  const randomPreset = [
    [143, 245, 289, 232, 280, 233, 182, 155, 114, 269, 242, 196, 249, 265, 241],
    [225, 158, 201, 205, 230, 233, 231, 255, 143, 264, 227, 157, 120, 203, 144],
    [252, 113, 115, 186, 248, 188, 162, 104, 100, 109, 175, 227, 143, 249, 280],
  ];
  const preset = select('random preset', [1, 2, 3]);
  return (
    <BaseCarousel
      controls={controls}
      mixedLength={mixedLength}
      loop={loop}
      snap={snap}
      style={{width, height}}
    >
      {Array.from({length: slideCount}, (x, i) => {
        const v = colorIncrement * (i + 1);
        return (
          <div
            style={{
              backgroundColor: `rgb(${v}, 100, 100)`,
              border: 'solid white 1px',
              width: `${randomPreset[preset - 1 || 0][i]}px`,
              height: `100px`,
            }}
          ></div>
        );
      })}
    </BaseCarousel>
  );
};

export const provideArrows = () => {
  const outsetArrows = boolean('outset arrows', false);
  const width = number('width', 440);
  const height = number('height', 225);
  const controls = select('show controls', CONTROLS);
  const myButtonStyle = {
    background: 'lightblue',
    borderRadius: '50%',
    fontSize: 14,
    color: 'white',
    width: '30px',
    height: '30px',
  };
  const MyButton = (props) => {
    const {children} = props;
    return (
      <button style={myButtonStyle} {...props}>
        {children}
      </button>
    );
  };
  return (
    <BaseCarousel
      controls={controls}
      style={{width, height}}
      outsetArrows={outsetArrows}
      arrowPrev={<MyButton>←</MyButton>}
      arrowNext={<MyButton>→</MyButton>}
    >
      {['lightcoral', 'peachpuff', 'lavender'].map((color) => (
        <div style={{backgroundColor: color, width, height}}></div>
      ))}
    </BaseCarousel>
  );
};

export const WithCaptions = () => {
  const controls = select('show controls', CONTROLS);
  return (
    <BaseCarousel
      visibleCount={3}
      controls={controls}
      loop
      style={{width: '500px', height: '400px'}}
    >
      <figure>
        <img
          style={{width: '500px', height: '300px'}}
          src="https://amp.dev/static/samples/img/landscape_lake_1280x857.jpg"
        />
        <figcaption>Each image has a different caption.</figcaption>
      </figure>
      <figure>
        <img
          style={{width: '600px', height: '300px'}}
          src="https://amp.dev/static/samples/img/landscape_village_1280x853.jpg"
        />
        <figcaption>This caption is different.</figcaption>
      </figure>
      <figure>
        <img
          style={{width: '500px', height: '300px'}}
          src="https://amp.dev/static/samples/img/landscape_desert_1280x853.jpg"
        />
        <figcaption>The third image has its caption.</figcaption>
      </figure>
    </BaseCarousel>
  );
};
