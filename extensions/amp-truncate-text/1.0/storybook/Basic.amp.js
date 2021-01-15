/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {number, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-truncate-text-1_0',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [
      {
        name: 'amp-truncate-text',
        version: '1.0',
      },
    ],
    experiments: ['bento'],
  },
};

export const _default = () => {
  const width = number('width (em)', 20);
  const height = number('height (em)', 4);

  return (
    <amp-truncate-text
      layout="fixed"
      height={`${height}em`}
      width={`${width}em`}
      class="box"
    >
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
      <p> Hello</p>
      <button slot="persistent">Lorem Ipsum</button>
      <button slot="collapsed">See more</button>
      <button slot="expanded">See less</button>
    </amp-truncate-text>
  );
};
