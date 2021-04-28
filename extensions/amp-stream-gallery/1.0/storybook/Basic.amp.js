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
import {boolean, number, select, withKnobs} from '@storybook/addon-knobs';
import {withAmp} from '@ampproject/storybook-addon';

const CONTROLS = ['auto', 'always', 'never'];

export default {
  title: 'amp-stream-gallery-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-stream-gallery', version: '1.0'}],

    experiments: ['bento'],
  },
};

export const Default = () => {
  const slideCount = number('slide count', 15, {min: 3, max: 99});
  const extraSpace = boolean('extra space around?', true);
  const controls = select('controls', CONTROLS);
  const loop = boolean('loop', true);
  const snap = boolean('snap', true);
  const slideAlign = select('slide align', ['start', 'center']);
  const minItemWidth = number('min item width', 130, {min: 1});
  const maxItemWidth = number('max item width', 180, {min: 1});
  const minVisibleCount = number('min visible count', 2.5, {min: 1});
  const maxVisibleCount = number('max visible count', 5, {min: 1});
  const peek = number('peek', 0, {min: 1});
  const outsetArrows = boolean('outset arrows', true);
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <>
      <amp-stream-gallery
        id="carousel"
        width="735"
        height="225"
        layout="responsive"
        controls={controls}
        extra-space={extraSpace}
        loop={loop}
        min-item-width={minItemWidth}
        max-item-width={maxItemWidth}
        min-visible-count={minVisibleCount}
        max-visible-count={maxVisibleCount}
        outset-arrows={outsetArrows}
        peek={peek}
        slide-align={slideAlign}
        snap={snap}
      >
        {Array.from({length: slideCount}, (x, i) => {
          const v = colorIncrement * (i + 1);
          return (
            <amp-layout width="245" height="225" layout="flex-item">
              <svg viewBox="0 0 440 225">
                <rect
                  style={{fill: `rgb(${v}, 100, 100)`}}
                  width="440"
                  height="225"
                />
                Sorry, your browser does not support inline SVG.
              </svg>
            </amp-layout>
          );
        })}
      </amp-stream-gallery>

      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:carousel.goToSlide(index=3)">goToSlide(index=3)</button>
        <button on="tap:carousel.next">Next</button>
        <button on="tap:carousel.prev">Prev</button>
      </div>
    </>
  );
};

export const customArrows = () => {
  const width = number('width', 400);
  const height = number('height', 200);
  const slideCount = number('slide count', 7, {min: 0, max: 99});
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <amp-stream-gallery max-visible-count={3} width={width} height={height}>
      {Array.from({length: slideCount}, (x, i) => {
        const v = colorIncrement * (i + 1);
        return (
          <div
            style={{
              backgroundColor: `rgb(${v}, 100, 100)`,
              border: 'solid white 1px',
              width: '100%',
              height: '100%',
            }}
          ></div>
        );
      })}
      <button slot="next-arrow">Next</button>
      <button slot="prev-arrow">Prev</button>
    </amp-stream-gallery>
  );
};

Default.storyName = 'default';
