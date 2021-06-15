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
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-wordpress-embed-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-wordpress-embed', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const BasicEmbedExample = () => {
  const url = text(
    'url',
    'https://wordpress.org/news/2021/06/gutenberg-highlights'
  );
  const width = number('width', 500);
  const height = number('height', 200);
  const layout = text('layout', 'fixed');

  return (
    <amp-wordpress-embed
      data-url={url}
      width={width}
      height={height}
      layout={layout}
    ></amp-wordpress-embed>
  );
};

BasicEmbedExample.story = {
  name: 'Basic example',
};
