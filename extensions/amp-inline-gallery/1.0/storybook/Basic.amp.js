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
import {boolean, number, withKnobs} from '@storybook/addon-knobs';
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

    experiments: ['amp-inline-gallery-bento', 'amp-base-carousel-bento'],
  },
};

export const Default = () => {
  const topInset = boolean('top indicator inset?', false);
  const bottomInset = boolean('bottom indicator inset?', false);
  const loop = boolean('loop thumbnails', false);
  const aspectRatio = number('thumbnails aspect ratio', undefined);
  return (
    <amp-inline-gallery style={{maxWidth: '360px'}} layout="container">
      <amp-inline-gallery-pagination
        inset={topInset}
        layout="fixed-height"
        height="24"
      />
      <amp-base-carousel width="360" height="240">
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
        inset={bottomInset}
        layout="fixed-height"
        height="24"
      />
      <amp-inline-gallery-thumbnails
        aspectRatio={aspectRatio}
        loop={loop}
        layout="fixed-height"
        height="50"
      />
    </amp-inline-gallery>
  );
};

Default.story = {
  name: 'default',
};
