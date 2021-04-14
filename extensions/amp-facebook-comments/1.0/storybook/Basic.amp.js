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
import {boolean, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-facebook-comments-1_0',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [
      {
        name: 'amp-facebook-comments',
        version: '1.0',
      },
    ],
    experiments: ['bento'],
  },
};

export const _default = () => {
  const href = text(
    'data-href',
    'http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html'
  );
  const numPosts = boolean('show 5 comments max');
  const orderBy = boolean('order by time');
  const locale = boolean('french locale');
  return (
    <amp-facebook-comments
      width="486"
      height="657"
      layout="responsive"
      data-href={href}
      data-locale={locale ? 'fr_FR' : undefined}
      data-numposts={numPosts ? 5 : undefined}
      data-order-by={orderBy ? 'time' : undefined}
    ></amp-facebook-comments>
  );
};

_default.story = {
  name: 'Default',
};
