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
import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-youtube-1_0',
  decorators: [withKnobs, withA11y, withAmp],
  parameters: {
    extensions: [
      {name: 'amp-youtube', version: '1.0'},
      {name: 'amp-accordion', version: '1.0'},
    ],
    experiments: ['bento'],
  },
};

export const Default = () => {
  const videoid = text('videoid', 'IAvf-rkzNck');
  const layout = text('layout', 'responsive');
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const width = number('width', 300);
  const height = number('height', 200);
  const credentials = text('credentials', 'include');
  return (
    <amp-youtube
      width={width}
      height={height}
      data-videoid={videoid}
      layout={layout}
      autoplay={autoplay}
      loop={loop}
      credentials={credentials}
    ></amp-youtube>
  );
};

export const InsideAccordion = () => {
  const videoid = text('videoid', 'IAvf-rkzNck');
  const width = number('width', 300);
  const height = number('height', 200);
  const autoplay = boolean('autoplay', false);
  return (
    <amp-accordion expand-single-section>
      <section expanded>
        <h2>YouTube Video</h2>
        <div>
          <amp-youtube
            width={width}
            height={height}
            data-videoid={videoid}
            autoplay={autoplay}
            loop
          ></amp-youtube>
        </div>
      </section>
    </amp-accordion>
  );
};

Default.story = {
  name: 'Default',
};
