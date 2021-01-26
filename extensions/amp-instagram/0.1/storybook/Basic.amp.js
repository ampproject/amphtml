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
  title: 'amp-instagram-0_1',
  decorators: [withA11y, withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-instagram', version: '0.1'}],
  },
};

export const _default = () => {
  const width = number('width', 500);
  const height = number('height', 600);
  const shortcode = text('shortcode', 'B8QaZW4AQY_');
  const captioned = boolean('captioned');
  const layout = text('layout', 'fixed');

  return (
    <amp-instagram
      data-shortcode={shortcode}
      data-captioned={captioned}
      width={width}
      height={height}
      layout={layout}
    ></amp-instagram>
  );
};
