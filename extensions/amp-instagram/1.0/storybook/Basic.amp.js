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

import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-instagram-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-instagram', version: '1.0'},
      {name: 'amp-accordion', version: '1.0'},
    ],
    experiments: ['bento'],
  },
  args: {
    width: 500,
    height: 600,
    layout: 'fixed',
    'data-shortcode': 'B8QaZW4AQY_',
    'data-captioned': false,
  },
};

export const _default = (args) => {
  return <amp-instagram {...args}></amp-instagram>;
};

export const InsideAccordion = (args) => {
  return (
    <amp-accordion expand-single-section>
      <section expanded>
        <h2>Post</h2>
        <div>
          <amp-instagram {...args}></amp-instagram>
        </div>
      </section>
    </amp-accordion>
  );
};

export const InsideDetails = (args) => {
  return (
    <details open>
      <summary>Post</summary>
      <amp-instagram {...args}></amp-instagram>
    </details>
  );
};

export const WithPlaceholderAndFallback = (args) => {
  return (
    <amp-instagram {...args}>
      <div placeholder style={{background: 'blue'}}>
        Placeholder. Loading content...
      </div>

      <div fallback style={{background: 'red'}}>
        Fallback. Could not load content...
      </div>
    </amp-instagram>
  );
};
