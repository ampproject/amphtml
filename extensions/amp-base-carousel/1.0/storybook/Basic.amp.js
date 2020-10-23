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
  const visibleCount = number('visible count', 1, {min: 1});
  const outsetArrows = boolean('outset arrows', false);
  const controls = select('show controls', ['auto', 'always', 'never']);
  const slideCount = number('slide count', 5, {min: 0, max: 99});
  const colorIncrement = Math.floor(255 / (slideCount + 1));

  return (
    <main>
      <amp-base-carousel
        id="carousel"
        advance-count={advanceCount}
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

Default.story = {
  name: 'default',
};
