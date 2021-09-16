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
import {boolean, number, select, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-base-carousel',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [{name: 'amp-base-carousel', version: '1.0'}],
    experiments: ['amp-base-carousel-bento'],
  },
};

export const Default = () => {
  const loop = boolean('loop', true);
  const snap = boolean('snap', true);
  const advanceCount = number('advance count', 1, {min: 1});
  const autoAdvance = boolean('auto advance', true);
  const autoAdvanceCount = number('auto advance count', 1);
  const autoAdvanceInterval = number('auto advance interval', 1000);
  const autoAdvanceLoops = number('auto advance loops', 3);
  const visibleCount = text('visible count', '(min-width: 400px) 2, 1');
  const outsetArrows = text('outset arrows', '(min-width: 400px) true, false');
  const controls = select('show controls', ['auto', 'always', 'never']);
  const slideCount = number('slide count', 5, {min: 0, max: 99});
  const colorIncrement = Math.floor(255 / (slideCount + 1));

  return (
    <main>
      <amp-base-carousel
        id="carousel"
        advance-count={advanceCount}
        auto-advance={autoAdvance}
        auto-advance-count={autoAdvanceCount}
        auto-advance-interval={autoAdvanceInterval}
        auto-advance-loops={autoAdvanceLoops}
        controls={controls}
        outset-arrows={outsetArrows}
        width="880"
        height="225"
        snap={String(snap)}
        loop={loop}
        layout="responsive"
        visible-count={visibleCount}
      >
        {Array.from({length: slideCount}, (x, i) => {
          const v = colorIncrement * (i + 1);
          return (
            <amp-layout width="440" height="225" layout="responsive">
              <div
                style={{
                  backgroundColor: `rgb(${v}, 100, 100)`,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48pt',
                }}
              >
                {i}
              </div>
            </amp-layout>
          );
        })}
      </amp-base-carousel>

      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:carousel.goToSlide(index=3)">goToSlide(index=3)</button>
        <button on="tap:carousel.next">Next</button>
        <button on="tap:carousel.prev">Prev</button>
      </div>
    </main>
  );
};

export const mixedLength = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  const slideCount = number('slide count', 7, {min: 0, max: 99});
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  const loop = boolean('loop', true);
  const snap = boolean('snap', true);
  const mixedLength = boolean('mixed length', true);
  const controls = select('show controls', ['auto', 'always', 'never']);

  return (
    <amp-base-carousel
      controls={controls}
      mixed-length={mixedLength}
      loop={loop}
      snap={String(snap)}
      width={width}
      height={height}
    >
      {Array.from({length: slideCount}, (x, i) => {
        const v = colorIncrement * (i + 1);
        return (
          <div
            style={{
              backgroundColor: `rgb(${v}, 100, 100)`,
              width: `${Math.floor(Math.random() * 200 + 100)}px`,
              height: `${Math.floor(Math.random() * 100 + 100)}px`,
            }}
          ></div>
        );
      })}
    </amp-base-carousel>
  );
};

Default.story = {
  name: 'default',
};
