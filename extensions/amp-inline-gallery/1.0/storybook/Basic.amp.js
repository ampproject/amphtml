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
import {boolean, select, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-inline-gallery-1_0',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [
      {name: 'amp-inline-gallery', version: '1.0'},
      {name: 'amp-base-carousel', version: '1.0'},
    ],

    experiments: ['bento'],
  },
};

export const Default = () => {
  const topInset = boolean('top indicator inset?', false);
  const bottomInset = boolean('bottom indicator inset?', true);
  const autoAdvance = boolean('auto advance', false);
  const autoAdvanceCount = text('auto advance count', 1);
  const autoAdvanceInterval = text('auto advance interval', 1000);
  const autoAdvanceLoops = text('auto advance loops', 3);
  const loop = boolean('loop thumbnails', false);
  const aspectRatio = text('thumbnails aspect ratio', undefined);
  const orientation = select(
    'orientation',
    ['horizontal', 'vertical'],
    'vertical'
  );
  return (
    <amp-inline-gallery style={{maxWidth: '360px'}} layout="container">
      <amp-inline-gallery-pagination
        layout={topInset ? 'nodisplay' : 'fixed-height'}
        height={topInset ? undefined : '24'}
        inset={topInset}
      />
      <amp-inline-gallery-thumbnails
        aspectRatio={aspectRatio}
        loop={loop}
        layout="fixed-height"
        height="50"
      />
      <amp-base-carousel
        auto-advance={autoAdvance}
        auto-advance-count={autoAdvanceCount}
        auto-advance-interval={autoAdvanceInterval}
        auto-advance-loops={autoAdvanceLoops}
        orientation={orientation}
        width="360"
        height="240"
      >
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
      </amp-base-carousel>
      <amp-inline-gallery-pagination
        layout={bottomInset ? 'nodisplay' : 'fixed-height'}
        height={bottomInset ? undefined : '24'}
        inset={bottomInset}
      />
    </amp-inline-gallery>
  );
};

Default.story = {
  name: 'default',
};
