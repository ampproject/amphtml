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
import {BaseCarousel} from '../../../amp-base-carousel/1.0/base-carousel';
import {InlineGallery} from '../inline-gallery';
import {Pagination} from '../pagination';
import {Thumbnails} from '../thumbnails';
import {boolean, number, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'InlineGallery',
  component: InlineGallery,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const width = 360;
  const height = 240;
  const paginationHeight = number('top indicator height', 20);
  const topInset = boolean('top indicator inset?', false);
  const bottomInset = boolean('bottom indicator inset?', false);
  const thumbnailHeight = number('thumbnail height', 50);
  const loop = boolean('thumbnail loop', false);
  const aspectRatio = number('thumbnail aspect ratio (w/h)', 3 / 2);

  return (
    <>
      <InlineGallery style={{width}}>
        <Pagination inset={topInset} style={{height: paginationHeight}} />
        <BaseCarousel style={{height}}>
          <img
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=120&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
        </BaseCarousel>
        <Pagination inset={bottomInset} />
        <Thumbnails
          aspectRatio={aspectRatio}
          loop={loop}
          style={{height: thumbnailHeight}}
        />
        <br />
        <Thumbnails />
      </InlineGallery>
      Content below carousel
    </>
  );
};

export const WithLooping = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  const paginationHeight = number('indicator height', 20);
  const inset = boolean('inset?', false);
  const thumbnailHeight = number('thumbnail height', 50);
  const loop = boolean('thumbnail loop', true);
  const aspectRatio = number('thumbnail aspect ratio', 2);
  const slides = [
    'lightpink',
    'lightcoral',
    'peachpuff',
    'powderblue',
    'lavender',
    'thistle',
  ].map((color, index) => (
    <div
      style={{
        backgroundColor: color,
        width,
        height,
        textAlign: 'center',
        fontSize: '48pt',
        lineHeight: height + 'px',
      }}
    >
      {index + 1}
    </div>
  ));

  return (
    <InlineGallery style={{width, position: 'relative'}}>
      <BaseCarousel loop style={{height, position: 'relative'}}>
        {slides}
      </BaseCarousel>
      <Pagination inset={inset} style={{height: paginationHeight}} />
      <Thumbnails
        aspectRatio={aspectRatio}
        loop={loop}
        style={{height: thumbnailHeight}}
      >
        <div>a</div>
        <div>b</div>
        <div>c</div>
        <div>d</div>
      </Thumbnails>
    </InlineGallery>
  );
};
