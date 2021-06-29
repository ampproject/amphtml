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

import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-lightbox-gallery-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [
      {name: 'amp-base-carousel', version: '1.0'},
      {name: 'amp-stream-gallery', version: '1.0'},
      {name: 'amp-lightbox-gallery', version: '1.0'},
    ],
    experiments: ['bento'],
  },
};

export const Default = () => {
  return (
    <>
      <div lightbox> invalid lightboxed div element </div>
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
        lightbox
      />
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
        lightbox
      ></amp-img>
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
        lightbox
      />
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
        lightbox
      ></amp-img>
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
        lightbox
      />
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
        lightbox
      ></amp-img>
    </>
  );
};

export const Carousel = () => {
  return (
    <amp-base-carousel lightbox width="360" height="240">
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
      />
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
      ></amp-img>
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
      />
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
      ></amp-img>
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
      />
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
      ></amp-img>
    </amp-base-carousel>
  );
};

export const StreamGallery = () => {
  return (
    <amp-stream-gallery max-visible-count="2" lightbox width="360" height="120">
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
      />
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
      ></amp-img>
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
      />
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
      ></amp-img>
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
      />
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
      ></amp-img>
    </amp-stream-gallery>
  );
};

export const Grouping = () => {
  return (
    <>
      <p>
        Note: The standalone img/amp-img elements are lightboxed in a separate
        lightbox-gallery group than the carousel elements.
      </p>
      <img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
        lightbox
      />
      <amp-base-carousel lightbox width="360" height="240">
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
        ></amp-img>
        <img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
        />
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
        ></amp-img>
      </amp-base-carousel>
      <amp-img
        width="360"
        height="240"
        src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
        lightbox
      ></amp-img>
      <img
        width="360"
        height="240"
        lightbox
        src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
      />
    </>
  );
};
